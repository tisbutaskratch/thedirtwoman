from __future__ import annotations

import enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip


class DomesticTravelMode(str, enum.Enum):
    """How you're actually getting there."""

    car = "car"
    train = "train"
    flight = "flight"


class DomesticDetail(Base):
    """
    In-country travel by car, rail, or a domestic flight.

    One table with mode-specific columns left null rather than three tables:
    a single trip often mixes modes (fly out, rent a car there), and the
    planning questions that matter differ far more by mode than the storage
    does.
    """

    __tablename__ = "domestic_details"

    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), primary_key=True)
    travel_mode: Mapped[Optional[DomesticTravelMode]] = mapped_column(
        Enum(DomesticTravelMode, native_enum=False), nullable=True
    )
    # Confirmation code, PNR, or rental reference. The string you'll be asked
    # for at a counter.
    booking_ref: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    origin: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    destination: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # --- Driving -------------------------------------------------------
    is_rental: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    rental_company: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    total_distance_mi: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    vehicle_mpg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fuel_price_per_gallon: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # --- Rail ----------------------------------------------------------
    rail_operator: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    rail_pass_type: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    # A pass is not a seat: many services require a separate reservation on
    # top of it, and those sell out well before the train does.
    seat_reservation_required: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    seat_reservations_booked: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)

    # --- Flying --------------------------------------------------------
    airline: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    checked_bags: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    carry_on_only: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    # Booked as separate tickets means nobody owns your connection: bags don't
    # transfer and a delay on the first leg is your problem, not the airline's.
    separate_tickets: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    layover_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # --- Where you're sleeping ------------------------------------------
    lodging_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    lodging_ref: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    trip: Mapped[Trip] = relationship(back_populates="domestic_detail")
