from app.core.config import Settings


def test_normalizes_bare_postgres_scheme():
    settings = Settings(database_url="postgres://user:pass@host:5432/db")
    assert settings.database_url == "postgresql+psycopg2://user:pass@host:5432/db"


def test_normalizes_bare_postgresql_scheme():
    settings = Settings(database_url="postgresql://user:pass@host:5432/db")
    assert settings.database_url == "postgresql+psycopg2://user:pass@host:5432/db"


def test_leaves_url_with_driver_already_specified_alone():
    settings = Settings(database_url="postgresql+psycopg2://user:pass@host:5432/db")
    assert settings.database_url == "postgresql+psycopg2://user:pass@host:5432/db"


def test_leaves_sqlite_url_alone():
    settings = Settings(database_url="sqlite:///./dev.db")
    assert settings.database_url == "sqlite:///./dev.db"
