from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import JSON, ForeignKey, String
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

    trip: Mapped[Trip] = relationship(back_populates="international_detail")
