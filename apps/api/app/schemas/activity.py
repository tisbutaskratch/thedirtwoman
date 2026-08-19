from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.limits import LONG_TEXT_MAX


class ActivityCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    day_index: int = 1
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    notes: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)
    todos: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)
    location_id: Optional[int] = None


class ActivityUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    day_index: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    notes: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)
    todos: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)
    location_id: Optional[int] = None


class ActivityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    title: str
    day_index: int
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    notes: Optional[str]
    todos: Optional[str]
    location_id: Optional[int]
