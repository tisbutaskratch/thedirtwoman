from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import (
    activities,
    auth,
    expenses,
    gear,
    health,
    locations,
    notes,
    sharing,
    trip_detail,
    trips,
)

app = FastAPI(title="Adventure Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(trips.router)
app.include_router(trip_detail.router)
app.include_router(locations.router)
app.include_router(activities.router)
app.include_router(expenses.router)
app.include_router(gear.router)
app.include_router(notes.router)
app.include_router(sharing.router)
