from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CollaboratorRead(BaseModel):
    user_id: int
    name: str
    email: str
    joined_at: datetime


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
