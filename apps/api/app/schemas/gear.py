from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.gear import GearRequiredLevel


class GearCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    category: Optional[str] = Field(default=None, max_length=100)
    weight_oz: Optional[float] = None
    packed: bool = False
    required_level: GearRequiredLevel = GearRequiredLevel.required
    assigned_to_user_id: Optional[int] = None
    notes: Optional[str] = None


class GearUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    category: Optional[str] = Field(default=None, max_length=100)
    weight_oz: Optional[float] = None
    packed: Optional[bool] = None
    required_level: Optional[GearRequiredLevel] = None
    assigned_to_user_id: Optional[int] = None
    notes: Optional[str] = None


class GearRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    name: str
    category: Optional[str]
    weight_oz: Optional[float]
    packed: bool
    required_level: GearRequiredLevel
    assigned_to_user_id: Optional[int]
    notes: Optional[str]
