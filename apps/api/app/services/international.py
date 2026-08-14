from __future__ import annotations

from app.models.international_detail import InternationalDetail
from app.schemas.international import InternationalDetailRead


def to_international_detail_read(detail: InternationalDetail) -> InternationalDetailRead:
    return InternationalDetailRead(
        trip_id=detail.trip_id,
        home_currency=detail.home_currency,
        destination_currencies=detail.destination_currencies,
        primary_timezone=detail.primary_timezone,
    )
