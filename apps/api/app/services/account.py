"""Deleting an account.

The hard part is not the user row. It is that a person is referenced from
other people's trips, and those references mean different things:

  * Gear and task assignments, and who paid for an expense, are nullable.
    Losing the name does not lose the fact, so they are cleared and the item
    stays where it is.
  * Collaborator rows, invites they sent, expense shares and journal
    entries are theirs. Those go.
  * Trips they created are the only real decision, and it is the user's to
    make rather than ours, because a trip with other people on it holds
    their planning too.

Solo trips always go: nobody else is on them. For shared trips the choice
is to leave them behind or to take them with you, and taking them with you
does not happen immediately.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from enum import Enum

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.expense import Expense, ExpenseParticipant
from app.models.gear import Gear
from app.models.journal_entry import JournalEntry
from app.models.task import Task
from app.models.trip import Trip
from app.models.trip_collaborator import TripCollaborator
from app.models.trip_invite import TripInvite
from app.models.user import User
from app.services.storage import get_storage

#: How long a shared trip stays readable after its creator asks for it to go.
#: Long enough for people who only look at a trip when they are about to
#: leave, short enough that it is not indefinite.
SHARED_TRIP_GRACE = timedelta(days=30)


class SharedTripAction(str, Enum):
    """What happens to trips the departing user created with others on them."""

    #: Leave them. The creator field becomes null and the trip belongs to
    #: everyone still on it, with no one inheriting and no one to go inactive.
    keep = "keep"
    #: Schedule them. They stay readable for the grace period so collaborators
    #: can object or take a copy, then go.
    delete = "delete"


class AccountDeletionSummary:
    """What was actually done, so the caller can say so."""

    def __init__(self) -> None:
        self.trips_deleted = 0
        self.trips_left_with_collaborators = 0
        self.trips_scheduled = 0
        self.journal_entries_deleted = 0


def _shared_trip_ids(db: Session, user_id: int) -> set[int]:
    """Trips this user created that somebody else is also on."""
    created = select(Trip.id).where(Trip.user_id == user_id)
    return {
        row[0]
        for row in db.execute(
            select(TripCollaborator.trip_id)
            .where(TripCollaborator.trip_id.in_(created))
            .where(TripCollaborator.user_id != user_id)
            .distinct()
        )
    }


def _delete_trip(db: Session, trip: Trip) -> None:
    """Remove a trip and the objects its attachments point at.

    The rows cascade from the relationships; the stored files do not, and
    an object nobody has a row for is one nobody will ever delete.
    """
    storage = get_storage()
    for attachment in trip.attachments:
        storage.delete(attachment.filename)
    db.delete(trip)


def delete_account(db: Session, user: User, shared: SharedTripAction) -> AccountDeletionSummary:
    """Delete a user, and decide what becomes of what they touched."""
    summary = AccountDeletionSummary()
    now = datetime.now(timezone.utc)
    shared_ids = _shared_trip_ids(db, user.id)

    for trip in list(db.query(Trip).filter(Trip.user_id == user.id).all()):
        if trip.id not in shared_ids:
            _delete_trip(db, trip)
            summary.trips_deleted += 1
        elif shared is SharedTripAction.keep:
            trip.user_id = None
            summary.trips_left_with_collaborators += 1
        else:
            trip.user_id = None
            trip.deletion_scheduled_at = now + SHARED_TRIP_GRACE
            summary.trips_scheduled += 1

    # Journal entries are private, so they die with the account wherever they
    # are, including on trips that outlive it.
    summary.journal_entries_deleted = (
        db.query(JournalEntry)
        .filter(JournalEntry.author_user_id == user.id)
        .delete(synchronize_session=False)
    )

    # Membership of other people's trips, and anything sent in their name.
    db.query(TripCollaborator).filter(TripCollaborator.user_id == user.id).delete(
        synchronize_session=False
    )
    db.query(TripInvite).filter(TripInvite.created_by_user_id == user.id).delete(
        synchronize_session=False
    )
    db.query(ExpenseParticipant).filter(ExpenseParticipant.user_id == user.id).delete(
        synchronize_session=False
    )

    # Assignments survive without a name attached: the tent is still on the
    # list and the expense still happened, they are just nobody's now.
    db.query(Gear).filter(Gear.assigned_to_user_id == user.id).update(
        {Gear.assigned_to_user_id: None}, synchronize_session=False
    )
    db.query(Task).filter(Task.assigned_to_user_id == user.id).update(
        {Task.assigned_to_user_id: None}, synchronize_session=False
    )
    db.query(Expense).filter(Expense.paid_by_user_id == user.id).update(
        {Expense.paid_by_user_id: None}, synchronize_session=False
    )

    db.delete(user)
    db.commit()
    return summary


def sweep_scheduled_deletions(db: Session, now: datetime | None = None) -> int:
    """Delete shared trips whose grace period has run out.

    Called on start-up rather than from a scheduler, because the deployment
    has no cron and one query on boot is cheaper than a service that exists
    to run one query. A trip that outlives its window by a few hours until
    the next restart harms nobody.
    """
    moment = now or datetime.now(timezone.utc)
    due = (
        db.query(Trip)
        .filter(Trip.deletion_scheduled_at.isnot(None), Trip.deletion_scheduled_at <= moment)
        .all()
    )
    for trip in due:
        _delete_trip(db, trip)
    if due:
        db.commit()
    return len(due)
