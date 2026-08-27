def _kit(client, headers, name="Trailside repair", **fields):
    return client.post("/kits", json={"name": name, **fields}, headers=headers)


def _item(client, headers, kit_id, name, **fields):
    return client.post(
        f"/kits/{kit_id}/items", json={"name": name, **fields}, headers=headers
    )


def _trip(client, headers, title="Moab"):
    return client.post(
        "/trips", json={"title": title, "trip_type": "overlanding"}, headers=headers
    ).json()["id"]


def test_a_kit_holds_items(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    kit = _kit(client, headers).json()
    assert kit["items"] == []

    _item(client, headers, kit["id"], "Tyre levers", quantity=2)
    _item(client, headers, kit["id"], "Patch kit")

    full = client.get(f"/kits/{kit['id']}", headers=headers).json()
    assert [t["name"] for t in full["items"]] == ["Tyre levers", "Patch kit"]
    assert full["items"][0]["quantity"] == 2
    assert full["items"][1]["quantity"] == 1


def test_an_item_is_only_reachable_through_its_kit(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    mine = _kit(client, headers).json()
    other = _kit(client, headers, "Camp kitchen").json()
    item = _item(client, headers, mine["id"], "Tyre levers").json()

    # Right tool, wrong bag: the kit in the path is not decoration.
    assert client.patch(
        f"/kits/{other['id']}/items/{item['id']}",
        json={"name": "Stolen"},
        headers=headers,
    ).status_code == 404
    assert client.patch(
        f"/kits/{mine['id']}/items/{item['id']}",
        json={"name": "Tyre levers, long"},
        headers=headers,
    ).status_code == 200


def test_your_kits_are_yours_alone(client, auth_headers):
    mine = auth_headers("frodo@bagend.dev")
    theirs = auth_headers("gollum@misty.dev")
    kit = _kit(client, mine).json()
    _kit(client, theirs, "Precious things")

    assert [b["name"] for b in client.get("/kits", headers=mine).json()] == [
        "Trailside repair"
    ]
    assert client.get(f"/kits/{kit['id']}", headers=theirs).status_code == 404
    assert _item(client, theirs, kit["id"], "Sneaky").status_code == 404


def test_deleting_a_kit_takes_its_items(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    kit = _kit(client, headers).json()
    item = _item(client, headers, kit["id"], "Tyre levers").json()

    assert client.delete(f"/kits/{kit['id']}", headers=headers).status_code == 204
    assert client.patch(
        f"/kits/{kit['id']}/items/{item['id']}", json={"name": "x"}, headers=headers
    ).status_code == 404


# --------------------------------------------------- packing a kit onto a trip


def test_packing_a_kit_copies_its_items_onto_the_packing_list(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    me = client.get("/auth/me", headers=headers).json()["id"]
    kit = _kit(client, headers).json()
    _item(client, headers, kit["id"], "Tyre levers", quantity=2)
    _item(client, headers, kit["id"], "Patch kit", notes="Check the glue")
    trip_id = _trip(client, headers)

    result = client.post(
        f"/trips/{trip_id}/gear/from-kit/{kit['id']}", headers=headers
    ).json()
    assert result["added"] == 2
    assert result["skipped"] == 0

    gear = client.get(f"/trips/{trip_id}/gear", headers=headers).json()
    names = {g["name"] for g in gear}
    # Quantity rides along in the name, since a packing list has no count.
    assert names == {"Tyre levers (x2)", "Patch kit"}
    # The bag becomes the category, so a packed kit reads as a group.
    assert {g["category"] for g in gear} == {"Trailside repair"}
    # You brought it, so it starts as yours.
    assert {g["assigned_to_user_id"] for g in gear} == {me}
    assert next(g for g in gear if g["name"] == "Patch kit")["notes"] == "Check the glue"


def test_packing_the_same_kit_twice_does_not_duplicate(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    kit = _kit(client, headers).json()
    _item(client, headers, kit["id"], "Tyre levers")
    trip_id = _trip(client, headers)

    first = client.post(f"/trips/{trip_id}/gear/from-kit/{kit['id']}", headers=headers).json()
    second = client.post(f"/trips/{trip_id}/gear/from-kit/{kit['id']}", headers=headers).json()
    assert (first["added"], first["skipped"]) == (1, 0)
    assert (second["added"], second["skipped"]) == (0, 1)
    assert len(client.get(f"/trips/{trip_id}/gear", headers=headers).json()) == 1


def test_packing_skips_only_what_is_already_there(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    kit = _kit(client, headers).json()
    _item(client, headers, kit["id"], "Tyre levers")
    trip_id = _trip(client, headers)
    client.post(f"/trips/{trip_id}/gear/from-kit/{kit['id']}", headers=headers)

    _item(client, headers, kit["id"], "Patch kit")
    again = client.post(f"/trips/{trip_id}/gear/from-kit/{kit['id']}", headers=headers).json()
    assert (again["added"], again["skipped"]) == (1, 1)


def test_the_copy_is_a_copy(client, auth_headers):
    """Editing the trip's row must not reach back into the garage."""
    headers = auth_headers("frodo@bagend.dev")
    kit = _kit(client, headers).json()
    item = _item(client, headers, kit["id"], "Tyre levers").json()
    trip_id = _trip(client, headers)
    client.post(f"/trips/{trip_id}/gear/from-kit/{kit['id']}", headers=headers)
    gear_id = client.get(f"/trips/{trip_id}/gear", headers=headers).json()[0]["id"]

    client.patch(f"/gear/{gear_id}", json={"name": "Borrowed levers", "packed": True}, headers=headers)
    unchanged = client.get(f"/kits/{kit['id']}", headers=headers).json()
    assert unchanged["items"][0]["name"] == "Tyre levers"

    # And the reverse: reorganising the kit leaves the planned trip alone.
    client.patch(
        f"/kits/{kit['id']}/items/{item['id']}", json={"name": "Long levers"}, headers=headers
    )
    assert client.get(f"/trips/{trip_id}/gear", headers=headers).json()[0]["name"] == "Borrowed levers"


def test_deleting_a_kit_leaves_the_trips_that_packed_it_alone(client, auth_headers):
    headers = auth_headers("frodo@bagend.dev")
    kit = _kit(client, headers).json()
    _item(client, headers, kit["id"], "Tyre levers")
    trip_id = _trip(client, headers)
    client.post(f"/trips/{trip_id}/gear/from-kit/{kit['id']}", headers=headers)

    client.delete(f"/kits/{kit['id']}", headers=headers)
    gear = client.get(f"/trips/{trip_id}/gear", headers=headers).json()
    assert [g["name"] for g in gear] == ["Tyre levers"]
    assert gear[0]["category"] == "Trailside repair"


def test_packing_needs_both_permissions(client, auth_headers):
    """The bag must be yours and the trip must be editable by you."""
    owner = auth_headers("frodo@bagend.dev")
    guest = auth_headers("sam@bagend.dev")
    kit = _kit(client, guest, "Sam's kit").json()
    _item(client, guest, kit["id"], "Rope")
    trip_id = _trip(client, owner)

    # Guest owns the kit but cannot touch a trip they are not on.
    assert client.post(
        f"/trips/{trip_id}/gear/from-kit/{kit['id']}", headers=guest
    ).status_code == 404
    # Owner can edit the trip but the kit is not theirs.
    assert client.post(
        f"/trips/{trip_id}/gear/from-kit/{kit['id']}", headers=owner
    ).status_code == 404


def test_a_viewer_cannot_pack_a_kit(client, auth_headers):
    owner = auth_headers("frodo@bagend.dev")
    guest = auth_headers("sam@bagend.dev")
    trip_id = _trip(client, owner)
    kit = _kit(client, guest, "Sam's kit").json()
    _item(client, guest, kit["id"], "Rope")

    token = client.post(f"/trips/{trip_id}/invite?role=viewer", headers=owner).json()["token"]
    client.post(f"/invites/{token}/accept", headers=guest)

    assert client.post(
        f"/trips/{trip_id}/gear/from-kit/{kit['id']}", headers=guest
    ).status_code == 403


def test_kits_require_authentication(client):
    assert client.get("/kits").status_code == 401
