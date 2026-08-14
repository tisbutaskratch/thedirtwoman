def test_create_and_list_trip(client, auth_headers):
    headers = auth_headers()
    response = client.post(
        "/trips", json={"title": "Ride to Rivendell", "trip_type": "motocamping"}, headers=headers
    )
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Ride to Rivendell"
    assert body["status"] == "planning"
    assert body["percent_planned"] == 0

    response = client.get("/trips", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_trips_are_scoped_per_user(client, auth_headers):
    headers_a = auth_headers("frodo@bagend.dev")
    headers_b = auth_headers("sam@bagend.dev")

    created = client.post(
        "/trips", json={"title": "Mordor", "trip_type": "backpacking"}, headers=headers_a
    )
    trip_id = created.json()["id"]

    response = client.get(f"/trips/{trip_id}", headers=headers_b)
    assert response.status_code == 404

    response = client.get("/trips", headers=headers_b)
    assert response.json() == []


def test_update_and_delete_trip(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips", json={"title": "Shire Loop", "trip_type": "camping"}, headers=headers
    )
    trip_id = created.json()["id"]

    response = client.patch(f"/trips/{trip_id}", json={"status": "active"}, headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "active"

    response = client.delete(f"/trips/{trip_id}", headers=headers)
    assert response.status_code == 204

    response = client.get(f"/trips/{trip_id}", headers=headers)
    assert response.status_code == 404


def test_percent_planned_increases_with_trip_content(client, auth_headers):
    headers = auth_headers()
    created = client.post(
        "/trips",
        json={
            "title": "Grand Tour",
            "trip_type": "international",
            "start_date": "3018-03-01",
            "end_date": "3018-03-25",
        },
        headers=headers,
    )
    trip_id = created.json()["id"]
    # 2 of 8 checks true (start_date, end_date); international's 3 mode
    # checks are still unanswered
    assert created.json()["percent_planned"] == 25

    client.post(
        f"/trips/{trip_id}/locations",
        json={"name": "Mount Doom", "kind": "waypoint"},
        headers=headers,
    )
    client.post(
        f"/trips/{trip_id}/activities", json={"title": "Destroy the Ring"}, headers=headers
    )
    client.post(f"/trips/{trip_id}/notes", json={"body": "Bring extra lembas."}, headers=headers)

    response = client.get(f"/trips/{trip_id}", headers=headers)
    # 5 of 8 checks true now (dates + locations + activities + notes)
    assert response.json()["percent_planned"] == 62


def test_nested_resources_scoped_to_trip_owner(client, auth_headers):
    headers_a = auth_headers("frodo@bagend.dev")
    headers_b = auth_headers("sam@bagend.dev")

    created = client.post(
        "/trips", json={"title": "Mordor", "trip_type": "backpacking"}, headers=headers_a
    )
    trip_id = created.json()["id"]

    location = client.post(
        f"/trips/{trip_id}/locations",
        json={"name": "Mount Doom", "kind": "waypoint"},
        headers=headers_a,
    )
    assert location.status_code == 201
    location_id = location.json()["id"]

    response = client.get(f"/trips/{trip_id}/locations", headers=headers_b)
    assert response.status_code == 404

    response = client.patch(
        f"/locations/{location_id}", json={"notes": "hijacked"}, headers=headers_b
    )
    assert response.status_code == 404
