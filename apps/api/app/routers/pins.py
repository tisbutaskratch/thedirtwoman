"""What you want kept at the top.

Both kinds of pin are private view preferences, so everything here is scoped
to the signed-in user. Pinning a shared trip rearranges your dashboard and
nobody else's.

PUT rather than POST, because pinning something already pinned is not an
error and should not create a second row. Pressing the button twice means
the same thing as pressing it once.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, trip_access_filter
from app.db.session import get_db
from app.models.pin import SectionKey, SectionPin, TripPin
from app.models.trip import Trip
from app.models.user import User

router = APIRouter(prefix="/pins", tags=["pins"])


@router.get("/trips", response_model=list[int])
def list_pinned_trips(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[int]:
    rows = (
        db.query(TripPin.trip_id)
        .filter(TripPin.user_id == current_user.id)
        .order_by(TripPin.created_at)
        .all()
    )
    return [row[0] for row in rows]


@router.put("/trips/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def pin_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    # You can only pin a trip you can see. Without this, the pin table would
    # happily confirm which trip ids exist.
    visible = (
        db.query(Trip.id)
        .filter(Trip.id == trip_id, trip_access_filter(current_user.id))
        .first()
    )
    if visible is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    existing = (
        db.query(TripPin)
        .filter(TripPin.user_id == current_user.id, TripPin.trip_id == trip_id)
        .first()
    )
    if existing is None:
        db.add(TripPin(user_id=current_user.id, trip_id=trip_id))
        db.commit()


@router.delete("/trips/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def unpin_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    # Unpinning something that was never pinned is a no-op, not a 404: the
    # caller wanted it unpinned and it is unpinned.
    db.query(TripPin).filter(
        TripPin.user_id == current_user.id, TripPin.trip_id == trip_id
    ).delete()
    db.commit()


@router.get("/sections", response_model=list[SectionKey])
def list_pinned_sections(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[SectionKey]:
    rows = (
        db.query(SectionPin.section)
        .filter(SectionPin.user_id == current_user.id)
        .order_by(SectionPin.created_at)
        .all()
    )
    return [row[0] for row in rows]


@router.put("/sections/{section}", status_code=status.HTTP_204_NO_CONTENT)
def pin_section(
    section: SectionKey,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    existing = (
        db.query(SectionPin)
        .filter(SectionPin.user_id == current_user.id, SectionPin.section == section)
        .first()
    )
    if existing is None:
        db.add(SectionPin(user_id=current_user.id, section=section))
        db.commit()


@router.delete("/sections/{section}", status_code=status.HTTP_204_NO_CONTENT)
def unpin_section(
    section: SectionKey,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    db.query(SectionPin).filter(
        SectionPin.user_id == current_user.id, SectionPin.section == section
    ).delete()
    db.commit()
