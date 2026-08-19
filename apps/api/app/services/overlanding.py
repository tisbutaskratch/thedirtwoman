from __future__ import annotations

from app.models.overlanding_detail import OverlandingDetail
from app.models.trip import Trip
from app.schemas.overlanding import OverlandingDetailRead
from app.services.fuel_range import compute_est_range_miles

# Overlanding guidance generally puts drinking + cooking + cleaning at
# roughly 1–2 gal per person per day; the conservative end is used here.
GAL_PER_PERSON_PER_DAY = 1.5


def compute_party_size(trip: Trip) -> int:
    return 1 + len(trip.collaborators)


def to_overlanding_detail_read(detail: OverlandingDetail, trip: Trip) -> OverlandingDetailRead:
    total_fuel = None
    if detail.fuel_capacity_gal is not None:
        total_fuel = detail.fuel_capacity_gal + (detail.aux_fuel_gal or 0)

    water_days = None
    if detail.water_capacity_gal is not None:
        daily_need = compute_party_size(trip) * GAL_PER_PERSON_PER_DAY
        water_days = round(detail.water_capacity_gal / daily_need, 1)

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
        tire_pressure_offroad_psi=detail.tire_pressure_offroad_psi,
        tire_pressure_highway_psi=detail.tire_pressure_highway_psi,
        water_capacity_gal=detail.water_capacity_gal,
        aux_fuel_gal=detail.aux_fuel_gal,
        est_range_miles=compute_est_range_miles(detail.fuel_capacity_gal, detail.fuel_economy_mpg),
        est_total_range_miles=compute_est_range_miles(total_fuel, detail.fuel_economy_mpg),
        water_days_supported=water_days,
    )
