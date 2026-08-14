from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict


class MotocampingDetailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    trip_type: str = "motocamping"
    trip_id: int
    motorcycle_name: Optional[str]
    fuel_capacity_gal: Optional[float]
    fuel_economy_mpg: Optional[float]
    daily_ride_target_miles: Optional[float]
    est_range_miles: Optional[float]
