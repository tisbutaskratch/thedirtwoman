def test_international_trip_gets_blank_detail_auto_created(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips", json={"title": "Grand Tour of Europe", "trip_type": "international"},
        headers=headers,
    )
    trip_id = created.json()["id"]

    response = client.get(f"/trips/{trip_id}/detail", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["trip_type"] == "international"
    assert body["home_currency"] is None
    assert body["destination_currencies"] is None
    assert body["primary_timezone"] is None


def test_update_detail_saves_currencies_and_timezone(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips", json={"title": "Grand Tour of Europe", "trip_type": "international"},
        headers=headers,
    )
    trip_id = created.json()["id"]

    response = client.patch(
        f"/trips/{trip_id}/detail",
        json={
            "home_currency": "USD",
            "destination_currencies": ["EUR", "GBP", "CHF"],
            "primary_timezone": "Europe/Paris",
        },
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["home_currency"] == "USD"
    assert body["destination_currencies"] == ["EUR", "GBP", "CHF"]
    assert body["primary_timezone"] == "Europe/Paris"
    # international has no derived value per the architecture doc
    assert "est_range_miles" not in body


def test_detail_scoped_to_trip_owner(client, auth_headers):
    headers_a = auth_headers("frodo@bagend.dev")
    headers_b = auth_headers("sam@bagend.dev")

    created = client.post(
        "/trips", json={"title": "Grand Tour", "trip_type": "international"}, headers=headers_a
    )
    trip_id = created.json()["id"]

    response = client.get(f"/trips/{trip_id}/detail", headers=headers_b)
    assert response.status_code == 404

    response = client.patch(
        f"/trips/{trip_id}/detail", json={"home_currency": "hijacked"}, headers=headers_b
    )
    assert response.status_code == 404


def test_percent_planned_factors_in_international_fields(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips",
        json={
            "title": "Grand Tour of Europe",
            "trip_type": "international",
            "start_date": "2026-09-01",
            "end_date": "2026-09-20",
        },
        headers=headers,
    )
    trip_id = created.json()["id"]
    assert created.json()["percent_planned"] == 25

    client.patch(
        f"/trips/{trip_id}/detail",
        json={
            "home_currency": "USD",
            "destination_currencies": ["EUR"],
            "primary_timezone": "Europe/Paris",
        },
        headers=headers,
    )

    response = client.get(f"/trips/{trip_id}", headers=headers)
    assert response.json()["percent_planned"] == 62


def test_all_five_modes_get_their_own_detail_shape(client, auth_headers):
    """Final guard: every trip type now has a detail model with the right shape."""
    headers = auth_headers()
    expectations = {
        "motocamping": "motorcycle_name",
        "backpacking": "base_pack_weight_oz",
        "overlanding": "vehicle_name",
        "camping": "campground_reservation_ref",
        "international": "home_currency",
    }
    for trip_type, expected_field in expectations.items():
        created = client.post(
            "/trips", json={"title": trip_type, "trip_type": trip_type}, headers=headers
        ).json()
        detail = client.get(f"/trips/{created['id']}/detail", headers=headers).json()
        assert expected_field in detail, f"{trip_type} missing {expected_field}"
