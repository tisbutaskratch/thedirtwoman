from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_accessible_trip, get_current_user, trip_access_filter
from app.db.session import get_db
from app.models.activity import Activity
from app.models.trip import Trip
from app.models.user import User
from app.schemas.activity import ActivityCreate, ActivityRead, ActivityUpdate

router = APIRouter(tags=["activities"])


def get_owned_activity(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Activity:
    activity = (
        db.query(Activity)
        .join(Trip, Activity.trip_id == Trip.id)
        .filter(Activity.id == activity_id, trip_access_filter(current_user.id))
        .first()
    )
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity


@router.get("/trips/{trip_id}/activities", response_model=list[ActivityRead])
def list_activities(trip: Trip = Depends(get_accessible_trip)) -> list[Activity]:
    return trip.activities


@router.post(
    "/trips/{trip_id}/activities", response_model=ActivityRead, status_code=status.HTTP_201_CREATED
)
def create_activity(
    payload: ActivityCreate,
    trip: Trip = Depends(get_accessible_trip),
    db: Session = Depends(get_db),
) -> Activity:
    activity = Activity(trip_id=trip.id, **payload.model_dump())
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.patch("/activities/{activity_id}", response_model=ActivityRead)
def update_activity(
    payload: ActivityUpdate,
    activity: Activity = Depends(get_owned_activity),
    db: Session = Depends(get_db),
) -> Activity:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(activity, field, value)
    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(
    activity: Activity = Depends(get_owned_activity), db: Session = Depends(get_db)
) -> None:
    db.delete(activity)
    db.commit()
