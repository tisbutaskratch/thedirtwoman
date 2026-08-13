from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_owned_trip
from app.db.session import get_db
from app.models.trip import Trip, TripType
from app.schemas.motocamping import MotocampingDetailRead, MotocampingDetailUpdate
from app.services.motocamping import to_motocamping_detail_read

router = APIRouter(prefix="/trips/{trip_id}/detail", tags=["trip-detail"])


@router.get("", response_model=MotocampingDetailRead)
def get_trip_detail(trip: Trip = Depends(get_owned_trip)) -> MotocampingDetailRead:
    if trip.trip_type != TripType.motocamping or trip.motocamping_detail is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No mode-specific detail available yet for {trip.trip_type.value} trips",
        )
    return to_motocamping_detail_read(trip.motocamping_detail)


@router.patch("", response_model=MotocampingDetailRead)
def update_trip_detail(
    payload: MotocampingDetailUpdate,
    trip: Trip = Depends(get_owned_trip),
    db: Session = Depends(get_db),
) -> MotocampingDetailRead:
    if trip.trip_type != TripType.motocamping or trip.motocamping_detail is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No mode-specific detail available yet for {trip.trip_type.value} trips",
        )

    detail = trip.motocamping_detail
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(detail, field, value)
    db.commit()
    db.refresh(detail)
    return to_motocamping_detail_read(detail)
