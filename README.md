# RoofRadar

Miami-Dade roofing lead generation for contractors. **Aging roofs** are the primary product — homes in the 13–17 year replacement window. Code violations are a secondary, high-urgency stream.

## Stack

- **Next.js 16** — marketing site, dashboard, API routes
- **PostgreSQL** — properties, permits, violations, scored leads
- **ArcGIS REST** — Miami-Dade permits, violations, property appraiser GIS
- **Shovels API** (optional) — historical roofing permits beyond county's ~3-year GIS window

## Quick start

```bash
cd web
cp .env.example .env
# Set DATABASE_URL to your Postgres instance

npm install
npm run db:migrate
npm run ingest:sample    # demo data — no county API needed
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## Live Miami-Dade data (real leads)

```bash
npm run ingest
```

This pulls **real** data from Miami-Dade County ArcGIS:

- **Properties** — homes built 2009–2013 (13–17 year aging window) from the Property Appraiser parcel layer
- **Roof permits** — re-roofs via `APPTYPE` 13/18/20 (last ~3 years in county GIS)
- **Code violations** — roof-related enforcement cases (when the county API responds)

After ingest, **restart the dev server** (`Ctrl+C` then `npm run dev`) so the dashboard picks up the new database.

Expand coverage (default: 25 zip codes, ~1,200 leads):

```bash
# PowerShell
$env:INGEST_MAX_ZIPS=60; npm run ingest

# Or keep sample data and add live data on top
npm run ingest -- --keep
```

For **high-confidence 15-year permit history** (beyond county's 3-year window), add `SHOVELS_API_KEY` to `.env` and re-run ingest.

## Aging roof logic

1. **High confidence** — last roofing permit issued 13–17 years ago (from Shovels or historical data)
2. **Medium confidence** — `year_built` in the same window with no re-roof in the last 5 years
3. Excludes properties with a roofing permit in the last 5 years

Configure the window via:

```
ROOF_AGE_MIN_YEARS=13
ROOF_AGE_MAX_YEARS=17
ROOF_RECENT_EXCLUDE_YEARS=5
```

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leads?type=aging_roof` | GET | Scored aging roof leads |
| `/api/leads?type=code_violation` | GET | Roof-related violations |
| `/api/ingest` | POST | Run full ingest + lead refresh (`Authorization: Bearer $INGEST_SECRET`) |

## Data sources

- [Miami-Dade Building Permits (ArcGIS)](https://gisweb.miamidade.gov/arcgis/rest/services/MD_LandInformation/MapServer/1)
- [Code Violations (ArcGIS)](https://gisweb.miamidade.gov/arcgis/rest/services/EnerGov/MD_LandMgtViewer/MapServer/86)
- [Property Point View (ArcGIS)](https://arcgis.gdsc.miami.edu/arcgis/rest/services/mdc_property_point_view/MapServer)
- [Shovels Permit API](https://docs.shovels.ai/) — historical permits

## Next steps

- [ ] Stripe subscriptions + territory (zip polygon) gating
- [ ] Map view (Mapbox) with lead pins
- [ ] Weekly email digest (Resend)
- [ ] Property Appraiser bulk file import for owner mailing addresses
- [ ] Broward / Palm Beach expansion
