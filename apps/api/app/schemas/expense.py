from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ExpenseParticipantRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    settled: bool
    share: float


class ExpenseCreate(BaseModel):
    category: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=255)
    amount: float = Field(gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    date: date
    paid_by_user_id: Optional[int] = None
    participant_user_ids: list[int] = Field(default_factory=list)


class ExpenseUpdate(BaseModel):
    category: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=255)
    amount: Optional[float] = Field(default=None, gt=0)
    currency: Optional[str] = Field(default=None, min_length=3, max_length=3)
    date: Optional[date] = None
    paid_by_user_id: Optional[int] = None
    participant_user_ids: Optional[list[int]] = None


class ExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    category: str
    description: Optional[str]
    amount: float
    currency: str
    date: date
    paid_by_user_id: Optional[int]
    participants: list[ExpenseParticipantRead]


class SettleUpdate(BaseModel):
    settled: bool
