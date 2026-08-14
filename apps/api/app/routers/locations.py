from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_accessible_trip, get_current_user, trip_access_filter
from app.db.session import get_db
from app.models.location import Location
from app.models.trip import Trip
from app.models.user import User
from app.schemas.location import LocationCreate, LocationRead, LocationUpdate

router = APIRouter(tags=["locations"])


def get_owned_location(
    location_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Location:
    location = (
        db.query(Location)
        .join(Trip, Location.trip_id == Trip.id)
        .filter(Location.id == location_id, trip_access_filter(current_user.id))
        .first()
    )
    if location is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")
    return location


@router.get("/trips/{trip_id}/locations", response_model=list[LocationRead])
def list_locations(trip: Trip = Depends(get_accessible_trip)) -> list[Location]:
    return trip.locations


@router.post(
    "/trips/{trip_id}/locations", response_model=LocationRead, status_code=status.HTTP_201_CREATED
)
def create_location(
    payload: LocationCreate,
    trip: Trip = Depends(get_accessible_trip),
    db: Session = Depends(get_db),
) -> Location:
    location = Location(trip_id=trip.id, **payload.model_dump())
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


@router.patch("/locations/{location_id}", response_model=LocationRead)
def update_location(
    payload: LocationUpdate,
    location: Location = Depends(get_owned_location),
    db: Session = Depends(get_db),
) -> Location:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(location, field, value)
    db.commit()
    db.refresh(location)
    return location


@router.delete("/locations/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(
    location: Location = Depends(get_owned_location), db: Session = Depends(get_db)
) -> None:
    db.delete(location)
    db.commit()
