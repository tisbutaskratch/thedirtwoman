from __future__ import annotations

from typing import Optional

from app.models.camping_detail import CampingDetail
from app.models.trip import Trip
from app.schemas.camping import CampingDetailRead

# Standard car-camping baseline: ~1 gal per person per day covering drinking,
# cooking and basic cleanup (more in heat or at altitude).
GAL_PER_PERSON_PER_DAY = 1.0


def compute_nights(trip: Trip) -> Optional[int]:
    if trip.start_date is None or trip.end_date is None:
        return None
    return max((trip.end_date - trip.start_date).days, 0)


def to_camping_detail_read(detail: CampingDetail, trip: Trip) -> CampingDetailRead:
    party_size = 1 + len(trip.collaborators)
    nights = compute_nights(trip)

    est_water = None
    if nights is not None:
        days = nights + 1
        est_water = round(party_size * days * GAL_PER_PERSON_PER_DAY, 1)

    return CampingDetailRead(
        trip_id=detail.trip_id,
        campground_reservation_ref=detail.campground_reservation_ref,
        fire_restrictions_checked=detail.fire_restrictions_checked,
        potable_water_available=detail.potable_water_available,
        firewood_policy=detail.firewood_policy,
        check_in_time=detail.check_in_time,
        quiet_hours=detail.quiet_hours,
        meal_plan=detail.meal_plan,
        party_size=party_size,
        nights=nights,
        est_water_needed_gal=est_water,
    )
