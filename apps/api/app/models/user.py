from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Consent, recorded rather than assumed. The version matters as much as
    # the timestamp: agreeing to one policy is not agreeing to a later one,
    # so when the policy changes this is what identifies who needs asking
    # again. Nullable because accounts created before consent existed have
    # not given it, and pretending otherwise would be the whole problem.
    privacy_policy_version: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    privacy_accepted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    trips: Mapped[list["Trip"]] = relationship(back_populates="user", cascade="all, delete-orphan")
