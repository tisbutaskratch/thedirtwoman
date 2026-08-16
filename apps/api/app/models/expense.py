from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Date, Float, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.trip import Trip
    from app.models.user import User


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    date: Mapped[date] = mapped_column(Date, nullable=False)
    # Who fronted the money — the group's "Who (paid)" column.
    paid_by_user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)

    trip: Mapped[Trip] = relationship(back_populates="expenses")
    paid_by: Mapped[Optional[User]] = relationship(foreign_keys=[paid_by_user_id])
    participants: Mapped[list[ExpenseParticipant]] = relationship(
        back_populates="expense", cascade="all, delete-orphan"
    )


class ExpenseParticipant(Base):
    """One person's equal share of an expense — the "Split" / "Owed" columns."""

    __tablename__ = "expense_participants"
    __table_args__ = (UniqueConstraint("expense_id", "user_id", name="uq_expense_participant"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    expense_id: Mapped[int] = mapped_column(
        ForeignKey("expenses.id"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    settled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    expense: Mapped[Expense] = relationship(back_populates="participants")
    user: Mapped[User] = relationship()
