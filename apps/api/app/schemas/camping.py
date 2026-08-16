from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict


class CampingDetailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    trip_type: str = "camping"
    trip_id: int
    campground_reservation_ref: Optional[str]
    fire_restrictions_checked: Optional[bool]
    potable_water_available: Optional[bool]
    firewood_policy: Optional[str]
    check_in_time: Optional[str]
    quiet_hours: Optional[str]
    meal_plan: Optional[str]
    # ~1 gal per person per day is the standard baseline; only meaningful to
    # haul in when the campground has no potable water.
    party_size: int
    nights: Optional[int]
    est_water_needed_gal: Optional[float]
