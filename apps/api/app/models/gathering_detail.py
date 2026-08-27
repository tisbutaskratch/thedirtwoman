from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip


class GatheringDetail(Base):
    """
    A holiday or a get-together, at somebody's house.

    Not a trip in the sense the other types mean it. Nobody is packing for
    range or checking a water source. What people actually need to agree on
    is who is coming, whose kitchen it is, and what everyone is bringing,
    which is why the contributions board carries the weight here and this
    table stays small.
    """

    __tablename__ = "gathering_details"

    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), primary_key=True)
    # "Thanksgiving", "Diwali", "Ben's 40th". The reason everyone is coming.
    occasion: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    # Whose house. Kept as free text rather than a user reference, because the
    # host is often somebody's mother, who is not going to make an account.
    host_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    headcount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    # Allergies, vegetarians, the cousin who cannot have gluten. The single
    # most useful thing to have written down before anyone starts cooking.
    dietary_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # Two ovens or one, whether there is a grill, how much fridge space there
    # is. Decides how many people can bring something that needs reheating.
    kitchen_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    trip: Mapped[Trip] = relationship(back_populates="gathering_detail")
