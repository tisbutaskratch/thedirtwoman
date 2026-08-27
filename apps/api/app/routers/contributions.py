from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import (
    get_accessible_trip,
    get_current_user,
    get_editable_trip,
    trip_write_filter,
    validate_trip_member,
)
from app.db.session import get_db
from app.models.contribution import Contribution
from app.models.trip import Trip
from app.models.user import User
from app.schemas.contribution import (
    ContributionCreate,
    ContributionRead,
    ContributionUpdate,
)

router = APIRouter(tags=["contributions"])


def get_owned_contribution(
    contribution_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Contribution:
    contribution = (
        db.query(Contribution)
        .join(Trip, Contribution.trip_id == Trip.id)
        .filter(Contribution.id == contribution_id, trip_write_filter(current_user.id))
        .first()
    )
    if contribution is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contribution not found"
        )
    return contribution


@router.get("/trips/{trip_id}/contributions", response_model=list[ContributionRead])
def list_contributions(trip: Trip = Depends(get_accessible_trip)) -> list[Contribution]:
    return trip.contributions


@router.post(
    "/trips/{trip_id}/contributions",
    response_model=ContributionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_contribution(
    payload: ContributionCreate,
    trip: Trip = Depends(get_editable_trip),
    db: Session = Depends(get_db),
) -> Contribution:
    validate_trip_member(trip, payload.assigned_to_user_id, db)
    contribution = Contribution(trip_id=trip.id, **payload.model_dump())
    db.add(contribution)
    db.commit()
    db.refresh(contribution)
    return contribution


@router.patch("/contributions/{contribution_id}", response_model=ContributionRead)
def update_contribution(
    payload: ContributionUpdate,
    contribution: Contribution = Depends(get_owned_contribution),
    db: Session = Depends(get_db),
) -> Contribution:
    updates = payload.model_dump(exclude_unset=True)
    if "assigned_to_user_id" in updates:
        validate_trip_member(contribution.trip, updates["assigned_to_user_id"], db)
    for field, value in updates.items():
        setattr(contribution, field, value)
    db.commit()
    db.refresh(contribution)
    return contribution


@router.delete("/contributions/{contribution_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contribution(
    contribution: Contribution = Depends(get_owned_contribution),
    db: Session = Depends(get_db),
) -> None:
    db.delete(contribution)
    db.commit()
