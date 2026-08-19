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
    tire_pressure_offroad_psi: Optional[float]
    tire_pressure_highway_psi: Optional[float]
    water_capacity_gal: Optional[float]
    aux_fuel_gal: Optional[float]
    est_range_miles: Optional[float]
    # Range including jerry cans. The number that actually matters when
    # committing to a remote stretch.
    est_total_range_miles: Optional[float]
    water_days_supported: Optional[float]
