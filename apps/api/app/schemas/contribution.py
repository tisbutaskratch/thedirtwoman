from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.contribution import ContributionKind
from app.schemas.limits import LONG_TEXT_MAX


class ContributionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    kind: ContributionKind = ContributionKind.food
    # Day 1 is the first day of the gathering. Rejecting 0 keeps rows off a
    # day that renders before the thing has started.
    day_index: Optional[int] = Field(default=None, ge=1)
    assigned_to_user_id: Optional[int] = None
    assigned_to_all: bool = False
    serves: Optional[int] = Field(default=None, ge=0)
    confirmed: bool = False
    notes: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)


class ContributionUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    kind: Optional[ContributionKind] = None
    day_index: Optional[int] = Field(default=None, ge=1)
    assigned_to_user_id: Optional[int] = None
    assigned_to_all: Optional[bool] = None
    serves: Optional[int] = Field(default=None, ge=0)
    confirmed: Optional[bool] = None
    notes: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)


class ContributionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    name: str
    kind: ContributionKind
    day_index: Optional[int]
    assigned_to_user_id: Optional[int]
    assigned_to_all: bool
    serves: Optional[int]
    confirmed: bool
    notes: Optional[str]
