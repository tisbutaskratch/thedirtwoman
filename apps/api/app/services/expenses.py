from app.models.expense import Expense
from app.schemas.expense import ExpenseParticipantRead, ExpenseRead


def to_expense_read(expense: Expense) -> ExpenseRead:
    share = expense.amount / len(expense.participants) if expense.participants else 0.0
    return ExpenseRead(
        id=expense.id,
        trip_id=expense.trip_id,
        category=expense.category,
        description=expense.description,
        amount=expense.amount,
        currency=expense.currency,
        date=expense.date,
        paid_by_user_id=expense.paid_by_user_id,
        participants=[
            ExpenseParticipantRead(user_id=p.user_id, settled=p.settled, share=share)
            for p in expense.participants
        ],
    )
