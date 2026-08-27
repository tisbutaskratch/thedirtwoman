from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.gear import GearRead
from app.schemas.limits import LONG_TEXT_MAX


class KitItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    quantity: int = Field(default=1, ge=1, le=999)
    notes: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)


class KitItemUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    quantity: Optional[int] = Field(default=None, ge=1, le=999)
    notes: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)


class KitItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    kit_id: int
    name: str
    quantity: int
    notes: Optional[str]


class KitCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    notes: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)


class KitUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    notes: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)


class KitRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    notes: Optional[str]
    items: list[KitItemRead]


class PackedKitRead(BaseModel):
    """What happened when a kit was emptied onto a packing list."""

    # Split out because "nothing happened" and "I added twelve things" look
    # identical from a 200 alone, and the second time you press it the
    # honest answer is usually "they were already there".
    added: int
    skipped: int
    gear: list[GearRead]
