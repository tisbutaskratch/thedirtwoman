from __future__ import annotations

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import ColumnElement, or_, select
from sqlalchemy.orm import Session

from app.core.security import InvalidTokenError, decode_token
from app.db.session import get_db
from app.models.common import TripRole
from app.models.trip import Trip
from app.models.trip_collaborator import TripCollaborator
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    try:
        user_id = decode_token(credentials.credentials, expected_type="access")
    except InvalidTokenError as exc:
        raise unauthorized from exc

    user = db.get(User, int(user_id))
    if user is None:
        raise unauthorized

    return user


def get_owned_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Trip:
    """Owner-only: deleting the trip, managing invites, removing collaborators."""
    trip = db.get(Trip, trip_id)
    if trip is None or trip.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip


def trip_access_filter(user_id: int) -> ColumnElement[bool]:
    """True when user_id can *see* the trip — any role, plus the creator."""
    return or_(
        Trip.user_id == user_id,
        Trip.id.in_(select(TripCollaborator.trip_id).where(TripCollaborator.user_id == user_id)),
    )


def trip_write_filter(user_id: int) -> ColumnElement[bool]:
    """True when user_id can *change* the trip: creator or editor.

    Viewers pass trip_access_filter but not this one, which is the whole
    point of the read-only audience.
    """
    return or_(
        Trip.user_id == user_id,
        Trip.id.in_(
            select(TripCollaborator.trip_id).where(
                TripCollaborator.user_id == user_id,
                TripCollaborator.role == TripRole.editor,
            )
        ),
    )


def get_accessible_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Trip:
    """Read access: creator, editor, or viewer."""
    trip = db.query(Trip).filter(Trip.id == trip_id, trip_access_filter(current_user.id)).first()
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip


def get_editable_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Trip:
    """Write access: creator or editor. Viewers get a 403, not a 404 —
    they can legitimately see this trip, they just can't change it."""
    trip = db.query(Trip).filter(Trip.id == trip_id, trip_access_filter(current_user.id)).first()
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    editable = (
        db.query(Trip).filter(Trip.id == trip_id, trip_write_filter(current_user.id)).first()
    )
    if editable is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have view-only access to this trip",
        )
    return editable


def validate_trip_member(trip: Trip, user_id: Optional[int], db: Session) -> None:
    """Raise 400 if user_id isn't the trip creator or an editor.

    Shared by gear/task assignment. Viewers are deliberately excluded: the
    audience is along to watch, so handing them a task nobody can act on
    would be a silent dead end.
    """
    if user_id is None or user_id == trip.user_id:
        return
    is_collaborator = (
        db.query(TripCollaborator)
        .filter(
            TripCollaborator.trip_id == trip.id,
            TripCollaborator.user_id == user_id,
            TripCollaborator.role == TripRole.editor,
        )
        .first()
        is not None
    )
    if not is_collaborator:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="assigned_to_user_id must be a trip member",
        )
