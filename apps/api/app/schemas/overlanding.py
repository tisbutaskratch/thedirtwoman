from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict


class OverlandingDetailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    trip_type: str = "overlanding"
    trip_id: int
    vehicle_name: Optional[str]
    fuel_capacity_gal: Optional[float]
    fuel_economy_mpg: Optional[float]
    ground_clearance_in: Optional[float]
    drivetrain: Optional[str]
    has_recovery_gear: Optional[bool]
    comms_plan: Optional[str]
    emergency_contact: Optional[str]
    est_range_miles: Optional[float]
