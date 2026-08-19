FROM python:3.12-slim-bookworm

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# psycopg2-binary ships libpq statically bundled in its wheel, so no system
# build tools (gcc, libpq-dev) are needed to install it or anything else
# currently pinned in requirements.txt — all have prebuilt manylinux wheels.
RUN useradd --create-home --shell /bin/bash appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser . .

RUN mkdir -p media && chown appuser:appuser media

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Migrations run before the server binds, so a deploy never serves traffic
# against a schema it was not built for. Render's preDeployCommand would
# be the tidier home for this, but it is not available on every instance
# type, and this works on all of them.
CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]
