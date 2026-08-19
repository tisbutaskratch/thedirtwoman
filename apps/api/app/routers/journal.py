from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_accessible_trip, get_current_user, trip_access_filter
from app.db.session import get_db
from app.models.journal_entry import JournalEntry
from app.models.trip import Trip
from app.models.user import User
from app.schemas.journal import JournalEntryCreate, JournalEntryRead, JournalEntryUpdate

router = APIRouter(tags=["journal"])

# Note on access: these routes take the *accessible* trip, not the editable
# one. A journal is personal, so anyone who can see the trip may keep their
# own diary of it, including the read-only audience. What none of them can do
# is read anyone else's, because every query below is filtered by author.


def get_own_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JournalEntry:
    """An entry the caller wrote, on a trip they can still see.

    Filtering by author in the lookup means a wrong id is a 404, not a
    forbidden: someone else's entry should not even be confirmed to exist.
    """
    entry = (
        db.query(JournalEntry)
        .join(Trip, JournalEntry.trip_id == Trip.id)
        .filter(
            JournalEntry.id == entry_id,
            JournalEntry.author_user_id == current_user.id,
            trip_access_filter(current_user.id),
        )
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    return entry


@router.get("/trips/{trip_id}/journal", response_model=list[JournalEntryRead])
def list_journal(
    trip: Trip = Depends(get_accessible_trip),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[JournalEntry]:
    return (
        db.query(JournalEntry)
        .filter(
            JournalEntry.trip_id == trip.id,
            JournalEntry.author_user_id == current_user.id,
        )
        .order_by(JournalEntry.entry_date.desc(), JournalEntry.created_at.desc())
        .all()
    )


@router.post(
    "/trips/{trip_id}/journal",
    response_model=JournalEntryRead,
    status_code=status.HTTP_201_CREATED,
)
def create_journal_entry(
    payload: JournalEntryCreate,
    trip: Trip = Depends(get_accessible_trip),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JournalEntry:
    entry = JournalEntry(
        trip_id=trip.id,
        author_user_id=current_user.id,
        **payload.model_dump(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.patch("/journal/{entry_id}", response_model=JournalEntryRead)
def update_journal_entry(
    payload: JournalEntryUpdate,
    entry: JournalEntry = Depends(get_own_entry),
    db: Session = Depends(get_db),
) -> JournalEntry:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/journal/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_journal_entry(
    entry: JournalEntry = Depends(get_own_entry), db: Session = Depends(get_db)
) -> None:
    db.delete(entry)
    db.commit()
