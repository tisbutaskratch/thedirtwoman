from enum import Enum

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_accessible_trip, get_current_user, get_editable_trip
from app.core.ratelimit import check_identity_limit
from app.db.session import get_db
from app.models.activity import Activity
from app.models.trip import Trip
from app.models.trip_collaborator import TripCollaborator
from app.models.user import User
from app.services.calendar import build_calendar, calendar_filename
from app.services.email import send_calendar_email

router = APIRouter(tags=["calendar"])


@router.get("/trips/{trip_id}/calendar.ics")
def download_calendar(
    trip: Trip = Depends(get_accessible_trip), db: Session = Depends(get_db)
) -> Response:
    """The trip and its activities as a calendar file.

    Read access is enough: anyone who can see the trip can already read
    everything this contains. Viewers included, since a read-only audience
    wanting the dates in their own calendar is the point of that role.
    """
    activities = (
        db.query(Activity).filter(Activity.trip_id == trip.id).order_by(Activity.day_index).all()
    )
    return Response(
        content=build_calendar(trip, activities),
        media_type="text/calendar; charset=utf-8",
        headers={
            # Named so a browser saves it rather than showing it as text, and
            # so the file in someone's downloads says which trip it is.
            "Content-Disposition": f'attachment; filename="{calendar_filename(trip)}"'
        },
    )


class CalendarRecipients(str, Enum):
    """Who gets the file.

    Deliberately not an address. Letting a caller name an arbitrary
    recipient would make this an open relay sending from a domain whose
    reputation belongs to everyone using the app, and the fastest way to
    lose that reputation is to let strangers pipe mail through it. The only
    people reachable here are people already on the trip.
    """

    me = "me"
    everyone = "everyone"


class CalendarEmailRequest(BaseModel):
    to: CalendarRecipients


class CalendarEmailResult(BaseModel):
    sent: int
    failed: int
    #: Addresses that were tried, so the caller can say who to chase.
    recipients: list[str]


def _trip_emails(db: Session, trip: Trip) -> list[str]:
    """Everyone on the trip: its creator, if it still has one, and members."""
    emails: list[str] = []
    if trip.user is not None:
        emails.append(trip.user.email)
    rows = (
        db.query(User.email)
        .join(TripCollaborator, TripCollaborator.user_id == User.id)
        .filter(TripCollaborator.trip_id == trip.id)
        .all()
    )
    emails.extend(row[0] for row in rows)
    # A creator who is also a collaborator row would otherwise be mailed twice.
    return list(dict.fromkeys(emails))


@router.post("/trips/{trip_id}/calendar/email", response_model=CalendarEmailResult)
def email_calendar(
    payload: CalendarEmailRequest,
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CalendarEmailResult:
    """Send the trip's calendar file to yourself, or to everyone on the trip.

    Mailing yourself needs only read access; mailing everybody is a write
    action, because it puts a message in other people's inboxes with your
    name on it.
    """
    if payload.to is CalendarRecipients.me:
        trip = get_accessible_trip(trip_id, current_user, db)
        recipients = [current_user.email]
    else:
        trip = get_editable_trip(trip_id, current_user, db)
        recipients = _trip_emails(db, trip)

    if not recipients:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Nobody to send this to"
        )

    # Bounded per account rather than per address: the cost of abuse here is
    # the sending domain's reputation, and that is shared by everyone.
    check_identity_limit(f"calendar-email:{current_user.id}", limit=20, window_seconds=3600)

    activities = (
        db.query(Activity).filter(Activity.trip_id == trip.id).order_by(Activity.day_index).all()
    )
    calendar = build_calendar(trip, activities).encode("utf-8")
    filename = calendar_filename(trip)

    sent = sum(
        1 for email in recipients if send_calendar_email(email, trip.title, calendar, filename)
    )
    return CalendarEmailResult(
        sent=sent, failed=len(recipients) - sent, recipients=recipients
    )
