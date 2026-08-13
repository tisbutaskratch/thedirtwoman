from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class GearCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    category: Optional[str] = Field(default=None, max_length=100)
    weight_oz: Optional[float] = None
    packed: bool = False


class GearUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    category: Optional[str] = Field(default=None, max_length=100)
    weight_oz: Optional[float] = None
    packed: Optional[bool] = None


class GearRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    name: str
    category: Optional[str]
    weight_oz: Optional[float]
    packed: bool
