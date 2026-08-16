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
    url: str
    original_filename: str
    content_type: str
    created_at: datetime
