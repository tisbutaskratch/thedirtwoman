from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class RigKind(str, enum.Enum):
    """What sort of thing it is, which is mostly about which icon to draw."""

    motorcycle = "motorcycle"
    truck = "truck"
    suv = "suv"
    van = "van"
    car = "car"
    other = "other"


class Rig(Base):
    """
    A vehicle somebody owns.

    Deliberately outside the trip. A rig has its own life: you buy it, you
    change its tyres, you sell it, and none of that is a trip event. It also
    has different rules from everything else in this app, because a rig
    belongs to exactly one person and is never shared, while a trip is shared
    by design. Two different sets of invariants means two different
    aggregates, not one table with a flag.

    Trips do not point at rigs. When you bring a rig on a trip, the trip
    copies down the name and the range it had at the time. That way selling
    the truck and deleting it here does not quietly rewrite what you rode
    last autumn.
    """

    __tablename__ = "rigs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    # What you call it, which is rarely the make and model. "The Tacoma",
    # "Big Red", "the loaner".
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    kind: Mapped[RigKind] = mapped_column(
        Enum(RigKind, native_enum=False), nullable=False, default=RigKind.other
    )
    make: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    fuel_capacity_gal: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fuel_economy_mpg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    # A fact about the vehicle, not about any one trip, which is why it
    # lives here rather than only on the overlanding panel that asks for it.
    ground_clearance_in: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    tire_size: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    drivetrain: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    owner: Mapped[User] = relationship()
