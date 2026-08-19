from __future__ import annotations

from app.models.international_detail import InternationalDetail
from app.models.trip import Trip
from app.schemas.international import InternationalDetailRead

# Many destinations (much of Europe especially) require a passport to stay
# valid at least six months past the end of the trip.
PASSPORT_MARGIN_DAYS = 180


def to_international_detail_read(
    detail: InternationalDetail, trip: Trip
) -> InternationalDetailRead:
    passport_valid = None
    days_of_margin = None
    if detail.passport_expiry is not None and trip.end_date is not None:
        days_of_margin = (detail.passport_expiry - trip.end_date).days
        passport_valid = days_of_margin >= PASSPORT_MARGIN_DAYS

    # A simple readiness tally so the UI can show "4 of 6 sorted" at a glance.
    docs = [
        passport_valid is True,
        detail.visa_required is not None,
        bool(detail.vaccinations_notes),
        bool(detail.travel_insurance_ref),
        bool(detail.embassy_contact),
        detail.step_enrolled is True,
    ]

    return InternationalDetailRead(
        trip_id=detail.trip_id,
        home_currency=detail.home_currency,
        destination_currencies=detail.destination_currencies,
        primary_timezone=detail.primary_timezone,
        passport_expiry=detail.passport_expiry,
        visa_required=detail.visa_required,
        visa_notes=detail.visa_notes,
        vaccinations_notes=detail.vaccinations_notes,
        travel_insurance_ref=detail.travel_insurance_ref,
        embassy_contact=detail.embassy_contact,
        step_enrolled=detail.step_enrolled,
        passport_valid_for_trip=passport_valid,
        passport_days_of_margin=days_of_margin,
        docs_ready_count=sum(docs),
        docs_total_count=len(docs),
    )
