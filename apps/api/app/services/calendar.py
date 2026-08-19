"""Trips as an iCalendar file.

Provider-specific "add to calendar" links only work for the provider that
invented them, and Proton has none at all. An .ics file is the format every
calendar reads, and both Gmail and Proton show an inline "add to calendar"
control when one arrives as an attachment.

The fiddly parts of RFC 5545, all of which are silent failures rather than
errors:

  * DTEND on an all-day event is exclusive. A trip ending on the 20th needs
    DTEND=21, or every trip shows a day short.
  * UIDs must be stable across exports. Re-importing an updated trip should
    move the existing events, not add a second copy of each.
  * Commas, semicolons and backslashes are separators inside a property
    value, so they have to be escaped in anything a user typed. Newlines
    become a literal \\n.
  * Lines are limited to 75 octets and continue with a leading space. A long
    note otherwise produces a file some parsers reject outright.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Iterable, Optional

from app.models.activity import Activity
from app.models.trip import Trip

PRODUCT_ID = "-//Adventure Planner//EN"


def _escape(value: str) -> str:
    """Escape a TEXT value. Backslash first, or it double-escapes the rest."""
    return (
        value.replace("\\", "\\\\")
        .replace(";", "\\;")
        .replace(",", "\\,")
        .replace("\r\n", "\\n")
        .replace("\n", "\\n")
    )


def _fold(line: str) -> str:
    """Wrap to 75 octets, continuing with a leading space.

    Counted in octets rather than characters: a trip title full of accents or
    emoji is longer on the wire than it looks, and splitting mid-character
    would corrupt it, so the split points are found on encoded bytes.
    """
    encoded = line.encode("utf-8")
    if len(encoded) <= 75:
        return line

    pieces, start = [], 0
    limit = 75
    while start < len(encoded):
        end = min(start + limit, len(encoded))
        # Do not split inside a multi-byte character.
        while end > start and end < len(encoded) and (encoded[end] & 0xC0) == 0x80:
            end -= 1
        pieces.append(encoded[start:end].decode("utf-8"))
        start = end
        limit = 74  # continuation lines carry a leading space
    return "\r\n ".join(pieces)


def _utc(value: datetime) -> str:
    """A UTC timestamp. Naive values are read as UTC rather than guessed at."""
    aware = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    return aware.astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def _day(value: date) -> str:
    return value.strftime("%Y%m%d")


def _event(
    uid: str,
    stamp: str,
    summary: str,
    *,
    start: str,
    end: str,
    all_day: bool,
    description: Optional[str] = None,
    location: Optional[str] = None,
    geo: Optional[tuple[float, float]] = None,
) -> list[str]:
    value = ";VALUE=DATE" if all_day else ""
    lines = [
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{stamp}",
        f"DTSTART{value}:{start}",
        f"DTEND{value}:{end}",
        f"SUMMARY:{_escape(summary)}",
    ]
    if description:
        lines.append(f"DESCRIPTION:{_escape(description)}")
    if location:
        lines.append(f"LOCATION:{_escape(location)}")
    if geo:
        # Phones offer directions from this; the LOCATION text alone is only
        # a label and may not geocode to the right place.
        lines.append(f"GEO:{geo[0]:.6f};{geo[1]:.6f}")
    lines.append("END:VEVENT")
    return lines


def _activity_event(activity: Activity, trip: Trip, stamp: str) -> Optional[list[str]]:
    """One activity. Timed when it has a time, otherwise a day on the trip."""
    uid = f"activity-{activity.id}@adventureplanner"
    place = activity.location
    location = place.name if place else None
    geo = None
    if place and place.lat is not None and place.lng is not None:
        geo = (place.lat, place.lng)

    if activity.start_time:
        end = activity.end_time or activity.start_time + timedelta(hours=1)
        return _event(
            uid,
            stamp,
            activity.title,
            start=_utc(activity.start_time),
            end=_utc(end),
            all_day=False,
            description=activity.notes,
            location=location,
            geo=geo,
        )

    if trip.start_date is None:
        # Nothing to anchor day_index to, so this activity has no date at all.
        return None

    day = trip.start_date + timedelta(days=max(0, activity.day_index))
    return _event(
        uid,
        stamp,
        activity.title,
        start=_day(day),
        end=_day(day + timedelta(days=1)),  # exclusive
        all_day=True,
        description=activity.notes,
        location=location,
        geo=geo,
    )


def build_calendar(trip: Trip, activities: Iterable[Activity]) -> str:
    """The whole trip as one calendar: the trip itself, plus its activities."""
    stamp = _utc(datetime.now(timezone.utc))
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        f"PRODID:{PRODUCT_ID}",
        "CALSCALE:GREGORIAN",
        # PUBLISH, not REQUEST: this is a copy of a plan, not a meeting
        # invitation, so no calendar should email anyone an RSVP.
        "METHOD:PUBLISH",
        f"X-WR-CALNAME:{_escape(trip.title)}",
    ]

    if trip.start_date:
        # A trip with only a start date is a single day, not an open interval.
        last_day = trip.end_date or trip.start_date
        lines += _event(
            f"trip-{trip.id}@adventureplanner",
            stamp,
            trip.title,
            start=_day(trip.start_date),
            end=_day(last_day + timedelta(days=1)),  # exclusive
            all_day=True,
        )

    for activity in activities:
        event = _activity_event(activity, trip, stamp)
        if event:
            lines += event

    lines.append("END:VCALENDAR")
    return "\r\n".join(_fold(line) for line in lines) + "\r\n"


def calendar_filename(trip: Trip) -> str:
    """A filename a browser will save without complaint."""
    safe = "".join(c if c.isalnum() or c in "-_ " else "" for c in trip.title).strip()
    return f"{(safe or 'trip').replace(' ', '-').lower()}.ics"
