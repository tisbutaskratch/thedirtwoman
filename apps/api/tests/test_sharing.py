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


def test_inviting_still_succeeds_when_the_mail_provider_is_down(client, auth_headers, monkeypatch):
    """The invite is saved and its link works regardless of email.

    This shipped the other way round: an SMTP failure propagated out of the
    request, so the caller saw a 502 while the invite sat in the database.
    The form never cleared and the pending list never refreshed, because as
    far as the browser knew the whole thing had failed.
    """
    import smtplib

    from app.core.config import settings

    monkeypatch.setattr(settings, "smtp_host", "smtp.invalid.example")

    def explode(*args, **kwargs):
        raise smtplib.SMTPConnectError(421, "unavailable")

    monkeypatch.setattr(smtplib, "SMTP", explode)

    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_trip(client, headers)

    response = client.post(
        f"/trips/{trip_id}/invites/email",
        json={"email": "sam@bagend.dev", "role": "editor"},
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["email"] == "sam@bagend.dev"
    # and it is pending, so the sender can copy the link by hand
    pending = client.get(f"/trips/{trip_id}/pending-invites", headers=headers).json()
    assert [p["email"] for p in pending] == ["sam@bagend.dev"]


def test_invites_go_over_https_when_a_resend_key_is_set(client, auth_headers, monkeypatch):
    """HTTPS is preferred over SMTP: Render's free tier blocks every SMTP
    port outbound, and the failure mode is a hang rather than a refusal."""
    import httpx

    from app.core.config import settings

    sent = {}

    class FakeResponse:
        is_success = True
        status_code = 200
        text = "{}"

    def capture(url, **kwargs):
        sent["url"] = url
        sent["json"] = kwargs.get("json")
        sent["auth"] = kwargs.get("headers", {}).get("Authorization")
        return FakeResponse()

    monkeypatch.setattr(settings, "resend_api_key", "re_test_key")
    monkeypatch.setattr(settings, "smtp_host", "smtp.example.com")
    monkeypatch.setattr(httpx, "post", capture)

    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_trip(client, headers)
    response = client.post(
        f"/trips/{trip_id}/invites/email",
        json={"email": "sam@bagend.dev", "role": "editor"},
        headers=headers,
    )

    assert response.status_code == 200
    assert sent["url"] == "https://api.resend.com/emails"
    assert sent["auth"] == "Bearer re_test_key"
    assert sent["json"]["to"] == ["sam@bagend.dev"]
    assert "Ring" in sent["json"]["subject"] or "invited" in sent["json"]["subject"].lower()
    assert "/invite/" in sent["json"]["text"]


def test_a_rejected_send_still_leaves_a_usable_invite(client, auth_headers, monkeypatch):
    """An unverified domain or a key without send rights returns 4xx. The
    invite must survive it, so the sender can pass the link on by hand."""
    import httpx

    from app.core.config import settings

    class Rejected:
        is_success = False
        status_code = 403
        text = '{"message":"domain is not verified"}'

    monkeypatch.setattr(settings, "resend_api_key", "re_test_key")
    monkeypatch.setattr(httpx, "post", lambda url, **kw: Rejected())

    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_trip(client, headers)
    response = client.post(
        f"/trips/{trip_id}/invites/email",
        json={"email": "sam@bagend.dev", "role": "editor"},
        headers=headers,
    )

    assert response.status_code == 200
    pending = client.get(f"/trips/{trip_id}/pending-invites", headers=headers).json()
    assert [p["email"] for p in pending] == ["sam@bagend.dev"]


def test_the_response_says_when_the_email_did_not_go(client, auth_headers, monkeypatch):
    """An invite nobody was told about looks exactly like a working one, so
    the caller has to be able to tell the difference and say so."""
    import httpx

    from app.core.config import settings

    class Rejected:
        is_success = False
        status_code = 403
        text = '{"message":"domain is not verified"}'

    monkeypatch.setattr(settings, "resend_api_key", "re_test_key")
    monkeypatch.setattr(httpx, "post", lambda url, **kw: Rejected())

    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_trip(client, headers)
    response = client.post(
        f"/trips/{trip_id}/invites/email",
        json={"email": "sam@bagend.dev", "role": "editor"},
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["email_sent"] is False


def test_the_response_says_when_the_email_did_go(client, auth_headers, monkeypatch):
    import httpx

    from app.core.config import settings

    class Accepted:
        is_success = True
        status_code = 200
        text = "{}"

    monkeypatch.setattr(settings, "resend_api_key", "re_test_key")
    monkeypatch.setattr(httpx, "post", lambda url, **kw: Accepted())

    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_trip(client, headers)
    response = client.post(
        f"/trips/{trip_id}/invites/email",
        json={"email": "sam@bagend.dev", "role": "editor"},
        headers=headers,
    )

    assert response.json()["email_sent"] is True
