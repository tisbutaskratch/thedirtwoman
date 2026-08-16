from __future__ import annotations

import enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Enum, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip
    from app.models.user import User


class GearRequiredLevel(str, enum.Enum):
    """Matches the group packing lists' 3-level column: Yes / No / No
    (strongly suggested)."""

    required = "required"
    suggested = "suggested"
    optional = "optional"


class Gear(Base):
    __tablename__ = "gear"

    id: Mapped[int] = mapped_column(primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    weight_oz: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    packed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    required_level: Mapped[GearRequiredLevel] = mapped_column(
        Enum(GearRequiredLevel, native_enum=False),
        nullable=False,
        default=GearRequiredLevel.required,
    )
    # Who's bringing/responsible for this item — used for the group's
    # "shareables" list (e.g. one stove shared across the whole trip).
    assigned_to_user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    trip: Mapped[Trip] = relationship(back_populates="gear")
    assigned_to: Mapped[Optional[User]] = relationship(foreign_keys=[assigned_to_user_id])
