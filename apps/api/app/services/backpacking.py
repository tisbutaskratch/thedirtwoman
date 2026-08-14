from __future__ import annotations

from typing import Optional

from app.models.backpacking_detail import BackpackingDetail
from app.models.trip import Trip
from app.schemas.backpacking import BackpackingDetailRead


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


def to_backpacking_detail_read(detail: BackpackingDetail, trip: Trip) -> BackpackingDetailRead:
    gear_weight_oz = compute_gear_weight_oz(trip)
    return BackpackingDetailRead(
        trip_id=detail.trip_id,
        base_pack_weight_oz=detail.base_pack_weight_oz,
        permit_required=detail.permit_required,
        permit_notes=detail.permit_notes,
        resupply_plan=detail.resupply_plan,
        gear_weight_oz=round(gear_weight_oz, 1),
        est_pack_weight_oz=compute_est_pack_weight_oz(detail, gear_weight_oz),
    )
