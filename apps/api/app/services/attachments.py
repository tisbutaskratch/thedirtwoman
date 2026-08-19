from __future__ import annotations

from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings
from app.models.attachment import Attachment
from app.schemas.attachment import AttachmentRead
from app.services.storage import get_storage


def media_dir() -> Path:
    """The local upload directory, used by the /media mount in development."""
    path = Path(settings.media_root)
    path.mkdir(parents=True, exist_ok=True)
    return path


async def save_upload(file: UploadFile) -> tuple[str, str, str]:
    """Store an upload and return (key, original_filename, content_type)."""
    return await get_storage().save(file)


def delete_file(filename: str) -> None:
    get_storage().delete(filename)


def to_attachment_read(attachment: Attachment) -> AttachmentRead:
    """Serialise an attachment, minting fresh URLs for it.

    The URLs are short-lived and generated per response rather than stored,
    so access ends when they expire. Callers reach this only through a route
    that has already checked the caller may see this trip.
    """
    storage = get_storage()
    return AttachmentRead(
        id=attachment.id,
        trip_id=attachment.trip_id,
        kind=attachment.kind,
        title=attachment.title,
        description=attachment.description,
        url=storage.view_url(attachment.filename, attachment.content_type),
        download_url=storage.download_url(attachment.filename, attachment.original_filename),
        original_filename=attachment.original_filename,
        content_type=attachment.content_type,
        created_at=attachment.created_at,
    )
