from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class InternationalDetailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    trip_type: str = "international"
    trip_id: int
    home_currency: Optional[str]
    destination_currencies: Optional[list[str]]
    primary_timezone: Optional[str]
    passport_expiry: Optional[date]
    visa_required: Optional[bool]
    visa_notes: Optional[str]
    vaccinations_notes: Optional[str]
    travel_insurance_ref: Optional[str]
    embassy_contact: Optional[str]
    step_enrolled: Optional[bool]
    # Many destinations require the passport stay valid 6+ months past the
    # return date, so this is checked against the trip's end date.
    passport_valid_for_trip: Optional[bool]
    passport_days_of_margin: Optional[int]
    docs_ready_count: int
    docs_total_count: int
