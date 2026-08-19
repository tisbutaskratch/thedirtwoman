import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.ratelimit import limiter
from app.db.base import Base
from app.db.session import get_db
from app.main import app


@pytest.fixture(autouse=True)
def no_rate_limiting(monkeypatch):
    """Tests register many accounts from one address on purpose.

    Off by default so every other test is unaffected, and the counters are
    cleared around each test so the limiter's own tests, which turn it back
    on, cannot leak state into anything else.
    """
    monkeypatch.setattr(settings, "rate_limit_enabled", False)
    limiter.reset()
    yield
    limiter.reset()


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = testing_session_local()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def auth_headers(client):
    def _register(email: str = "sam@bagend.dev", password: str = "gardenpath1") -> dict[str, str]:
        response = client.post(
            "/auth/register",
            json={"email": email, "password": password, "name": "Samwise Gamgee"},
        )
        assert response.status_code == 201, response.text
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    return _register
