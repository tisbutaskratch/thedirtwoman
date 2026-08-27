from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict


class GatheringDetailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    trip_type: str = "gathering"
    trip_id: int
    occasion: Optional[str]
    host_name: Optional[str]
    headcount: Optional[int]
    dietary_notes: Optional[str]
    kitchen_notes: Optional[str]

    # --- derived --------------------------------------------------------
    # How many contributions have somebody's name against them, and how many
    # are still nobody's problem. The number the host actually wants.
    claimed_count: int
    unclaimed_count: int
    # Whether anyone has said out loud that they are bringing a main. Four
    # desserts and no mains is the classic potluck failure.
    has_a_main: bool
    # Roughly how many people the food covers, against the headcount. None
    # when nobody has filled in serving sizes, rather than a misleading zero.
    est_servings: Optional[int]
    servings_shortfall: Optional[int]
