from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[int] = mapped_column(primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    distance_miles: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    geometry: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    trip: Mapped[Trip] = relationship(back_populates="routes")
