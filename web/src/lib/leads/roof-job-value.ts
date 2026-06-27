const MIN_HEATED_SQFT = 300;
const MAX_HEATED_SQFT = 25_000;

/** Default installed re-roof $/sq ft for Miami-Dade (override via env). */
export function getRoofJobEstimatePerSqft(): number {
  const rate = Number(process.env.ROOF_JOB_ESTIMATE_PER_SQFT ?? 12);
  return Number.isFinite(rate) && rate > 0 ? rate : 12;
}

export function estimateRoofJobValue(
  heatedSqft: number | null | undefined,
): number | null {
  if (heatedSqft == null || !Number.isFinite(heatedSqft)) return null;

  const sqft = Math.round(heatedSqft);
  if (sqft < MIN_HEATED_SQFT || sqft > MAX_HEATED_SQFT) return null;

  const value = Math.round(sqft * getRoofJobEstimatePerSqft());
  return value > 0 ? value : null;
}

export function formatEstimatedJobValue(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export const ROOF_JOB_VALUE_DISCLAIMER =
  "Estimated job values are derived from county heated living area and a default replacement cost per square foot. They are not quotes. Actual pricing depends on roof type, pitch, materials, access, and scope — use these figures only to compare relative job size between leads.";

export const ROOF_JOB_VALUE_SHORT_LABEL = "Est. job value";

export function enrichLeadRecord<T extends { building_heated_area?: number | null }>(
  lead: T,
): T & { building_heated_area: number | null; estimated_job_value: number | null } {
  const building_heated_area = lead.building_heated_area ?? null;
  return {
    ...lead,
    building_heated_area,
    estimated_job_value: estimateRoofJobValue(building_heated_area),
  };
}
