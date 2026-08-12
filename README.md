# Adventure Planner

A personal site (about/skills/projects) plus a trip-planning platform with five
specialized modes: Motocamping, Camping, Overlanding, Backpacking, and
International Travel.

Full spec, data model, API surface, and build phases: [ARCHITECTURE.md](./ARCHITECTURE.md).

**Status:** Phase 1 complete — repo scaffold, hello-world page, `/health`
endpoint. Next up: Phase 2 (personal site) or Phase 3 (auth + core platform).

## Stack

- **Web** — React + TypeScript + Vite + Tailwind CSS (`apps/web`)
- **API** — FastAPI + SQLAlchemy 2.0 + Alembic (`apps/api`)
- **Database** — PostgreSQL

## Monorepo layout

```
apps/
  web/    # React + TS + Vite frontend
  api/    # FastAPI backend
docker-compose.yml   # local dev: postgres + api + web
```

## Local development

### Option A: Docker Compose (recommended once Docker is installed)

```bash
docker compose up --build
```

- Web: http://localhost:5173
- API: http://localhost:8000 (docs at `/docs`)
- Postgres: localhost:5432 (user/pass `postgres`, db `adventure_planner`)

### Option B: run each app manually

**API**

```bash
cd apps/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # adjust DATABASE_URL if not using Docker's Postgres
uvicorn app.main:app --reload
```

**Web**

```bash
cd apps/web
npm install
cp .env.example .env
npm run dev
```

## Testing & linting

```bash
# API
cd apps/api && source .venv/bin/activate
pytest
ruff check .

# Web
cd apps/web
npm run lint
npm run test
npm run build
```

CI (`.github/workflows/ci.yml`) runs all of the above on every push/PR to `main`.
