from datetime import datetime, timedelta, timezone

from app.models.trip_invite import TripInvite


def _create_trip(client, headers, title="Fellowship of the Ring"):
    response = client.post(
        "/trips", json={"title": title, "trip_type": "backpacking"}, headers=headers
    )
    return response.json()["id"]


def test_owner_can_create_invite(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_trip(client, headers)

    response = client.post(f"/trips/{trip_id}/invite", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["trip_id"] == trip_id
    assert len(body["token"]) > 20


def test_non_owner_cannot_create_invite(client, auth_headers):
    owner_headers = auth_headers("frodo@bagend.dev")
    other_headers = auth_headers("sam@bagend.dev")
    trip_id = _create_trip(client, owner_headers)

    response = client.post(f"/trips/{trip_id}/invite", headers=other_headers)
    assert response.status_code == 404


def test_invite_is_reused_until_revoked(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_trip(client, headers)

    first = client.post(f"/trips/{trip_id}/invite", headers=headers).json()
    second = client.post(f"/trips/{trip_id}/invite", headers=headers).json()
    assert first["token"] == second["token"]

    client.delete(f"/trips/{trip_id}/invite", headers=headers)
    third = client.post(f"/trips/{trip_id}/invite", headers=headers).json()
    assert third["token"] != first["token"]


def test_invite_preview_requires_auth(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_trip(client, headers)
    token = client.post(f"/trips/{trip_id}/invite", headers=headers).json()["token"]

    response = client.get(f"/invites/{token}")
    assert response.status_code == 401


def test_invite_preview_shows_trip_and_owner(client, auth_headers):
    owner_headers = auth_headers("frodo@bagend.dev")
    other_headers = auth_headers("sam@bagend.dev")
    trip_id = _create_trip(client, owner_headers)
    token = client.post(f"/trips/{trip_id}/invite", headers=owner_headers).json()["token"]

    response = client.get(f"/invites/{token}", headers=other_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["trip_id"] == trip_id
    assert body["invited_by_name"] == "Samwise Gamgee"
    assert body["role"] == "editor"
    assert body["already_member"] is False


def test_accept_invite_grants_collaborator_access(client, auth_headers):
    owner_headers = auth_headers("frodo@bagend.dev")
    other_headers = auth_headers("sam@bagend.dev")
    trip_id = _create_trip(client, owner_headers)
    token = client.post(f"/trips/{trip_id}/invite", headers=owner_headers).json()["token"]

    accept = client.post(f"/invites/{token}/accept", headers=other_headers)
    assert accept.status_code == 200
    assert accept.json()["trip_id"] == trip_id

    response = client.get(f"/trips/{trip_id}", headers=other_headers)
    assert response.status_code == 200

    listed = client.get("/trips", headers=other_headers).json()
    assert any(t["id"] == trip_id for t in listed)


def test_collaborator_can_edit_but_not_delete_trip(client, auth_headers):
    owner_headers = auth_headers("frodo@bagend.dev")
    collaborator_headers = auth_headers("sam@bagend.dev")
    trip_id = _create_trip(client, owner_headers)
    token = client.post(f"/trips/{trip_id}/invite", headers=owner_headers).json()["token"]
    client.post(f"/invites/{token}/accept", headers=collaborator_headers)

    # can add trip content
    response = client.post(
        f"/trips/{trip_id}/locations",
        json={"name": "Rivendell", "kind": "waypoint"},
        headers=collaborator_headers,
    )
    assert response.status_code == 201

    # can edit trip metadata
    response = client.patch(
        f"/trips/{trip_id}", json={"archived": True}, headers=collaborator_headers
    )
    assert response.status_code == 200

    # cannot delete the trip
    response = client.delete(f"/trips/{trip_id}", headers=collaborator_headers)
    assert response.status_code == 404

    # cannot manage invites or remove collaborators
    response = client.post(f"/trips/{trip_id}/invite", headers=collaborator_headers)
    assert response.status_code == 404


def test_owner_can_list_and_remove_collaborator(client, auth_headers):
    owner_headers = auth_headers("frodo@bagend.dev")
    collaborator_headers = auth_headers("sam@bagend.dev")
    trip_id = _create_trip(client, owner_headers)
    token = client.post(f"/trips/{trip_id}/invite", headers=owner_headers).json()["token"]
    client.post(f"/invites/{token}/accept", headers=collaborator_headers)

    # The creator is listed alongside everyone else, flagged is_creator, because
    # the UI calls the whole roster collaborators and never says "owner".
    collaborators = client.get(f"/trips/{trip_id}/collaborators", headers=owner_headers).json()
    assert [(c["email"], c["is_creator"]) for c in collaborators] == [
        ("frodo@bagend.dev", True),
        ("sam@bagend.dev", False),
    ]
    collaborator_user_id = next(c["user_id"] for c in collaborators if not c["is_creator"])

    response = client.delete(
        f"/trips/{trip_id}/collaborators/{collaborator_user_id}", headers=owner_headers
    )
    assert response.status_code == 204

    response = client.get(f"/trips/{trip_id}", headers=collaborator_headers)
    assert response.status_code == 404


def test_expired_invite_is_rejected(client, auth_headers, db_session):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_trip(client, headers)

    expired = TripInvite(
        trip_id=trip_id,
        token="already-expired-token",
        created_by_user_id=1,
        expires_at=datetime.now(timezone.utc) - timedelta(days=1),
    )
    db_session.add(expired)
    db_session.commit()

    response = client.get(f"/invites/{expired.token}", headers=headers)
    assert response.status_code == 404


def test_owner_accepting_own_invite_is_a_noop(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_trip(client, headers)
    token = client.post(f"/trips/{trip_id}/invite", headers=headers).json()["token"]

    response = client.post(f"/invites/{token}/accept", headers=headers)
    assert response.status_code == 200

    # Accepting your own invite adds nobody: the creator is already on the roster.
    collaborators = client.get(f"/trips/{trip_id}/collaborators", headers=headers).json()
    assert [c["email"] for c in collaborators] == ["frodo@bagend.dev"]
    assert collaborators[0]["is_creator"] is True
