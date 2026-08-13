from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip


class MotocampingDetail(Base):
    __tablename__ = "motocamping_details"

    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), primary_key=True)
    motorcycle_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    fuel_capacity_gal: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fuel_economy_mpg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    daily_ride_target_miles: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    trip: Mapped[Trip] = relationship(back_populates="motocamping_detail")
