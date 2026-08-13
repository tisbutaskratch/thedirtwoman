from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MotocampingDetailUpdate(BaseModel):
    motorcycle_name: Optional[str] = Field(default=None, max_length=255)
    fuel_capacity_gal: Optional[float] = Field(default=None, gt=0)
    fuel_economy_mpg: Optional[float] = Field(default=None, gt=0)
    daily_ride_target_miles: Optional[float] = Field(default=None, gt=0)


class MotocampingDetailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    trip_type: str = "motocamping"
    trip_id: int
    motorcycle_name: Optional[str]
    fuel_capacity_gal: Optional[float]
    fuel_economy_mpg: Optional[float]
    daily_ride_target_miles: Optional[float]
    est_range_miles: Optional[float]
