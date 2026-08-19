"""Bounds on what a caller can send.

Postgres Text has no length, so without these an honest-looking POST can be
any size the network will carry. The caps sit far above real use: nobody
writes a twenty thousand character journal entry by accident.
"""

from __future__ import annotations

from app.schemas.limits import LONG_TEXT_MAX, SHORT_TEXT_MAX


def _trip(client, headers) -> int:
    return client.post(
        "/trips", json={"title": "Limits", "trip_type": "camping"}, headers=headers
    ).json()["id"]


def test_a_long_journal_entry_is_still_accepted(client, auth_headers):
    """The cap must not get in the way of someone actually writing."""
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _trip(client, headers)

    response = client.post(
        f"/trips/{trip_id}/journal",
        headers=headers,
        json={"entry_date": "2026-08-19", "body": "x" * LONG_TEXT_MAX},
    )
    assert response.status_code == 201


def test_an_oversized_journal_entry_is_refused(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _trip(client, headers)

    response = client.post(
        f"/trips/{trip_id}/journal",
        headers=headers,
        json={"entry_date": "2026-08-19", "body": "x" * (LONG_TEXT_MAX + 1)},
    )
    assert response.status_code == 422


def test_an_oversized_short_field_is_refused(client, auth_headers):
    """Titles map to String(255); anything longer would be truncated or error
    at the database instead of being rejected cleanly here."""
    headers = auth_headers("frodo@bagend.dev")

    response = client.post(
        "/trips",
        headers=headers,
        json={"title": "t" * (SHORT_TEXT_MAX + 1), "trip_type": "camping"},
    )
    assert response.status_code == 422


def test_reading_back_a_long_entry_is_not_truncated(client, auth_headers):
    """Read schemas are uncapped on purpose: a cap there would silently cut
    data that is already stored."""
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _trip(client, headers)
    body = "y" * LONG_TEXT_MAX
    client.post(
        f"/trips/{trip_id}/journal",
        headers=headers,
        json={"entry_date": "2026-08-19", "body": body},
    )

    entries = client.get(f"/trips/{trip_id}/journal", headers=headers).json()
    assert entries[0]["body"] == body


def test_an_absurd_content_length_is_refused_before_parsing(client, auth_headers):
    """Rejected on the declared size, so the body is never read into memory."""
    headers = auth_headers("frodo@bagend.dev")

    response = client.post(
        "/trips",
        headers={**headers, "Content-Length": str(500 * 1024 * 1024)},
        content=b'{"title":"x","trip_type":"camping"}',
    )
    assert response.status_code == 413


def test_a_nonsense_content_length_is_refused(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")

    response = client.post(
        "/trips",
        headers={**headers, "Content-Length": "not-a-number"},
        content=b'{"title":"x","trip_type":"camping"}',
    )
    assert response.status_code in (400, 422)
