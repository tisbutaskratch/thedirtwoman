from typing import Optional

from app.models.common import TripRole
from app.models.trip import Trip, TripType
from app.schemas.trip import TripRead


def compute_percent_planned(trip: Trip) -> int:
    """Rough completeness score for a trip.

    Counts core fields shared by every trip type, plus mode-specific
    required fields from that mode's detail model. Every trip type has
    one as of Phase 8 (international).
    """
    checks = [
        trip.start_date is not None,
        trip.end_date is not None,
        len(trip.locations) > 0,
        len(trip.activities) > 0,
        len(trip.notes) > 0,
    ]

    if trip.trip_type == TripType.motocamping and trip.motocamping_detail is not None:
        detail = trip.motocamping_detail
        checks += [
            detail.motorcycle_name is not None,
            detail.fuel_capacity_gal is not None,
            detail.fuel_economy_mpg is not None,
        ]
    elif trip.trip_type == TripType.backpacking and trip.backpacking_detail is not None:
        detail = trip.backpacking_detail
        checks += [
            detail.base_pack_weight_oz is not None,
            detail.permit_required is not None,
            detail.resupply_plan is not None,
        ]
    elif trip.trip_type == TripType.overlanding and trip.overlanding_detail is not None:
        detail = trip.overlanding_detail
        checks += [
            detail.vehicle_name is not None,
            detail.fuel_capacity_gal is not None,
            detail.fuel_economy_mpg is not None,
        ]
    elif trip.trip_type == TripType.camping and trip.camping_detail is not None:
        detail = trip.camping_detail
        checks += [
            detail.campground_reservation_ref is not None,
            detail.fire_restrictions_checked is not None,
        ]
    elif trip.trip_type == TripType.international and trip.international_detail is not None:
        detail = trip.international_detail
        checks += [
            detail.home_currency is not None,
            bool(detail.destination_currencies),
            detail.primary_timezone is not None,
        ]
    elif trip.trip_type == TripType.domestic and trip.domestic_detail is not None:
        detail = trip.domestic_detail
        # How you're travelling drives everything else, so it counts twice
        # over: without it none of the mode-specific fields even apply.
        checks += [
            detail.travel_mode is not None,
            detail.booking_ref is not None,
            detail.destination is not None,
        ]

    return round(100 * sum(checks) / len(checks))


def role_for(trip: Trip, user_id: Optional[int]) -> TripRole:
    """What `user_id` may do with this trip. Creator always edits."""
    if user_id is None or trip.user_id == user_id:
        return TripRole.editor
    for collaborator in trip.collaborators:
        if collaborator.user_id == user_id:
            return collaborator.role
    return TripRole.editor


def to_trip_read(trip: Trip, user_id: Optional[int] = None) -> TripRead:
    return TripRead(
        id=trip.id,
        user_id=trip.user_id,
        title=trip.title,
        trip_type=trip.trip_type,
        start_date=trip.start_date,
        end_date=trip.end_date,
        archived_at=trip.archived_at,
        owner_vehicle=trip.owner_vehicle,
        owner_fuel_range_miles=trip.owner_fuel_range_miles,
        created_at=trip.created_at,
        percent_planned=compute_percent_planned(trip),
        my_role=role_for(trip, user_id),
    )
