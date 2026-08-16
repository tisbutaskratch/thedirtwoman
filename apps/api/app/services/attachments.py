from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings
from app.models.attachment import Attachment
from app.schemas.attachment import AttachmentRead


def media_dir() -> Path:
    path = Path(settings.media_root)
    path.mkdir(parents=True, exist_ok=True)
    return path


async def save_upload(file: UploadFile) -> tuple[str, str, str]:
    """Write an upload to disk and return (stored_filename, original_filename, content_type)."""
    suffix = Path(file.filename or "").suffix
    stored_filename = f"{uuid.uuid4().hex}{suffix}"
    destination = media_dir() / stored_filename
    contents = await file.read()
    destination.write_bytes(contents)
    content_type = file.content_type or "application/octet-stream"
    return stored_filename, file.filename or stored_filename, content_type


def delete_file(filename: str) -> None:
    path = media_dir() / filename
    path.unlink(missing_ok=True)


def to_attachment_read(attachment: Attachment) -> AttachmentRead:
    return AttachmentRead(
        id=attachment.id,
        trip_id=attachment.trip_id,
        kind=attachment.kind,
        title=attachment.title,
        description=attachment.description,
        url=f"/media/{attachment.filename}",
        original_filename=attachment.original_filename,
        content_type=attachment.content_type,
        created_at=attachment.created_at,
    )
