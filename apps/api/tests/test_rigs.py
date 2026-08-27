def _add_rig(client, headers, name="The Tacoma", **fields):
    return client.post("/rigs", json={"name": name, **fields}, headers=headers)


def test_a_rig_is_yours_and_needs_no_trip(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    response = _add_rig(
        client, headers, kind="truck", make="Toyota", model="Tacoma", year=2019
    )
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["name"] == "The Tacoma"
    assert body["kind"] == "truck"
    assert body["description"] == "2019 Toyota Tacoma"


def test_description_uses_whatever_was_filled_in(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    assert _add_rig(client, headers, make="Yamaha").json()["description"] == "Yamaha"
    assert _add_rig(client, headers, "Bare").json()["description"] is None


def test_range_is_derated_and_needs_both_numbers(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    full = _add_rig(client, headers, fuel_capacity_gal=21, fuel_economy_mpg=20).json()
    # 21 * 20 * 0.85, because loaded mileage never matches the sticker.
    assert full["est_range_miles"] == 357

    half = _add_rig(client, headers, "No mpg", fuel_capacity_gal=21).json()
    assert half["est_range_miles"] is None

    zeroed = _add_rig(
        client, headers, "Zeroes", fuel_capacity_gal=0, fuel_economy_mpg=20
    ).json()
    assert zeroed["est_range_miles"] is None


def test_your_rigs_are_yours_alone(client, auth_headers):
    mine = auth_headers("frodo@bagend.dev")
    theirs = auth_headers("gollum@misty.dev")
    my_rig = _add_rig(client, mine, "The Tacoma").json()
    _add_rig(client, theirs, "The Precious")

    assert [r["name"] for r in client.get("/rigs", headers=mine).json()] == ["The Tacoma"]
    assert [r["name"] for r in client.get("/rigs", headers=theirs).json()] == ["The Precious"]

    # Somebody else's rigs are not even enumerable: one you do not own
    # looks exactly like one that never existed.
    assert client.get(f"/rigs/{my_rig['id']}", headers=theirs).status_code == 404
    assert client.patch(
        f"/rigs/{my_rig['id']}", json={"name": "Mine now"}, headers=theirs
    ).status_code == 404
    assert client.delete(f"/rigs/{my_rig['id']}", headers=theirs).status_code == 404


def test_updating_leaves_untouched_fields_alone(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    rig = _add_rig(client, headers, make="Toyota", fuel_capacity_gal=21).json()

    patched = client.patch(
        f"/rigs/{rig['id']}", json={"tire_size": "265/70R17"}, headers=headers
    ).json()
    assert patched["tire_size"] == "265/70R17"
    assert patched["make"] == "Toyota"
    assert patched["fuel_capacity_gal"] == 21


def test_a_silly_year_is_rejected(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    assert _add_rig(client, headers, year=8165141816).status_code == 422


def test_deleting_a_rig_does_not_rewrite_the_trips_it_went_on(client, auth_headers):
    """The whole reason trips snapshot instead of pointing at the garage."""
    headers = auth_headers("frodo@bagend.dev")
    rig = _add_rig(client, headers, fuel_capacity_gal=21, fuel_economy_mpg=20).json()
    trip_id = client.post(
        "/trips", json={"title": "Moab", "trip_type": "overlanding"}, headers=headers
    ).json()["id"]

    # Bringing it copies the name and range down onto the trip.
    client.patch(
        f"/trips/{trip_id}/collaborators/me",
        json={"vehicle": rig["name"], "fuel_range_miles": rig["est_range_miles"]},
        headers=headers,
    )
    assert client.delete(f"/rigs/{rig['id']}", headers=headers).status_code == 204

    roster = client.get(f"/trips/{trip_id}/collaborators", headers=headers).json()
    assert roster[0]["vehicle"] == "The Tacoma"
    assert roster[0]["fuel_range_miles"] == 357


def test_rigs_require_authentication(client):
    assert client.get("/rigs").status_code == 401
    assert client.post("/rigs", json={"name": "Sneaky"}).status_code == 401
