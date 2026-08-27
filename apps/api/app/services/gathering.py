from __future__ import annotations

from typing import Optional

from app.models.contribution import ContributionKind
from app.models.gathering_detail import GatheringDetail
from app.models.trip import Trip
from app.schemas.gathering import GatheringDetailRead

# What counts as holding up the meal. Desserts and drinks are welcome, but a
# table of them is not dinner, and the host is the one who finds out last.
MAIN_KINDS = {ContributionKind.food}


def to_gathering_detail_read(detail: GatheringDetail, trip: Trip) -> GatheringDetailRead:
    contributions = trip.contributions

    # "Everyone brings one" counts as claimed: it has an owner, it is just
    # everybody. Only a null assignee with no all-hands flag is unclaimed.
    claimed = [c for c in contributions if c.assigned_to_user_id is not None or c.assigned_to_all]
    unclaimed = [c for c in contributions if c not in claimed]

    # Servings are optional to fill in, so distinguish "nobody said" from
    # "somebody said zero". Summing blanks as zero would report a shortfall
    # that is really just an empty column.
    sized = [c.serves for c in contributions if c.serves is not None]
    est_servings = sum(sized) if sized else None

    shortfall: Optional[int] = None
    if est_servings is not None and detail.headcount is not None:
        shortfall = max(detail.headcount - est_servings, 0)

    return GatheringDetailRead(
        trip_id=detail.trip_id,
        occasion=detail.occasion,
        host_name=detail.host_name,
        headcount=detail.headcount,
        dietary_notes=detail.dietary_notes,
        kitchen_notes=detail.kitchen_notes,
        claimed_count=len(claimed),
        unclaimed_count=len(unclaimed),
        has_a_main=any(c.kind in MAIN_KINDS for c in contributions),
        est_servings=est_servings,
        servings_shortfall=shortfall,
    )
