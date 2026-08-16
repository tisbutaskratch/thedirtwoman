import logging
import sys

from app.core.config import settings


def configure_logging() -> None:
    level = logging.DEBUG if settings.environment == "development" else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
        stream=sys.stdout,
        force=True,
    )
    # SQLAlchemy's engine logger is very chatty at INFO; only surface it when
    # someone explicitly wants SQL echo, not on every request.
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
