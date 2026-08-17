from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.domestic_detail import DomesticTravelMode


class DomesticDetailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    trip_type: str = "domestic"
    trip_id: int
    travel_mode: Optional[DomesticTravelMode]
    booking_ref: Optional[str]
    origin: Optional[str]
    destination: Optional[str]

    is_rental: Optional[bool]
    rental_company: Optional[str]
    total_distance_mi: Optional[float]
    vehicle_mpg: Optional[float]
    fuel_price_per_gallon: Optional[float]

    rail_operator: Optional[str]
    rail_pass_type: Optional[str]
    seat_reservation_required: Optional[bool]
    seat_reservations_booked: Optional[bool]

    airline: Optional[str]
    checked_bags: Optional[int]
    carry_on_only: Optional[bool]
    separate_tickets: Optional[bool]
    layover_notes: Optional[str]

    lodging_type: Optional[str]
    lodging_ref: Optional[str]

    # --- derived --------------------------------------------------------
    # Real-world mileage runs well under the sticker figure, so the estimate
    # is deliberately pessimistic rather than optimistic.
    est_fuel_gallons: Optional[float]
    est_fuel_cost: Optional[float]
    # Hours before departure you should be at the airport for a domestic leg.
    recommended_airport_lead_hours: Optional[int]
    # True when a pass needs seat reservations that nobody has booked yet.
    reservations_outstanding: Optional[bool]
    # "high" when the legs are on separate tickets — then a missed connection
    # is on you, not the airline.
    connection_risk: Optional[str]
