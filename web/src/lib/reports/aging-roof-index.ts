import { MIAMI_AREA_PAGES } from "@/lib/miami-dade/areas";
import { estimateRoofJobValue, getRoofJobEstimatePerSqft } from "@/lib/leads/roof-job-value";
import type { BloomMomentumLabel } from "@/lib/leads/neighborhood-bloom";

export const AGING_ROOF_INDEX_SLUG = "miami-dade-aging-roof-index-2026";
export const AGING_ROOF_INDEX_PATH = `/reports/${AGING_ROOF_INDEX_SLUG}`;

/** Public report includes only well-aged roofs (strictly over 15 years). */
export const AGING_ROOF_INDEX_MIN_ROOF_AGE_YEARS = 15;

/**
 * ZIP-level public report only — no addresses, folios, or lat/lng.
 * Property-level fields never enter AgingRoofIndexReport.
 */
export const PUBLIC_REPORT_PRIVACY_NOTICE =
  "ZIP-level aggregates only. This report does not publish street addresses, folio numbers, owner names, or other property identifiers.";

export type ZipIndexRow = {
  rank: number;
  zip: string;
  areaLabel: string;
  agingLeadCount: number;
  replacementLikelyCount: number;
  highOpportunityCount: number;
  avgRoofAgeYears: number;
  avgDataBloomScore: number;
  avgEstimatedJobValue: number | null;
  avgHeatedSqft: number | null;
  neighborhoodScore: number;
  bloomProbability: number;
  momentumLabel: BloomMomentumLabel;
  momentumPct: number;
  permits12mo: number;
  recentPermits90d: number;
};

export type AgingRoofIndexReport = {
  generatedAt: string;
  minRoofAgeYears: number;
  jobValueRatePerSqft: number;
  countyTotals: {
    totalAgingLeads: number;
    replacementLikely: number;
    highOpportunity: number;
    zipsAnalyzed: number;
    avgRoofAgeYears: number;
    medianEstimatedJobValue: number | null;
  };
  top10: ZipIndexRow[];
  oldestByAvgAge: ZipIndexRow[];
  highestEstimatedValue: ZipIndexRow[];
};

const zipToArea = new Map<string, string>();
for (const area of MIAMI_AREA_PAGES) {
  if (!zipToArea.has(area.zip)) {
    zipToArea.set(area.zip, area.name);
  }
}

export function labelForZip(zip: string): string {
  return zipToArea.get(zip) ?? `Miami-Dade ${zip}`;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return Math.round(value).toLocaleString("en-US");
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function estimateJobValueFromHeatedSqft(
  heatedSqft: number | null | undefined,
): number | null {
  return estimateRoofJobValue(heatedSqft);
}

export function getJobValueRatePerSqft(): number {
  return getRoofJobEstimatePerSqft();
}
