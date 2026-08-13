def test_register_returns_token_pair(client):
    response = client.post(
        "/auth/register",
        json={"email": "sam@bagend.dev", "password": "gardenpath1", "name": "Samwise Gamgee"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == "sam@bagend.dev"
    assert "access_token" in body
    assert "refresh_token" in body


def test_register_duplicate_email_rejected(client):
    payload = {"email": "sam@bagend.dev", "password": "gardenpath1", "name": "Sam"}
    client.post("/auth/register", json=payload)
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 409


def test_login_success(client):
    client.post(
        "/auth/register",
        json={"email": "sam@bagend.dev", "password": "gardenpath1", "name": "Sam"},
    )
    response = client.post(
        "/auth/login", json={"email": "sam@bagend.dev", "password": "gardenpath1"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password_rejected(client):
    client.post(
        "/auth/register",
        json={"email": "sam@bagend.dev", "password": "gardenpath1", "name": "Sam"},
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
        json={"email": "sam@bagend.dev", "password": "gardenpath1", "name": "Sam"},
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
