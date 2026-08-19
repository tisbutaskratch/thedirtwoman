"""Where uploaded files live.

Two backends behind one interface. Local disk is for development; object
storage (Cloudflare R2, or anything else speaking S3) is for deployment,
because Render's filesystem is ephemeral: a free instance loses everything
written to disk on any restart, not just on deploy.

The backend is chosen by configuration, not by an environment name. Set a
bucket and its credentials and uploads go to object storage; leave them
unset and they go to disk. That way a developer needs no cloud account, and
production cannot silently fall back to a disk that will be wiped.

Access control note: the bucket is private. Nothing is publicly readable.
Callers get a short-lived signed URL, minted only after the router has
already checked that this user may see this trip, so the URL is both
unguessable and short-lived rather than permanent and unguarded.
"""

from __future__ import annotations

import uuid
from functools import lru_cache
from pathlib import Path
from typing import Optional, Protocol

from fastapi import UploadFile

from app.core.config import settings


def _new_key(original_filename: Optional[str]) -> str:
    """A random object key that keeps the original extension.

    The extension is kept so content sniffing and image previews behave, and
    the stem is discarded so a user-supplied name can never traverse a path
    or collide with someone else's upload.
    """
    suffix = Path(original_filename or "").suffix
    return f"{uuid.uuid4().hex}{suffix}"


class Storage(Protocol):
    async def save(self, file: UploadFile) -> tuple[str, str, str]:
        """Store an upload; return (key, original_filename, content_type)."""

    def delete(self, key: str) -> None: ...

    def view_url(self, key: str, content_type: str) -> str:
        """A URL that displays the object inline, for images."""

    def download_url(self, key: str, original_filename: str) -> str:
        """A URL that saves the object under its original name."""


class LocalStorage:
    """Development backend: files on disk, served by the /media mount."""

    def __init__(self, root: str) -> None:
        self._root = Path(root)

    def _dir(self) -> Path:
        self._root.mkdir(parents=True, exist_ok=True)
        return self._root

    async def save(self, file: UploadFile) -> tuple[str, str, str]:
        key = _new_key(file.filename)
        (self._dir() / key).write_bytes(await file.read())
        return key, file.filename or key, file.content_type or "application/octet-stream"

    def delete(self, key: str) -> None:
        (self._dir() / key).unlink(missing_ok=True)

    def view_url(self, key: str, content_type: str) -> str:
        return f"/media/{key}"

    def download_url(self, key: str, original_filename: str) -> str:
        return f"/media/{key}"


class S3Storage:
    """Deployment backend: a private S3-compatible bucket, signed URLs out.

    Written against Cloudflare R2, which is S3-compatible and has a free
    tier with no egress charges. Any S3 endpoint works.
    """

    def __init__(self) -> None:
        import boto3  # imported lazily so development needs no boto3 install

        self._bucket = settings.s3_bucket
        self._ttl = settings.attachment_url_ttl_seconds
        self._client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint_url,
            aws_access_key_id=settings.s3_access_key_id,
            aws_secret_access_key=settings.s3_secret_access_key,
            # R2 ignores region but boto3 insists on one being set.
            region_name=settings.s3_region,
        )

    async def save(self, file: UploadFile) -> tuple[str, str, str]:
        key = _new_key(file.filename)
        content_type = file.content_type or "application/octet-stream"
        self._client.put_object(
            Bucket=self._bucket,
            Key=key,
            Body=await file.read(),
            ContentType=content_type,
        )
        return key, file.filename or key, content_type

    def delete(self, key: str) -> None:
        self._client.delete_object(Bucket=self._bucket, Key=key)

    def _signed(self, key: str, **overrides: str) -> str:
        return self._client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self._bucket, "Key": key, **overrides},
            ExpiresIn=self._ttl,
        )

    def view_url(self, key: str, content_type: str) -> str:
        return self._signed(key, ResponseContentType=content_type)

    def download_url(self, key: str, original_filename: str) -> str:
        # Naming the file in the signed URL means the browser can download it
        # by plain navigation. A cross-origin fetch would need CORS rules on
        # the bucket; a navigation does not.
        safe = original_filename.replace('"', "")
        return self._signed(key, ResponseContentDisposition=f'attachment; filename="{safe}"')


@lru_cache(maxsize=1)
def get_storage() -> Storage:
    if settings.uses_object_storage:
        return S3Storage()
    return LocalStorage(settings.media_root)
