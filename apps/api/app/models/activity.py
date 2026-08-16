from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.location import Location
    from app.models.trip import Trip


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    day_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # Per-entry prep items (e.g. "Book Lil Abner's for night 2") — the
    # itinerary PDFs' "To-Do" column, scoped to this specific timeline
    # entry rather than the trip-wide checklist.
    todos: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location_id: Mapped[Optional[int]] = mapped_column(ForeignKey("locations.id"), nullable=True)

    trip: Mapped[Trip] = relationship(back_populates="activities")
    location: Mapped[Optional[Location]] = relationship()
