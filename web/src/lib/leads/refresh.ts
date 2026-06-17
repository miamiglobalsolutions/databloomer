import { evaluateAgingRoof, type AgingRoofCandidate } from "@/lib/leads/aging-roof";
import { getAgingRoofConfig, type PropertyRow } from "@/lib/leads/types";
import { query } from "@/lib/db/client";

const LEAD_UPSERT_BATCH = 200;

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

async function upsertAgingLeadBatch(candidates: AgingRoofCandidate[]): Promise<void> {
  if (candidates.length === 0) return;

  for (let offset = 0; offset < candidates.length; offset += LEAD_UPSERT_BATCH) {
    const chunk = candidates.slice(offset, offset + LEAD_UPSERT_BATCH);
    const ids = chunk.map((c) => `aging-${c.folio}`);
    const folios = chunk.map((c) => c.folio);
    const addresses = chunk.map((c) => c.address);
    const zips = chunk.map((c) => c.zip);
    const scores = chunk.map((c) => c.score);
    const confidences = chunk.map((c) => c.confidence);
    const roofAges = chunk.map((c) => c.roof_age_years);
    const lastRoofDates = chunk.map((c) => formatDate(c.last_roof_date));
    const yearBuilts = chunk.map((c) => c.year_built);
    const assessedValues = chunk.map((c) => c.assessed_value);
    const summaries = chunk.map((c) => c.signal_summary);
    const lats = chunk.map((c) => c.lat);
    const lngs = chunk.map((c) => c.lng);

    await query(
      `INSERT INTO leads (
        id, lead_type, folio, address, zip, score, confidence,
        roof_age_years, last_roof_date, year_built, assessed_value,
        violation_case, violation_desc, signal_summary, lat, lng, computed_at
      )
      SELECT
        u.id, 'aging_roof', u.folio, u.address, u.zip, u.score, u.confidence::lead_confidence,
        u.roof_age_years, u.last_roof_date::date, u.year_built, u.assessed_value,
        NULL, NULL, u.signal_summary, u.lat, u.lng, NOW()
      FROM UNNEST(
        $1::text[],
        $2::text[],
        $3::text[],
        $4::text[],
        $5::int[],
        $6::text[],
        $7::numeric[],
        $8::text[],
        $9::int[],
        $10::numeric[],
        $11::text[],
        $12::float8[],
        $13::float8[]
      ) AS u(
        id, folio, address, zip, score, confidence,
        roof_age_years, last_roof_date, year_built, assessed_value,
        signal_summary, lat, lng
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
        ids,
        folios,
        addresses,
        zips,
        scores,
        confidences,
        roofAges,
        lastRoofDates,
        yearBuilts,
        assessedValues,
        summaries,
        lats,
        lngs,
      ],
    );
  }
}

export async function refreshAgingRoofLeads(): Promise<number> {
  const config = getAgingRoofConfig();

  const [properties, permitsResult] = await Promise.all([
    query<PropertyRow>(
      `SELECT folio, address, city, zip, year_built, assessed_value, lat, lng
       FROM properties`,
    ),
    query<{
      folio: string;
      issue_date: Date;
      permit_type: string;
      source: string;
    }>(
      `SELECT folio, issue_date, permit_type, source
       FROM roof_permits
       WHERE folio IS NOT NULL
       ORDER BY folio, issue_date DESC`,
    ),
  ]);

  const permitsByFolio = new Map<
    string,
    { issue_date: Date; permit_type: string; source: string }[]
  >();

  for (const row of permitsResult.rows) {
    const list = permitsByFolio.get(row.folio) ?? [];
    list.push({
      issue_date: row.issue_date,
      permit_type: row.permit_type,
      source: row.source,
    });
    permitsByFolio.set(row.folio, list);
  }

  const candidates: AgingRoofCandidate[] = [];

  for (const property of properties.rows) {
    const permits = permitsByFolio.get(property.folio) ?? [];
    const candidate = evaluateAgingRoof(property, permits, config);
    if (candidate) candidates.push(candidate);
  }

  await upsertAgingLeadBatch(candidates);

  if (candidates.length > 0) {
    const folios = candidates.map((c) => c.folio);
    await query(
      `DELETE FROM leads
       WHERE lead_type = 'aging_roof'
         AND folio IS NOT NULL
         AND NOT (folio = ANY($1::text[]))`,
      [folios],
    );
  } else {
    await query(`DELETE FROM leads WHERE lead_type = 'aging_roof'`);
  }

  return candidates.length;
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

export async function refreshConstructionLeads(): Promise<number> {
  const permits = await query<{
    id: string;
    address: string | null;
    permit_number: string | null;
    process_number: string | null;
    permit_type: string;
    permit_desc: string | null;
    contractor_name: string | null;
    issue_date: Date;
    lat: number | null;
    lng: number | null;
  }>(
    `SELECT cp.id, cp.address, cp.permit_number, cp.process_number, cp.permit_type,
            cp.permit_desc, cp.contractor_name, cp.issue_date, p.lat, p.lng
     FROM construction_permits cp
     LEFT JOIN properties p ON p.folio = cp.folio`,
  );

  let upserted = 0;
  for (const p of permits.rows) {
    if (!p.address) continue;
    const leadId = `construction-${p.id}`;

    const scoreByType: Record<string, number> = {
      "07": 78,
      "01": 70,
      "02": 68,
    };
    const score = scoreByType[p.permit_type] ?? 65;

    await query(
      `INSERT INTO leads (
        id, lead_type, folio, address, zip, score, confidence,
        roof_age_years, last_roof_date, year_built, assessed_value,
        violation_case, violation_desc, signal_summary, lat, lng, computed_at
      ) VALUES (
        $1, 'new_construction', NULL, $2, NULL, $3, 'high',
        NULL, NULL, NULL, NULL,
        $4, $5, $6, $7, $8, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        address = EXCLUDED.address,
        score = EXCLUDED.score,
        violation_case = EXCLUDED.violation_case,
        violation_desc = EXCLUDED.violation_desc,
        signal_summary = EXCLUDED.signal_summary,
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        computed_at = NOW()`,
      [
        leadId,
        p.address,
        score,
        p.permit_number ?? p.process_number ?? p.permit_type,
        p.contractor_name,
        `Recent ${
          p.permit_type === "07"
            ? "new construction"
            : p.permit_type === "01"
              ? "attached addition"
              : "detached addition"
        } permit${p.contractor_name ? ` · Builder: ${p.contractor_name}` : ""}${p.permit_desc ? ` · ${p.permit_desc}` : ""}`,
        p.lat,
        p.lng,
      ],
    );
    upserted += 1;
  }
  return upserted;
}

export async function refreshAllLeads(): Promise<{
  aging_roof: number;
  code_violation: number;
  new_construction: number;
}> {
  const aging_roof = await refreshAgingRoofLeads();
  const code_violation = await refreshViolationLeads();
  const new_construction = await refreshConstructionLeads();
  return { aging_roof, code_violation, new_construction };
}
