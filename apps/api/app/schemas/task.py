from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.common import RequiredLevel


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    done: bool = False
    required_level: RequiredLevel = RequiredLevel.required
    assigned_to_user_id: Optional[int] = None
    assigned_to_all: bool = False
    due_date: Optional[date] = None
    notes: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    done: Optional[bool] = None
    required_level: Optional[RequiredLevel] = None
    assigned_to_user_id: Optional[int] = None
    assigned_to_all: Optional[bool] = None
    due_date: Optional[date] = None
    notes: Optional[str] = None


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    title: str
    done: bool
    required_level: RequiredLevel
    assigned_to_user_id: Optional[int]
    assigned_to_all: bool
    due_date: Optional[date]
    notes: Optional[str]
    created_at: datetime
