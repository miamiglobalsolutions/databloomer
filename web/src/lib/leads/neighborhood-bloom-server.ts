import { query } from "@/lib/db/client";
import {
  computeNeighborhoodBloomForecasts,
  type NeighborhoodBloomForecast,
  type ZipBloomStats,
} from "@/lib/leads/neighborhood-bloom";

export async function fetchNeighborhoodBloomForecasts(): Promise<
  NeighborhoodBloomForecast[]
> {
  const result = await query<{
    zip: string;
    aging_lead_count: number;
    avg_lead_score: number;
    recent_permits_90d: number;
    prior_permits_90d: number;
    permits_12mo: number;
    lat: number | null;
    lng: number | null;
  }>(
    `WITH lead_zip AS (
       SELECT
         LEFT(zip, 5) AS zip,
         COUNT(*)::int AS aging_lead_count,
         AVG(score)::float AS avg_lead_score,
         AVG(lat)::float AS lat,
         AVG(lng)::float AS lng
       FROM leads
       WHERE lead_type = 'aging_roof'
         AND zip IS NOT NULL
         AND zip <> ''
       GROUP BY LEFT(zip, 5)
     ),
     permit_zip AS (
       SELECT
         COALESCE(
           NULLIF(LEFT(p.zip, 5), ''),
           NULLIF(LEFT(l.zip, 5), ''),
           NULLIF(SUBSTRING(rp.address FROM '(33[0-9]{3}|330[0-9]{2})'), '')
         ) AS zip,
         rp.issue_date
       FROM roof_permits rp
       LEFT JOIN properties p ON p.folio = rp.folio
       LEFT JOIN leads l ON l.folio = rp.folio AND l.lead_type = 'aging_roof'
       WHERE rp.issue_date IS NOT NULL
     ),
     permit_counts AS (
       SELECT
         zip,
         COUNT(*) FILTER (
           WHERE issue_date >= CURRENT_DATE - INTERVAL '90 days'
         )::int AS recent_permits_90d,
         COUNT(*) FILTER (
           WHERE issue_date >= CURRENT_DATE - INTERVAL '180 days'
             AND issue_date < CURRENT_DATE - INTERVAL '90 days'
         )::int AS prior_permits_90d,
         COUNT(*) FILTER (
           WHERE issue_date >= CURRENT_DATE - INTERVAL '365 days'
         )::int AS permits_12mo
       FROM permit_zip
       WHERE zip IS NOT NULL AND zip <> ''
       GROUP BY zip
     )
     SELECT
       lz.zip,
       lz.aging_lead_count,
       lz.avg_lead_score,
       COALESCE(pc.recent_permits_90d, 0) AS recent_permits_90d,
       COALESCE(pc.prior_permits_90d, 0) AS prior_permits_90d,
       COALESCE(pc.permits_12mo, 0) AS permits_12mo,
       lz.lat,
       lz.lng
     FROM lead_zip lz
     LEFT JOIN permit_counts pc ON pc.zip = lz.zip`,
  );

  const rows: ZipBloomStats[] = result.rows.map((row) => ({
    zip: row.zip,
    agingLeadCount: row.aging_lead_count,
    avgLeadScore: row.avg_lead_score,
    recentPermits90d: row.recent_permits_90d,
    priorPermits90d: row.prior_permits_90d,
    permits12mo: row.permits_12mo,
    lat: row.lat,
    lng: row.lng,
  }));

  return computeNeighborhoodBloomForecasts(rows);
}

export async function fetchNeighborhoodBloomForZip(
  zip: string,
): Promise<NeighborhoodBloomForecast | null> {
  const normalized = zip.trim().slice(0, 5);
  const all = await fetchNeighborhoodBloomForecasts();
  return all.find((row) => row.zip === normalized) ?? null;
}
