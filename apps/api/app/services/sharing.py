from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.trip import Trip
from app.models.trip_collaborator import TripCollaborator
from app.models.trip_invite import TripInvite
from app.schemas.sharing import CollaboratorRead


def to_owner_collaborator_read(trip: Trip) -> CollaboratorRead:
    """The trip owner isn't a TripCollaborator row, but the roster should
    still show them alongside everyone else."""
    return CollaboratorRead(
        user_id=trip.user_id,
        name=trip.user.name,
        email=trip.user.email,
        vehicle=trip.owner_vehicle,
        joined_at=trip.created_at,
    )


def get_or_create_invite(db: Session, trip: Trip, created_by_user_id: int) -> TripInvite:
    now = datetime.now(timezone.utc)
    existing = (
        db.query(TripInvite)
        .filter(TripInvite.trip_id == trip.id, TripInvite.expires_at > now)
        .order_by(TripInvite.created_at.desc())
        .first()
    )
    if existing is not None:
        return existing

    invite = TripInvite(
        trip_id=trip.id,
        token=secrets.token_urlsafe(24),
        created_by_user_id=created_by_user_id,
        expires_at=now + timedelta(days=settings.trip_invite_expire_days),
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)
    return invite


def revoke_invites(db: Session, trip: Trip) -> None:
    db.query(TripInvite).filter(TripInvite.trip_id == trip.id).delete()
    db.commit()


def to_collaborator_read(collaborator: TripCollaborator) -> CollaboratorRead:
    return CollaboratorRead(
        user_id=collaborator.user_id,
        name=collaborator.user.name,
        email=collaborator.user.email,
        vehicle=collaborator.vehicle,
        joined_at=collaborator.created_at,
    )
