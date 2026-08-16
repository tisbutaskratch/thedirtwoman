from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip


class CampingDetail(Base):
    __tablename__ = "camping_details"

    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), primary_key=True)
    campground_reservation_ref: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    fire_restrictions_checked: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    # Whether the campground has potable water decides how much you haul in
    # (~1 gal per person per day is the usual baseline).
    potable_water_available: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    # Most campgrounds require firewood be bought locally to avoid moving pests.
    firewood_policy: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    check_in_time: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    quiet_hours: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    meal_plan: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    trip: Mapped[Trip] = relationship(back_populates="camping_detail")
