from __future__ import annotations

from app.models.overlanding_detail import OverlandingDetail
from app.schemas.overlanding import OverlandingDetailRead
from app.services.fuel_range import compute_est_range_miles


def to_overlanding_detail_read(detail: OverlandingDetail) -> OverlandingDetailRead:
    return OverlandingDetailRead(
        trip_id=detail.trip_id,
        vehicle_name=detail.vehicle_name,
        fuel_capacity_gal=detail.fuel_capacity_gal,
        fuel_economy_mpg=detail.fuel_economy_mpg,
        ground_clearance_in=detail.ground_clearance_in,
        drivetrain=detail.drivetrain,
        has_recovery_gear=detail.has_recovery_gear,
        comms_plan=detail.comms_plan,
        emergency_contact=detail.emergency_contact,
        est_range_miles=compute_est_range_miles(detail.fuel_capacity_gal, detail.fuel_economy_mpg),
    )
