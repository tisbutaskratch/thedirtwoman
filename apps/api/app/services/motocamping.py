from __future__ import annotations

from typing import Optional

from app.models.motocamping_detail import MotocampingDetail
from app.schemas.motocamping import MotocampingDetailRead


def compute_est_range_miles(detail: MotocampingDetail) -> Optional[float]:
    if detail.fuel_capacity_gal is None or detail.fuel_economy_mpg is None:
        return None
    return round(detail.fuel_capacity_gal * detail.fuel_economy_mpg, 1)


def to_motocamping_detail_read(detail: MotocampingDetail) -> MotocampingDetailRead:
    return MotocampingDetailRead(
        trip_id=detail.trip_id,
        motorcycle_name=detail.motorcycle_name,
        fuel_capacity_gal=detail.fuel_capacity_gal,
        fuel_economy_mpg=detail.fuel_economy_mpg,
        daily_ride_target_miles=detail.daily_ride_target_miles,
        est_range_miles=compute_est_range_miles(detail),
    )
