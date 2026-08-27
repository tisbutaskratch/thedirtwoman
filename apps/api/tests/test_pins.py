def _trip(client, headers, title="Moab"):
    return client.post(
        "/trips", json={"title": title, "trip_type": "overlanding"}, headers=headers
    ).json()["id"]


def test_pinning_a_trip_is_private_to_you(client, auth_headers):
    """A trip is shared; pinning it is not."""
    owner = auth_headers("frodo@bagend.dev")
    guest = auth_headers("sam@bagend.dev")
    trip_id = _trip(client, owner)
    token = client.post(f"/trips/{trip_id}/invite", headers=owner).json()["token"]
    client.post(f"/invites/{token}/accept", headers=guest)

    client.put(f"/pins/trips/{trip_id}", headers=owner)

    assert client.get("/pins/trips", headers=owner).json() == [trip_id]
    assert client.get("/pins/trips", headers=guest).json() == []


def test_pinning_twice_is_the_same_as_pinning_once(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _trip(client, headers)

    assert client.put(f"/pins/trips/{trip_id}", headers=headers).status_code == 204
    assert client.put(f"/pins/trips/{trip_id}", headers=headers).status_code == 204
    assert client.get("/pins/trips", headers=headers).json() == [trip_id]


def test_unpinning_something_never_pinned_is_fine(client, auth_headers):
    """The caller wanted it unpinned, and it is unpinned."""
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _trip(client, headers)
    assert client.delete(f"/pins/trips/{trip_id}", headers=headers).status_code == 204


def test_unpinning_removes_it(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _trip(client, headers)
    client.put(f"/pins/trips/{trip_id}", headers=headers)
    client.delete(f"/pins/trips/{trip_id}", headers=headers)
    assert client.get("/pins/trips", headers=headers).json() == []


def test_you_cannot_pin_a_trip_you_cannot_see(client, auth_headers):
    """Otherwise the pin table would confirm which trip ids exist."""
    owner = auth_headers("frodo@bagend.dev")
    stranger = auth_headers("gollum@misty.dev")
    trip_id = _trip(client, owner)

    assert client.put(f"/pins/trips/{trip_id}", headers=stranger).status_code == 404
    assert client.put("/pins/trips/999999", headers=stranger).status_code == 404


def test_a_viewer_can_pin(client, auth_headers):
    """Pinning is a view preference, so read-only access is enough."""
    owner = auth_headers("frodo@bagend.dev")
    guest = auth_headers("sam@bagend.dev")
    trip_id = _trip(client, owner)
    token = client.post(f"/trips/{trip_id}/invite?role=viewer", headers=owner).json()["token"]
    client.post(f"/invites/{token}/accept", headers=guest)

    assert client.put(f"/pins/trips/{trip_id}", headers=guest).status_code == 204
    assert client.get("/pins/trips", headers=guest).json() == [trip_id]


def test_pins_come_back_in_the_order_they_were_made(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    first = _trip(client, headers, "First")
    second = _trip(client, headers, "Second")
    client.put(f"/pins/trips/{second}", headers=headers)
    client.put(f"/pins/trips/{first}", headers=headers)

    assert client.get("/pins/trips", headers=headers).json() == [second, first]


def test_deleting_a_trip_takes_its_pin(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _trip(client, headers)
    client.put(f"/pins/trips/{trip_id}", headers=headers)
    client.delete(f"/trips/{trip_id}", headers=headers)

    assert client.get("/pins/trips", headers=headers).json() == []


# ------------------------------------------------------------ section pins


def test_section_pins_apply_to_every_trip(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    client.put("/pins/sections/packing", headers=headers)
    client.put("/pins/sections/assignments", headers=headers)

    assert client.get("/pins/sections", headers=headers).json() == ["packing", "assignments"]


def test_section_pins_are_private(client, auth_headers):
    mine = auth_headers("frodo@bagend.dev")
    theirs = auth_headers("sam@bagend.dev")
    client.put("/pins/sections/packing", headers=mine)

    assert client.get("/pins/sections", headers=theirs).json() == []


def test_pinning_a_section_twice_does_not_duplicate(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    client.put("/pins/sections/packing", headers=headers)
    client.put("/pins/sections/packing", headers=headers)
    assert client.get("/pins/sections", headers=headers).json() == ["packing"]


def test_unknown_section_is_rejected(client, auth_headers):
    """A free-text key would be stored happily and then silently do nothing."""
    headers = auth_headers("frodo@bagend.dev")
    assert client.put("/pins/sections/kitchen-sink", headers=headers).status_code == 422


def test_unpinning_a_section(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    client.put("/pins/sections/packing", headers=headers)
    client.delete("/pins/sections/packing", headers=headers)
    assert client.get("/pins/sections", headers=headers).json() == []


def test_pins_require_authentication(client):
    assert client.get("/pins/trips").status_code == 401
    assert client.get("/pins/sections").status_code == 401
