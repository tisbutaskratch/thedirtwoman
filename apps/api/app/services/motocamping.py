from __future__ import annotations

from app.models.motocamping_detail import MotocampingDetail
from app.schemas.motocamping import MotocampingDetailRead
from app.services.fuel_range import compute_est_range_miles


def to_motocamping_detail_read(detail: MotocampingDetail) -> MotocampingDetailRead:
    return MotocampingDetailRead(
        trip_id=detail.trip_id,
        motorcycle_name=detail.motorcycle_name,
        fuel_capacity_gal=detail.fuel_capacity_gal,
        fuel_economy_mpg=detail.fuel_economy_mpg,
        daily_ride_target_miles=detail.daily_ride_target_miles,
        est_range_miles=compute_est_range_miles(detail.fuel_capacity_gal, detail.fuel_economy_mpg),
    )
