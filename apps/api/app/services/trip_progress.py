from app.models.trip import Trip, TripType
from app.schemas.trip import TripRead


def compute_percent_planned(trip: Trip) -> int:
    """Rough completeness score for a trip.

    Counts core fields shared by every trip type, plus mode-specific
    required fields once that mode's detail model exists (currently
    just motocamping; other modes fall back to the core checks only
    until their own Phase adds a detail model).
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

    return round(100 * sum(checks) / len(checks))


def to_trip_read(trip: Trip) -> TripRead:
    return TripRead(
        id=trip.id,
        user_id=trip.user_id,
        title=trip.title,
        trip_type=trip.trip_type,
        start_date=trip.start_date,
        end_date=trip.end_date,
        status=trip.status,
        created_at=trip.created_at,
        percent_planned=compute_percent_planned(trip),
    )
