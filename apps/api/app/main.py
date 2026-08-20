import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.logging import configure_logging
from app.routers import (
    activities,
    attachments,
    auth,
    calendar,
    expenses,
    gear,
    health,
    journal,
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

# Local uploads are served straight from disk in development. In deployment
# uploads live in a private bucket and are reached only through short-lived
# signed URLs, so there is deliberately nothing mounted here.
if not settings.uses_object_storage:
    app.mount("/media", StaticFiles(directory=media_dir()), name="media")


@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    """Refuse oversized bodies before anything reads them.

    Field-level caps stop a huge journal entry, but they only apply after the
    body has been parsed, by which point it is already in memory. This rejects
    on the declared length first, so an instance with a few hundred megabytes
    of RAM cannot be exhausted by one request.

    Content-Length can be absent or a lie, so this is a cheap first gate
    rather than the only one; the field caps behind it are the real limit.
    """
    declared = request.headers.get("content-length")
    if declared is not None:
        try:
            if int(declared) > settings.max_request_bytes:
                return JSONResponse(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    content={"detail": "Request body too large"},
                )
        except ValueError:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Invalid Content-Length"},
            )
    return await call_next(request)


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
app.include_router(calendar.router)
app.include_router(expenses.router)
app.include_router(gear.router)
app.include_router(journal.router)
app.include_router(notes.router)
app.include_router(tasks.router)
app.include_router(sharing.router)
