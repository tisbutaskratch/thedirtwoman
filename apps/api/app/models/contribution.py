from __future__ import annotations

import enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip
    from app.models.user import User


class ContributionKind(str, enum.Enum):
    """What someone is turning up with."""

    food = "food"
    drink = "drink"
    dessert = "dessert"
    game = "game"
    supplies = "supplies"
    other = "other"


class Contribution(Base):
    """
    One thing somebody is bringing, on one day.

    Deliberately not a packing list row. A packing list answers "have I got
    it in the car", and its weight and required-or-optional columns mean
    nothing here. This answers "who is bringing the ham, and is it Thursday
    or Friday", which needs a day and a person and nothing about ounces.
    """

    __tablename__ = "contributions"

    id: Mapped[int] = mapped_column(primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    kind: Mapped[ContributionKind] = mapped_column(
        Enum(ContributionKind, native_enum=False),
        nullable=False,
        default=ContributionKind.food,
    )
    # Day 1 is the gathering's first day, matching how activities number the
    # timeline. Nullable because "somebody bring a board game at some point"
    # is a legitimate thing to write down before anyone has picked a day.
    day_index: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    # Who is bringing it. Null means nobody has claimed it yet, which is the
    # whole point of writing the list down before people volunteer.
    assigned_to_user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    # "Everybody bring a side". Different from unclaimed, where one person
    # still needs to put their hand up.
    assigned_to_all: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    # Roughly how many people it feeds, so the host can see at a glance
    # whether there are four desserts and no mains.
    serves: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    # Claimed is a promise; confirmed is that they have actually said yes.
    # Worth separating in the week before a holiday.
    confirmed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    trip: Mapped[Trip] = relationship(back_populates="contributions")
    assigned_to: Mapped[Optional[User]] = relationship(foreign_keys=[assigned_to_user_id])
