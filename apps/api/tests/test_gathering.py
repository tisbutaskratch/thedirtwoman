def _create_gathering(client, headers, title="Thanksgiving at Mom's"):
    response = client.post(
        "/trips",
        json={
            "title": title,
            "trip_type": "gathering",
            "start_date": "2026-11-25",
            "end_date": "2026-11-29",
        },
        headers=headers,
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


def _bring(client, headers, trip_id, name, **fields):
    return client.post(
        f"/trips/{trip_id}/contributions",
        json={"name": name, **fields},
        headers=headers,
    )


def test_a_gathering_is_a_trip_type(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_gathering(client, headers)
    trip = client.get(f"/trips/{trip_id}", headers=headers).json()
    assert trip["trip_type"] == "gathering"


def test_contribution_records_who_brings_what_on_which_day(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_gathering(client, headers)
    me = client.get("/auth/me", headers=headers).json()

    response = _bring(
        client,
        headers,
        trip_id,
        "Ham",
        kind="food",
        day_index=2,
        assigned_to_user_id=me["id"],
        serves=12,
    )
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["name"] == "Ham"
    assert body["kind"] == "food"
    assert body["day_index"] == 2
    assert body["assigned_to_user_id"] == me["id"]
    assert body["serves"] == 12
    assert body["confirmed"] is False


def test_a_contribution_needs_no_day_or_owner(client, auth_headers):
    """Somebody bring a board game, at some point, is a real plan."""
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_gathering(client, headers)

    body = _bring(client, headers, trip_id, "A board game", kind="game").json()
    assert body["day_index"] is None
    assert body["assigned_to_user_id"] is None
    assert body["assigned_to_all"] is False


def test_day_zero_is_rejected(client, auth_headers):
    """Day 1 is the first day; a 0 would render before the gathering starts."""
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_gathering(client, headers)

    assert _bring(client, headers, trip_id, "Ham", day_index=0).status_code == 422


def test_cannot_assign_to_someone_who_is_not_coming(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    stranger = auth_headers("gollum@misty.dev")
    trip_id = _create_gathering(client, headers)
    stranger_id = client.get("/auth/me", headers=stranger).json()["id"]

    response = _bring(client, headers, trip_id, "Ham", assigned_to_user_id=stranger_id)
    assert response.status_code in (400, 404)


def test_contributions_can_be_updated_and_removed(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_gathering(client, headers)
    item = _bring(client, headers, trip_id, "Ham", serves=8).json()

    patched = client.patch(
        f"/contributions/{item['id']}",
        json={"confirmed": True, "serves": 14},
        headers=headers,
    ).json()
    assert patched["confirmed"] is True
    assert patched["serves"] == 14
    assert patched["name"] == "Ham"

    assert client.delete(f"/contributions/{item['id']}", headers=headers).status_code == 204
    assert client.get(f"/trips/{trip_id}/contributions", headers=headers).json() == []


def test_a_viewer_can_read_but_not_add(client, auth_headers):
    owner = auth_headers("frodo@bagend.dev")
    guest = auth_headers("sam@bagend.dev")
    trip_id = _create_gathering(client, owner)
    _bring(client, owner, trip_id, "Ham")

    token = client.post(f"/trips/{trip_id}/invite?role=viewer", headers=owner).json()["token"]
    client.post(f"/invites/{token}/accept", headers=guest)

    assert len(client.get(f"/trips/{trip_id}/contributions", headers=guest).json()) == 1
    # 403 rather than 404: a viewer can see this trip, so pretending it does
    # not exist would be the wrong answer.
    assert _bring(client, guest, trip_id, "Pie").status_code == 403


def test_detail_counts_what_is_claimed_and_what_is_not(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_gathering(client, headers)
    me = client.get("/auth/me", headers=headers).json()

    client.patch(f"/trips/{trip_id}/detail", json={"headcount": 20}, headers=headers)
    _bring(client, headers, trip_id, "Ham", assigned_to_user_id=me["id"], serves=12)
    _bring(client, headers, trip_id, "Rolls", assigned_to_all=True, serves=4)
    _bring(client, headers, trip_id, "Pie", kind="dessert")

    detail = client.get(f"/trips/{trip_id}/detail", headers=headers).json()
    assert detail["headcount"] == 20
    # "Everyone brings one" has an owner; only Pie is nobody's problem yet.
    assert detail["claimed_count"] == 2
    assert detail["unclaimed_count"] == 1
    assert detail["has_a_main"] is True
    assert detail["est_servings"] == 16
    assert detail["servings_shortfall"] == 4


def test_servings_stay_unknown_when_nobody_filled_them_in(client, auth_headers):
    """A blank serving column is not the same as a shortfall of everything."""
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_gathering(client, headers)
    client.patch(f"/trips/{trip_id}/detail", json={"headcount": 20}, headers=headers)
    _bring(client, headers, trip_id, "Ham")

    detail = client.get(f"/trips/{trip_id}/detail", headers=headers).json()
    assert detail["est_servings"] is None
    assert detail["servings_shortfall"] is None


def test_a_table_of_desserts_is_not_dinner(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_gathering(client, headers)
    _bring(client, headers, trip_id, "Pie", kind="dessert")
    _bring(client, headers, trip_id, "Wine", kind="drink")

    detail = client.get(f"/trips/{trip_id}/detail", headers=headers).json()
    assert detail["has_a_main"] is False


def test_gathering_detail_holds_the_host_and_the_allergies(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_gathering(client, headers)

    client.patch(
        f"/trips/{trip_id}/detail",
        json={
            "occasion": "Thanksgiving",
            "host_name": "Mom",
            "dietary_notes": "Nina is gluten free",
            "kitchen_notes": "One oven, so nothing that needs an hour at 400",
        },
        headers=headers,
    )
    detail = client.get(f"/trips/{trip_id}/detail", headers=headers).json()
    assert detail["trip_type"] == "gathering"
    assert detail["occasion"] == "Thanksgiving"
    assert detail["host_name"] == "Mom"
    assert detail["dietary_notes"] == "Nina is gluten free"


def test_deleting_the_trip_takes_its_contributions(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _create_gathering(client, headers)
    item = _bring(client, headers, trip_id, "Ham").json()

    client.delete(f"/trips/{trip_id}", headers=headers)
    assert client.patch(
        f"/contributions/{item['id']}", json={"confirmed": True}, headers=headers
    ).status_code == 404
