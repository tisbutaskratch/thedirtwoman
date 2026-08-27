from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip
    from app.models.user import User


class SectionKey(str, enum.Enum):
    """The parts of a trip page somebody might want at the top.

    A closed set rather than free text, because these are names of things
    the client renders. An unknown key would be stored happily and then
    silently do nothing, which is the worst of both.
    """

    members = "members"
    timeline = "timeline"
    files = "files"
    contributions = "contributions"
    packing = "packing"
    tasks = "tasks"
    expenses = "expenses"
    locations = "locations"
    notes = "notes"
    journal = "journal"
    photos = "photos"
    assignments = "assignments"


class TripPin(Base):
    """One person's decision to keep a trip at the top of their list.

    Per user, not per trip. A trip is shared, but pinning it is a private
    view preference: pinning Moab should not rearrange anybody else's
    dashboard. That is the whole reason this is its own table rather than a
    flag on the trip.

    It also sidesteps the owner/collaborator split that per-trip vehicle
    fields suffer from, since the creator and the invited are the same shape
    of row here.
    """

    __tablename__ = "trip_pins"
    __table_args__ = (UniqueConstraint("user_id", "trip_id", name="uq_trip_pin"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship()
    trip: Mapped[Trip] = relationship(back_populates="pins")


class SectionPin(Base):
    """A section this person wants at the top of every trip page.

    Deliberately not per trip. "I always look at the packing list first" is a
    fact about how somebody uses the app, not about one holiday, and setting
    it again on every new trip would make the feature not worth having.
    """

    __tablename__ = "section_pins"
    __table_args__ = (UniqueConstraint("user_id", "section", name="uq_section_pin"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    section: Mapped[SectionKey] = mapped_column(
        Enum(SectionKey, native_enum=False), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship()
