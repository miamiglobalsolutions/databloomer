export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { LeadRecord } from "@/lib/leads/types";
import { normalizeZipInput } from "@/lib/miami-dade/zips";
import { query } from "@/lib/db/client";
import { isSubscriptionGatingEnabled, maskAddress, maskFolio } from "@/lib/subscription/access";
import { getAccessForRequest } from "@/lib/subscription/session";

const ALLOWED_TYPES = new Set(["aging_roof", "code_violation", "new_construction"]);

async function getTotalCount(type: string): Promise<number> {
  const result = await query<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM leads WHERE lead_type::text = $1`,
    [type],
  );
  return result.rows[0]?.n ?? 0;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedType = searchParams.get("type") ?? "aging_roof";
  const type = ALLOWED_TYPES.has(requestedType) ? requestedType : "aging_roof";
  const zipRaw = searchParams.get("zip");
  const zip = zipRaw ? normalizeZipInput(zipRaw) : null;
  const diverse = searchParams.get("diverse") === "true";
  const perZip = Math.min(Number(searchParams.get("perZip") ?? 15), 50);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 8500);

  try {
    const access = await getAccessForRequest(request);
    let result;

    if (diverse && !zip) {
      result = await query<LeadRecord>(
        `SELECT id, lead_type, folio, address, zip, score, confidence,
                roof_age_years, last_roof_date, year_built, assessed_value,
                violation_case, violation_desc, signal_summary, lat, lng, computed_at
         FROM (
           SELECT *,
             ROW_NUMBER() OVER (
               PARTITION BY COALESCE(zip, 'unknown')
               ORDER BY score DESC, computed_at DESC
             ) AS zip_rank
           FROM leads
           WHERE lead_type::text = $1
         ) ranked
         WHERE zip_rank <= $2
         ORDER BY score DESC, computed_at DESC
         LIMIT $3`,
        [type, perZip, limit],
      );
    } else {
      const clauses = ["lead_type::text = $1"];
      const params: unknown[] = [type];

      if (zip) {
        params.push(zip);
        clauses.push(`zip LIKE $${params.length} || '%'`);
      }

      params.push(limit);

      result = await query<LeadRecord>(
        `SELECT *
         FROM leads
         WHERE ${clauses.join(" AND ")}
         ORDER BY score DESC, computed_at DESC
         LIMIT $${params.length}`,
        params,
      );
    }

    const leads = isSubscriptionGatingEnabled() && !access.full
      ? result.rows.map((row) => ({
          ...row,
          address: maskAddress(row.address),
          folio: row.folio ? maskFolio(row.folio) : null,
        }))
      : result.rows;

    return NextResponse.json({
      leads,
      count: result.rows.length,
      total: await getTotalCount(type),
      type,
      diverse: diverse && !zip,
      access,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
