from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip


class OverlandingDetail(Base):
    __tablename__ = "overlanding_details"

    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), primary_key=True)
    vehicle_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    fuel_capacity_gal: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fuel_economy_mpg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ground_clearance_in: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    drivetrain: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    has_recovery_gear: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    comms_plan: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    emergency_contact: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    # Airing down for traction off-pavement then back up for the highway
    # return is core overlanding practice, so both pressures get tracked.
    tire_pressure_offroad_psi: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    tire_pressure_highway_psi: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    # Onboard water and jerry-can fuel both extend how far off-grid the rig
    # can realistically go.
    water_capacity_gal: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    aux_fuel_gal: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    trip: Mapped[Trip] = relationship(back_populates="overlanding_detail")
