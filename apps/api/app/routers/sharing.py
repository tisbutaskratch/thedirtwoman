from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_accessible_trip, get_current_user, get_owned_trip
from app.db.session import get_db
from app.models.trip import Trip
from app.models.trip_collaborator import TripCollaborator
from app.models.trip_invite import TripInvite
from app.models.user import User
from app.schemas.sharing import CollaboratorRead, InviteAcceptResult, InvitePreviewRead, InviteRead
from app.services.sharing import get_or_create_invite, revoke_invites, to_collaborator_read

router = APIRouter(tags=["sharing"])


@router.post("/trips/{trip_id}/invite", response_model=InviteRead)
def create_invite(
    trip: Trip = Depends(get_owned_trip),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TripInvite:
    return get_or_create_invite(db, trip, current_user.id)


@router.delete("/trips/{trip_id}/invite", status_code=status.HTTP_204_NO_CONTENT)
def delete_invite(trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)) -> None:
    revoke_invites(db, trip)


@router.get("/trips/{trip_id}/collaborators", response_model=list[CollaboratorRead])
def list_collaborators(trip: Trip = Depends(get_accessible_trip)) -> list[CollaboratorRead]:
    return [to_collaborator_read(c) for c in trip.collaborators]


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
        owner_name=trip.user.name,
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
        db.add(TripCollaborator(trip_id=trip.id, user_id=current_user.id))
        db.commit()

    return InviteAcceptResult(trip_id=trip.id)
