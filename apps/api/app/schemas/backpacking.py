from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict


class BackpackingDetailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    trip_type: str = "backpacking"
    trip_id: int
    base_pack_weight_oz: Optional[float]
    permit_required: Optional[bool]
    permit_notes: Optional[str]
    resupply_plan: Optional[str]
    bear_canister_required: Optional[bool]
    water_capacity_liters: Optional[float]
    longest_dry_stretch_mi: Optional[float]
    total_distance_mi: Optional[float]
    elevation_gain_ft: Optional[float]
    gear_weight_oz: float
    est_pack_weight_oz: Optional[float]
    # Water you'd need to cover the longest stretch without a source, and
    # whether the stated carry capacity actually covers it.
    water_needed_dry_stretch_l: Optional[float]
    water_carry_sufficient: Optional[bool]
    avg_miles_per_day: Optional[float]
