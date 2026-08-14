from __future__ import annotations

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import ColumnElement, or_, select
from sqlalchemy.orm import Session

from app.core.security import InvalidTokenError, decode_token
from app.db.session import get_db
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
    """True when user_id owns the trip or is a collaborator on it.

    Shared by every trip-scoped resource query so viewing/editing trip
    content works the same for the owner and for invited collaborators.
    """
    return or_(
        Trip.user_id == user_id,
        Trip.id.in_(select(TripCollaborator.trip_id).where(TripCollaborator.user_id == user_id)),
    )


def get_accessible_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Trip:
    """Owner or collaborator: viewing/editing trip content and metadata."""
    trip = db.query(Trip).filter(Trip.id == trip_id, trip_access_filter(current_user.id)).first()
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip
