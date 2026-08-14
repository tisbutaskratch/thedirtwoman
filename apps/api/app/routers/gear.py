from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_accessible_trip, get_current_user, trip_access_filter
from app.db.session import get_db
from app.models.gear import Gear
from app.models.trip import Trip
from app.models.user import User
from app.schemas.gear import GearCreate, GearRead, GearUpdate

router = APIRouter(tags=["gear"])


def get_owned_gear(
    gear_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Gear:
    gear = (
        db.query(Gear)
        .join(Trip, Gear.trip_id == Trip.id)
        .filter(Gear.id == gear_id, trip_access_filter(current_user.id))
        .first()
    )
    if gear is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gear item not found")
    return gear


@router.get("/trips/{trip_id}/gear", response_model=list[GearRead])
def list_gear(trip: Trip = Depends(get_accessible_trip)) -> list[Gear]:
    return trip.gear


@router.post("/trips/{trip_id}/gear", response_model=GearRead, status_code=status.HTTP_201_CREATED)
def create_gear(
    payload: GearCreate, trip: Trip = Depends(get_accessible_trip), db: Session = Depends(get_db)
) -> Gear:
    gear = Gear(trip_id=trip.id, **payload.model_dump())
    db.add(gear)
    db.commit()
    db.refresh(gear)
    return gear


@router.patch("/gear/{gear_id}", response_model=GearRead)
def update_gear(
    payload: GearUpdate, gear: Gear = Depends(get_owned_gear), db: Session = Depends(get_db)
) -> Gear:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(gear, field, value)
    db.commit()
    db.refresh(gear)
    return gear
