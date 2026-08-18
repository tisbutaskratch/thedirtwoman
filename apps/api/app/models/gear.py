from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Enum, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import RequiredLevel

if TYPE_CHECKING:
    from app.models.trip import Trip
    from app.models.user import User


# Kept as an alias so existing imports keep working; the enum itself is
# shared with tasks.
GearRequiredLevel = RequiredLevel


class Gear(Base):
    __tablename__ = "gear"

    id: Mapped[int] = mapped_column(primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    weight_oz: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    packed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    required_level: Mapped[RequiredLevel] = mapped_column(
        # Explicit name pins the existing CHECK constraint now that the enum
        # class is shared and no longer named after gear.
        Enum(RequiredLevel, native_enum=False, name="gearrequiredlevel"),
        nullable=False,
        default=RequiredLevel.required,
    )
    # Who's bringing/responsible for this item. Used for the group's
    # "shareables" list (e.g. one stove shared across the whole trip).
    assigned_to_user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    # "Everyone brings one". Distinct from unassigned, which means nobody
    # has claimed it yet.
    assigned_to_all: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    trip: Mapped[Trip] = relationship(back_populates="gear")
    assigned_to: Mapped[Optional[User]] = relationship(foreign_keys=[assigned_to_user_id])
