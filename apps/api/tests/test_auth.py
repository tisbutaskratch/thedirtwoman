from app.core.policy import PRIVACY_POLICY_VERSION


def test_register_returns_token_pair(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "sam@bagend.dev",
            "password": "gardenpath1",
            "name": "Samwise Gamgee",
            "accepted_privacy_version": PRIVACY_POLICY_VERSION,
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == "sam@bagend.dev"
    assert "access_token" in body
    assert "refresh_token" in body


def test_register_duplicate_email_rejected(client):
    payload = {
        "email": "sam@bagend.dev",
        "password": "gardenpath1",
        "name": "Sam",
        "accepted_privacy_version": PRIVACY_POLICY_VERSION,
    }
    client.post("/auth/register", json=payload)
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 409


def test_login_success(client):
    client.post(
        "/auth/register",
        json={
            "email": "sam@bagend.dev",
            "password": "gardenpath1",
            "name": "Sam",
            "accepted_privacy_version": PRIVACY_POLICY_VERSION,
        },
    )
    response = client.post(
        "/auth/login", json={"email": "sam@bagend.dev", "password": "gardenpath1"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password_rejected(client):
    client.post(
        "/auth/register",
        json={
            "email": "sam@bagend.dev",
            "password": "gardenpath1",
            "name": "Sam",
            "accepted_privacy_version": PRIVACY_POLICY_VERSION,
        },
    )
    response = client.post(
        "/auth/login", json={"email": "sam@bagend.dev", "password": "wrong-password"}
    )
    assert response.status_code == 401


def test_me_requires_valid_token(client, auth_headers):
    response = client.get("/auth/me", headers=auth_headers())
    assert response.status_code == 200
    assert response.json()["email"] == "sam@bagend.dev"


def test_me_rejects_missing_token(client):
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_refresh_issues_new_access_token(client):
    register = client.post(
        "/auth/register",
        json={
            "email": "sam@bagend.dev",
            "password": "gardenpath1",
            "name": "Sam",
            "accepted_privacy_version": PRIVACY_POLICY_VERSION,
        },
    )
    refresh_token = register.json()["refresh_token"]

    response = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_refresh_rejects_access_token(client, auth_headers):
    headers = auth_headers()
    access_token = headers["Authorization"].split(" ")[1]

    response = client.post("/auth/refresh", json={"refresh_token": access_token})
    assert response.status_code == 401


def test_registering_records_which_policy_was_agreed_to(client, db_session):
    """A timestamp alone cannot answer "agreed to what", which is the only
    question that matters once the policy changes."""
    from app.core.policy import PRIVACY_POLICY_VERSION
    from app.models.user import User

    response = client.post(
        "/auth/register",
        json={
            "email": "frodo@bagend.dev",
            "password": "hunter2hunter2",
            "name": "Frodo",
            "accepted_privacy_version": PRIVACY_POLICY_VERSION,
        },
    )
    assert response.status_code == 201

    user = db_session.query(User).filter(User.email == "frodo@bagend.dev").first()
    assert user.privacy_policy_version == PRIVACY_POLICY_VERSION
    assert user.privacy_accepted_at is not None


def test_registration_without_agreeing_is_rejected(client):
    """The field is required, so a client cannot quietly omit it."""
    response = client.post(
        "/auth/register",
        json={"email": "frodo@bagend.dev", "password": "hunter2hunter2", "name": "Frodo"},
    )
    assert response.status_code == 422


def test_agreeing_to_an_older_policy_is_refused(client):
    """A stale page reports agreement to text its user was shown, which is not
    this text. Recording it as consent to the current policy would be a lie."""
    response = client.post(
        "/auth/register",
        json={
            "email": "frodo@bagend.dev",
            "password": "hunter2hunter2",
            "name": "Frodo",
            "accepted_privacy_version": "2020-01-01",
        },
    )
    assert response.status_code == 409
    assert "privacy policy" in response.json()["detail"].lower()


def test_the_two_policy_versions_agree():
    """The frontend sends its constant and the API checks against its own, so
    if these ever drift, registration breaks for everyone at once."""
    import pathlib
    import re

    from app.core.policy import PRIVACY_POLICY_VERSION

    web = pathlib.Path(__file__).resolve().parents[2] / "web" / "src" / "lib" / "privacy.ts"
    match = re.search(r'PRIVACY_POLICY_VERSION = "([^"]+)"', web.read_text())
    assert match, "could not find the frontend's policy version"
    assert match.group(1) == PRIVACY_POLICY_VERSION
