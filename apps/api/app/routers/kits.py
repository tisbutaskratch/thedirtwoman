"""Kits, and emptying one onto a trip.

Items are reached through their kit rather than by their own id. That is not
decoration: an item has no meaning outside the kit it is in, and a route
like /items/{id} would invite callers to treat it as if it did. Naming the
kit first makes the boundary the URL's problem instead of every caller's.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_editable_trip
from app.db.session import get_db
from app.models.kit import Kit, KitItem
from app.models.trip import Trip
from app.models.user import User
from app.schemas.gear import GearRead
from app.schemas.kit import (
    KitCreate,
    KitItemCreate,
    KitItemRead,
    KitItemUpdate,
    KitRead,
    KitUpdate,
    PackedKitRead,
)
from app.services.kit import pack_kit_onto_trip

router = APIRouter(tags=["kits"])


def get_owned_kit(
    kit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Kit:
    """A kit of yours, or a 404. Somebody else's is not enumerable."""
    kit = db.query(Kit).filter(Kit.id == kit_id, Kit.user_id == current_user.id).first()
    if kit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kit not found")
    return kit


def get_owned_item(
    item_id: int,
    kit: Kit = Depends(get_owned_kit),
    db: Session = Depends(get_db),
) -> KitItem:
    """An item, reached through the kit that owns it."""
    item = db.query(KitItem).filter(KitItem.id == item_id, KitItem.kit_id == kit.id).first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


# --------------------------------------------------------------- the kits


@router.get("/kits", response_model=list[KitRead])
def list_kits(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[Kit]:
    return db.query(Kit).filter(Kit.user_id == current_user.id).order_by(Kit.name).all()


@router.post("/kits", response_model=KitRead, status_code=status.HTTP_201_CREATED)
def create_kit(
    payload: KitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Kit:
    kit = Kit(user_id=current_user.id, **payload.model_dump())
    db.add(kit)
    db.commit()
    db.refresh(kit)
    return kit


@router.get("/kits/{kit_id}", response_model=KitRead)
def get_kit(kit: Kit = Depends(get_owned_kit)) -> Kit:
    return kit


@router.patch("/kits/{kit_id}", response_model=KitRead)
def update_kit(
    payload: KitUpdate,
    kit: Kit = Depends(get_owned_kit),
    db: Session = Depends(get_db),
) -> Kit:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(kit, field, value)
    db.commit()
    db.refresh(kit)
    return kit


@router.delete("/kits/{kit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_kit(kit: Kit = Depends(get_owned_kit), db: Session = Depends(get_db)) -> None:
    """Takes its contents with it. Trips that packed it keep their own copies."""
    db.delete(kit)
    db.commit()


# -------------------------------------------------------------- the items


@router.post(
    "/kits/{kit_id}/items", response_model=KitItemRead, status_code=status.HTTP_201_CREATED
)
def add_item(
    payload: KitItemCreate,
    kit: Kit = Depends(get_owned_kit),
    db: Session = Depends(get_db),
) -> KitItem:
    item = KitItem(kit_id=kit.id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/kits/{kit_id}/items/{item_id}", response_model=KitItemRead)
def update_item(
    payload: KitItemUpdate,
    item: KitItem = Depends(get_owned_item),
    db: Session = Depends(get_db),
) -> KitItem:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/kits/{kit_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item: KitItem = Depends(get_owned_item), db: Session = Depends(get_db)) -> None:
    db.delete(item)
    db.commit()


# ------------------------------------------------- where the two contexts meet


@router.post("/trips/{trip_id}/gear/from-kit/{kit_id}", response_model=PackedKitRead)
def pack_kit(
    kit: Kit = Depends(get_owned_kit),
    trip: Trip = Depends(get_editable_trip),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PackedKitRead:
    """Empty one of your kits onto this trip's packing list.

    Needs both: the kit has to be yours, and you have to be able to edit the
    trip. Neither permission implies the other, which is exactly why they
    are separate contexts.
    """
    created, skipped = pack_kit_onto_trip(db, kit, trip, current_user.id)
    return PackedKitRead(
        added=len(created),
        skipped=skipped,
        gear=[GearRead.model_validate(g) for g in created],
    )
