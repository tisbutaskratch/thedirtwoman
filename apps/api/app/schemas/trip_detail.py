from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class TripDetailUpdate(BaseModel):
    """Superset of every mode's editable detail fields.

    The /trips/{id}/detail endpoint is a single shared route (per the
    architecture doc) whose shape is picked by trip_type at request time,
    so the request body has to accept any mode's fields; the router only
    applies the subset that belongs to the trip's actual mode.
    """

    # motocamping
    motorcycle_name: Optional[str] = Field(default=None, max_length=255)
    fuel_capacity_gal: Optional[float] = Field(default=None, gt=0)
    fuel_economy_mpg: Optional[float] = Field(default=None, gt=0)
    daily_ride_target_miles: Optional[float] = Field(default=None, gt=0)

    # backpacking
    base_pack_weight_oz: Optional[float] = Field(default=None, ge=0)
    permit_required: Optional[bool] = None
    permit_notes: Optional[str] = None
    resupply_plan: Optional[str] = None

    # overlanding (fuel_capacity_gal / fuel_economy_mpg shared with motocamping above)
    vehicle_name: Optional[str] = Field(default=None, max_length=255)
    ground_clearance_in: Optional[float] = Field(default=None, ge=0)
    drivetrain: Optional[str] = Field(default=None, max_length=50)
    has_recovery_gear: Optional[bool] = None
    comms_plan: Optional[str] = None
    emergency_contact: Optional[str] = Field(default=None, max_length=255)

    # camping
    campground_reservation_ref: Optional[str] = Field(default=None, max_length=255)
    fire_restrictions_checked: Optional[bool] = None
