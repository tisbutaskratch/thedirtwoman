from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CollaboratorRead(BaseModel):
    user_id: int
    name: str
    email: str
    vehicle: Optional[str]
    joined_at: datetime


class VehicleUpdate(BaseModel):
    vehicle: Optional[str] = Field(default=None, max_length=255)


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
