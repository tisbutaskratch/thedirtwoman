from __future__ import annotations

from typing import Optional

from app.models.rig import Rig
from app.schemas.rig import RigRead

# Observed mileage lands well below the sticker figure once the rig is
# loaded, so the range estimate derates it. Same 0.85 the domestic fuel
# estimate uses, for the same reason: budgeting on the optimistic number is
# how people end up walking to a petrol station.
REAL_WORLD_MPG_DERATE = 0.85


def estimated_range_miles(rig: Rig) -> Optional[float]:
    """Full tank to empty, derated. None when we cannot say."""
    if rig.fuel_capacity_gal is None or rig.fuel_economy_mpg is None:
        return None
    if rig.fuel_capacity_gal <= 0 or rig.fuel_economy_mpg <= 0:
        return None
    return round(rig.fuel_capacity_gal * rig.fuel_economy_mpg * REAL_WORLD_MPG_DERATE)


def describe(rig: Rig) -> Optional[str]:
    """"2019 Toyota Tacoma", from whichever parts were filled in."""
    parts = [str(rig.year) if rig.year else None, rig.make, rig.model]
    present = [p for p in parts if p]
    return " ".join(present) if present else None


def to_rig_read(rig: Rig) -> RigRead:
    return RigRead(
        id=rig.id,
        user_id=rig.user_id,
        name=rig.name,
        kind=rig.kind,
        make=rig.make,
        model=rig.model,
        year=rig.year,
        fuel_capacity_gal=rig.fuel_capacity_gal,
        fuel_economy_mpg=rig.fuel_economy_mpg,
        ground_clearance_in=rig.ground_clearance_in,
        tire_size=rig.tire_size,
        drivetrain=rig.drivetrain,
        notes=rig.notes,
        description=describe(rig),
        est_range_miles=estimated_range_miles(rig),
    )
