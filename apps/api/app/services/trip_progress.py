from app.models.trip import Trip
from app.schemas.trip import TripRead


def compute_percent_planned(trip: Trip) -> int:
    """Rough completeness score for a trip, independent of mode-specific detail.

    Counts core fields being filled in: dates set, and at least one
    location/activity/note logged. Gets more precise once mode-specific
    detail (Phase 4+) contributes its own required fields.
    """
    checks = [
        trip.start_date is not None,
        trip.end_date is not None,
        len(trip.locations) > 0,
        len(trip.activities) > 0,
        len(trip.notes) > 0,
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
