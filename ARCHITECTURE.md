# Adventure Planner — Architecture & Build Plan

A personal website (about/skills/projects) plus a single planning platform with
five specialized trip-planning modes: **Motocamping, Camping, Overlanding,
Backpacking, International Travel**.

This doc is written to be handed directly to Claude Code as the spec for the
build. It locks in concrete decisions instead of leaving options open, since
open options just create ambiguity for an agent building this unattended.

---

## 1. Tech Stack (decided)

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite | Fast dev loop, no need for Next.js SSR features here |
| Styling | Tailwind CSS | Fast to build with, easy for Claude Code to generate consistently |
| Backend | Python + FastAPI | You want to learn Python; FastAPI gives typed request/response models for free |
| ORM | SQLAlchemy 2.0 + Alembic (migrations) | Standard, well-documented, plays well with Postgres |
| Database | PostgreSQL | Relational model fits Trip → Locations/Routes/Activities well |
| Auth | JWT (access + refresh token), passwords hashed with bcrypt via `passlib` | Simple, no third-party dependency required to start |
| API style | REST, JSON | Matches FastAPI's strengths; simplest to reason about |
| Hosting (frontend) | Vercel or Netlify (static build) | Free tier, trivial CI deploy from GitHub |
| Hosting (backend + DB) | Railway or Render (Postgres + FastAPI container) | Both offer managed Postgres + simple deploys from a Dockerfile |
| Background jobs (later) | none for v1; revisit with a queue (e.g. `arq` or Celery) only if weather/route syncing needs to run async | Avoid overbuilding early |

Skip Next.js entirely for now — one frontend framework is enough decision
surface for v1. If you still want to learn Next.js later, that's a good
**second, separate** portfolio project, not a second app bolted onto this one.

---

## 2. Monorepo Structure

```
adventure-planner/
├── apps/
│   ├── web/                  # React + TS + Vite (personal site + planner UI)
│   │   ├── src/
│   │   │   ├── pages/         # Home, About, Skills, Projects, Dashboard, TripDetail
│   │   │   ├── components/
│   │   │   ├── modes/         # one folder per trip type's specialized UI
│   │   │   │   ├── motocamping/
│   │   │   │   ├── camping/
│   │   │   │   ├── overlanding/
│   │   │   │   ├── backpacking/
│   │   │   │   └── international/
│   │   │   ├── api/           # typed fetch client
│   │   │   ├── lib/
│   │   │   └── main.tsx
│   │   └── package.json
│   │
│   └── api/                  # FastAPI backend
│       ├── app/
│       │   ├── main.py
│       │   ├── core/           # config, security, deps
│       │   ├── db/             # session, base, migrations (alembic)
│       │   ├── models/         # SQLAlchemy models
│       │   ├── schemas/        # Pydantic request/response models
│       │   ├── routers/        # trips.py, auth.py, locations.py, mode routers
│       │   ├── services/       # business logic (fuel range calc, pack weight calc, etc.)
│       │   └── integrations/   # weather.py, maps.py, geocoding.py
│       ├── tests/
│       ├── alembic/
│       ├── requirements.txt
│       └── Dockerfile
│
├── docker-compose.yml         # local dev: postgres + api + web
├── .github/workflows/         # CI: lint, test, build on push
└── README.md
```

---

## 3. Data Model

### 3.1 Core (shared across all trip types)

```
User
 id, email, hashed_password, name, created_at

Trip
 id, user_id (FK), title, trip_type (enum: motocamping | camping | overlanding
                                     | backpacking | international)
 start_date, end_date, status (planning | active | completed), created_at

Location
 id, trip_id (FK), name, lat, lng, kind (waypoint | campsite | hotel | poi | fuel_stop)
 arrival_time (nullable), notes, order_index

Route
 id, trip_id (FK), name, distance_miles, geometry (GeoJSON or polyline string)

Activity
 id, trip_id (FK), title, day_index, start_time, end_time, notes,
 location_id (FK, nullable)

Expense
 id, trip_id (FK), category, description, amount, currency, date

Gear
 id, trip_id (FK), name, category, weight_oz (nullable), packed (bool)

Note
 id, trip_id (FK), body, created_at
```

### 3.2 Mode-specific extensions (one-to-one with Trip, only present for that mode)

```
MotocampingDetail
 trip_id (FK, PK), motorcycle_name, fuel_capacity_gal, fuel_economy_mpg,
 est_range_miles (derived), daily_ride_target_miles

OverlandingDetail
 trip_id (FK, PK), vehicle_name, fuel_capacity_gal, fuel_economy_mpg,
 ground_clearance_in, drivetrain, has_recovery_gear (bool),
 comms_plan (text), emergency_contact

BackpackingDetail
 trip_id (FK, PK), base_pack_weight_oz, permit_required (bool),
 permit_notes, resupply_plan (text)

CampingDetail
 trip_id (FK, PK), campground_reservation_ref, fire_restrictions_checked (bool)

InternationalDetail
 trip_id (FK, PK), home_currency, destination_currencies (array),
 primary_timezone
```

