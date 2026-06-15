import type { BloomZipSummary } from "@/lib/leads/bloom-zips";
import { query } from "@/lib/db/client";

export async function fetchTopBloomZipsFromDb(
  leadType: string,
  limit = 5,
): Promise<BloomZipSummary[]> {
  const result = await query<{
    zip: string;
    lead_count: number;
    avg_score: number;
    high_count: number;
    replacement_count: number;
  }>(
    `SELECT
       COALESCE(zip, 'unknown') AS zip,
       COUNT(*)::int AS lead_count,
       ROUND(AVG(score)::numeric, 1)::float AS avg_score,
       COUNT(*) FILTER (WHERE score >= 65)::int AS high_count,
       COUNT(*) FILTER (WHERE score >= 80)::int AS replacement_count
     FROM leads
     WHERE lead_type = $1 AND zip IS NOT NULL AND zip <> ''
     GROUP BY zip
     HAVING COUNT(*) >= 3
     ORDER BY (AVG(score) * 0.6 + COUNT(*) FILTER (WHERE score >= 65) * 2
       + COUNT(*) FILTER (WHERE score >= 80) * 5) DESC
     LIMIT $2`,
    [leadType, limit],
  );

  return result.rows.map((row) => ({
    zip: row.zip,
    label: row.zip,
    leadCount: row.lead_count,
    avgScore: row.avg_score,
    highOpportunityCount: row.high_count,
    replacementLikelyCount: row.replacement_count,
    bloomRank:
      row.avg_score * 0.6 + row.high_count * 2 + row.replacement_count * 5,
  }));
}
