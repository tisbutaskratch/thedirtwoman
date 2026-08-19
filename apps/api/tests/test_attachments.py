"""Attachment upload, listing, download and deletion, over HTTP.

Uploads used to be written straight to the container's disk and served from
an unauthenticated /media mount. Both halves of that were wrong on Render:
the disk does not survive a restart, and the mount let anyone holding a URL
read a private trip's files. These tests pin down the behaviour that
replaced it.
"""

from __future__ import annotations

import io

import pytest

from app.services.storage import get_storage


@pytest.fixture(autouse=True)
def uploads_in_tmp_path(tmp_path, monkeypatch):
    """Keep test uploads out of the working tree."""
    from app.core.config import settings

    monkeypatch.setattr(settings, "media_root", str(tmp_path / "media"))
    get_storage.cache_clear()
    yield
    get_storage.cache_clear()


def _trip(client, headers) -> int:
    return client.post(
        "/trips", json={"title": "Storage smoke", "trip_type": "camping"}, headers=headers
    ).json()["id"]


def _upload(client, headers, trip_id, name="route notes.pdf", kind="files"):
    return client.post(
        f"/trips/{trip_id}/{kind}",
        headers=headers,
        data={"title": "Route notes"},
        files={"file": (name, io.BytesIO(b"%PDF-1.4 test"), "application/pdf")},
    )


def test_upload_lists_downloads_and_deletes(client, auth_headers, tmp_path):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _trip(client, headers)

    created = _upload(client, headers, trip_id)
    assert created.status_code == 201
    body = created.json()

    # The original name is preserved for display and download, while the
    # stored object is keyed by something the user did not choose.
    assert body["original_filename"] == "route notes.pdf"
    assert "route notes.pdf" not in body["url"]
    assert body["url"].endswith(".pdf")

    listed = client.get(f"/trips/{trip_id}/files", headers=headers).json()
    assert [f["id"] for f in listed] == [body["id"]]

    # The /media mount is bound at import time, so it is not exercised here;
    # what matters is that the bytes landed under the stored key.
    stored = tmp_path / "media" / body["url"].removeprefix("/media/")
    assert stored.read_bytes() == b"%PDF-1.4 test"

    assert client.delete(f"/attachments/{body['id']}", headers=headers).status_code == 204
    assert client.get(f"/trips/{trip_id}/files", headers=headers).json() == []


def test_every_attachment_carries_both_urls(client, auth_headers):
    """One to show it inline, one to save it under its real name."""
    headers = auth_headers("frodo@bagend.dev")
    body = _upload(client, headers, _trip(client, headers), kind="photos").json()

    assert body["url"]
    assert body["download_url"]


def test_a_stranger_cannot_list_a_trips_files(client, auth_headers):
    owner = auth_headers("frodo@bagend.dev")
    stranger = auth_headers("gollum@misty.dev")
    trip_id = _trip(client, owner)
    _upload(client, owner, trip_id)

    assert client.get(f"/trips/{trip_id}/files", headers=stranger).status_code == 404


def test_a_stranger_cannot_delete_someone_elses_attachment(client, auth_headers):
    owner = auth_headers("frodo@bagend.dev")
    stranger = auth_headers("gollum@misty.dev")
    trip_id = _trip(client, owner)
    attachment_id = _upload(client, owner, trip_id).json()["id"]

    assert client.delete(f"/attachments/{attachment_id}", headers=stranger).status_code == 404
    # and it is still there for the owner
    assert len(client.get(f"/trips/{trip_id}/files", headers=owner).json()) == 1


def test_deleting_an_attachment_removes_the_stored_object(client, auth_headers, tmp_path):
    headers = auth_headers("frodo@bagend.dev")
    trip_id = _trip(client, headers)
    body = _upload(client, headers, trip_id).json()

    stored = tmp_path / "media" / body["url"].removeprefix("/media/")
    assert stored.exists()

    client.delete(f"/attachments/{body['id']}", headers=headers)
    assert not stored.exists()
