from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.common import TripRole
from app.models.trip import Trip
from app.models.trip_collaborator import TripCollaborator
from app.models.trip_invite import TripInvite
from app.models.user import User
from app.schemas.sharing import CollaboratorRead, PendingMemberRead
from app.services.email import send_invite_email


def to_owner_collaborator_read(trip: Trip) -> CollaboratorRead:
    """The trip's creator isn't a TripCollaborator row, but the roster should
    still show them alongside everyone else — as a collaborator, not an
    "owner"."""
    return CollaboratorRead(
        user_id=trip.user_id,
        name=trip.user.name,
        email=trip.user.email,
        role=TripRole.editor,
        is_creator=True,
        vehicle=trip.owner_vehicle,
        fuel_range_miles=trip.owner_fuel_range_miles,
        joined_at=trip.created_at,
    )


def get_or_create_invite(
    db: Session, trip: Trip, created_by_user_id: int, role: TripRole = TripRole.editor
) -> TripInvite:
    """The reusable share link, one per access level.

    Editor and viewer links are separate tokens so handing someone the
    read-only link can never accidentally grant edit rights.
    """
    now = datetime.now(timezone.utc)
    existing = (
        db.query(TripInvite)
        .filter(
            TripInvite.trip_id == trip.id,
            TripInvite.invitee_email.is_(None),
            TripInvite.role == role,
            TripInvite.expires_at > now,
        )
        .order_by(TripInvite.created_at.desc())
        .first()
    )
    if existing is not None:
        return existing

    invite = TripInvite(
        trip_id=trip.id,
        token=secrets.token_urlsafe(24),
        created_by_user_id=created_by_user_id,
        role=role,
        expires_at=now + timedelta(days=settings.trip_invite_expire_days),
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)
    return invite


def revoke_invites(db: Session, trip: Trip) -> None:
    db.query(TripInvite).filter(
        TripInvite.trip_id == trip.id, TripInvite.invitee_email.is_(None)
    ).delete()
    db.commit()


def to_collaborator_read(collaborator: TripCollaborator) -> CollaboratorRead:
    return CollaboratorRead(
        user_id=collaborator.user_id,
        name=collaborator.user.name,
        email=collaborator.user.email,
        role=collaborator.role,
        vehicle=collaborator.vehicle,
        fuel_range_miles=collaborator.fuel_range_miles,
        joined_at=collaborator.created_at,
    )


def create_email_invite(
    db: Session,
    trip: Trip,
    created_by_user_id: int,
    email: str,
    role: TripRole = TripRole.editor,
) -> TripInvite:
    now = datetime.now(timezone.utc)
    email = email.lower()

    existing = (
        db.query(TripInvite)
        .filter(
            TripInvite.trip_id == trip.id,
            TripInvite.invitee_email == email,
            TripInvite.expires_at > now,
        )
        .first()
    )
    invite = existing or TripInvite(
        trip_id=trip.id,
        token=secrets.token_urlsafe(24),
        created_by_user_id=created_by_user_id,
        invitee_email=email,
        role=role,
        expires_at=now + timedelta(days=settings.trip_invite_expire_days),
    )
    if existing is None:
        db.add(invite)
        db.commit()
        db.refresh(invite)

    invite_url = f"{settings.frontend_base_url}/invite/{invite.token}"
    send_invite_email(email, trip.title, invite_url)
    return invite


def list_pending_invites(db: Session, trip: Trip) -> list[PendingMemberRead]:
    now = datetime.now(timezone.utc)
    invites = (
        db.query(TripInvite)
        .filter(
            TripInvite.trip_id == trip.id,
            TripInvite.invitee_email.isnot(None),
            TripInvite.expires_at > now,
        )
        .order_by(TripInvite.created_at)
        .all()
    )
    return [
        PendingMemberRead(
            id=i.id, email=i.invitee_email, role=i.role, invited_at=i.created_at
        )
        for i in invites
    ]


def cancel_email_invite(db: Session, trip: Trip, invite_id: int) -> bool:
    deleted = (
        db.query(TripInvite)
        .filter(
            TripInvite.id == invite_id,
            TripInvite.trip_id == trip.id,
            TripInvite.invitee_email.isnot(None),
        )
        .delete()
    )
    db.commit()
    return deleted > 0


def is_email_already_member(db: Session, trip: Trip, email: str) -> bool:
    email = email.lower()
    if trip.user.email.lower() == email:
        return True
    return (
        db.query(TripCollaborator)
        .join(User, TripCollaborator.user_id == User.id)
        .filter(TripCollaborator.trip_id == trip.id, User.email.ilike(email))
        .first()
        is not None
    )
