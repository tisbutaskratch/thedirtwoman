# Adventure Planner

A personal site (about/skills/projects) plus a trip-planning platform with five
specialized modes: Motocamping, Camping, Overlanding, Backpacking, and
International Travel.

Full spec, data model, API surface, and build phases: [ARCHITECTURE.md](./ARCHITECTURE.md).

**Status:** Phases 1–9 complete. Public site, auth, Trip CRUD/sharing, and
all five trip-planning modes (Motocamping, Backpacking, Overlanding, Camping,
International) are built and tested. Deploy configs are prepared but not
connected to live hosting — see [Deployment](#deployment) below.

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

No Postgres installed? SQLite is enough to run the whole API locally. The
migrations use `batch_alter_table`, so they apply to both. In `apps/api/.env`:

```
DATABASE_URL=sqlite:///./dev.db
RATE_LIMIT_ENABLED=false
```

then `alembic upgrade head`. Local database files and `.env` are gitignored.
Postgres is still what runs in production, so anything touching SQL behaviour
is worth checking against the real thing before shipping.

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

## Deployment

Per the architecture doc: frontend on Vercel or Netlify, backend + Postgres
on Railway or Render. Config files are prepared but require you to connect
your own accounts — nothing here is deployed automatically.

**Backend (Render)** — `render.yaml` at the repo root is a
[Render Blueprint](https://render.com/docs/blueprint-spec). In the Render
dashboard: "New +" → "Blueprint" → select this repo. It provisions a free
Postgres database and a web service built from `apps/api/Dockerfile`,
auto-wires `DATABASE_URL`, and generates a random `JWT_SECRET_KEY`. After
the first deploy, set `CORS_ORIGINS` in the dashboard to your deployed
frontend's URL, e.g. `["https://your-app.vercel.app"]`.

**Backend (Railway)** — no extra config needed. Railway builds directly from
`apps/api/Dockerfile`; add a Postgres plugin and set `DATABASE_URL`,
`JWT_SECRET_KEY`, `ENVIRONMENT=production`, and `CORS_ORIGINS` as service
variables.

**Frontend (Vercel)** — `apps/web/vercel.json` sets the build command and a
SPA rewrite so client-side routes (e.g. `/app/dashboard`) don't 404 on
refresh. In the Vercel dashboard, set the project's Root Directory to
`apps/web` and add `VITE_API_BASE_URL` pointing at your deployed API.

**Frontend (Netlify)** — `netlify.toml` at the repo root sets `base =
"apps/web"` for this monorepo plus the same SPA redirect. Set
`VITE_API_BASE_URL` in the dashboard's environment variables.

Both frontend configs can coexist harmlessly — pick whichever platform you
actually use.
