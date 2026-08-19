from __future__ import annotations

from typing import Optional

from app.models.backpacking_detail import BackpackingDetail
from app.models.trip import Trip
from app.schemas.backpacking import BackpackingDetailRead

# Common backcountry planning rule of thumb: roughly half a litre of water
# per mile of hiking in moderate conditions.
LITERS_PER_MILE = 0.5


def compute_gear_weight_oz(trip: Trip) -> float:
    return sum(item.weight_oz for item in trip.gear if item.weight_oz is not None)


def compute_est_pack_weight_oz(detail: BackpackingDetail, gear_weight_oz: float) -> Optional[float]:
    """base_pack_weight_oz + everything logged in the shared Gear list.

    The architecture doc's formula (base weight + consumables + water) assumes
    consumables/water are tracked somewhere; rather than add fields the locked
    data model doesn't have, this sums the trip's existing Gear entries (which
    already cover food, fuel, water, etc.) on top of the base pack weight.
    """
    if detail.base_pack_weight_oz is None:
        return None
    return round(detail.base_pack_weight_oz + gear_weight_oz, 1)


def compute_trip_days(trip: Trip) -> Optional[int]:
    if trip.start_date is None or trip.end_date is None:
        return None
    return max((trip.end_date - trip.start_date).days + 1, 1)


def to_backpacking_detail_read(detail: BackpackingDetail, trip: Trip) -> BackpackingDetailRead:
    gear_weight_oz = compute_gear_weight_oz(trip)

    water_needed = None
    water_sufficient = None
    if detail.longest_dry_stretch_mi is not None:
        water_needed = round(detail.longest_dry_stretch_mi * LITERS_PER_MILE, 1)
        if detail.water_capacity_liters is not None:
            water_sufficient = detail.water_capacity_liters >= water_needed

    days = compute_trip_days(trip)
    avg_miles_per_day = None
    if detail.total_distance_mi is not None and days:
        avg_miles_per_day = round(detail.total_distance_mi / days, 1)

    return BackpackingDetailRead(
        trip_id=detail.trip_id,
        base_pack_weight_oz=detail.base_pack_weight_oz,
        permit_required=detail.permit_required,
        permit_notes=detail.permit_notes,
        resupply_plan=detail.resupply_plan,
        bear_canister_required=detail.bear_canister_required,
        water_capacity_liters=detail.water_capacity_liters,
        longest_dry_stretch_mi=detail.longest_dry_stretch_mi,
        total_distance_mi=detail.total_distance_mi,
        elevation_gain_ft=detail.elevation_gain_ft,
        gear_weight_oz=round(gear_weight_oz, 1),
        est_pack_weight_oz=compute_est_pack_weight_oz(detail, gear_weight_oz),
        water_needed_dry_stretch_l=water_needed,
        water_carry_sufficient=water_sufficient,
        avg_miles_per_day=avg_miles_per_day,
    )
