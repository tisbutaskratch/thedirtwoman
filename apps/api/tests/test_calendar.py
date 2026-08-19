"""Calendar export.

Every bug available here is silent: a trip a day short, duplicated events on
re-import, or a file a parser rejects without saying why. So these assert on
the generated text rather than on a status code.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

from app.services.calendar import build_calendar, calendar_filename


class FakeLocation:
    def __init__(self, name, lat=None, lng=None):
        self.name = name
        self.lat = lat
        self.lng = lng


class FakeActivity:
    def __init__(self, id, title, day_index=0, start_time=None, end_time=None,
                 notes=None, location=None):
        self.id = id
        self.title = title
        self.day_index = day_index
        self.start_time = start_time
        self.end_time = end_time
        self.notes = notes
        self.location = location


class FakeTrip:
    def __init__(self, id=1, title="Ride to Rivendell", start_date=None, end_date=None):
        self.id = id
        self.title = title
        self.start_date = start_date
        self.end_date = end_date


def _props(ics: str, name: str) -> list[str]:
    """Unfold continuation lines, then collect one property's values."""
    unfolded = ics.replace("\r\n ", "")
    return [ln[len(name) + 1:] for ln in unfolded.split("\r\n") if ln.startswith(name + ":")]


def test_a_trip_spans_through_its_last_day():
    """DTEND is exclusive: ending the 20th means DTEND the 21st. Off by one
    here and every trip in the calendar is a day short."""
    ics = build_calendar(FakeTrip(start_date=date(2026, 8, 18), end_date=date(2026, 8, 20)), [])

    assert "DTSTART;VALUE=DATE:20260818" in ics
    assert "DTEND;VALUE=DATE:20260821" in ics


def test_a_one_day_trip_is_one_day_not_zero():
    ics = build_calendar(FakeTrip(start_date=date(2026, 8, 18)), [])

    assert "DTSTART;VALUE=DATE:20260818" in ics
    assert "DTEND;VALUE=DATE:20260819" in ics


def test_uids_are_stable_so_reimporting_updates_rather_than_duplicates():
    trip = FakeTrip(start_date=date(2026, 8, 18))
    activity = FakeActivity(7, "Fuel stop")

    first = build_calendar(trip, [activity])
    second = build_calendar(trip, [activity])

    assert _props(first, "UID") == _props(second, "UID")
    assert "UID:trip-1@adventureplanner" in first
    assert "UID:activity-7@adventureplanner" in first


def test_an_activity_without_a_time_lands_on_its_day():
    trip = FakeTrip(start_date=date(2026, 8, 18))
    ics = build_calendar(trip, [FakeActivity(1, "Day three ride", day_index=2)])

    assert "DTSTART;VALUE=DATE:20260820" in ics


def test_a_timed_activity_is_written_in_utc():
    start = datetime(2026, 8, 18, 15, 30, tzinfo=timezone(timedelta(hours=-5)))
    ics = build_calendar(
        FakeTrip(start_date=date(2026, 8, 18)),
        [FakeActivity(1, "Ferry", start_time=start)],
    )

    assert "DTSTART:20260818T203000Z" in ics


def test_a_timed_activity_without_an_end_gets_a_sensible_one():
    """A zero-length event is invisible in most calendar views."""
    start = datetime(2026, 8, 18, 9, 0, tzinfo=timezone.utc)
    ics = build_calendar(
        FakeTrip(start_date=date(2026, 8, 18)), [FakeActivity(1, "Coffee", start_time=start)]
    )

    assert "DTSTART:20260818T090000Z" in ics
    assert "DTEND:20260818T100000Z" in ics


def test_activities_are_dropped_when_there_is_nothing_to_anchor_them_to():
    """No trip start date and no time of its own means no date at all, and a
    guessed date is worse than an absent event."""
    ics = build_calendar(FakeTrip(), [FakeActivity(1, "Someday")])

    assert "BEGIN:VEVENT" not in ics


def test_separators_in_user_text_are_escaped():
    """Unescaped, a comma silently truncates the summary at that point."""
    ics = build_calendar(
        FakeTrip(start_date=date(2026, 8, 18)),
        [FakeActivity(1, "Fuel, food; then ride", notes="line one\nline two")],
    )

    assert "SUMMARY:Fuel\\, food\\; then ride" in ics
    assert "DESCRIPTION:line one\\nline two" in ics


def test_long_lines_are_folded_within_the_limit():
    ics = build_calendar(
        FakeTrip(start_date=date(2026, 8, 18)),
        [FakeActivity(1, "x" * 300)],
    )

    for line in ics.split("\r\n"):
        assert len(line.encode("utf-8")) <= 75, line[:80]


def test_folding_does_not_corrupt_multibyte_characters():
    """Splitting on byte 75 mid-character would produce invalid UTF-8."""
    ics = build_calendar(
        FakeTrip(start_date=date(2026, 8, 18)),
        [FakeActivity(1, "🏔" * 60)],
    )

    assert "🏔" in ics.replace("\r\n ", "")
    ics.encode("utf-8").decode("utf-8")


def test_coordinates_are_included_so_phones_can_navigate():
    ics = build_calendar(
        FakeTrip(start_date=date(2026, 8, 18)),
        [FakeActivity(1, "Camp", location=FakeLocation("Lil Abner's", 39.0997, -94.5786))],
    )

    assert "LOCATION:Lil Abner's" in ics
    assert "GEO:39.099700;-94.578600" in ics


def test_the_calendar_is_a_published_copy_not_a_meeting_invitation():
    """METHOD:REQUEST would make calendars treat this as an invite and start
    emailing RSVPs to whoever appears in it."""
    ics = build_calendar(FakeTrip(start_date=date(2026, 8, 18)), [])

    assert "METHOD:PUBLISH" in ics
    assert "METHOD:REQUEST" not in ics


def test_filenames_survive_an_awkward_title():
    assert calendar_filename(FakeTrip(title="Ride to Rivendell")) == "ride-to-rivendell.ics"
    assert calendar_filename(FakeTrip(title="../../etc/passwd")) == "etcpasswd.ics"
    assert calendar_filename(FakeTrip(title="🏔🏔🏔")) == "trip.ics"


def test_the_endpoint_serves_a_downloadable_calendar(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = client.post(
        "/trips",
        json={"title": "Ride to Rivendell", "trip_type": "motocamping",
              "start_date": "2026-08-18", "end_date": "2026-08-20"},
        headers=headers,
    ).json()["id"]

    response = client.get(f"/trips/{trip_id}/calendar.ics", headers=headers)

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/calendar")
    assert "ride-to-rivendell.ics" in response.headers["content-disposition"]
    assert response.text.startswith("BEGIN:VCALENDAR")


def test_a_stranger_cannot_download_someone_elses_calendar(client, auth_headers):
    owner = auth_headers("frodo@bagend.dev")
    stranger = auth_headers("gollum@misty.dev")
    trip_id = client.post(
        "/trips", json={"title": "Secret", "trip_type": "camping"}, headers=owner
    ).json()["id"]

    assert client.get(f"/trips/{trip_id}/calendar.ics", headers=stranger).status_code == 404
