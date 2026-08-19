"""Uploads must not depend on a disk that Render throws away.

These cover the backend choice and the shape of the URLs each one hands
out. The S3 tests never reach the network: presigning is a local signature
calculation, so a fake key and secret are enough to prove the URL is signed,
scoped to the right object, and carries the disposition that makes a browser
download it under its original name.
"""

from __future__ import annotations

import asyncio
import io
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi import UploadFile

from app.core.config import settings
from app.services.storage import LocalStorage, S3Storage, get_storage


def _upload(name: str, content: bytes = b"hello", content_type: str = "text/plain") -> UploadFile:
    return UploadFile(
        filename=name,
        file=io.BytesIO(content),
        headers={"content-type": content_type},
    )


@pytest.fixture
def s3_settings(monkeypatch):
    """Configure a bucket without touching the real one."""
    monkeypatch.setattr(settings, "s3_bucket", "trips")
    monkeypatch.setattr(settings, "s3_endpoint_url", "https://acct.r2.cloudflarestorage.com")
    monkeypatch.setattr(settings, "s3_access_key_id", "test-key")
    monkeypatch.setattr(settings, "s3_secret_access_key", "test-secret")
    get_storage.cache_clear()
    yield
    get_storage.cache_clear()


def test_disk_is_used_when_no_bucket_is_configured():
    get_storage.cache_clear()
    assert isinstance(get_storage(), LocalStorage)
    get_storage.cache_clear()


def test_bucket_is_used_once_fully_configured(s3_settings):
    assert isinstance(get_storage(), S3Storage)


def test_a_half_configured_bucket_does_not_count(monkeypatch):
    """Credentials without an endpoint must not silently fall back to disk in
    production, nor half-start an S3 client. All four are required together."""
    monkeypatch.setattr(settings, "s3_bucket", "trips")
    monkeypatch.setattr(settings, "s3_endpoint_url", None)
    assert settings.uses_object_storage is False


def test_local_storage_round_trip(tmp_path):
    store = LocalStorage(str(tmp_path))
    key, original, content_type = asyncio.run(store.save(_upload("packing list.pdf", b"pdf bytes")))

    assert original == "packing list.pdf"
    assert content_type == "text/plain"
    assert (tmp_path / key).read_bytes() == b"pdf bytes"
    assert store.view_url(key, content_type) == f"/media/{key}"

    store.delete(key)
    assert not (tmp_path / key).exists()
    store.delete(key)  # deleting twice is not an error


def test_stored_key_keeps_the_extension_but_discards_the_name(tmp_path):
    """The stem is user input; only the suffix is worth keeping."""
    store = LocalStorage(str(tmp_path))
    key, _, _ = asyncio.run(store.save(_upload("../../etc/passwd.jpg")))

    assert key.endswith(".jpg")
    assert "passwd" not in key
    assert "/" not in key


def test_two_uploads_of_one_name_do_not_collide(tmp_path):
    store = LocalStorage(str(tmp_path))
    first, _, _ = asyncio.run(store.save(_upload("map.png", b"one")))
    second, _, _ = asyncio.run(store.save(_upload("map.png", b"two")))

    assert first != second
    assert (tmp_path / first).read_bytes() == b"one"
    assert (tmp_path / second).read_bytes() == b"two"


def test_signed_view_url_is_scoped_and_expiring(s3_settings):
    url = S3Storage().view_url("abc123.jpg", "image/jpeg")
    query = parse_qs(urlparse(url).query)

    assert "abc123.jpg" in urlparse(url).path
    assert query["X-Amz-Expires"] == [str(settings.attachment_url_ttl_seconds)]
    assert "X-Amz-Signature" in query


def test_signed_download_url_names_the_file(s3_settings):
    """So a browser saves "route notes.pdf" rather than the opaque key."""
    url = S3Storage().download_url("abc123.pdf", "route notes.pdf")
    disposition = parse_qs(urlparse(url).query)["response-content-disposition"][0]

    assert disposition == 'attachment; filename="route notes.pdf"'


def test_a_quoted_filename_cannot_break_the_disposition_header(s3_settings):
    url = S3Storage().download_url("abc.pdf", 'ev"il.pdf')
    disposition = parse_qs(urlparse(url).query)["response-content-disposition"][0]

    assert disposition == 'attachment; filename="evil.pdf"'