Rather than five near-duplicate tables for "route-like" data, model the
**shared** concepts (Location, Route, Activity) once and let each mode's
frontend decide what to surface and how to label it. This is the single most
important architectural decision in the whole project — it's what turns "five
apps" into "one platform with five views," and it's what will make the
codebase interesting rather than repetitive.

### 3.3 Derived/computed values (service layer, not stored)

- Motocamping/Overlanding: estimated range = `fuel_capacity_gal * fuel_economy_mpg`
- Backpacking: estimated pack weight = `base_pack_weight_oz + consumables + water_oz`
- Any trip: `% planned` = ratio of filled-in required fields per trip type

---

## 4. API Surface (v1)

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh

GET    /trips                     # list current user's trips
POST   /trips                     # create trip (includes trip_type)
GET    /trips/{id}
PATCH  /trips/{id}
DELETE /trips/{id}

GET    /trips/{id}/locations
POST   /trips/{id}/locations
PATCH  /locations/{id}
DELETE /locations/{id}

GET    /trips/{id}/activities
POST   /trips/{id}/activities
PATCH  /activities/{id}

GET    /trips/{id}/expenses
POST   /trips/{id}/expenses

GET    /trips/{id}/gear
POST   /trips/{id}/gear
PATCH  /gear/{id}

GET/PATCH /trips/{id}/detail      # mode-specific detail, routed by trip_type

GET    /integrations/weather?lat=&lng=&date=
GET    /integrations/geocode?query=
```

Keep mode-specific detail behind a single `/trips/{id}/detail` endpoint whose
shape depends on `trip_type` rather than five separate endpoint families —
fewer moving parts for the frontend's typed client to track.

---

## 5. Frontend Structure

- **Public site**: `/`, `/about`, `/skills`, `/projects`, `/contact` — static,
  no auth required. This is the resume-adjacent part.
- **Planner app**: `/app/dashboard`, `/app/trips/new`, `/app/trips/:id` — auth
  required.
- **Dashboard**: card grid of trips, each showing type icon, dates, and
  `% planned`.
- **New Trip flow**: pick a type (5 icon buttons) → creates a `Trip` row with
  that `trip_type` → redirects into that mode's trip detail view.
- **Trip detail view**: shared shell (day-by-day timeline, map, notes,
  expenses) + a mode-specific panel driven by `apps/web/src/modes/<type>/`.
  The timeline component itself is shared; only how each activity/location
  renders (icons, labels, fields shown) changes per mode.

---

## 6. External Integrations (add incrementally, don't block v1 on these)

| Integration | Use | Notes |
|---|---|---|
| Geocoding (e.g. OpenStreetMap Nominatim, or Mapbox) | Turn place names into lat/lng | Nominatim is free and enough to start |
| Weather (e.g. Open-Meteo) | Show forecast for trip dates/locations | Open-Meteo has a generous free tier, no key required |
| Maps rendering (e.g. MapLibre GL + OSM tiles) | Show routes/waypoints visually | Avoid Google Maps billing complexity for a portfolio project |
| Currency conversion | International mode only | Any free exchange-rate API |

---

## 7. Build Phases

Each phase should be a deployable, demoable increment — good for portfolio
commits and for Claude Code to tackle as discrete tasks.

1. **Repo scaffold** — monorepo structure above, Docker Compose for local
   Postgres, FastAPI hello-world, Vite hello-world, CI skeleton.
2. **Personal site** — Home/About/Skills/Projects/Contact, fully static,
   deployed first so there's always something live.
3. **Auth + core platform** — register/login, Trip CRUD, dashboard, generic
   trip detail (Locations/Activities/Expenses/Notes), no mode specialization
   yet.
4. **Motocamping mode** (flagship) — MotocampingDetail model + UI, range
   calculator, ride-day planning on the timeline.
5. **Backpacking mode** — BackpackingDetail, pack weight calculator, trail
   segment view. Chosen second deliberately: it stresses the shared model in
   a different direction than motocamping (weight/elevation vs. fuel/mileage),
   which is the real test of whether the architecture is actually shared and
   not just copy-pasted.
6. **Overlanding mode** — vehicle/recovery/comms fields, mostly reuses
   patterns from motocamping.
7. **Camping mode** — usually the thinnest addition since the shared platform
   already covers most of it.
8. **International Travel mode** — flights/hotels/currency/timezones; the
   largest of the five, do it last once the platform is mature.
9. **Engineering polish** — tests (pytest + Vitest), Dockerfile hardening,
   CI/CD to Railway/Render + Vercel/Netlify, error handling/logging, API docs
   (FastAPI gives OpenAPI docs for free at `/docs`).

---

## 8. What to tell Claude Code

When you start the build, a good first prompt is:

> Scaffold the monorepo described in adventure-planner-architecture.md:
> apps/web (Vite + React + TS + Tailwind) and apps/api (FastAPI + SQLAlchemy +
> Alembic), with docker-compose for local Postgres. Get a "hello world" page
> and a `/health` endpoint working end to end before adding any features.

Then work phase-by-phase from Section 7, pointing Claude Code at this file
for the data model and API surface each time you start a new phase.
