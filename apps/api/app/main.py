import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.logging import configure_logging
from app.routers import (
    activities,
    attachments,
    auth,
    expenses,
    gear,
    health,
    locations,
    notes,
    sharing,
    tasks,
    trip_detail,
    trips,
)
from app.services.attachments import media_dir

logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    if settings.environment == "production" and settings.jwt_secret_key == "change-me":
        logger.critical(
            "JWT_SECRET_KEY is still the default value in a production environment. "
            "Set a real secret via the JWT_SECRET_KEY environment variable."
        )
    yield


app = FastAPI(
    title="Adventure Planner API",
    description="Trip planning platform with mode-specific detail for five adventure types.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/media", StaticFiles(directory=media_dir()), name="media")


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "%s %s -> %d (%.1fms)",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(trips.router)
app.include_router(trip_detail.router)
app.include_router(locations.router)
app.include_router(activities.router)
app.include_router(attachments.router)
app.include_router(expenses.router)
app.include_router(gear.router)
app.include_router(notes.router)
app.include_router(tasks.router)
app.include_router(sharing.router)
