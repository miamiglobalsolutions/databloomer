# Press releases

## Two formats — different jobs

| Asset | Format | Use |
|-------|--------|-----|
| **Site detail report** | **Static HTML page** (primary) | SEO, shareable URL, EIN link target — `/reports/miami-dade-aging-roof-index-2026` |
| **Site PDF edition** | Static file (optional) | Email attachment / offline share — same numbers as the page |
| **EIN Presswire** | Word (`.docx`) / text | Short release pointing readers to the **web page** |

Neither format publishes street addresses or folio numbers — ZIP/area aggregates only.

## Refresh the published report

From production or local DB with leads ingested:

```bash
cd web
npm run report:snapshot
```

This writes:

- `src/data/reports/miami-dade-aging-roof-index-2026.json` — baked into the static page at build time
- `public/reports/DataBloomer-Miami-Dade-Aging-Roof-Index-2026.pdf` — optional download

Commit both files, then deploy. Re-run when you want a new edition (e.g. pre–hurricane season 2027).

## EIN press release (Word)

After snapshotting (optional — keeps numbers aligned):

```bash
cd web
npx tsx scripts/generate-aging-roof-press-release.ts
python ../marketing/press-releases/generate-ein-docx.py
```

Outputs: `ein-miami-dade-aging-roof-index-2026.txt`, `.docx`

**Always link to the web report in EIN**, not the PDF. The page is what Google indexes and what earns backlinks.
