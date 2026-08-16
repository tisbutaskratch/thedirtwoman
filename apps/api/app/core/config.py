from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/adventure_planner"
    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30
    trip_invite_expire_days: int = 7
    cors_origins: list[str] = ["http://localhost:5173"]
    media_root: str = "media"

    @field_validator("database_url")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        # Managed Postgres providers (Render, Railway, Heroku) hand out
        # postgres:// or postgresql:// URLs without a driver; SQLAlchemy
        # needs the driver spelled out explicitly.
        for prefix in ("postgres://", "postgresql://"):
            if value.startswith(prefix) and "+psycopg2" not in value:
                return "postgresql+psycopg2://" + value[len(prefix) :]
        return value


settings = Settings()
