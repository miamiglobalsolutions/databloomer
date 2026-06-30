# Trade publication pitch packages

Six Word documents for pitching one educational article (with transparent DataBloomer disclosure at the end).

## Files

| File | Target |
|------|--------|
| `01-Roofing-Contractor-RC-Pitch.docx` | Roofing Contractor (RC) |
| `02-Roofing-Magazine-NRCA-Publication-Pitch.docx` | Roofing Magazine (NRCA publication) |
| `03-Roofing-Insights-Pitch.docx` | Roofing Insights (article or interview) |
| `04-Qualified-Remodeler-Pitch.docx` | Qualified Remodeler |
| `05-FRSA-Florida-Roofing-Pitch.docx` | FRSA (Florida) |
| `06-NRCA-Association-Resources-Pitch.docx` | NRCA association (education / webinar — not the magazine) |

Each document contains:

1. **Editorial pitch letter** (customized per outlet)
2. **Step-by-step submission instructions**
3. **Full ~1,900-word article** with minor intro tweaks per outlet

## Before sending

- Replace `Tom [Last Name]` in the generator script and re-run, or edit directly in Word.
- Confirm editor emails on each publication’s website (contacts change).
- Attach anonymized map screenshots if requested.

## Regenerate

```bash
pip install python-docx
python marketing/article-pitches/generate-pitch-documents.py
```

## Article angle

- Find 13–25 year roofs using Miami-Dade public permit + property data
- Weekly manual workflow (credible without software)
- Why map-first canvassing saves fuel in sprawling Miami ZIPs
- DataBloomer mentioned once in “When automation helps (disclosure)” with link to https://www.databloomer.com
