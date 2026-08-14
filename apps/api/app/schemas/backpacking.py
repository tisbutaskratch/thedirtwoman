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
    gear_weight_oz: float
    est_pack_weight_oz: Optional[float]
