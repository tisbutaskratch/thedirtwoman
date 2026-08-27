from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.common import RequiredLevel
from app.models.gear import Gear
from app.models.kit import Kit, KitItem
from app.models.trip import Trip


def gear_name_for(item: KitItem) -> str:
    """"Tyre levers" or "Tyre levers (x2)"."""
    return item.name if item.quantity <= 1 else f"{item.name} (x{item.quantity})"


def pack_kit_onto_trip(
    db: Session, kit: Kit, trip: Trip, user_id: int
) -> tuple[list[Gear], int]:
    """Copy a kit's contents onto a trip's packing list.

    This is the seam between the two contexts, and it is a copy rather than
    a link on purpose. Once the items are on the trip they are the trip's:
    rename one, tick it off, hand it to somebody else, and the kit is
    untouched. Equally, reorganising the kit afterwards does not reach back
    into a trip that has already been planned.

    Adding the same kit twice is treated as a mistake rather than an
    instruction, so anything already on the list by name is left alone. That
    makes the button safe to press when you cannot remember whether you
    pressed it.

    Returns the rows created, and how many were skipped.
    """
    existing = {g.name.strip().lower() for g in trip.gear}

    created: list[Gear] = []
    skipped = 0
    for item in kit.items:
        name = gear_name_for(item)
        if name.strip().lower() in existing:
            skipped += 1
            continue
        gear = Gear(
            trip_id=trip.id,
            name=name,
            # The kit becomes the category, which is what makes it readable
            # as a group on the list instead of a dozen loose rows.
            category=kit.name,
            notes=item.notes,
            required_level=RequiredLevel.required,
            # You brought it, so it is yours to carry unless somebody says
            # otherwise.
            assigned_to_user_id=user_id,
        )
        db.add(gear)
        created.append(gear)
        existing.add(name.strip().lower())

    db.commit()
    for gear in created:
        db.refresh(gear)
    return created, skipped
