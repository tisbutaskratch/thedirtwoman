from __future__ import annotations

from app.models.camping_detail import CampingDetail
from app.schemas.camping import CampingDetailRead


def to_camping_detail_read(detail: CampingDetail) -> CampingDetailRead:
    return CampingDetailRead(
        trip_id=detail.trip_id,
        campground_reservation_ref=detail.campground_reservation_ref,
        fire_restrictions_checked=detail.fire_restrictions_checked,
    )
