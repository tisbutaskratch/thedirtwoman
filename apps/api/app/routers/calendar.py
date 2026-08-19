from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.deps import get_accessible_trip
from app.db.session import get_db
from app.models.activity import Activity
from app.models.trip import Trip
from app.services.calendar import build_calendar, calendar_filename

router = APIRouter(tags=["calendar"])


@router.get("/trips/{trip_id}/calendar.ics")
def download_calendar(
    trip: Trip = Depends(get_accessible_trip), db: Session = Depends(get_db)
) -> Response:
    """The trip and its activities as a calendar file.

    Read access is enough: anyone who can see the trip can already read
    everything this contains. Viewers included, since a read-only audience
    wanting the dates in their own calendar is the point of that role.
    """
    activities = (
        db.query(Activity).filter(Activity.trip_id == trip.id).order_by(Activity.day_index).all()
    )
    return Response(
        content=build_calendar(trip, activities),
        media_type="text/calendar; charset=utf-8",
        headers={
            # Named so a browser saves it rather than showing it as text, and
            # so the file in someone's downloads says which trip it is.
            "Content-Disposition": f'attachment; filename="{calendar_filename(trip)}"'
        },
    )
