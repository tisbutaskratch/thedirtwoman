"""Deleting an account.

Every mistake available here is somebody else's data. These check both
directions: that everything of the departing user's goes, and that nothing
belonging to anyone else goes with it.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.models.gear import Gear
from app.models.journal_entry import JournalEntry
from app.models.trip import Trip
from app.models.trip_collaborator import TripCollaborator
from app.models.user import User
from app.services.account import SHARED_TRIP_GRACE, sweep_scheduled_deletions


def _trip(client, headers, title="Solo trip") -> int:
    return client.post(
        "/trips", json={"title": title, "trip_type": "camping"}, headers=headers
    ).json()["id"]


def _share(client, owner_headers, guest_headers, trip_id) -> None:
    token = client.post(f"/trips/{trip_id}/invite", headers=owner_headers).json()["token"]
    client.post(f"/invites/{token}/accept", headers=guest_headers)


def _delete_account(client, headers, email, shared="keep"):
    return client.request(
        "DELETE",
        "/auth/me",
        headers=headers,
        json={"shared_trips": shared, "confirm": email},
    )


def test_deleting_takes_the_account_and_its_solo_trips(client, auth_headers, db_session):
    headers = auth_headers("frodo@bagend.dev")
    _trip(client, headers)
    _trip(client, headers, "Another")

    response = _delete_account(client, headers, "frodo@bagend.dev")

    assert response.status_code == 200
    assert response.json()["trips_deleted"] == 2
    assert db_session.query(User).filter(User.email == "frodo@bagend.dev").first() is None
    assert db_session.query(Trip).count() == 0


def test_the_confirmation_has_to_match_the_account(client, auth_headers, db_session):
    """A dialog can be clicked through; typing the wrong address cannot be
    mistaken for consent to delete this one."""
    headers = auth_headers("frodo@bagend.dev")

    response = _delete_account(client, headers, "someone-else@example.com")

    assert response.status_code == 400
    assert db_session.query(User).filter(User.email == "frodo@bagend.dev").first() is not None


def test_a_shared_trip_can_be_left_with_everyone_still_on_it(
    client, auth_headers, db_session
):
    """Option C: no one inherits it, so no single inactive account can strand
    the rest."""
    owner = auth_headers("frodo@bagend.dev")
    guest = auth_headers("sam@bagend.dev")
    trip_id = _trip(client, owner, "Fellowship")
    _share(client, owner, guest, trip_id)

    response = _delete_account(client, owner, "frodo@bagend.dev", shared="keep")

    assert response.status_code == 200
    assert response.json()["trips_left_with_collaborators"] == 1

    trip = db_session.get(Trip, trip_id)
    assert trip is not None
    assert trip.user_id is None
    # and the remaining collaborator still reaches it
    assert client.get(f"/trips/{trip_id}", headers=guest).status_code == 200


def test_an_editor_can_manage_a_trip_that_has_no_creator(client, auth_headers):
    """Creator-only powers pass to the editors, or an ownerless trip could
    never be deleted, shared or tidied up by anyone."""
    owner = auth_headers("frodo@bagend.dev")
    guest = auth_headers("sam@bagend.dev")
    trip_id = _trip(client, owner, "Fellowship")
    _share(client, owner, guest, trip_id)
    _delete_account(client, owner, "frodo@bagend.dev", shared="keep")

    # inviting is a creator-only action
    assert client.post(f"/trips/{trip_id}/invite", headers=guest).status_code == 200
    assert client.delete(f"/trips/{trip_id}", headers=guest).status_code == 204


def test_a_viewer_does_not_inherit_the_creator_s_powers(client, auth_headers, db_session):
    owner = auth_headers("frodo@bagend.dev")
    viewer = auth_headers("pippin@tookborough.dev")
    trip_id = _trip(client, owner, "Fellowship")
    token = client.post(
        f"/trips/{trip_id}/invite?role=viewer", headers=owner
    ).json()["token"]
    client.post(f"/invites/{token}/accept", headers=viewer)

    _delete_account(client, owner, "frodo@bagend.dev", shared="keep")

    assert client.delete(f"/trips/{trip_id}", headers=viewer).status_code == 404
    assert db_session.get(Trip, trip_id) is not None


def test_taking_a_shared_trip_with_you_schedules_it_rather_than_dropping_it(
    client, auth_headers, db_session
):
    """Collaborators get the grace period to object or take a copy."""
    owner = auth_headers("frodo@bagend.dev")
    guest = auth_headers("sam@bagend.dev")
    trip_id = _trip(client, owner, "Fellowship")
    _share(client, owner, guest, trip_id)

    response = _delete_account(client, owner, "frodo@bagend.dev", shared="delete")

    assert response.json()["trips_scheduled"] == 1
    trip = db_session.get(Trip, trip_id)
    assert trip is not None
    assert trip.deletion_scheduled_at is not None
    # still readable in the meantime
    assert client.get(f"/trips/{trip_id}", headers=guest).status_code == 200


def test_the_sweep_only_takes_trips_whose_grace_has_run_out(
    client, auth_headers, db_session
):
    owner = auth_headers("frodo@bagend.dev")
    guest = auth_headers("sam@bagend.dev")
    trip_id = _trip(client, owner, "Fellowship")
    _share(client, owner, guest, trip_id)
    _delete_account(client, owner, "frodo@bagend.dev", shared="delete")

    assert sweep_scheduled_deletions(db_session) == 0
    assert db_session.get(Trip, trip_id) is not None

    later = datetime.now(timezone.utc) + SHARED_TRIP_GRACE + timedelta(days=1)
    assert sweep_scheduled_deletions(db_session, now=later) == 1
    assert db_session.get(Trip, trip_id) is None


def test_deleting_does_not_touch_a_trip_somebody_else_created(
    client, auth_headers, db_session
):
    """The departing user was a guest here, so only their membership goes."""
    host = auth_headers("sam@bagend.dev")
    leaver = auth_headers("frodo@bagend.dev")
    trip_id = _trip(client, host, "Sam's trip")
    _share(client, host, leaver, trip_id)

    _delete_account(client, leaver, "frodo@bagend.dev")

    trip = db_session.get(Trip, trip_id)
    assert trip is not None
    assert client.get(f"/trips/{trip_id}", headers=host).status_code == 200
    assert db_session.query(TripCollaborator).filter_by(trip_id=trip_id).count() == 0


def test_private_journal_entries_go_wherever_they_are(client, auth_headers, db_session):
    """They are private to the account, so they cannot outlive it, including
    on a trip that does."""
    host = auth_headers("sam@bagend.dev")
    leaver = auth_headers("frodo@bagend.dev")
    trip_id = _trip(client, host, "Sam's trip")
    _share(client, host, leaver, trip_id)
    client.post(
        f"/trips/{trip_id}/journal",
        json={"entry_date": "2026-08-19", "body": "Private thoughts"},
        headers=leaver,
    )

    response = _delete_account(client, leaver, "frodo@bagend.dev")

    assert response.json()["journal_entries_deleted"] == 1
    assert db_session.query(JournalEntry).count() == 0


def test_their_assignments_are_cleared_rather_than_deleted(
    client, auth_headers, db_session
):
    """The tent is still on the packing list. It is just nobody's now."""
    host = auth_headers("sam@bagend.dev")
    leaver = auth_headers("frodo@bagend.dev")
    trip_id = _trip(client, host, "Sam's trip")
    _share(client, host, leaver, trip_id)

    leaver_id = db_session.query(User).filter(User.email == "frodo@bagend.dev").first().id
    gear = Gear(trip_id=trip_id, name="Tent", assigned_to_user_id=leaver_id)
    db_session.add(gear)
    db_session.commit()

    _delete_account(client, leaver, "frodo@bagend.dev")

    db_session.expire_all()
    remaining = db_session.query(Gear).filter_by(trip_id=trip_id).one()
    assert remaining.name == "Tent"
    assert remaining.assigned_to_user_id is None


def test_deleting_requires_being_signed_in(client):
    response = client.request(
        "DELETE", "/auth/me", json={"shared_trips": "keep", "confirm": "x@example.com"}
    )
    assert response.status_code == 401
