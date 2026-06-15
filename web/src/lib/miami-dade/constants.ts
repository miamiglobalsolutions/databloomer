export const MIAMI_DADE = {
  name: "Miami-Dade County",
  state: "FL",
} as const;

/** Miami-Dade building permit application types for roofing work */
export const ROOF_PERMIT_TYPE_CODES = ["13", "18", "20"] as const;

export const ROOF_PERMIT_TYPE_LABELS: Record<string, string> = {
  "13": "Re-roof / Repair",
  "18": "Re-roof / Repair (Hurricane)",
  "20": "Roof Recovery",
};

export const ARCGIS = {
  buildingPermits:
    "https://gisweb.miamidade.gov/arcgis/rest/services/MD_LandInformation/MapServer/1",
  /** Property Appraiser parcels — year_built, owner, assessed value */
  parcels:
    "https://gisweb.miamidade.gov/arcgis/rest/services/MD_LandInformation/MapServer/26",
  codeViolations:
    "https://gisweb.miamidade.gov/arcgis/rest/services/EnerGov/MD_LandMgtViewer/MapServer/86",
} as const;

export const SHOVELS_API_BASE = "https://api.shovels.ai/v2";

/**
 * Miami-Dade GIS never labels violations with "ROOF" in PROBLEM_DESC.
 * Roof issues appear under structure / minimum-housing maintenance categories.
 * @see MapServer/86 groupBy on PROBLEM_DESC (verified 2026-06).
 */
export const ROOF_RELATED_VIOLATION_DESC_PATTERNS = [
  "Structure Maintenance",
  "Minimum Housing",
] as const;

/** Default: only open enforcement cases (actionable leads). */
export const VIOLATIONS_OPEN_ONLY =
  process.env.VIOLATIONS_OPEN_ONLY !== "false";
