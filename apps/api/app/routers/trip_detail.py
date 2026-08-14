from collections.abc import Callable
from typing import Union

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_accessible_trip
from app.db.session import get_db
from app.models.trip import Trip, TripType
from app.schemas.backpacking import BackpackingDetailRead
from app.schemas.motocamping import MotocampingDetailRead
from app.schemas.overlanding import OverlandingDetailRead
from app.schemas.trip_detail import TripDetailUpdate
from app.services.backpacking import to_backpacking_detail_read
from app.services.motocamping import to_motocamping_detail_read
from app.services.overlanding import to_overlanding_detail_read

router = APIRouter(prefix="/trips/{trip_id}/detail", tags=["trip-detail"])

DetailRead = Union[MotocampingDetailRead, BackpackingDetailRead, OverlandingDetailRead]

# Each mode with a detail model: the Trip relationship holding it, the
# TripDetailUpdate fields it owns, and how to build its read schema. Modes
# without a detail model yet (camping, international) are simply absent,
# falling through to _not_implemented below.
_MODE_CONFIG: dict[TripType, tuple[str, set[str], Callable[[object, Trip], object]]] = {
    TripType.motocamping: (
        "motocamping_detail",
        {"motorcycle_name", "fuel_capacity_gal", "fuel_economy_mpg", "daily_ride_target_miles"},
        lambda detail, trip: to_motocamping_detail_read(detail),
    ),
    TripType.backpacking: (
        "backpacking_detail",
        {"base_pack_weight_oz", "permit_required", "permit_notes", "resupply_plan"},
        to_backpacking_detail_read,
    ),
    TripType.overlanding: (
        "overlanding_detail",
        {
            "vehicle_name",
            "fuel_capacity_gal",
            "fuel_economy_mpg",
            "ground_clearance_in",
            "drivetrain",
            "has_recovery_gear",
            "comms_plan",
            "emergency_contact",
        },
        lambda detail, trip: to_overlanding_detail_read(detail),
    ),
}


def _not_implemented(trip: Trip) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"No mode-specific detail available yet for {trip.trip_type.value} trips",
    )


def _get_detail(trip: Trip):
    config = _MODE_CONFIG.get(trip.trip_type)
    if config is None:
        raise _not_implemented(trip)
    attr_name, fields, to_read = config
    detail = getattr(trip, attr_name)
    if detail is None:
        raise _not_implemented(trip)
    return detail, fields, to_read


@router.get("", response_model=DetailRead)
def get_trip_detail(trip: Trip = Depends(get_accessible_trip)) -> DetailRead:
    detail, _fields, to_read = _get_detail(trip)
    return to_read(detail, trip)


@router.patch("", response_model=DetailRead)
def update_trip_detail(
    payload: TripDetailUpdate,
    trip: Trip = Depends(get_accessible_trip),
    db: Session = Depends(get_db),
) -> DetailRead:
    detail, fields, to_read = _get_detail(trip)

    for field, value in payload.model_dump(exclude_unset=True).items():
        if field in fields:
            setattr(detail, field, value)
    db.commit()
    db.refresh(detail)
    return to_read(detail, trip)
