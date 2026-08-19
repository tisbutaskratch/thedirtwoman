from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.limits import LONG_TEXT_MAX


class NoteCreate(BaseModel):
    body: str = Field(min_length=1, max_length=LONG_TEXT_MAX)


class NoteUpdate(BaseModel):
    body: str = Field(min_length=1, max_length=LONG_TEXT_MAX)


class NoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    body: str
    created_at: datetime
