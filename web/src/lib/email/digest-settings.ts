import { query } from "@/lib/db/client";
import {
  type DigestFrequency,
  type DigestSettings,
  isDigestFrequency,
} from "@/lib/email/digest-schedule";

type DigestSettingsRow = {
  enabled: boolean;
  frequency: string;
  last_run_at: Date | null;
  updated_at: Date;
};

function rowToSettings(row: DigestSettingsRow): DigestSettings {
  return {
    enabled: row.enabled,
    frequency: isDigestFrequency(row.frequency) ? row.frequency : "weekly",
    lastRunAt: row.last_run_at?.toISOString() ?? null,
    updatedAt: row.updated_at.toISOString(),
  };
}

async function ensureDigestSettingsRow(): Promise<void> {
  await query(
    `INSERT INTO digest_settings (id, enabled, frequency)
     VALUES (1, TRUE, 'weekly')
     ON CONFLICT (id) DO NOTHING`,
  );
}

export async function getDigestSettings(): Promise<DigestSettings> {
  await ensureDigestSettingsRow();
  const result = await query<DigestSettingsRow>(
    `SELECT enabled, frequency, last_run_at, updated_at
     FROM digest_settings
     WHERE id = 1`,
  );
  const row = result.rows[0];
  if (!row) {
    return {
      enabled: true,
      frequency: "weekly",
      lastRunAt: null,
      updatedAt: new Date().toISOString(),
    };
  }
  return rowToSettings(row);
}

export async function updateDigestSettings(
  patch: Partial<Pick<DigestSettings, "enabled" | "frequency">>,
): Promise<DigestSettings> {
  await ensureDigestSettingsRow();

  if (patch.frequency != null && !isDigestFrequency(patch.frequency)) {
    throw new Error("Invalid digest frequency");
  }

  const result = await query<DigestSettingsRow>(
    `UPDATE digest_settings
     SET
       enabled = COALESCE($1, enabled),
       frequency = COALESCE($2, frequency),
       updated_at = NOW()
     WHERE id = 1
     RETURNING enabled, frequency, last_run_at, updated_at`,
    [patch.enabled ?? null, patch.frequency ?? null],
  );

  return rowToSettings(result.rows[0]);
}

export async function markDigestRunComplete(): Promise<void> {
  await ensureDigestSettingsRow();
  await query(
    `UPDATE digest_settings
     SET last_run_at = NOW(), updated_at = NOW()
     WHERE id = 1`,
  );
}
