"""Password guessing and bulk signup are the two things a stranger can do here.

The autouse fixture in conftest turns limiting off for every other test; these
turn it back on deliberately.
"""

from __future__ import annotations

import pytest

from app.core.config import settings
from app.core.ratelimit import SlidingWindowLimiter, client_ip, limiter


@pytest.fixture()
def limiting_on(monkeypatch):
    monkeypatch.setattr(settings, "rate_limit_enabled", True)
    limiter.reset()
    yield
    limiter.reset()


class FakeRequest:
    """Enough of a Request for client_ip: headers and a peer address."""

    def __init__(self, forwarded: str | None, peer: str = "10.0.0.1"):
        self.headers = {"x-forwarded-for": forwarded} if forwarded else {}
        self.client = type("C", (), {"host": peer})()


def test_the_window_slides_rather_than_resetting_on_a_boundary():
    """A fixed window allows a double burst across the boundary."""
    lim = SlidingWindowLimiter()
    assert lim.hit("k", limit=2, window_seconds=60) is None
    assert lim.hit("k", limit=2, window_seconds=60) is None

    retry = lim.hit("k", limit=2, window_seconds=60)
    assert retry is not None and retry > 0


def test_the_window_lets_callers_back_in_once_hits_age_out():
    lim = SlidingWindowLimiter()
    assert lim.hit("k", limit=1, window_seconds=0.05) is None
    assert lim.hit("k", limit=1, window_seconds=0.05) is not None

    import time

    time.sleep(0.06)
    assert lim.hit("k", limit=1, window_seconds=0.05) is None


def test_separate_keys_do_not_share_an_allowance():
    lim = SlidingWindowLimiter()
    assert lim.hit("a", limit=1, window_seconds=60) is None
    assert lim.hit("b", limit=1, window_seconds=60) is None


def test_client_ip_reads_the_hop_our_proxy_added(monkeypatch):
    """The rightmost entry is the one Render appended; the rest are hearsay."""
    monkeypatch.setattr(settings, "trusted_proxy_hops", 1)
    assert client_ip(FakeRequest("203.0.113.9")) == "203.0.113.9"


def test_a_forged_forwarded_header_cannot_change_the_bucket(monkeypatch):
    """A caller sending their own X-Forwarded-For prepends to the chain.

    If we read the leftmost entry, anyone could rotate it per request and
    never hit a limit at all.
    """
    monkeypatch.setattr(settings, "trusted_proxy_hops", 1)
    forged = FakeRequest("1.1.1.1, 203.0.113.9")
    assert client_ip(forged) == "203.0.113.9"


def test_client_ip_falls_back_to_the_peer_without_a_proxy(monkeypatch):
    monkeypatch.setattr(settings, "trusted_proxy_hops", 0)
    assert client_ip(FakeRequest(None, peer="198.51.100.4")) == "198.51.100.4"


def test_repeated_bad_passwords_are_eventually_refused(client, auth_headers, limiting_on):
    auth_headers("frodo@bagend.dev")
    body = {"email": "frodo@bagend.dev", "password": "wrong-password"}

    for _ in range(10):
        assert client.post("/auth/login", json=body).status_code == 401

    refused = client.post("/auth/login", json=body)
    assert refused.status_code == 429
    assert int(refused.headers["Retry-After"]) > 0


def test_the_limit_does_not_leak_the_password(client, auth_headers, limiting_on):
    """Being refused must not confirm the password was right."""
    auth_headers("frodo@bagend.dev")
    for _ in range(10):
        client.post("/auth/login", json={"email": "frodo@bagend.dev", "password": "wrong"})

    correct = client.post(
        "/auth/login", json={"email": "frodo@bagend.dev", "password": "hunter2hunter2"}
    )
    assert correct.status_code == 429


def test_bulk_signup_is_capped(client, limiting_on):
    for i in range(5):
        created = client.post(
            "/auth/register",
            json={"email": f"signup{i}@example.com", "password": "a-long-password", "name": "T"},
        )
        assert created.status_code == 201

    assert client.post(
        "/auth/register",
        json={"email": "signup5@example.com", "password": "a-long-password", "name": "T"},
    ).status_code == 429
