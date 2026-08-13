from __future__ import annotations

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import InvalidTokenError, decode_token
from app.db.session import get_db
from app.models.trip import Trip
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
    trip = db.get(Trip, trip_id)
    if trip is None or trip.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip
