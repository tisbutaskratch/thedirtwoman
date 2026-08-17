from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import (
    get_accessible_trip,
    get_current_user,
    get_editable_trip,
    trip_write_filter,
)
from app.db.session import get_db
from app.models.note import Note
from app.models.trip import Trip
from app.models.user import User
from app.schemas.note import NoteCreate, NoteRead, NoteUpdate

router = APIRouter(tags=["notes"])


def get_owned_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Note:
    note = (
        db.query(Note)
        .join(Trip, Note.trip_id == Trip.id)
        .filter(Note.id == note_id, trip_write_filter(current_user.id))
        .first()
    )
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note


@router.get("/trips/{trip_id}/notes", response_model=list[NoteRead])
def list_notes(trip: Trip = Depends(get_accessible_trip)) -> list[Note]:
    return trip.notes


@router.post("/trips/{trip_id}/notes", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note(
    payload: NoteCreate, trip: Trip = Depends(get_editable_trip), db: Session = Depends(get_db)
) -> Note:
    note = Note(trip_id=trip.id, **payload.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.patch("/notes/{note_id}", response_model=NoteRead)
def update_note(
    payload: NoteUpdate, note: Note = Depends(get_owned_note), db: Session = Depends(get_db)
) -> Note:
    note.body = payload.body
    db.commit()
    db.refresh(note)
    return note


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note: Note = Depends(get_owned_note), db: Session = Depends(get_db)) -> None:
    db.delete(note)
    db.commit()
