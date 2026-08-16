from __future__ import annotations

import enum
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.activity import Activity
    from app.models.attachment import Attachment
    from app.models.backpacking_detail import BackpackingDetail
    from app.models.camping_detail import CampingDetail
    from app.models.expense import Expense
    from app.models.gear import Gear
    from app.models.international_detail import InternationalDetail
    from app.models.location import Location
    from app.models.motocamping_detail import MotocampingDetail
    from app.models.note import Note
    from app.models.overlanding_detail import OverlandingDetail
    from app.models.route import Route
    from app.models.task import Task
    from app.models.trip_collaborator import TripCollaborator
    from app.models.trip_invite import TripInvite
    from app.models.user import User


class TripType(str, enum.Enum):
    motocamping = "motocamping"
    camping = "camping"
    overlanding = "overlanding"
    backpacking = "backpacking"
    international = "international"


class TripStatus(str, enum.Enum):
    planning = "planning"
    active = "active"
    completed = "completed"


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    trip_type: Mapped[TripType] = mapped_column(Enum(TripType, native_enum=False), nullable=False)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[TripStatus] = mapped_column(
        Enum(TripStatus, native_enum=False), nullable=False, default=TripStatus.planning
    )
    # The owner's own vehicle for this trip (collaborators get theirs on
    # TripCollaborator.vehicle) — real usage always lists a full rider roster.
    owner_vehicle: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="trips")
    locations: Mapped[list[Location]] = relationship(
        back_populates="trip", cascade="all, delete-orphan", order_by="Location.order_index"
    )
    routes: Mapped[list[Route]] = relationship(back_populates="trip", cascade="all, delete-orphan")
    activities: Mapped[list[Activity]] = relationship(
        back_populates="trip", cascade="all, delete-orphan", order_by="Activity.day_index"
    )
    expenses: Mapped[list[Expense]] = relationship(
        back_populates="trip", cascade="all, delete-orphan"
    )
    gear: Mapped[list[Gear]] = relationship(back_populates="trip", cascade="all, delete-orphan")
    notes: Mapped[list[Note]] = relationship(
        back_populates="trip", cascade="all, delete-orphan", order_by="Note.created_at.desc()"
    )
    tasks: Mapped[list[Task]] = relationship(
        back_populates="trip", cascade="all, delete-orphan", order_by="Task.created_at"
    )
    attachments: Mapped[list[Attachment]] = relationship(
        back_populates="trip", cascade="all, delete-orphan", order_by="Attachment.created_at.desc()"
    )
    motocamping_detail: Mapped[Optional[MotocampingDetail]] = relationship(
        back_populates="trip", cascade="all, delete-orphan", uselist=False
    )
    backpacking_detail: Mapped[Optional[BackpackingDetail]] = relationship(
        back_populates="trip", cascade="all, delete-orphan", uselist=False
    )
    overlanding_detail: Mapped[Optional[OverlandingDetail]] = relationship(
        back_populates="trip", cascade="all, delete-orphan", uselist=False
    )
    camping_detail: Mapped[Optional[CampingDetail]] = relationship(
        back_populates="trip", cascade="all, delete-orphan", uselist=False
    )
    international_detail: Mapped[Optional[InternationalDetail]] = relationship(
        back_populates="trip", cascade="all, delete-orphan", uselist=False
    )
    collaborators: Mapped[list[TripCollaborator]] = relationship(
        back_populates="trip", cascade="all, delete-orphan"
    )
    invites: Mapped[list[TripInvite]] = relationship(
        back_populates="trip", cascade="all, delete-orphan"
    )
