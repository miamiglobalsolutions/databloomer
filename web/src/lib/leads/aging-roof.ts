import type { AgingRoofConfig, LeadConfidence, PropertyRow } from "./types";

export type RoofPermitSummary = {
  issue_date: Date;
  permit_type: string;
  source: string;
};

export type AgingRoofCandidate = {
  folio: string;
  address: string;
  zip: string | null;
  year_built: number | null;
  assessed_value: number | null;
  lat: number | null;
  lng: number | null;
  last_roof_date: Date | null;
  roof_age_years: number;
  confidence: LeadConfidence;
  signal_summary: string;
  score: number;
};

function yearsBetween(from: Date, to: Date = new Date()): number {
  const ms = to.getTime() - from.getTime();
  return Math.round((ms / (365.25 * 24 * 60 * 60 * 1000)) * 10) / 10;
}

function isInAgeWindow(
  ageYears: number,
  config: AgingRoofConfig,
): boolean {
  return ageYears >= config.minAgeYears && ageYears <= config.maxAgeYears;
}

function hasRecentRoof(
  permits: RoofPermitSummary[],
  config: AgingRoofConfig,
): boolean {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - config.recentExcludeYears);
  return permits.some((p) => p.issue_date >= cutoff);
}

/**
 * DataBloom Score for aging-roof leads (0–100).
 */
function scoreAgingLead(input: {
  roofAgeYears: number;
  assessedValue: number | null;
  confidence: LeadConfidence;
  targetAge: number;
}): number {
  const { roofAgeYears, assessedValue, confidence, targetAge } = input;
  let score = 50;

  const proximity = Math.abs(roofAgeYears - targetAge);
  score += Math.max(0, 25 - proximity * 8);

  if (confidence === "high") score += 20;
  else if (confidence === "medium") score += 8;

  if (assessedValue != null) {
    if (assessedValue >= 500_000) score += 15;
    else if (assessedValue >= 300_000) score += 10;
    else if (assessedValue >= 150_000) score += 5;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

function permitSignalSummary(roofAgeYears: number, permitType: string): string {
  if (roofAgeYears <= 17) {
    return `Last roof permit ${roofAgeYears} yrs ago (${permitType}) — likely replacement window`;
  }
  return `Last roof permit ${roofAgeYears} yrs ago (${permitType}) — aging roof (18–25 yr band)`;
}

function buildSignalSummary(buildYear: number, buildAgeYears: number): string {
  if (buildAgeYears <= 17) {
    return `Built ${buildYear} (~${buildAgeYears} yrs) — no recent re-roof on record; probable aging roof`;
  }
  return `Built ${buildYear} (~${buildAgeYears} yrs) — no recent re-roof on record; aging roof (18–25 yr band)`;
}

/**
 * Core aging-roof logic:
 * 1. HIGH — last roofing permit falls in the 13–25 year window (historical permit data)
 * 2. MEDIUM — no recent roof permit + year_built falls in the same window (proxy)
 * 3. MEDIUM — year_built older but last known roof permit is in window
 */
export function evaluateAgingRoof(
  property: PropertyRow,
  permits: RoofPermitSummary[],
  config: AgingRoofConfig = {
    minAgeYears: 13,
    maxAgeYears: 25,
    targetAgeYears: 15,
    recentExcludeYears: 5,
    currentYear: new Date().getFullYear(),
  },
): AgingRoofCandidate | null {
  if (hasRecentRoof(permits, config)) {
    return null;
  }

  const sorted = [...permits].sort(
    (a, b) => b.issue_date.getTime() - a.issue_date.getTime(),
  );
  const latestPermit = sorted[0] ?? null;
  const targetAge = config.targetAgeYears;

  if (latestPermit) {
    const roofAgeYears = yearsBetween(latestPermit.issue_date);
    if (!isInAgeWindow(roofAgeYears, config)) {
      return null;
    }

    const hasHistorical =
      latestPermit.source === "shovels" ||
      roofAgeYears > 3; /* county GIS only keeps ~3 years */

    const confidence: LeadConfidence = hasHistorical ? "high" : "medium";

    return {
      folio: property.folio,
      address: property.address,
      zip: property.zip,
      year_built: property.year_built,
      assessed_value: property.assessed_value,
      lat: property.lat,
      lng: property.lng,
      last_roof_date: latestPermit.issue_date,
      roof_age_years: roofAgeYears,
      confidence,
      signal_summary: permitSignalSummary(
        roofAgeYears,
        latestPermit.permit_type,
      ),
      score: scoreAgingLead({
        roofAgeYears,
        assessedValue: property.assessed_value,
        confidence,
        targetAge,
      }),
    };
  }

  if (property.year_built == null) {
    return null;
  }

  const buildAgeYears = config.currentYear - property.year_built;
  if (!isInAgeWindow(buildAgeYears, config)) {
    return null;
  }

  const confidence: LeadConfidence = "medium";
  const proxyRoofDate = new Date(property.year_built, 6, 1);

  return {
    folio: property.folio,
    address: property.address,
    zip: property.zip,
    year_built: property.year_built,
    assessed_value: property.assessed_value,
    lat: property.lat,
    lng: property.lng,
    last_roof_date: proxyRoofDate,
    roof_age_years: buildAgeYears,
    confidence,
    signal_summary: buildSignalSummary(property.year_built, buildAgeYears),
    score: scoreAgingLead({
      roofAgeYears: buildAgeYears,
      assessedValue: property.assessed_value,
      confidence,
      targetAge,
    }),
  };
}
