from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.location import LocationKind


class LocationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    lat: Optional[float] = None
    lng: Optional[float] = None
    kind: LocationKind
    arrival_time: Optional[datetime] = None
    notes: Optional[str] = None
    order_index: int = 0
    contact_phone: Optional[str] = Field(default=None, max_length=50)
    confirmation_ref: Optional[str] = Field(default=None, max_length=255)
    address: Optional[str] = Field(default=None, max_length=500)


class LocationUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    lat: Optional[float] = None
    lng: Optional[float] = None
    kind: Optional[LocationKind] = None
    arrival_time: Optional[datetime] = None
    notes: Optional[str] = None
    order_index: Optional[int] = None
    contact_phone: Optional[str] = Field(default=None, max_length=50)
    confirmation_ref: Optional[str] = Field(default=None, max_length=255)
    address: Optional[str] = Field(default=None, max_length=500)


class LocationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    name: str
    lat: Optional[float]
    lng: Optional[float]
    kind: LocationKind
    arrival_time: Optional[datetime]
    notes: Optional[str]
    order_index: int
    contact_phone: Optional[str]
    confirmation_ref: Optional[str]
    address: Optional[str]
