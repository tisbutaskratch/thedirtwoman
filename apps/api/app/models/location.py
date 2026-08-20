from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip


class LocationKind(str, enum.Enum):
    """What a place is, in the terms a traveller would use.

    Deliberately short. Every extra option is a decision at the point
    somebody is trying to type an address, and "poi" absorbs the long tail.

    "lodging" rather than "hotel" because the label was the problem: a
    mother's spare room, an Airbnb, a hostel and a friend's sofa are all
    where you are staying, and none of them are a hotel. "transit" exists
    because airports, stations and ferry terminals had nowhere to go, which
    is most of the shape of an international or domestic trip.
    """

    waypoint = "waypoint"
    campsite = "campsite"
    lodging = "lodging"
    transit = "transit"
    poi = "poi"
    fuel_stop = "fuel_stop"


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    lng: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    kind: Mapped[LocationKind] = mapped_column(
        Enum(LocationKind, native_enum=False), nullable=False
    )
    arrival_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    confirmation_ref: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    trip: Mapped[Trip] = relationship(back_populates="locations")
