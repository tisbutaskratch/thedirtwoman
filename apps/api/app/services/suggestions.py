"""What this person has typed before.

Deliberately a read model rather than part of the domain. Nobody says "I
have a saved packing item", they say "I always bring my headlamp", so there
is no aggregate here and nothing new to persist. These are queries over rows
the user can already see, ranked so the things they reach for most often
come up first.

Kept out of the routers so the ranking rules live in one place, and so the
routers stay about HTTP.
"""

from __future__ import annotations

from typing import Optional

from sqlalchemy import ColumnElement, func, select
from sqlalchemy.orm import Session

from app.core.deps import trip_access_filter
from app.models.gear import Gear
from app.models.task import Task
from app.models.trip import Trip

# Enough to fill a dropdown without turning it into a scroll exercise.
DEFAULT_LIMIT = 8
MAX_LIMIT = 25


def _contains(column: ColumnElement[str], term: str) -> ColumnElement[bool]:
    """Case-insensitive contains, with LIKE's own wildcards defanged.

    Without escaping, typing "%" would match everything and "_" would match
    any character, which is confusing rather than dangerous: the value is
    still parameterised, it just would not mean what the person typed.
    """
    escaped = term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return column.ilike(f"%{escaped}%", escape="\\")


def _suggest(
    db: Session,
    user_id: int,
    column: ColumnElement[str],
    trip_id_column: ColumnElement[int],
    query: Optional[str],
    limit: int,
) -> list[str]:
    """Distinct past values for one free-text field, most used first.

    Grouped case-insensitively so "Headlamp" and "headlamp" are one
    suggestion rather than two, with the alphabetically first spelling shown
    as the representative. Ties break alphabetically so the list is stable
    between calls instead of shuffling on every keystroke.
    """
    limit = max(1, min(limit, MAX_LIMIT))
    stmt = (
        select(func.min(column), func.count().label("uses"))
        .join(Trip, trip_id_column == Trip.id)
        .where(trip_access_filter(user_id), column.is_not(None), column != "")
        .group_by(func.lower(column))
        .order_by(func.count().desc(), func.min(column))
        .limit(limit)
    )
    if query:
        stmt = stmt.where(_contains(column, query))
    return [row[0] for row in db.execute(stmt)]


def gear_names(
    db: Session, user_id: int, query: Optional[str] = None, limit: int = DEFAULT_LIMIT
) -> list[str]:
    return _suggest(db, user_id, Gear.name, Gear.trip_id, query, limit)


def gear_categories(
    db: Session, user_id: int, query: Optional[str] = None, limit: int = DEFAULT_LIMIT
) -> list[str]:
    return _suggest(db, user_id, Gear.category, Gear.trip_id, query, limit)


def task_titles(
    db: Session, user_id: int, query: Optional[str] = None, limit: int = DEFAULT_LIMIT
) -> list[str]:
    return _suggest(db, user_id, Task.title, Task.trip_id, query, limit)
