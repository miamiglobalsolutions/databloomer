# Press releases

## Two formats — different jobs

| Asset | Format | Use |
|-------|--------|-----|
| **Site detail report** | **Static HTML page** (primary) | SEO, shareable URL, EIN link target — `/reports/miami-dade-aging-roofs-hurricane-season-2026` |
| **Site PDF edition** | Static file (optional) | Email attachment / offline share |
| **EIN Presswire** | Word (`.docx`) / text | Short release pointing readers to the **web page** |

Legacy URL `/reports/miami-dade-aging-roof-index-2026` redirects permanently to the new path.

## Refresh the published report

```bash
cd web
npm run report:snapshot
```

Writes:

- `src/data/reports/miami-dade-aging-roofs-hurricane-season-2026.json`
- `public/reports/DataBloomer-Miami-Dade-Aging-Roofs-Hurricane-Season-2026.pdf`

## EIN press release

Uses the **same published snapshot JSON** as the static report page (not the local dev database). Run `report:snapshot` first so numbers match the live site.

```bash
cd web
npm run report:snapshot
npx tsx scripts/generate-aging-roof-press-release.ts
python ../marketing/press-releases/generate-ein-docx.py
```

Outputs: `ein-miami-dade-aging-roofs-hurricane-season-2026.txt`, `.docx`
