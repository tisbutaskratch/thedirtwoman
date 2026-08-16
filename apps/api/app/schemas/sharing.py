from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CollaboratorRead(BaseModel):
    user_id: int
    name: str
    email: str
    vehicle: Optional[str]
    fuel_range_miles: Optional[float]
    joined_at: datetime


class VehicleUpdate(BaseModel):
    vehicle: Optional[str] = Field(default=None, max_length=255)
    fuel_range_miles: Optional[float] = Field(default=None, ge=0)


class EmailInviteCreate(BaseModel):
    email: EmailStr


class PendingMemberRead(BaseModel):
    id: int
    email: str
    invited_at: datetime


class InviteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    token: str
    trip_id: int
    expires_at: datetime


class InvitePreviewRead(BaseModel):
    trip_id: int
    trip_title: str
    trip_type: str
    owner_name: str
    already_member: bool


class InviteAcceptResult(BaseModel):
    trip_id: int
