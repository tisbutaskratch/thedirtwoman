from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import (
    get_accessible_trip,
    get_current_user,
    trip_access_filter,
    validate_trip_member,
)
from app.db.session import get_db
from app.models.task import Task
from app.models.trip import Trip
from app.models.user import User
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate

router = APIRouter(tags=["tasks"])


def get_owned_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Task:
    task = (
        db.query(Task)
        .join(Trip, Task.trip_id == Trip.id)
        .filter(Task.id == task_id, trip_access_filter(current_user.id))
        .first()
    )
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.get("/trips/{trip_id}/tasks", response_model=list[TaskRead])
def list_tasks(trip: Trip = Depends(get_accessible_trip)) -> list[Task]:
    return trip.tasks


@router.post("/trips/{trip_id}/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate, trip: Trip = Depends(get_accessible_trip), db: Session = Depends(get_db)
) -> Task:
    validate_trip_member(trip, payload.assigned_to_user_id, db)
    task = Task(trip_id=trip.id, **payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/tasks/{task_id}", response_model=TaskRead)
def update_task(
    payload: TaskUpdate, task: Task = Depends(get_owned_task), db: Session = Depends(get_db)
) -> Task:
    updates = payload.model_dump(exclude_unset=True)
    if "assigned_to_user_id" in updates:
        validate_trip_member(task.trip, updates["assigned_to_user_id"], db)
    for field, value in updates.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task: Task = Depends(get_owned_task), db: Session = Depends(get_db)) -> None:
    db.delete(task)
    db.commit()
