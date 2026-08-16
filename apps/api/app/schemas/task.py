from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    done: bool = False
    assigned_to_user_id: Optional[int] = None
    due_date: Optional[date] = None
    notes: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    done: Optional[bool] = None
    assigned_to_user_id: Optional[int] = None
    due_date: Optional[date] = None
    notes: Optional[str] = None


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    title: str
    done: bool
    assigned_to_user_id: Optional[int]
    due_date: Optional[date]
    notes: Optional[str]
    created_at: datetime
