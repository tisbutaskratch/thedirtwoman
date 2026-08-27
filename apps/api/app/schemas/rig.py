from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.rig import RigKind
from app.schemas.limits import LONG_TEXT_MAX


class RigCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    kind: RigKind = RigKind.other
    make: Optional[str] = Field(default=None, max_length=100)
    model: Optional[str] = Field(default=None, max_length=100)
    # Wide enough for anything anyone is actually driving, narrow enough to
    # reject a typo'd phone number.
    year: Optional[int] = Field(default=None, ge=1900, le=2100)
    fuel_capacity_gal: Optional[float] = Field(default=None, ge=0)
    fuel_economy_mpg: Optional[float] = Field(default=None, ge=0)
    ground_clearance_in: Optional[float] = Field(default=None, ge=0)
    tire_size: Optional[str] = Field(default=None, max_length=100)
    drivetrain: Optional[str] = Field(default=None, max_length=50)
    notes: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)


class RigUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    kind: Optional[RigKind] = None
    make: Optional[str] = Field(default=None, max_length=100)
    model: Optional[str] = Field(default=None, max_length=100)
    year: Optional[int] = Field(default=None, ge=1900, le=2100)
    fuel_capacity_gal: Optional[float] = Field(default=None, ge=0)
    fuel_economy_mpg: Optional[float] = Field(default=None, ge=0)
    ground_clearance_in: Optional[float] = Field(default=None, ge=0)
    tire_size: Optional[str] = Field(default=None, max_length=100)
    drivetrain: Optional[str] = Field(default=None, max_length=50)
    notes: Optional[str] = Field(default=None, max_length=LONG_TEXT_MAX)


class RigRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    kind: RigKind
    make: Optional[str]
    model: Optional[str]
    year: Optional[int]
    fuel_capacity_gal: Optional[float]
    fuel_economy_mpg: Optional[float]
    ground_clearance_in: Optional[float]
    tire_size: Optional[str]
    drivetrain: Optional[str]
    notes: Optional[str]

    # --- derived --------------------------------------------------------
    # "2019 Toyota Tacoma", or null when none of those were filled in.
    description: Optional[str]
    # Full tank to empty, derated for real-world mileage.
    est_range_miles: Optional[float]
