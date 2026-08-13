from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ExpenseCreate(BaseModel):
    category: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=255)
    amount: float = Field(gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    date: date


class ExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    category: str
    description: Optional[str]
    amount: float
    currency: str
    date: date
