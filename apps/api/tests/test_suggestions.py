def _create_trip(client, headers, title="Fellowship of the Ring"):
    response = client.post(
        "/trips", json={"title": title, "trip_type": "backpacking"}, headers=headers
    )
    return response.json()["id"]


def _add_gear(client, headers, trip_id, name, category=None):
    payload = {"name": name}
    if category is not None:
        payload["category"] = category
    return client.post(f"/trips/{trip_id}/gear", json=payload, headers=headers)


def test_suggests_gear_from_your_own_past_trips(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    first = _create_trip(client, headers, "Weathertop")
    second = _create_trip(client, headers, "Rivendell")
    _add_gear(client, headers, first, "Headlamp")
    _add_gear(client, headers, second, "Rope")

    names = client.get("/suggestions/gear", headers=headers).json()
    assert sorted(names) == ["Headlamp", "Rope"]


def test_most_used_comes_first(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    for title in ("One", "Two", "Three"):
        trip_id = _create_trip(client, headers, title)
        _add_gear(client, headers, trip_id, "Headlamp")
        if title != "Three":
            _add_gear(client, headers, trip_id, "Rope")
    lonely = _create_trip(client, headers, "Four")
    _add_gear(client, headers, lonely, "Zebra blanket")

    names = client.get("/suggestions/gear", headers=headers).json()
    assert names[0] == "Headlamp"
    assert names[1] == "Rope"


def test_same_item_in_different_cases_is_one_suggestion(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    first = _create_trip(client, headers, "One")
    second = _create_trip(client, headers, "Two")
    _add_gear(client, headers, first, "Headlamp")
    _add_gear(client, headers, second, "headlamp")

    names = client.get("/suggestions/gear", headers=headers).json()
    assert names == ["Headlamp"]


def test_query_filters_and_is_case_insensitive(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_trip(client, headers)
    _add_gear(client, headers, trip_id, "Headlamp")
    _add_gear(client, headers, trip_id, "Rope")

    assert client.get("/suggestions/gear?q=lamp", headers=headers).json() == ["Headlamp"]
    assert client.get("/suggestions/gear?q=HEAD", headers=headers).json() == ["Headlamp"]


def test_like_wildcards_are_taken_literally(client, auth_headers):
    """A typed % should search for a percent sign, not match everything."""
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_trip(client, headers)
    _add_gear(client, headers, trip_id, "Headlamp")
    _add_gear(client, headers, trip_id, "100% wool socks")

    assert client.get("/suggestions/gear?q=%25", headers=headers).json() == ["100% wool socks"]
    assert client.get("/suggestions/gear?q=_", headers=headers).json() == []


def test_does_not_leak_other_peoples_gear(client, auth_headers):
    mine = auth_headers("frodo@bagend.dev")
    theirs = auth_headers("gollum@misty.dev")
    my_trip = _create_trip(client, mine, "Mine")
    their_trip = _create_trip(client, theirs, "Theirs")
    _add_gear(client, mine, my_trip, "Headlamp")
    _add_gear(client, theirs, their_trip, "Precious")

    assert client.get("/suggestions/gear", headers=mine).json() == ["Headlamp"]
    assert client.get("/suggestions/gear", headers=theirs).json() == ["Precious"]


def test_includes_gear_from_trips_shared_with_you(client, auth_headers):
    owner = auth_headers("frodo@bagend.dev")
    guest = auth_headers("sam@bagend.dev")
    trip_id = _create_trip(client, owner)
    _add_gear(client, owner, trip_id, "Lembas bread")

    token = client.post(f"/trips/{trip_id}/invite", headers=owner).json()["token"]
    client.post(f"/invites/{token}/accept", headers=guest)

    assert client.get("/suggestions/gear", headers=guest).json() == ["Lembas bread"]


def test_categories_and_tasks_have_their_own_lists(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_trip(client, headers)
    _add_gear(client, headers, trip_id, "Headlamp", category="Lighting")
    client.post(f"/trips/{trip_id}/tasks", json={"title": "Service the bike"}, headers=headers)

    assert client.get("/suggestions/gear-categories", headers=headers).json() == ["Lighting"]
    assert client.get("/suggestions/tasks", headers=headers).json() == ["Service the bike"]


def test_empty_categories_are_not_suggested(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_trip(client, headers)
    _add_gear(client, headers, trip_id, "Headlamp")

    assert client.get("/suggestions/gear-categories", headers=headers).json() == []


def test_requires_authentication(client):
    assert client.get("/suggestions/gear").status_code == 401
