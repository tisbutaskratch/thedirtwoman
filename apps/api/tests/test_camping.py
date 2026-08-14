def test_camping_trip_gets_blank_detail_auto_created(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips", json={"title": "Weekend at the KOA", "trip_type": "camping"}, headers=headers
    )
    trip_id = created.json()["id"]

    response = client.get(f"/trips/{trip_id}/detail", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["trip_type"] == "camping"
    assert body["campground_reservation_ref"] is None
    assert body["fire_restrictions_checked"] is None


def test_update_detail_saves_reservation_and_fire_check(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips", json={"title": "Weekend at the KOA", "trip_type": "camping"}, headers=headers
    )
    trip_id = created.json()["id"]

    response = client.patch(
        f"/trips/{trip_id}/detail",
        json={"campground_reservation_ref": "KOA-88213", "fire_restrictions_checked": True},
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["campground_reservation_ref"] == "KOA-88213"
    assert body["fire_restrictions_checked"] is True
    # camping has no derived value per the architecture doc
    assert "est_range_miles" not in body


def test_detail_scoped_to_trip_owner(client, auth_headers):
    headers_a = auth_headers("frodo@bagend.dev")
    headers_b = auth_headers("sam@bagend.dev")

    created = client.post(
        "/trips", json={"title": "Weekend Trip", "trip_type": "camping"}, headers=headers_a
    )
    trip_id = created.json()["id"]

    response = client.get(f"/trips/{trip_id}/detail", headers=headers_b)
    assert response.status_code == 404

    response = client.patch(
        f"/trips/{trip_id}/detail",
        json={"campground_reservation_ref": "hijacked"},
        headers=headers_b,
    )
    assert response.status_code == 404


def test_percent_planned_factors_in_camping_fields(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips",
        json={
            "title": "Weekend at the KOA",
            "trip_type": "camping",
            "start_date": "2026-07-04",
            "end_date": "2026-07-06",
        },
        headers=headers,
    )
    trip_id = created.json()["id"]
    # 2 of 7 checks true (start_date, end_date) — camping only adds 2 mode checks
    assert created.json()["percent_planned"] == 29

    client.patch(
        f"/trips/{trip_id}/detail",
        json={"campground_reservation_ref": "KOA-88213", "fire_restrictions_checked": False},
        headers=headers,
    )

    response = client.get(f"/trips/{trip_id}", headers=headers)
    # 4 of 7 checks true now (dates + reservation ref + fire check answered)
    assert response.json()["percent_planned"] == 57
