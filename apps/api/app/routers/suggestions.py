"""Read-only lookups of what you have typed before.

Separate endpoints per field rather than one endpoint with a "kind"
parameter. A kind switch would mean every new suggestible field edits this
router's dispatch, and callers would have to know a vocabulary of magic
strings that is not part of the domain language.
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services import suggestions

router = APIRouter(prefix="/suggestions", tags=["suggestions"])

# Shared so the three endpoints cannot drift apart in how they take input.
_QUERY = Query(default=None, max_length=100, description="Filter to values containing this text")
_LIMIT = Query(default=suggestions.DEFAULT_LIMIT, ge=1, le=suggestions.MAX_LIMIT)


@router.get("/gear", response_model=list[str])
def suggest_gear_names(
    q: Optional[str] = _QUERY,
    limit: int = _LIMIT,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[str]:
    return suggestions.gear_names(db, current_user.id, q, limit)


@router.get("/gear-categories", response_model=list[str])
def suggest_gear_categories(
    q: Optional[str] = _QUERY,
    limit: int = _LIMIT,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[str]:
    return suggestions.gear_categories(db, current_user.id, q, limit)


@router.get("/tasks", response_model=list[str])
def suggest_task_titles(
    q: Optional[str] = _QUERY,
    limit: int = _LIMIT,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[str]:
    return suggestions.task_titles(db, current_user.id, q, limit)
