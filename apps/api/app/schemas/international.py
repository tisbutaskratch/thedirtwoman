from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict


class InternationalDetailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    trip_type: str = "international"
    trip_id: int
    home_currency: Optional[str]
    destination_currencies: Optional[list[str]]
    primary_timezone: Optional[str]
