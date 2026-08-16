from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import (
    get_accessible_trip,
    get_current_user,
    trip_access_filter,
    validate_trip_member,
)
from app.db.session import get_db
from app.models.expense import Expense, ExpenseParticipant
from app.models.trip import Trip
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseRead, ExpenseUpdate, SettleUpdate
from app.services.expenses import to_expense_read

router = APIRouter(tags=["expenses"])


def get_owned_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Expense:
    expense = (
        db.query(Expense)
        .join(Trip, Expense.trip_id == Trip.id)
        .filter(Expense.id == expense_id, trip_access_filter(current_user.id))
        .first()
    )
    if expense is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    return expense


def _set_participants(expense: Expense, user_ids: list[int], trip: Trip, db: Session) -> None:
    for user_id in user_ids:
        validate_trip_member(trip, user_id, db)
    expense.participants = [
        ExpenseParticipant(user_id=user_id) for user_id in dict.fromkeys(user_ids)
    ]


@router.get("/trips/{trip_id}/expenses", response_model=list[ExpenseRead])
def list_expenses(trip: Trip = Depends(get_accessible_trip)) -> list[ExpenseRead]:
    return [to_expense_read(e) for e in trip.expenses]


@router.post(
    "/trips/{trip_id}/expenses", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED
)
def create_expense(
    payload: ExpenseCreate,
    trip: Trip = Depends(get_accessible_trip),
    db: Session = Depends(get_db),
) -> ExpenseRead:
    validate_trip_member(trip, payload.paid_by_user_id, db)
    data = payload.model_dump(exclude={"participant_user_ids"})
    expense = Expense(trip_id=trip.id, **data)
    _set_participants(expense, payload.participant_user_ids, trip, db)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return to_expense_read(expense)


@router.patch("/expenses/{expense_id}", response_model=ExpenseRead)
def update_expense(
    payload: ExpenseUpdate,
    expense: Expense = Depends(get_owned_expense),
    db: Session = Depends(get_db),
) -> ExpenseRead:
    updates = payload.model_dump(exclude_unset=True, exclude={"participant_user_ids"})
    if "paid_by_user_id" in updates:
        validate_trip_member(expense.trip, updates["paid_by_user_id"], db)
    for field, value in updates.items():
        setattr(expense, field, value)
    if payload.participant_user_ids is not None:
        _set_participants(expense, payload.participant_user_ids, expense.trip, db)
    db.commit()
    db.refresh(expense)
    return to_expense_read(expense)


@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense: Expense = Depends(get_owned_expense), db: Session = Depends(get_db)
) -> None:
    db.delete(expense)
    db.commit()


@router.patch("/expenses/{expense_id}/participants/me", response_model=ExpenseRead)
def settle_my_share(
    payload: SettleUpdate,
    expense: Expense = Depends(get_owned_expense),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExpenseRead:
    participant = next((p for p in expense.participants if p.user_id == current_user.id), None)
    if participant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Not a participant on this expense"
        )
    participant.settled = payload.settled
    db.commit()
    db.refresh(expense)
    return to_expense_read(expense)
