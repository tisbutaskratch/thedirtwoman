from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.limits import LONG_TEXT_MAX


class JournalEntryCreate(BaseModel):
    entry_date: date
    body: str = Field(min_length=1, max_length=LONG_TEXT_MAX)


class JournalEntryUpdate(BaseModel):
    entry_date: Optional[date] = None
    body: Optional[str] = Field(default=None, min_length=1, max_length=LONG_TEXT_MAX)


class JournalEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    entry_date: date
    body: str
    created_at: datetime
    updated_at: datetime
    # Deliberately no author field: you only ever receive your own entries,
    # so returning an author id would just be a hint that others exist.
