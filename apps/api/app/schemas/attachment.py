from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.attachment import AttachmentKind


class AttachmentRead(BaseModel):
    id: int
    trip_id: int
    kind: AttachmentKind
    title: str
    description: Optional[str]
    # Displays the object inline, for image previews.
    url: str
    # Saves it under its original name. Distinct from url because object
    # storage sets the download filename in the signed URL itself.
    download_url: str
    original_filename: str
    content_type: str
    created_at: datetime
