from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_accessible_trip
from app.db.session import get_db
from app.models.expense import Expense
from app.models.trip import Trip
from app.schemas.expense import ExpenseCreate, ExpenseRead

router = APIRouter(tags=["expenses"])


@router.get("/trips/{trip_id}/expenses", response_model=list[ExpenseRead])
def list_expenses(trip: Trip = Depends(get_accessible_trip)) -> list[Expense]:
    return trip.expenses


@router.post(
    "/trips/{trip_id}/expenses", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED
)
def create_expense(
    payload: ExpenseCreate,
    trip: Trip = Depends(get_accessible_trip),
    db: Session = Depends(get_db),
) -> Expense:
    expense = Expense(trip_id=trip.id, **payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense
