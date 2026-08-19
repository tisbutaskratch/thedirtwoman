from typing import Optional

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

    # Rate limiting. Disabled in tests, where hundreds of accounts are created
    # from one address on purpose.
    rate_limit_enabled: bool = True
    # How many proxies of our own sit in front of the app. Render terminates
    # TLS and forwards, so one. Used to find the caller's real address in
    # X-Forwarded-For without trusting entries the caller invented.
    trusted_proxy_hops: int = 1
    # The largest request body we will read, in bytes. Uploads are the only
    # legitimately large thing here.
    max_request_bytes: int = 25 * 1024 * 1024

    # Object storage for uploads. Set these and attachments go to an
    # S3-compatible bucket (Cloudflare R2); leave them unset and they go to
    # media_root on local disk. Deployments must set them: Render's
    # filesystem is ephemeral, so disk-backed uploads do not survive a
    # restart. The bucket is private; the API hands out short-lived signed
    # URLs after checking trip access.
    s3_bucket: Optional[str] = None
    s3_endpoint_url: Optional[str] = None
    s3_access_key_id: Optional[str] = None
    s3_secret_access_key: Optional[str] = None
    s3_region: str = "auto"
    attachment_url_ttl_seconds: int = 900
    frontend_base_url: str = "http://localhost:5173"

    # Email invites. Preferred path is Resend's HTTP API: it runs on 443, and
    # Render's free instances block outbound connections on every SMTP port,
    # which shows up as a hang rather than a refusal. SMTP is kept for anyone
    # self-hosting somewhere without that restriction. With neither set,
    # invites are logged instead of sent, which is the right default locally.
    resend_api_key: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    # Overridden per deployment. Must be an address on a domain you control,
    # or providers will reject the mail outright.
    # Bounded so a blocked port cannot hang a request until the gateway times
    # it out; a mail send is never worth holding a worker for.
    smtp_timeout_seconds: float = 10.0
    smtp_from_email: str = "noreply@thedirthags.com"

    @property
    def uses_object_storage(self) -> bool:
        """True when a bucket and its credentials are fully configured.

        All four are required together: a half-set bucket would otherwise
        fail at upload time rather than at start-up.
        """
        return all(
            (
                self.s3_bucket,
                self.s3_endpoint_url,
                self.s3_access_key_id,
                self.s3_secret_access_key,
            )
        )

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
