from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, Field

from app.models.domestic_detail import DomesticTravelMode
from app.schemas.limits import LONG_TEXT_MAX


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
    permit_notes: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)
    resupply_plan: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)
    bear_canister_required: Optional[bool] = None
    water_capacity_liters: Optional[float] = Field(default=None, ge=0)
    longest_dry_stretch_mi: Optional[float] = Field(default=None, ge=0)
    total_distance_mi: Optional[float] = Field(default=None, ge=0)
    elevation_gain_ft: Optional[float] = Field(default=None, ge=0)

    # overlanding (fuel_capacity_gal / fuel_economy_mpg shared with motocamping above)
    vehicle_name: Optional[str] = Field(default=None, max_length=255)
    ground_clearance_in: Optional[float] = Field(default=None, ge=0)
    drivetrain: Optional[str] = Field(default=None, max_length=50)
    has_recovery_gear: Optional[bool] = None
    comms_plan: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)
    emergency_contact: Optional[str] = Field(default=None, max_length=255)
    tire_pressure_offroad_psi: Optional[float] = Field(default=None, ge=0)
    tire_pressure_highway_psi: Optional[float] = Field(default=None, ge=0)
    water_capacity_gal: Optional[float] = Field(default=None, ge=0)
    aux_fuel_gal: Optional[float] = Field(default=None, ge=0)

    # camping
    campground_reservation_ref: Optional[str] = Field(default=None, max_length=255)
    fire_restrictions_checked: Optional[bool] = None
    potable_water_available: Optional[bool] = None
    firewood_policy: Optional[str] = Field(default=None, max_length=50)
    check_in_time: Optional[str] = Field(default=None, max_length=50)
    quiet_hours: Optional[str] = Field(default=None, max_length=50)
    meal_plan: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)

    # international
    home_currency: Optional[str] = Field(default=None, min_length=3, max_length=3)
    destination_currencies: Optional[list[str]] = None
    primary_timezone: Optional[str] = Field(default=None, max_length=100)
    passport_expiry: Optional[date] = None
    visa_required: Optional[bool] = None
    visa_notes: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)
    vaccinations_notes: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)
    travel_insurance_ref: Optional[str] = Field(default=None, max_length=255)
    embassy_contact: Optional[str] = Field(default=None, max_length=255)
    step_enrolled: Optional[bool] = None

    # domestic
    travel_mode: Optional[DomesticTravelMode] = None
    booking_ref: Optional[str] = Field(default=None, max_length=100)
    origin: Optional[str] = Field(default=None, max_length=255)
    destination: Optional[str] = Field(default=None, max_length=255)
    is_rental: Optional[bool] = None
    rental_company: Optional[str] = Field(default=None, max_length=255)
    vehicle_mpg: Optional[float] = Field(default=None, ge=0)
    fuel_price_per_gallon: Optional[float] = Field(default=None, ge=0)
    rail_operator: Optional[str] = Field(default=None, max_length=255)
    rail_pass_type: Optional[str] = Field(default=None, max_length=255)
    seat_reservation_required: Optional[bool] = None
    seat_reservations_booked: Optional[bool] = None
    airline: Optional[str] = Field(default=None, max_length=255)
    checked_bags: Optional[int] = Field(default=None, ge=0)
    carry_on_only: Optional[bool] = None
    separate_tickets: Optional[bool] = None
    layover_notes: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)
    lodging_type: Optional[str] = Field(default=None, max_length=50)
    lodging_ref: Optional[str] = Field(default=None, max_length=255)
