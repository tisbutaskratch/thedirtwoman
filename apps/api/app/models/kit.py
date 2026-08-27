from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class Kit(Base):
    """
    A named set of things somebody keeps packed.

    Deliberately not about vehicles or tools specifically. A trailside repair
    kit, a camp kitchen, a carry-on, a ski bag and a first aid kit are all
    the same shape: a name, and a list of what is in it. Naming this after
    any one trip type would have made it useless to the others.

    A second aggregate in the personal context alongside Rig, and not a
    subtype of it: the two share an owner and a name and nothing else. A rig
    has a tank and tyres, a kit has contents, and a common base class would
    be inheritance for code reuse, which is the kind that does not survive
    the second requirement.

    Items live inside this boundary and are reached through the kit, never
    on their own. That is why the item routes are nested under it.
    """

    __tablename__ = "kits"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    # "Trailside repair", "Camp kitchen", "Carry-on", "Cold weather".
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    owner: Mapped[User] = relationship()
    items: Mapped[list[KitItem]] = relationship(
        back_populates="kit", cascade="all, delete-orphan", order_by="KitItem.id"
    )


class KitItem(Base):
    """One thing in a kit.

    Has no life outside its kit: deleting the kit deletes it, and there is
    no route that reaches it without naming the kit first.
    """

    __tablename__ = "kit_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    kit_id: Mapped[int] = mapped_column(ForeignKey("kits.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    # Two tyre levers, three spare tubes, four tent pegs. Defaults to one
    # because that is what almost everything is.
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    kit: Mapped[Kit] = relationship(back_populates="items")
