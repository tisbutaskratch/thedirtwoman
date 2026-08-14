from typing import Union

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_accessible_trip
from app.db.session import get_db
from app.models.trip import Trip, TripType
from app.schemas.backpacking import BackpackingDetailRead
from app.schemas.motocamping import MotocampingDetailRead
from app.schemas.trip_detail import TripDetailUpdate
from app.services.backpacking import to_backpacking_detail_read
from app.services.motocamping import to_motocamping_detail_read

router = APIRouter(prefix="/trips/{trip_id}/detail", tags=["trip-detail"])

DetailRead = Union[MotocampingDetailRead, BackpackingDetailRead]

_MOTOCAMPING_FIELDS = {
    "motorcycle_name",
    "fuel_capacity_gal",
    "fuel_economy_mpg",
    "daily_ride_target_miles",
}
_BACKPACKING_FIELDS = {"base_pack_weight_oz", "permit_required", "permit_notes", "resupply_plan"}


def _not_implemented(trip: Trip) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"No mode-specific detail available yet for {trip.trip_type.value} trips",
    )


@router.get("", response_model=DetailRead)
def get_trip_detail(trip: Trip = Depends(get_accessible_trip)) -> DetailRead:
    if trip.trip_type == TripType.motocamping and trip.motocamping_detail is not None:
        return to_motocamping_detail_read(trip.motocamping_detail)
    if trip.trip_type == TripType.backpacking and trip.backpacking_detail is not None:
        return to_backpacking_detail_read(trip.backpacking_detail, trip)
    raise _not_implemented(trip)


@router.patch("", response_model=DetailRead)
def update_trip_detail(
    payload: TripDetailUpdate,
    trip: Trip = Depends(get_accessible_trip),
    db: Session = Depends(get_db),
) -> DetailRead:
    updates = payload.model_dump(exclude_unset=True)

    if trip.trip_type == TripType.motocamping and trip.motocamping_detail is not None:
        detail = trip.motocamping_detail
        for field, value in updates.items():
            if field in _MOTOCAMPING_FIELDS:
                setattr(detail, field, value)
        db.commit()
        db.refresh(detail)
        return to_motocamping_detail_read(detail)

    if trip.trip_type == TripType.backpacking and trip.backpacking_detail is not None:
        detail = trip.backpacking_detail
        for field, value in updates.items():
            if field in _BACKPACKING_FIELDS:
                setattr(detail, field, value)
        db.commit()
        db.refresh(detail)
        return to_backpacking_detail_read(detail, trip)

    raise _not_implemented(trip)
