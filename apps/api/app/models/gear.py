from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip


class Gear(Base):
    __tablename__ = "gear"

    id: Mapped[int] = mapped_column(primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    weight_oz: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    packed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    trip: Mapped[Trip] = relationship(back_populates="gear")
