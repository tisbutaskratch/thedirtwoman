from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.common import TripRole
from app.models.trip import TripType


class TripCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    trip_type: TripType
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class TripUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    archived: Optional[bool] = None
    owner_vehicle: Optional[str] = Field(default=None, max_length=255)
    owner_fuel_range_miles: Optional[float] = Field(default=None, ge=0)


class TripRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    trip_type: TripType
    start_date: Optional[date]
    end_date: Optional[date]
    archived_at: Optional[datetime]
    owner_vehicle: Optional[str]
    owner_fuel_range_miles: Optional[float]
    created_at: datetime
    percent_planned: int
    # The requesting user's access level, so the UI can hide edit controls
    # from the audience rather than letting them fail on submit.
    my_role: TripRole = TripRole.editor
