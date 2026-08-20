from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_accessible_trip, get_current_user, get_editable_trip, get_owned_trip
from app.db.session import get_db
from app.models.common import TripRole
from app.models.trip import Trip
from app.models.trip_collaborator import TripCollaborator
from app.models.trip_invite import TripInvite
from app.models.user import User
from app.schemas.sharing import (
    CollaboratorRead,
    EmailInviteCreate,
    InviteAcceptResult,
    InvitePreviewRead,
    InviteRead,
    PendingMemberRead,
    RoleUpdate,
    VehicleUpdate,
)
from app.services.account import leave_trip
from app.services.sharing import (
    cancel_email_invite,
    create_email_invite,
    get_or_create_invite,
    is_email_already_member,
    list_pending_invites,
    revoke_invites,
    to_collaborator_read,
    to_owner_collaborator_read,
)

router = APIRouter(tags=["sharing"])


@router.post("/trips/{trip_id}/invite", response_model=InviteRead)
def create_invite(
    role: TripRole = TripRole.editor,
    trip: Trip = Depends(get_owned_trip),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TripInvite:
    return get_or_create_invite(db, trip, current_user.id, role)


@router.delete("/trips/{trip_id}/invite", status_code=status.HTTP_204_NO_CONTENT)
def delete_invite(trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)) -> None:
    revoke_invites(db, trip)


@router.get("/trips/{trip_id}/collaborators", response_model=list[CollaboratorRead])
def list_collaborators(trip: Trip = Depends(get_accessible_trip)) -> list[CollaboratorRead]:
    collaborators = [to_collaborator_read(c) for c in trip.collaborators]
    return [to_owner_collaborator_read(trip)] + collaborators


@router.post("/trips/{trip_id}/invites/email", response_model=PendingMemberRead)
def invite_by_email(
    payload: EmailInviteCreate,
    trip: Trip = Depends(get_owned_trip),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PendingMemberRead:
    if is_email_already_member(db, trip, payload.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Already a member of this trip"
        )
    invite = create_email_invite(db, trip, current_user.id, payload.email, payload.role)
    return PendingMemberRead(
        id=invite.id,
        email=invite.invitee_email,
        role=invite.role,
        invited_at=invite.created_at,
        email_sent=getattr(invite, "email_was_sent", None),
    )


@router.get("/trips/{trip_id}/pending-invites", response_model=list[PendingMemberRead])
def get_pending_invites(
    trip: Trip = Depends(get_accessible_trip), db: Session = Depends(get_db)
) -> list[PendingMemberRead]:
    return list_pending_invites(db, trip)


@router.delete("/trips/{trip_id}/invites/email/{invite_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_pending_invite(
    invite_id: int, trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)
) -> None:
    if not cancel_email_invite(db, trip, invite_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")


@router.patch("/trips/{trip_id}/collaborators/me", response_model=CollaboratorRead)
def update_my_vehicle(
    payload: VehicleUpdate,
    trip: Trip = Depends(get_editable_trip),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CollaboratorRead:
    if trip.user_id == current_user.id:
        trip.owner_vehicle = payload.vehicle
        trip.owner_fuel_range_miles = payload.fuel_range_miles
        db.commit()
        db.refresh(trip)
        return to_owner_collaborator_read(trip)

    collaborator = (
        db.query(TripCollaborator)
        .filter(TripCollaborator.trip_id == trip.id, TripCollaborator.user_id == current_user.id)
        .first()
    )
    if collaborator is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not a trip member")

    collaborator.vehicle = payload.vehicle
    collaborator.fuel_range_miles = payload.fuel_range_miles
    db.commit()
    db.refresh(collaborator)
    return to_collaborator_read(collaborator)


@router.patch("/trips/{trip_id}/collaborators/{user_id}/role", response_model=CollaboratorRead)
def update_collaborator_role(
    user_id: int,
    payload: RoleUpdate,
    trip: Trip = Depends(get_owned_trip),
    db: Session = Depends(get_db),
) -> CollaboratorRead:
    # The creator always keeps edit rights. Otherwise a trip could be left
    # with nobody able to change it.
    if user_id == trip.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The trip's creator always has edit access",
        )
    collaborator = (
        db.query(TripCollaborator)
        .filter(TripCollaborator.trip_id == trip.id, TripCollaborator.user_id == user_id)
        .first()
    )
    if collaborator is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not a trip member")
    collaborator.role = payload.role
    db.commit()
    db.refresh(collaborator)
    return to_collaborator_read(collaborator)


@router.delete("/trips/{trip_id}/collaborators/me", status_code=status.HTTP_204_NO_CONTENT)
def leave_this_trip(
    trip: Trip = Depends(get_accessible_trip),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Leave a trip you are on.

    Available to anyone on it, editor or viewer, at any time. Being unable
    to leave something you were invited to is its own kind of trap.

    Your private journal entries for this trip go with you. Leaving them on
    a trip you walked away from is the one thing a private journal must not
    do.

    The trip itself is deleted only when the last person leaves, so nobody
    loses planning because somebody else did.
    """
    leave_trip(db, trip, current_user)


@router.delete("/trips/{trip_id}/collaborators/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_collaborator(
    user_id: int,
    trip: Trip = Depends(get_owned_trip),
    db: Session = Depends(get_db),
) -> None:
    db.query(TripCollaborator).filter(
        TripCollaborator.trip_id == trip.id, TripCollaborator.user_id == user_id
    ).delete()
    db.commit()


def _get_valid_invite(token: str, db: Session) -> TripInvite:
    invite = (
        db.query(TripInvite)
        .filter(TripInvite.token == token, TripInvite.expires_at > datetime.now(timezone.utc))
        .first()
    )
    if invite is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found or expired"
        )
    return invite


@router.get("/invites/{token}", response_model=InvitePreviewRead)
def preview_invite(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InvitePreviewRead:
    invite = _get_valid_invite(token, db)
    trip = invite.trip
    already_member = trip.user_id == current_user.id or any(
        c.user_id == current_user.id for c in trip.collaborators
    )
    return InvitePreviewRead(
        trip_id=trip.id,
        trip_title=trip.title,
        trip_type=trip.trip_type.value,
        invited_by_name=trip.user.name,
        role=invite.role,
        already_member=already_member,
    )


@router.post("/invites/{token}/accept", response_model=InviteAcceptResult)
def accept_invite(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InviteAcceptResult:
    invite = _get_valid_invite(token, db)
    trip = invite.trip

    if trip.user_id == current_user.id:
        return InviteAcceptResult(trip_id=trip.id)

    already_member = (
        db.query(TripCollaborator)
        .filter(TripCollaborator.trip_id == trip.id, TripCollaborator.user_id == current_user.id)
        .first()
    )
    if already_member is None:
        db.add(TripCollaborator(trip_id=trip.id, user_id=current_user.id, role=invite.role))
    elif already_member.role != invite.role and invite.role == TripRole.editor:
        # Accepting an editor invite upgrades a viewer; the reverse would let
        # a stale read-only link silently strip someone's edit rights.
        already_member.role = TripRole.editor

    if invite.invitee_email is not None:
        # Targeted invite consumed on acceptance. It stops showing as pending.
        db.delete(invite)

    db.commit()

    return InviteAcceptResult(trip_id=trip.id)
