from __future__ import annotations

from typing import Optional

from app.models.domestic_detail import DomesticDetail, DomesticTravelMode
from app.models.trip import Trip
from app.schemas.domestic import DomesticDetailRead

# Observed highway mileage typically lands 10-20% below the EPA sticker, so
# fuel estimates derate it. Budgeting for the optimistic number is how people
# come up short.
REAL_WORLD_MPG_DERATE = 0.85

# Standard guidance for a domestic departure: two hours from kerb to gate.
DOMESTIC_AIRPORT_LEAD_HOURS = 2


def estimate_fuel(
    distance_mi: Optional[float],
    mpg: Optional[float],
    price_per_gallon: Optional[float],
) -> tuple[Optional[float], Optional[float]]:
    """Gallons and dollars for a drive, or (None, None) if we can't say."""
    if distance_mi is None or mpg is None or mpg <= 0:
        return None, None
    gallons = round(distance_mi / (mpg * REAL_WORLD_MPG_DERATE), 1)
    if price_per_gallon is None:
        return gallons, None
    return gallons, round(gallons * price_per_gallon, 2)


def to_domestic_detail_read(detail: DomesticDetail, trip: Trip) -> DomesticDetailRead:
    mode = detail.travel_mode

    est_gallons: Optional[float] = None
    est_cost: Optional[float] = None
    if mode == DomesticTravelMode.car:
        est_gallons, est_cost = estimate_fuel(
            detail.total_distance_mi, detail.vehicle_mpg, detail.fuel_price_per_gallon
        )

    reservations_outstanding: Optional[bool] = None
    if mode == DomesticTravelMode.train and detail.seat_reservation_required is not None:
        reservations_outstanding = bool(detail.seat_reservation_required) and not bool(
            detail.seat_reservations_booked
        )

    lead_hours: Optional[int] = None
    connection_risk: Optional[str] = None
    if mode == DomesticTravelMode.flight:
        lead_hours = DOMESTIC_AIRPORT_LEAD_HOURS
        if detail.separate_tickets is not None:
            connection_risk = "high" if detail.separate_tickets else "low"

    return DomesticDetailRead(
        trip_id=detail.trip_id,
        travel_mode=mode,
        booking_ref=detail.booking_ref,
        origin=detail.origin,
        destination=detail.destination,
        is_rental=detail.is_rental,
        rental_company=detail.rental_company,
        total_distance_mi=detail.total_distance_mi,
        vehicle_mpg=detail.vehicle_mpg,
        fuel_price_per_gallon=detail.fuel_price_per_gallon,
        rail_operator=detail.rail_operator,
        rail_pass_type=detail.rail_pass_type,
        seat_reservation_required=detail.seat_reservation_required,
        seat_reservations_booked=detail.seat_reservations_booked,
        airline=detail.airline,
        checked_bags=detail.checked_bags,
        carry_on_only=detail.carry_on_only,
        separate_tickets=detail.separate_tickets,
        layover_notes=detail.layover_notes,
        lodging_type=detail.lodging_type,
        lodging_ref=detail.lodging_ref,
        est_fuel_gallons=est_gallons,
        est_fuel_cost=est_cost,
        recommended_airport_lead_hours=lead_hours,
        reservations_outstanding=reservations_outstanding,
        connection_risk=connection_risk,
    )
