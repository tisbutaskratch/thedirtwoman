def test_backpacking_trip_gets_blank_detail_auto_created(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips", json={"title": "Mordor", "trip_type": "backpacking"}, headers=headers
    )
    trip_id = created.json()["id"]

    response = client.get(f"/trips/{trip_id}/detail", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["base_pack_weight_oz"] is None
    assert body["gear_weight_oz"] == 0
    assert body["est_pack_weight_oz"] is None


def test_update_detail_computes_est_pack_weight_from_base_and_gear(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips", json={"title": "Mordor", "trip_type": "backpacking"}, headers=headers
    )
    trip_id = created.json()["id"]

    client.post(
        f"/trips/{trip_id}/gear",
        json={"name": "Lembas bread", "weight_oz": 12},
        headers=headers,
    )
    client.post(
        f"/trips/{trip_id}/gear", json={"name": "Water (2L)", "weight_oz": 68}, headers=headers
    )

    response = client.patch(
        f"/trips/{trip_id}/detail",
        json={"base_pack_weight_oz": 128, "permit_required": True, "permit_notes": "Trailhead kiosk"},
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["base_pack_weight_oz"] == 128
    assert body["gear_weight_oz"] == 80
    assert body["est_pack_weight_oz"] == 208
    assert body["permit_required"] is True


def test_detail_scoped_to_trip_owner(client, auth_headers):
    headers_a = auth_headers("frodo@bagend.dev")
    headers_b = auth_headers("sam@bagend.dev")

    created = client.post(
        "/trips", json={"title": "Mordor", "trip_type": "backpacking"}, headers=headers_a
    )
    trip_id = created.json()["id"]

    response = client.get(f"/trips/{trip_id}/detail", headers=headers_b)
    assert response.status_code == 404

    response = client.patch(
        f"/trips/{trip_id}/detail", json={"base_pack_weight_oz": 999}, headers=headers_b
    )
    assert response.status_code == 404


def test_percent_planned_factors_in_backpacking_fields(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips",
        json={
            "title": "Mordor",
            "trip_type": "backpacking",
            "start_date": "3018-12-25",
            "end_date": "3019-03-25",
        },
        headers=headers,
    )
    trip_id = created.json()["id"]
    # 2 of 8 checks true (start_date, end_date)
    assert created.json()["percent_planned"] == 25

    client.patch(
        f"/trips/{trip_id}/detail",
        json={
            "base_pack_weight_oz": 128,
            "permit_required": False,
            "resupply_plan": "None needed, nine days of provisions.",
        },
        headers=headers,
    )

    response = client.get(f"/trips/{trip_id}", headers=headers)
    # 5 of 8 checks true now (dates + base weight + permit_required answered + resupply_plan)
    assert response.json()["percent_planned"] == 62


def test_motocamping_trip_still_gets_motocamping_detail_shape(client, auth_headers):
    """Guards against the shared /detail endpoint regressing Phase 4."""
    headers = auth_headers()
    created = client.post(
        "/trips", json={"title": "Ride", "trip_type": "motocamping"}, headers=headers
    )
    trip_id = created.json()["id"]

    response = client.get(f"/trips/{trip_id}/detail", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert "motorcycle_name" in body
    assert "base_pack_weight_oz" not in body
