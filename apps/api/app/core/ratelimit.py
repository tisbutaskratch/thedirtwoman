"""Rate limiting for the endpoints worth attacking.

Password guessing and bulk account creation are the two things an unauthenticated
stranger can do to this API. bcrypt makes each guess expensive, which is a cost
to the attacker but also to us, and it does nothing about someone registering
ten thousand accounts to fill a 1 GB database.

Deliberately in-process, with no Redis. The API runs as a single instance, so a
shared store would be infrastructure to run and pay for with nothing to
coordinate. That choice has consequences worth stating plainly: counters reset
when the instance restarts, and the moment there are two instances each keeps
its own count, so the effective limit multiplies by the instance count. Both are
acceptable for slowing down guessing; neither is acceptable for billing or
quotas. Move to a shared store before scaling out.
"""

from __future__ import annotations

import time
from collections import defaultdict, deque
from typing import Callable, Optional

from fastapi import HTTPException, Request, status

from app.core.config import settings


def client_ip(request: Request) -> str:
    """The caller's address, as seen from outside any proxy we run behind.

    Render terminates TLS and forwards, so request.client.host is the proxy
    for every caller: using it would put the whole internet in one bucket.

    X-Forwarded-For is a chain, and a client can forge entries by sending the
    header itself. Only the entries our own proxies appended can be trusted,
    and those are on the right. So we count in from the right by the number of
    proxies we actually run behind; anything the client invented sits to the
    left of that and is ignored.
    """
    hops = settings.trusted_proxy_hops
    forwarded = request.headers.get("x-forwarded-for", "")
    parts = [p.strip() for p in forwarded.split(",") if p.strip()]

    if hops > 0 and parts:
        return parts[max(0, len(parts) - hops)]
    return request.client.host if request.client else "unknown"


class SlidingWindowLimiter:
    """Counts recent hits per key and reports how long to wait once full.

    A sliding window rather than a fixed one: fixed windows let someone spend
    the whole allowance at the end of one window and again at the start of the
    next, which is twice the intended rate at the moment it matters most.
    """

    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def hit(self, key: str, limit: int, window_seconds: float) -> Optional[int]:
        """Record an attempt. Returns seconds to wait if the caller is over."""
        now = time.monotonic()
        cutoff = now - window_seconds
        hits = self._hits[key]

        while hits and hits[0] <= cutoff:
            hits.popleft()

        if len(hits) >= limit:
            # Room frees up when the oldest hit leaves the window.
            return max(1, int(hits[0] + window_seconds - now) + 1)

        hits.append(now)
        # Keys are only created on a request and emptied as they age out; drop
        # the entry entirely so a long tail of one-off addresses cannot grow
        # without bound.
        if not hits:
            del self._hits[key]
        return None

    def reset(self) -> None:
        self._hits.clear()


limiter = SlidingWindowLimiter()


def rate_limit(bucket: str, limit: int, window_seconds: float) -> Callable:
    """A dependency that limits a route by caller address."""

    def dependency(request: Request) -> None:
        if not settings.rate_limit_enabled:
            return
        retry_after = limiter.hit(f"{bucket}:{client_ip(request)}", limit, window_seconds)
        if retry_after is not None:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many attempts. Try again shortly.",
                headers={"Retry-After": str(retry_after)},
            )

    return dependency


def check_identity_limit(identity: str, limit: int, window_seconds: float) -> None:
    """Limit attempts against one account, whatever address they come from.

    Per-address limits alone are weak against someone spreading guesses for a
    single account across many addresses. This bounds the other axis. Keyed by
    the address the caller typed, which is not proof of anything, so it can
    only ever be a brake rather than a lock.
    """
    if not settings.rate_limit_enabled:
        return
    retry_after = limiter.hit(f"identity:{identity.lower()}", limit, window_seconds)
    if retry_after is not None:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many attempts for this account. Try again shortly.",
            headers={"Retry-After": str(retry_after)},
        )
