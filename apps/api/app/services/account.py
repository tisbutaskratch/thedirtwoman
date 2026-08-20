"""Deleting an account, and leaving a trip.

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

Solo trips always go: nobody else is on them. Shared trips are never
destroyed on someone else's behalf. Deleting is per person: you leave, and
the trip carries on for whoever is still on it. Asking for a shared trip to
be deleted means asking the others to leave as well, which they decide for
themselves.

The trip disappears when the last person leaves it, which is the only
moment nobody loses anything by its going.
"""

from __future__ import annotations

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


class SharedTripAction(str, Enum):
    """What to do about trips the departing user created with others on them."""

    #: Leave quietly. The trip carries on for everyone still on it, with no
    #: creator, so nobody inherits it and no single account can strand the rest.
    keep = "keep"
    #: Leave, and ask the others whether they want rid of it too. Each of them
    #: decides; the trip goes only if they all leave.
    ask_others_to_leave = "ask"


class AccountDeletionSummary:
    """What was actually done, so the caller can say so."""

    def __init__(self) -> None:
        self.trips_deleted = 0
        self.trips_left_with_collaborators = 0
        self.collaborators_asked = 0
        self.journal_entries_deleted = 0
        #: Who to tell, and about what. The caller sends the mail so this
        #: stays a database function that a test can run without a provider.
        self.notify: list[tuple[str, str]] = []


def delete_trip(db: Session, trip: Trip) -> None:
    """Remove a trip and the objects its attachments point at.

    The rows cascade from the relationships; the stored files do not, and an
    object nobody has a row for is one nobody will ever delete.
    """
    storage = get_storage()
    for attachment in trip.attachments:
        storage.delete(attachment.filename)
    db.delete(trip)


def _members(db: Session, trip_id: int) -> list[TripCollaborator]:
    return db.query(TripCollaborator).filter(TripCollaborator.trip_id == trip_id).all()


def delete_trip_if_empty(db: Session, trip: Trip) -> bool:
    """Delete a trip once nobody is on it. Returns whether it went.

    A trip with no creator and no collaborators belongs to nobody and is
    reachable by nobody, so leaving it in the database is just holding
    somebody's data after the last person with a claim to it walked away.
    """
    if trip.user_id is not None:
        return False
    if _members(db, trip.id):
        return False
    delete_trip(db, trip)
    return True


def leave_trip(db: Session, trip: Trip, user: User) -> bool:
    """Remove one person from a trip. Returns whether the trip went with them.

    Their journal entries go too: those were never anyone else's to read, and
    leaving them behind on a trip they walked away from is the one thing a
    private journal must not do.
    """
    db.query(TripCollaborator).filter(
        TripCollaborator.trip_id == trip.id, TripCollaborator.user_id == user.id
    ).delete(synchronize_session=False)
    db.query(JournalEntry).filter(
        JournalEntry.trip_id == trip.id, JournalEntry.author_user_id == user.id
    ).delete(synchronize_session=False)

    if trip.user_id == user.id:
        trip.user_id = None

    _release_assignments(db, trip.id, user.id)
    db.flush()

    gone = delete_trip_if_empty(db, trip)
    db.commit()
    return gone


def _release_assignments(db: Session, trip_id: int, user_id: int) -> None:
    """Unpick a person from a trip's contents without deleting the contents.

    The tent is still on the list and the expense still happened. They are
    just nobody's now.
    """
    db.query(Gear).filter(Gear.trip_id == trip_id, Gear.assigned_to_user_id == user_id).update(
        {Gear.assigned_to_user_id: None}, synchronize_session=False
    )
    db.query(Task).filter(Task.trip_id == trip_id, Task.assigned_to_user_id == user_id).update(
        {Task.assigned_to_user_id: None}, synchronize_session=False
    )
    db.query(Expense).filter(
        Expense.trip_id == trip_id, Expense.paid_by_user_id == user_id
    ).update({Expense.paid_by_user_id: None}, synchronize_session=False)


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


def delete_account(db: Session, user: User, shared: SharedTripAction) -> AccountDeletionSummary:
    """Delete a user, and decide what becomes of what they touched."""
    summary = AccountDeletionSummary()
    shared_ids = _shared_trip_ids(db, user.id)

    for trip in list(db.query(Trip).filter(Trip.user_id == user.id).all()):
        if trip.id not in shared_ids:
            # Nobody else is on it, so nobody else loses anything.
            delete_trip(db, trip)
            summary.trips_deleted += 1
            continue

        trip.user_id = None
        summary.trips_left_with_collaborators += 1

        if shared is SharedTripAction.ask_others_to_leave:
            # An ask, not an instruction. Each of them decides, and the trip
            # goes only once they have all left.
            for member in _members(db, trip.id):
                if member.user_id == user.id:
                    continue
                member_user = db.get(User, member.user_id)
                if member_user is not None:
                    summary.notify.append((member_user.email, trip.title))
                    summary.collaborators_asked += 1

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
    db.flush()

    # A trip whose only other members had already gone is now empty.
    for trip_id in shared_ids:
        trip = db.get(Trip, trip_id)
        if trip is not None and delete_trip_if_empty(db, trip):
            summary.trips_left_with_collaborators -= 1
            summary.trips_deleted += 1

    db.commit()
    return summary
