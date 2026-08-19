# Deploying

Two domains, three accounts, one repo.

| Domain | Serves | Hosted by | Talks to the API? |
| --- | --- | --- | --- |
| `sabawilhelm.com` | Resume | Netlify site #1 | No. Every page is static. |
| `thedirthags.com` | Adventure Planner | Netlify site #2 | Yes |
| `api.thedirthags.com` | FastAPI + Postgres | Render | — |

The API subdomain sits under `thedirthags.com` because the planner is its only
caller. `sabawilhelm.com` needs no connection to Render whatsoever.

Do these in order. Each step produces a URL the next step needs.

## 1. Render: the API and database

1. New → Blueprint → connect this repo. It reads `render.yaml` and creates
   both the web service and the Postgres database.
2. Wait for the first deploy. The container runs `alembic upgrade head` before
   uvicorn binds, so the schema is in place before the app serves anything.
3. Check `https://<service>.onrender.com/health` returns OK.

Two environment variables are deliberately not in `render.yaml`, because they
contain URLs that do not exist until step 2. Set them in the dashboard once
you have them:

- `CORS_ORIGINS` → `["https://thedirthags.com"]`
- `FRONTEND_BASE_URL` → `https://thedirthags.com`

Both are required. Without the first, every planner request is blocked by the
browser. Without the second, invite emails link people to `localhost`.

### Uploads: a Cloudflare R2 bucket

Render's filesystem is ephemeral, so uploads must not live on it. Set these
four and the API stores attachments in object storage instead of on disk;
leave any of them unset and it falls back to local disk, which on Render
means files vanish on the next restart.

1. Cloudflare dashboard → R2 → create a bucket, e.g. `thedirthags-uploads`.
   Leave public access **off**. Nothing in it should be world-readable.
2. R2 → Manage API Tokens → create a token with Object Read & Write, scoped
   to that bucket.
3. Set on the Render service:

```
S3_BUCKET             thedirthags-uploads
S3_ENDPOINT_URL       https://<account-id>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID      <token access key id>
S3_SECRET_ACCESS_KEY  <token secret>
```

No CORS configuration is needed on the bucket. Files are reached by plain
navigation to a signed URL, not by a cross-origin fetch.

The API mints a signed URL, valid for 15 minutes, only after checking that
the caller may see that trip. Nothing in the bucket is reachable without one.

## 2. Netlify: two sites from this one repo

Add both sites from the same repo and the same `main` branch. They share
`netlify.toml`, so the build settings are detected. They differ only in
environment variables, set per site under Site settings → Environment
variables.

**Site 1, the resume**

```
VITE_SITE          (leave unset)
VITE_PLANNER_URL   https://thedirthags.com
```

**Site 2, the planner**

```
VITE_SITE          planner
VITE_RESUME_URL    https://sabawilhelm.com
VITE_API_BASE_URL  https://api.thedirthags.com
```

The resume needs no `VITE_API_BASE_URL`; it makes no requests.

## 3. Namecheap: point the names at the machines

For each domain, Domain List → Manage → Advanced DNS. The simplest route is to
switch to Netlify's nameservers and let Netlify manage the records. If you
prefer to keep DNS at Namecheap:

`sabawilhelm.com`

| Host | Type | Value |
| --- | --- | --- |
| `@` | ALIAS | the apex target Netlify gives you |
| `www` | CNAME | `<site-1>.netlify.app` |

`thedirthags.com`

| Host | Type | Value |
| --- | --- | --- |
| `@` | ALIAS | the apex target Netlify gives you |
| `www` | CNAME | `<site-2>.netlify.app` |
| `api` | CNAME | `<service>.onrender.com` |

Then add each custom domain in the Netlify site settings, and
`api.thedirthags.com` in Render's settings. Both issue TLS certificates
automatically once DNS resolves; this can take up to an hour to propagate.

## 4. Verify

- `sabawilhelm.com` loads the resume, and its footer link opens the planner.
- `thedirthags.com` redirects to `/dashboard`, then to `/login` when signed out.
- Register an account, create a trip, upload a file, and reload.
- The planner footer's byline links back to the resume.

## Known gaps before real users

- **The free Postgres database expires 30 days after creation**, with a 14-day
  grace period before deletion. This is a hard deadline, not a nag: upgrade it
  or export the data before then. Set a calendar reminder on the day you create
  it.
- **Free web services sleep after 15 minutes idle** and take about a minute to
  wake, so a recruiter clicking through from the resume may sit on a blank
  screen. Move to `starter` in `render.yaml` before the link goes anywhere
  public.
- **Free instances have no persistent disk at all**, which is why the R2 step
  above is not optional. Skip it and every upload is lost on the next restart.
