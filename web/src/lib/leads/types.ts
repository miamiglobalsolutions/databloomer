export type LeadType = "aging_roof" | "code_violation";
export type LeadConfidence = "high" | "medium" | "low";

export type LeadRecord = {
  id: string;
  lead_type: LeadType;
  folio: string | null;
  address: string;
  zip: string | null;
  score: number;
  confidence: LeadConfidence;
  roof_age_years: number | null;
  last_roof_date: string | null;
  year_built: number | null;
  assessed_value: number | null;
  violation_case: string | null;
  violation_desc: string | null;
  signal_summary: string;
  lat: number | null;
  lng: number | null;
  computed_at: string;
};

export type PropertyRow = {
  folio: string;
  address: string;
  city: string | null;
  zip: string | null;
  year_built: number | null;
  assessed_value: number | null;
  lat: number | null;
  lng: number | null;
};

export type RoofPermitRow = {
  id: string;
  folio: string | null;
  permit_number: string | null;
  process_number: string | null;
  address: string | null;
  permit_type: string;
  issue_date: Date;
  status: string | null;
  source: string;
};

export type AgingRoofConfig = {
  minAgeYears: number;
  maxAgeYears: number;
  recentExcludeYears: number;
  currentYear: number;
};

export function getAgingRoofConfig(): AgingRoofConfig {
  return {
    minAgeYears: Number(process.env.ROOF_AGE_MIN_YEARS ?? 13),
    maxAgeYears: Number(process.env.ROOF_AGE_MAX_YEARS ?? 17),
    recentExcludeYears: Number(process.env.ROOF_RECENT_EXCLUDE_YEARS ?? 5),
    currentYear: new Date().getFullYear(),
  };
}
