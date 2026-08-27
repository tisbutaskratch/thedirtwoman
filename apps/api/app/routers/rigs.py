"""Your garage.

Everything here is scoped to the signed-in user and never shared. There is
no trip in any of these paths on purpose: a rig is yours whether or not it
is going anywhere, and trip permissions have no say over it.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.rig import Rig
from app.models.user import User
from app.schemas.rig import RigCreate, RigRead, RigUpdate
from app.services.rig import to_rig_read

router = APIRouter(prefix="/rigs", tags=["rigs"])


def get_owned_rig(
    rig_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Rig:
    """A rig of yours, or a 404.

    404 rather than 403 throughout: somebody else's garage should not be
    enumerable, so an existing rig you do not own is indistinguishable from
    one that was never there.
    """
    rig = db.query(Rig).filter(Rig.id == rig_id, Rig.user_id == current_user.id).first()
    if rig is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rig not found")
    return rig


@router.get("", response_model=list[RigRead])
def list_rigs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[RigRead]:
    rigs = db.query(Rig).filter(Rig.user_id == current_user.id).order_by(Rig.name).all()
    return [to_rig_read(rig) for rig in rigs]


@router.post("", response_model=RigRead, status_code=status.HTTP_201_CREATED)
def create_rig(
    payload: RigCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RigRead:
    rig = Rig(user_id=current_user.id, **payload.model_dump())
    db.add(rig)
    db.commit()
    db.refresh(rig)
    return to_rig_read(rig)


@router.get("/{rig_id}", response_model=RigRead)
def get_rig(rig: Rig = Depends(get_owned_rig)) -> RigRead:
    return to_rig_read(rig)


@router.patch("/{rig_id}", response_model=RigRead)
def update_rig(
    payload: RigUpdate,
    rig: Rig = Depends(get_owned_rig),
    db: Session = Depends(get_db),
) -> RigRead:
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(rig, field, value)
    db.commit()
    db.refresh(rig)
    return to_rig_read(rig)


@router.delete("/{rig_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rig(rig: Rig = Depends(get_owned_rig), db: Session = Depends(get_db)) -> None:
    """Gone for good.

    Safe to do, because trips keep their own copy of what was brought. This
    removes the rig from your garage; it does not edit history.
    """
    db.delete(rig)
    db.commit()
