from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict


class CampingDetailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    trip_type: str = "camping"
    trip_id: int
    campground_reservation_ref: Optional[str]
    fire_restrictions_checked: Optional[bool]
