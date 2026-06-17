import { query } from "@/lib/db/client";

const ZIP_CURSOR_KEY = "property_zip_cursor";

export async function getZipIngestCursor(): Promise<number> {
  const result = await query<{ value: string }>(
    `SELECT value FROM ingest_state WHERE key = $1`,
    [ZIP_CURSOR_KEY],
  );
  const raw = result.rows[0]?.value;
  const parsed = raw != null ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export async function setZipIngestCursor(index: number): Promise<void> {
  await query(
    `INSERT INTO ingest_state (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET
       value = EXCLUDED.value,
       updated_at = NOW()`,
    [ZIP_CURSOR_KEY, String(index)],
  );
}
