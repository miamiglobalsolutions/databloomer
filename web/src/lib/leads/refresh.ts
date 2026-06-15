import { evaluateAgingRoof } from "@/lib/leads/aging-roof";
import { getAgingRoofConfig, type PropertyRow } from "@/lib/leads/types";
import { query } from "@/lib/db/client";

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

export async function refreshAgingRoofLeads(): Promise<number> {
  const config = getAgingRoofConfig();

  const properties = await query<PropertyRow>(
    `SELECT folio, address, city, zip, year_built, assessed_value, lat, lng
     FROM properties`,
  );

  let upserted = 0;

  for (const property of properties.rows) {
    const permitsResult = await query<{
      issue_date: Date;
      permit_type: string;
      source: string;
    }>(
      `SELECT issue_date, permit_type, source
       FROM roof_permits
       WHERE folio = $1
       ORDER BY issue_date DESC`,
      [property.folio],
    );

    const candidate = evaluateAgingRoof(
      property,
      permitsResult.rows.map((row) => ({
        issue_date: row.issue_date,
        permit_type: row.permit_type,
        source: row.source,
      })),
      config,
    );

    if (!candidate) {
      await query(
        `DELETE FROM leads WHERE lead_type = 'aging_roof' AND folio = $1`,
        [property.folio],
      );
      continue;
    }

    const leadId = `aging-${property.folio}`;
    await query(
      `INSERT INTO leads (
        id, lead_type, folio, address, zip, score, confidence,
        roof_age_years, last_roof_date, year_built, assessed_value,
        violation_case, violation_desc, signal_summary, lat, lng, computed_at
      ) VALUES (
        $1, 'aging_roof', $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        NULL, NULL, $11, $12, $13, NOW()
      )
      ON CONFLICT (lead_type, folio) DO UPDATE SET
        address = EXCLUDED.address,
        zip = EXCLUDED.zip,
        score = EXCLUDED.score,
        confidence = EXCLUDED.confidence,
        roof_age_years = EXCLUDED.roof_age_years,
        last_roof_date = EXCLUDED.last_roof_date,
        year_built = EXCLUDED.year_built,
        assessed_value = EXCLUDED.assessed_value,
        signal_summary = EXCLUDED.signal_summary,
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        computed_at = NOW()`,
      [
        leadId,
        candidate.folio,
        candidate.address,
        candidate.zip,
        candidate.score,
        candidate.confidence,
        candidate.roof_age_years,
        formatDate(candidate.last_roof_date),
        candidate.year_built,
        candidate.assessed_value,
        candidate.signal_summary,
        candidate.lat,
        candidate.lng,
      ],
    );
    upserted += 1;
  }

  return upserted;
}

export async function refreshViolationLeads(): Promise<number> {
  const violations = await query<{
    id: string;
    folio: string | null;
    case_number: string | null;
    address: string | null;
    case_date: Date | null;
    problem_desc: string | null;
    status_desc: string | null;
    lat: number | null;
    lng: number | null;
  }>(
    `SELECT id, folio, case_number, address, case_date, problem_desc, status_desc, lat, lng
     FROM code_violations
     WHERE problem_desc IS NOT NULL`,
  );

  let upserted = 0;

  for (const v of violations.rows) {
    if (!v.address && !v.folio) continue;

    const folio = v.folio ?? `violation-${v.id}`;
    const leadId = `violation-${v.id}`;
    const score = 70 + (v.status_desc?.toLowerCase().includes("open") ? 15 : 0);

    await query(
      `INSERT INTO properties (folio, address, city, zip, updated_at)
       VALUES ($1, $2, 'Miami', NULL, NOW())
       ON CONFLICT (folio) DO NOTHING`,
      [folio, v.address ?? "Unknown address"],
    );

    await query(
      `INSERT INTO leads (
        id, lead_type, folio, address, zip, score, confidence,
        roof_age_years, last_roof_date, year_built, assessed_value,
        violation_case, violation_desc, signal_summary, lat, lng, computed_at
      ) VALUES (
        $1, 'code_violation', $2, $3, NULL, $4, 'high',
        NULL, NULL, NULL, NULL,
        $5, $6, $7, $8, $9, NOW()
      )
      ON CONFLICT (lead_type, folio) DO UPDATE SET
        score = EXCLUDED.score,
        violation_case = EXCLUDED.violation_case,
        violation_desc = EXCLUDED.violation_desc,
        signal_summary = EXCLUDED.signal_summary,
        computed_at = NOW()`,
      [
        leadId,
        folio,
        v.address ?? "Unknown address",
        Math.min(100, score),
        v.case_number,
        v.problem_desc,
        `Code violation: ${v.problem_desc ?? "roof-related"}`,
        v.lat,
        v.lng,
      ],
    );
    upserted += 1;
  }

  return upserted;
}

export async function refreshAllLeads(): Promise<{
  aging_roof: number;
  code_violation: number;
}> {
  const aging_roof = await refreshAgingRoofLeads();
  const code_violation = await refreshViolationLeads();
  return { aging_roof, code_violation };
}
