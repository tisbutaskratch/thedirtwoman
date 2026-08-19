from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING, Optional

from sqlalchemy import JSON, Boolean, Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip


class InternationalDetail(Base):
    __tablename__ = "international_details"

    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), primary_key=True)
    home_currency: Mapped[Optional[str]] = mapped_column(String(3), nullable=True)
    # JSON rather than Postgres' native ARRAY so this stays portable across
    # dialects (this codebase already avoids native_enum for the same reason).
    destination_currencies: Mapped[Optional[list[str]]] = mapped_column(JSON, nullable=True)
    primary_timezone: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    # Many countries require a passport valid 6+ months past the return date,
    # so the expiry is worth surfacing as a hard readiness check.
    passport_expiry: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    visa_required: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    visa_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    vaccinations_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    travel_insurance_ref: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    embassy_contact: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    # US State Dept's Smart Traveler Enrollment Program.
    step_enrolled: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)

    trip: Mapped[Trip] = relationship(back_populates="international_detail")
