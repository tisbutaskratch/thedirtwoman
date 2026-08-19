from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.common import TripRole


class CollaboratorRead(BaseModel):
    user_id: int
    name: str
    email: str
    role: TripRole
    # The person who created the trip can't be removed or demoted. They are
    # still just "a collaborator" everywhere in the UI.
    is_creator: bool = False
    vehicle: Optional[str]
    fuel_range_miles: Optional[float]
    joined_at: datetime


class VehicleUpdate(BaseModel):
    vehicle: Optional[str] = Field(default=None, max_length=255)
    fuel_range_miles: Optional[float] = Field(default=None, ge=0)


class EmailInviteCreate(BaseModel):
    email: EmailStr
    role: TripRole = TripRole.editor


class RoleUpdate(BaseModel):
    role: TripRole


class PendingMemberRead(BaseModel):
    id: int
    email: str
    role: TripRole
    invited_at: datetime


class InviteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    token: str
    trip_id: int
    role: TripRole
    expires_at: datetime


class InvitePreviewRead(BaseModel):
    trip_id: int
    trip_title: str
    trip_type: str
    invited_by_name: str
    role: TripRole
    already_member: bool


class InviteAcceptResult(BaseModel):
    trip_id: int
