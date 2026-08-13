def test_motocamping_trip_gets_blank_detail_auto_created(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips", json={"title": "Ride to Rivendell", "trip_type": "motocamping"}, headers=headers
    )
    trip_id = created.json()["id"]

    response = client.get(f"/trips/{trip_id}/detail", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["motorcycle_name"] is None
    assert body["est_range_miles"] is None


def test_non_motocamping_trip_has_no_detail_yet(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips", json={"title": "Mordor", "trip_type": "backpacking"}, headers=headers
    )
    trip_id = created.json()["id"]

    response = client.get(f"/trips/{trip_id}/detail", headers=headers)
    assert response.status_code == 404


def test_update_detail_computes_est_range(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips", json={"title": "Ride to Rivendell", "trip_type": "motocamping"}, headers=headers
    )
    trip_id = created.json()["id"]

    response = client.patch(
        f"/trips/{trip_id}/detail",
        json={"motorcycle_name": "KLR650", "fuel_capacity_gal": 6.1, "fuel_economy_mpg": 48},
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["motorcycle_name"] == "KLR650"
    assert body["est_range_miles"] == 292.8


def test_detail_scoped_to_trip_owner(client, auth_headers):
    headers_a = auth_headers("frodo@bagend.dev")
    headers_b = auth_headers("sam@bagend.dev")

    created = client.post(
        "/trips", json={"title": "Ride", "trip_type": "motocamping"}, headers=headers_a
    )
    trip_id = created.json()["id"]

    response = client.get(f"/trips/{trip_id}/detail", headers=headers_b)
    assert response.status_code == 404

    response = client.patch(
        f"/trips/{trip_id}/detail", json={"motorcycle_name": "hijacked"}, headers=headers_b
    )
    assert response.status_code == 404


def test_percent_planned_factors_in_motocamping_fields(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips",
        json={
            "title": "Ride to Rivendell",
            "trip_type": "motocamping",
            "start_date": "3018-03-01",
            "end_date": "3018-03-25",
        },
        headers=headers,
    )
    trip_id = created.json()["id"]
    # 2 of 8 checks true (start_date, end_date)
    assert created.json()["percent_planned"] == 25

    client.patch(
        f"/trips/{trip_id}/detail",
        json={"motorcycle_name": "KLR650", "fuel_capacity_gal": 6.1, "fuel_economy_mpg": 48},
        headers=headers,
    )

    response = client.get(f"/trips/{trip_id}", headers=headers)
    # 5 of 8 checks true now (dates + 3 motocamping fields); round() uses
    # banker's rounding, so 62.5 rounds down to the nearest even number
    assert response.json()["percent_planned"] == 62
