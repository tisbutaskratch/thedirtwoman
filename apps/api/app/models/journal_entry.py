from __future__ import annotations

from datetime import date as date_type
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, Index, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip
    from app.models.user import User


class JournalEntry(Base):
    """
    One person's private diary entry for a trip.

    Unlike every other trip resource, this is scoped to an author as well as
    a trip. Collaborators and audience never see each other's entries, and
    there is deliberately no sharing switch: a diary that might become
    visible is one people write differently, which defeats the point.

    Enforcement lives in the query itself (always filtered by
    author_user_id) rather than in a response filter, so there is no route
    that could accidentally return somebody else's writing.
    """

    __tablename__ = "journal_entries"
    __table_args__ = (
        # Every read is "this trip, this author, newest first".
        Index("ix_journal_trip_author_date", "trip_id", "author_user_id", "entry_date"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), nullable=False, index=True)
    author_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    # The day being written about, which is often not the day it was written.
    entry_date: Mapped[date_type] = mapped_column(Date, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    trip: Mapped[Trip] = relationship(back_populates="journal_entries")
    author: Mapped[User] = relationship()
