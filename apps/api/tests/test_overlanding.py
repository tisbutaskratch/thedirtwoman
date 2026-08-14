def test_overlanding_trip_gets_blank_detail_auto_created(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips", json={"title": "Trans-Andean Crossing", "trip_type": "overlanding"},
        headers=headers,
    )
    trip_id = created.json()["id"]

    response = client.get(f"/trips/{trip_id}/detail", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["trip_type"] == "overlanding"
    assert body["vehicle_name"] is None
    assert body["est_range_miles"] is None


def test_update_detail_computes_est_range_and_saves_recovery_fields(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips", json={"title": "Trans-Andean Crossing", "trip_type": "overlanding"},
        headers=headers,
    )
    trip_id = created.json()["id"]

    response = client.patch(
        f"/trips/{trip_id}/detail",
        json={
            "vehicle_name": "Land Cruiser 80",
            "fuel_capacity_gal": 24.2,
            "fuel_economy_mpg": 16,
            "ground_clearance_in": 9.5,
            "drivetrain": "4WD",
            "has_recovery_gear": True,
            "comms_plan": "InReach + CB channel 4",
            "emergency_contact": "Base camp, +51 555 0100",
        },
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["vehicle_name"] == "Land Cruiser 80"
    assert body["est_range_miles"] == 387.2
    assert body["drivetrain"] == "4WD"
    assert body["has_recovery_gear"] is True
    assert body["emergency_contact"] == "Base camp, +51 555 0100"


def test_detail_scoped_to_trip_owner(client, auth_headers):
    headers_a = auth_headers("frodo@bagend.dev")
    headers_b = auth_headers("sam@bagend.dev")

    created = client.post(
        "/trips", json={"title": "Crossing", "trip_type": "overlanding"}, headers=headers_a
    )
    trip_id = created.json()["id"]

    response = client.get(f"/trips/{trip_id}/detail", headers=headers_b)
    assert response.status_code == 404

    response = client.patch(
        f"/trips/{trip_id}/detail", json={"vehicle_name": "hijacked"}, headers=headers_b
    )
    assert response.status_code == 404


def test_percent_planned_factors_in_overlanding_fields(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips",
        json={
            "title": "Trans-Andean Crossing",
            "trip_type": "overlanding",
            "start_date": "2026-06-01",
            "end_date": "2026-06-20",
        },
        headers=headers,
    )
    trip_id = created.json()["id"]
    assert created.json()["percent_planned"] == 25

    client.patch(
        f"/trips/{trip_id}/detail",
        json={"vehicle_name": "Land Cruiser 80", "fuel_capacity_gal": 24.2, "fuel_economy_mpg": 16},
        headers=headers,
    )

    response = client.get(f"/trips/{trip_id}", headers=headers)
    assert response.json()["percent_planned"] == 62


def test_other_modes_still_get_their_own_detail_shape(client, auth_headers):
    """Guards against the growing shared /detail router regressing earlier modes."""
    headers = auth_headers()

    moto = client.post(
        "/trips", json={"title": "Ride", "trip_type": "motocamping"}, headers=headers
    ).json()
    detail = client.get(f"/trips/{moto['id']}/detail", headers=headers).json()
    assert "motorcycle_name" in detail
    assert "vehicle_name" not in detail

    pack = client.post(
        "/trips", json={"title": "Hike", "trip_type": "backpacking"}, headers=headers
    ).json()
    detail = client.get(f"/trips/{pack['id']}/detail", headers=headers).json()
    assert "base_pack_weight_oz" in detail
    assert "vehicle_name" not in detail
