from __future__ import annotations

from typing import Optional


def compute_est_range_miles(
    fuel_capacity_gal: Optional[float], fuel_economy_mpg: Optional[float]
) -> Optional[float]:
    """Shared by motocamping and overlanding, which both compute range the same way."""
    if fuel_capacity_gal is None or fuel_economy_mpg is None:
        return None
    return round(fuel_capacity_gal * fuel_economy_mpg, 1)
