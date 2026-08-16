from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Float, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip


class BackpackingDetail(Base):
    __tablename__ = "backpacking_details"

    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), primary_key=True)
    base_pack_weight_oz: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    permit_required: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    permit_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resupply_plan: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # Bear canisters are legally required in parts of the Sierra, Yosemite,
    # Sequoia/Kings Canyon and the Adirondacks — worth tracking explicitly.
    bear_canister_required: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    # Water planning drives the whole day: carry capacity vs. the longest
    # stretch between reliable sources.
    water_capacity_liters: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longest_dry_stretch_mi: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    total_distance_mi: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    elevation_gain_ft: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    trip: Mapped[Trip] = relationship(back_populates="backpacking_detail")
