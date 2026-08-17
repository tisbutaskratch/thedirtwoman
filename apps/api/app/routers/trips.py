from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import (
    get_accessible_trip,
    get_current_user,
    get_editable_trip,
    get_owned_trip,
    trip_access_filter,
)
from app.db.session import get_db
from app.models.backpacking_detail import BackpackingDetail
from app.models.camping_detail import CampingDetail
from app.models.domestic_detail import DomesticDetail
from app.models.international_detail import InternationalDetail
from app.models.motocamping_detail import MotocampingDetail
from app.models.overlanding_detail import OverlandingDetail
from app.models.trip import Trip, TripType
from app.models.user import User
from app.schemas.trip import TripCreate, TripRead, TripUpdate
from app.services.trip_progress import to_trip_read

router = APIRouter(prefix="/trips", tags=["trips"])

# Every trip type now has a detail model — each gets a blank row created
# alongside its trip.
_DETAIL_MODEL_BY_TYPE = {
    TripType.motocamping: MotocampingDetail,
    TripType.backpacking: BackpackingDetail,
    TripType.overlanding: OverlandingDetail,
    TripType.camping: CampingDetail,
    TripType.international: InternationalDetail,
    TripType.domestic: DomesticDetail,
}


@router.get("", response_model=list[TripRead])
def list_trips(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[TripRead]:
    trips = (
        db.query(Trip)
        .filter(trip_access_filter(current_user.id))
        .order_by(Trip.created_at.desc())
        .all()
    )
    return [to_trip_read(trip, current_user.id) for trip in trips]


@router.post("", response_model=TripRead, status_code=status.HTTP_201_CREATED)
def create_trip(
    payload: TripCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TripRead:
    trip = Trip(user_id=current_user.id, **payload.model_dump())
    db.add(trip)
    db.flush()

    detail_model = _DETAIL_MODEL_BY_TYPE.get(trip.trip_type)
    if detail_model is not None:
        db.add(detail_model(trip_id=trip.id))

    db.commit()
    db.refresh(trip)
    return to_trip_read(trip)


@router.get("/{trip_id}", response_model=TripRead)
def get_trip(
    trip: Trip = Depends(get_accessible_trip),
    current_user: User = Depends(get_current_user),
) -> TripRead:
    return to_trip_read(trip, current_user.id)


@router.patch("/{trip_id}", response_model=TripRead)
def update_trip(
    payload: TripUpdate,
    trip: Trip = Depends(get_editable_trip),
    db: Session = Depends(get_db),
) -> TripRead:
    updates = payload.model_dump(exclude_unset=True)

    # `archived` is exposed as a boolean but stored as a timestamp, so the
    # UI can toggle it without having to invent a date.
    if "archived" in updates:
        archived = updates.pop("archived")
        trip.archived_at = datetime.now(timezone.utc) if archived else None

    for field, value in updates.items():
        setattr(trip, field, value)
    db.commit()
    db.refresh(trip)
    return to_trip_read(trip)


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)) -> None:
    db.delete(trip)
    db.commit()
