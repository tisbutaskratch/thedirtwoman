from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip


class CampingDetail(Base):
    __tablename__ = "camping_details"

    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), primary_key=True)
    campground_reservation_ref: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    fire_restrictions_checked: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)

    trip: Mapped[Trip] = relationship(back_populates="camping_detail")
