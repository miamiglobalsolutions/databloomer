import { query } from "@/lib/db/client";
import { fetchNeighborhoodBloomForecasts } from "@/lib/leads/neighborhood-bloom-server";
import {
  AGING_ROOF_INDEX_MIN_ROOF_AGE_YEARS,
  type AgingRoofIndexReport,
  type ZipIndexRow,
  estimateJobValueFromHeatedSqft,
  getJobValueRatePerSqft,
  labelForZip,
  median,
} from "@/lib/reports/aging-roof-index";

/** Public report queries aggregate by ZIP only — never select address, folio, or lat/lng. */

const MIN_ROOF_AGE = AGING_ROOF_INDEX_MIN_ROOF_AGE_YEARS;

const AGING_ROOF_WHERE = `
  lead_type = 'aging_roof'
  AND zip IS NOT NULL
  AND zip <> ''
  AND roof_age_years > ${MIN_ROOF_AGE}`;

type ZipLeadStats = {
  zip: string;
  aging_lead_count: number;
  replacement_likely: number;
  high_opportunity: number;
  avg_roof_age: number;
  avg_score: number;
  avg_heated_sqft: number | null;
};

async function fetchZipLeadStats(): Promise<Map<string, ZipLeadStats>> {
  const result = await query<ZipLeadStats>(
    `SELECT
       LEFT(zip, 5) AS zip,
       COUNT(*)::int AS aging_lead_count,
       COUNT(*) FILTER (WHERE score >= 80)::int AS replacement_likely,
       COUNT(*) FILTER (WHERE score >= 65)::int AS high_opportunity,
       ROUND(AVG(roof_age_years)::numeric, 1)::float AS avg_roof_age,
       ROUND(AVG(score)::numeric, 1)::float AS avg_score,
       ROUND(AVG(building_heated_area)::numeric, 0)::float AS avg_heated_sqft
     FROM leads
     WHERE ${AGING_ROOF_WHERE}
     GROUP BY LEFT(zip, 5)
     HAVING COUNT(*) >= 10`,
  );

  return new Map(result.rows.map((row) => [row.zip, row]));
}

function buildZipRow(
  rank: number,
  zip: string,
  stats: ZipLeadStats,
  forecast: {
    neighborhoodScore: number;
    bloomProbability: number;
    momentumLabel: ZipIndexRow["momentumLabel"];
    momentumPct: number;
    permits12mo: number;
    recentPermits90d: number;
  },
): ZipIndexRow {
  const avgHeated = stats.avg_heated_sqft;
  return {
    rank,
    zip,
    areaLabel: labelForZip(zip),
    agingLeadCount: stats.aging_lead_count,
    replacementLikelyCount: stats.replacement_likely,
    highOpportunityCount: stats.high_opportunity,
    avgRoofAgeYears: stats.avg_roof_age,
    avgDataBloomScore: stats.avg_score,
    avgHeatedSqft: avgHeated,
    avgEstimatedJobValue: estimateJobValueFromHeatedSqft(avgHeated),
    neighborhoodScore: forecast.neighborhoodScore,
    bloomProbability: forecast.bloomProbability,
    momentumLabel: forecast.momentumLabel,
    momentumPct: forecast.momentumPct,
    permits12mo: forecast.permits12mo,
    recentPermits90d: forecast.recentPermits90d,
  };
}

export async function fetchAgingRoofIndexReport(): Promise<AgingRoofIndexReport> {
  const [forecasts, zipStats, countyResult] = await Promise.all([
    fetchNeighborhoodBloomForecasts({ minRoofAgeYears: MIN_ROOF_AGE }),
    fetchZipLeadStats(),
    query<{
      total: number;
      replacement: number;
      high: number;
      avg_age: number;
    }>(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE score >= 80)::int AS replacement,
         COUNT(*) FILTER (WHERE score >= 65)::int AS high,
         ROUND(AVG(roof_age_years)::numeric, 1)::float AS avg_age
       FROM leads
       WHERE ${AGING_ROOF_WHERE}`,
    ),
  ]);

  const rows: ZipIndexRow[] = [];
  for (const forecast of forecasts) {
    const stats = zipStats.get(forecast.zip);
    if (!stats) continue;
    rows.push(buildZipRow(0, forecast.zip, stats, forecast));
  }

  rows.sort((a, b) => {
    if (b.neighborhoodScore !== a.neighborhoodScore) {
      return b.neighborhoodScore - a.neighborhoodScore;
    }
    return b.replacementLikelyCount - a.replacementLikelyCount;
  });

  const top10 = rows.slice(0, 10).map((row, i) => ({ ...row, rank: i + 1 }));

  const oldestByAvgAge = [...rows]
    .sort((a, b) => b.avgRoofAgeYears - a.avgRoofAgeYears)
    .slice(0, 5)
    .map((row, i) => ({ ...row, rank: i + 1 }));

  const highestEstimatedValue = [...rows]
    .filter((r) => r.avgEstimatedJobValue != null)
    .sort((a, b) => (b.avgEstimatedJobValue ?? 0) - (a.avgEstimatedJobValue ?? 0))
    .slice(0, 5)
    .map((row, i) => ({ ...row, rank: i + 1 }));

  const jobValues = rows
    .map((r) => r.avgEstimatedJobValue)
    .filter((v): v is number => v != null);

  const county = countyResult.rows[0];

  return {
    generatedAt: new Date().toISOString(),
    minRoofAgeYears: MIN_ROOF_AGE,
    jobValueRatePerSqft: getJobValueRatePerSqft(),
    countyTotals: {
      totalAgingLeads: county?.total ?? 0,
      replacementLikely: county?.replacement ?? 0,
      highOpportunity: county?.high ?? 0,
      zipsAnalyzed: rows.length,
      avgRoofAgeYears: county?.avg_age ?? 0,
      medianEstimatedJobValue: median(jobValues),
    },
    top10,
    oldestByAvgAge,
    highestEstimatedValue,
  };
}
