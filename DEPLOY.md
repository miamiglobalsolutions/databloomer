# DataBloomer (RoofRadar) — Vercel deployment

Production site: **https://databloomer.com**

## What was prepared in this repo

- `web/vercel.json` — Next.js deploy config + weekly data refresh cron (Mondays 11:00 UTC)
- Production database **requires** `DATABASE_URL` (PGlite is local-dev only)
- SSL-enabled Postgres pool for Neon/Vercel Postgres
- Branding/metadata defaults to `databloomer.com`

## What you need to do (≈15 minutes)

### 1. Create a production database (Neon — recommended)

1. Open [Vercel Dashboard](https://vercel.com) → your team → **Storage** → **Create** → **Neon** (or connect existing Neon).
2. Link the database to your project.
3. Vercel will inject `DATABASE_URL` / `POSTGRES_URL` automatically.

Alternatively: [neon.tech](https://neon.tech) → create project → copy the **pooled** connection string.

### 2. Push this code to GitHub

```powershell
cd C:\Users\tompa\Documents\solution\roofradar
git init
git add .
git commit -m "Initial DataBloomer roofing leads app"
```

Create a new repo on GitHub (e.g. `databloomer`), then:

```powershell
git remote add origin https://github.com/YOUR_USER/databloomer.git
git branch -M main
git push -u origin main
```

### 3. Import project in Vercel

1. **Add New** → **Project** → import the GitHub repo.
2. **Root Directory**: `web` (important — app is not at repo root).
3. Framework: Next.js (auto-detected).

### 4. Environment variables

In Vercel → Project → **Settings** → **Environment Variables**:

| Variable | Value | Notes |
|----------|--------|--------|
| `DATABASE_URL` | *(from Neon)* | Required in production |
| `NEXT_PUBLIC_APP_URL` | `https://databloomer.com` | Canonical URL |
| `INGEST_SECRET` | *(long random string)* | Protects manual ingest API |
| `CRON_SECRET` | *(long random string)* | Vercel sends this on cron hits |

Generate secrets (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

### 5. Attach domain databloomer.com

1. Vercel → Project → **Settings** → **Domains**.
2. Add `databloomer.com` and `www.databloomer.com`.
3. If the domain is already on your Vercel account, assign it to **this** project.
4. DNS should point to Vercel (A `76.76.21.21` or CNAME `cname.vercel-dns.com`) — Vercel shows exact records.

### 6. First deploy + database setup

After the first successful deploy:

**Option A — from your PC (easiest for first full ingest):**

```powershell
cd C:\Users\tompa\Documents\solution\roofradar\web
$env:DATABASE_URL = "postgresql://..."   # Neon pooled URL
npm run db:migrate
npm run ingest
```

**Option B — via production API:**

```powershell
curl -X POST https://databloomer.com/api/ingest `
  -H "Authorization: Bearer YOUR_INGEST_SECRET" `
  -H "Content-Type: application/json" `
  -d "{}"
```

> **Note:** Full county ingest takes ~30–60s. Hobby plan function timeout is 10s — use **local ingest** (Option A) for the first load, or upgrade to Pro for long cron/API runs.

### 7. Verify

- https://databloomer.com — landing page
- https://databloomer.com/dashboard?view=map — map with leads
- Filter ZIP `33131` or `33030`

## Optional

| Variable | Purpose |
|----------|---------|
| `SHOVELS_API_KEY` | Historical 15-year roof permits |
| `INGEST_MAX_PROPERTIES` | Default `8500` |
| `ROOF_AGE_MIN_YEARS` / `ROOF_AGE_MAX_YEARS` | Aging window |

## Local development (unchanged)

```powershell
cd web
npm install
npm run dev
```

No `DATABASE_URL` → embedded local DB at `web/data/roofradar`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API returns database error | Set `DATABASE_URL` on Vercel, redeploy |
| Empty dashboard | Run `db:migrate` + `ingest` against production DB |
| Cron ingest fails | Check `CRON_SECRET`; consider Pro plan for duration |
| Build fails on PGlite | Should not happen — `VERCEL` disables embedded DB |
