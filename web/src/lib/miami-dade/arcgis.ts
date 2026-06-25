import {
  ARCGIS,
  CONSTRUCTION_PERMIT_TYPE_CODES,
  ROOF_PERMIT_TYPE_CODES,
  ROOF_RELATED_VIOLATION_DESC_PATTERNS,
  VIOLATIONS_OPEN_ONLY,
} from "./constants";
import {
  resolvePropertyAssessedValue,
  type AssessedValueSource,
} from "./property-value";

type ArcGISGeometry =
  | { x: number; y: number }
  | { rings: number[][][] };

type ArcGISFeature<T> = {
  attributes: T;
  geometry?: ArcGISGeometry;
};

type ArcGISResponse<T> = {
  features?: ArcGISFeature<T>[];
  exceededTransferLimit?: boolean;
  error?: { message: string; details?: string[] };
};

async function arcgisQuery<T>(
  layerUrl: string,
  params: Record<string, string>,
): Promise<ArcGISFeature<T>[]> {
  const url = new URL(`${layerUrl}/query`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(180_000),
  });

  if (!response.ok) {
    throw new Error(`ArcGIS request failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as ArcGISResponse<T>;
  if (data.error) {
    const detail = data.error.details?.join("; ") ?? "";
    throw new Error(`ArcGIS error: ${data.error.message}${detail ? ` (${detail})` : ""}`);
  }

  return data.features ?? [];
}

async function arcgisQueryAll<T>(
  layerUrl: string,
  baseParams: Record<string, string>,
  options?: { pageSize?: number; maxRecords?: number },
): Promise<ArcGISFeature<T>[]> {
  const pageSize = options?.pageSize ?? 1000;
  const maxRecords = options?.maxRecords ?? 50_000;
  const all: ArcGISFeature<T>[] = [];
  let offset = 0;

  for (;;) {
    const batch = await arcgisQuery<T>(layerUrl, {
      ...baseParams,
      resultOffset: String(offset),
      resultRecordCount: String(pageSize),
    });

    all.push(...batch);
    if (all.length >= maxRecords) break;
    if (batch.length < pageSize) break;
    offset += pageSize;
  }

  return all.slice(0, maxRecords);
}

type PermitAttributes = {
  OBJECTID: number;
  FOLIO?: string;
  ID?: number;
  PROCNUM?: string;
  ADDRESS?: string;
  APPTYPE?: string;
  DESC1?: string;
  ISSUDATE?: number;
  BPSTATUS?: string;
};

type ViolationAttributes = {
  OBJECTID: number;
  CASE_NUM?: string;
  CASE_DATE?: number;
  STAT_DESC?: string;
  ADDRESS?: string;
  FOLIO?: string;
  PROBLEM?: string;
  PROBLEM_DESC?: string;
  CASE_STATUS?: string;
  X_COORD?: number;
  Y_COORD?: number;
};

type ParcelAttributes = {
  FOLIO?: string;
  TRUE_SITE_ADDR?: string;
  TRUE_SITE_CITY?: string;
  TRUE_SITE_ZIP_CODE?: string;
  YEAR_BUILT?: number;
  TOTAL_VAL_CUR?: number | null;
  BUILDING_HEATED_AREA?: number | null;
  BUILDING_EFFECTIVE_AREA?: number | null;
  X_COORD?: number;
  Y_COORD?: number;
};

const PARCEL_OUT_FIELDS =
  "FOLIO,TRUE_SITE_ADDR,TRUE_SITE_CITY,TRUE_SITE_ZIP_CODE,YEAR_BUILT,TOTAL_VAL_CUR,BUILDING_HEATED_AREA,BUILDING_EFFECTIVE_AREA,X_COORD,Y_COORD";

function arcgisDateToDate(value?: number): Date | null {
  if (value == null) return null;
  return new Date(value);
}

function normalizeFolio(value?: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length > 0 ? digits.padStart(13, "0") : null;
}

function normalizeZip(value?: string | null): string | null {
  if (!value) return null;
  const zip = value.trim().split("-")[0];
  return zip.length >= 5 ? zip.slice(0, 5) : zip || null;
}

function geometryToLatLng(
  geometry?: ArcGISGeometry,
): { lat: number; lng: number } | null {
  if (!geometry) return null;

  if ("x" in geometry && "y" in geometry) {
    return { lng: geometry.x, lat: geometry.y };
  }

  if ("rings" in geometry && geometry.rings[0]?.length) {
    const ring = geometry.rings[0];
    let lng = 0;
    let lat = 0;
    for (const [x, y] of ring) {
      lng += x;
      lat += y;
    }
    return { lng: lng / ring.length, lat: lat / ring.length };
  }

  return null;
}

function parseParcelFeature(
  feature: ArcGISFeature<ParcelAttributes>,
): ParsedProperty | null {
  const attrs = feature.attributes;
  const folio = normalizeFolio(attrs.FOLIO);
  if (!folio || !attrs.TRUE_SITE_ADDR?.trim()) return null;

  const coords =
    geometryToLatLng(feature.geometry) ??
    (attrs.X_COORD != null && attrs.Y_COORD != null
      ? { lng: attrs.X_COORD, lat: attrs.Y_COORD }
      : null);

  const assessed = resolvePropertyAssessedValue({
    totalValCur: attrs.TOTAL_VAL_CUR,
    buildingHeatedArea: attrs.BUILDING_HEATED_AREA,
    buildingEffectiveArea: attrs.BUILDING_EFFECTIVE_AREA,
  });

  return {
    folio,
    address: attrs.TRUE_SITE_ADDR.trim(),
    city: attrs.TRUE_SITE_CITY?.trim() ?? "Miami",
    zip: normalizeZip(attrs.TRUE_SITE_ZIP_CODE),
    year_built: attrs.YEAR_BUILT && attrs.YEAR_BUILT > 0 ? attrs.YEAR_BUILT : null,
    assessed_value: assessed.assessed_value,
    assessed_value_source: assessed.assessed_value_source,
    building_heated_area: assessed.building_heated_area,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
  };
}

export type ParsedRoofPermit = {
  id: string;
  folio: string | null;
  permit_number: string | null;
  process_number: string | null;
  address: string | null;
  permit_type: string;
  issue_date: Date;
  status: string | null;
  raw: Record<string, unknown>;
};

export type ParsedConstructionPermit = {
  id: string;
  folio: string | null;
  permit_number: string | null;
  process_number: string | null;
  address: string | null;
  permit_type: string;
  permit_desc: string | null;
  proposed_use: string | null;
  contractor_name: string | null;
  contractor_number: string | null;
  residential_or_commercial: string | null;
  issue_date: Date;
  status: string | null;
  raw: Record<string, unknown>;
};

export type ParsedViolation = {
  id: string;
  folio: string | null;
  case_number: string | null;
  address: string | null;
  case_date: Date | null;
  problem_code: string | null;
  problem_desc: string | null;
  status_desc: string | null;
  case_status: string | null;
  lat: number | null;
  lng: number | null;
  raw: Record<string, unknown>;
};

export type ParsedProperty = {
  folio: string;
  address: string;
  city: string | null;
  zip: string | null;
  year_built: number | null;
  assessed_value: number | null;
  assessed_value_source?: AssessedValueSource | null;
  building_heated_area?: number | null;
  lat: number | null;
  lng: number | null;
};

const AGING_PROPERTY_FILTER = (minYear: number, maxYear: number) =>
  `YEAR_BUILT >= ${minYear} AND YEAR_BUILT <= ${maxYear} AND YEAR_BUILT > 0 AND (CONDO_FLAG IS NULL OR CONDO_FLAG <> 'T')`;

export async function fetchRoofPermits(options?: {
  maxRecords?: number;
}): Promise<ParsedRoofPermit[]> {
  const appTypes = ROOF_PERMIT_TYPE_CODES.map((c) => `'${c}'`).join(",");
  const features = await arcgisQueryAll<PermitAttributes>(
    ARCGIS.buildingPermits,
    {
      where: `APPTYPE IN (${appTypes})`,
      outFields:
        "OBJECTID,FOLIO,ID,PROCNUM,ADDRESS,APPTYPE,DESC1,ISSUDATE,BPSTATUS",
      returnGeometry: "false",
      orderByFields: "ISSUDATE DESC",
      f: "json",
    },
    { pageSize: 1000, maxRecords: options?.maxRecords ?? 10_000 },
  );

  const parsed: ParsedRoofPermit[] = [];
  for (const feature of features) {
    const attrs = feature.attributes;
    const issueDate = arcgisDateToDate(attrs.ISSUDATE);
    if (!issueDate || !attrs.APPTYPE) continue;

    parsed.push({
      id: `arcgis-permit-${attrs.OBJECTID}`,
      folio: normalizeFolio(attrs.FOLIO),
      permit_number: attrs.ID != null ? String(attrs.ID) : null,
      process_number: attrs.PROCNUM ?? null,
      address: attrs.ADDRESS?.trim() ?? null,
      permit_type: attrs.APPTYPE,
      issue_date: issueDate,
      status: attrs.BPSTATUS ?? null,
      raw: attrs as unknown as Record<string, unknown>,
    });
  }

  return parsed;
}

export async function fetchConstructionPermits(options?: {
  maxRecords?: number;
}): Promise<ParsedConstructionPermit[]> {
  const appTypes = CONSTRUCTION_PERMIT_TYPE_CODES.map((c) => `'${c}'`).join(",");
  const features = await arcgisQueryAll<PermitAttributes & Record<string, unknown>>(
    ARCGIS.buildingPermits,
    {
      where: `APPTYPE IN (${appTypes}) AND TYPE = 'BLDG'`,
      outFields:
        "OBJECTID,FOLIO,ID,PROCNUM,ADDRESS,APPTYPE,DESC1,PROPUSE,CONTRNAME,CONTRNUM,RESCOMM,ISSUDATE,BPSTATUS",
      returnGeometry: "false",
      orderByFields: "ISSUDATE DESC",
      f: "json",
    },
    { pageSize: 1000, maxRecords: options?.maxRecords ?? 10_000 },
  );

  const parsed: ParsedConstructionPermit[] = [];
  for (const feature of features) {
    const attrs = feature.attributes;
    const issueDate = arcgisDateToDate(attrs.ISSUDATE);
    if (!issueDate || !attrs.APPTYPE) continue;

    parsed.push({
      id: `arcgis-construction-${attrs.OBJECTID}`,
      folio: normalizeFolio(attrs.FOLIO),
      permit_number: attrs.ID != null ? String(attrs.ID) : null,
      process_number: attrs.PROCNUM ?? null,
      address: attrs.ADDRESS?.trim() ?? null,
      permit_type: attrs.APPTYPE,
      permit_desc: typeof attrs.DESC1 === "string" ? attrs.DESC1.trim() : null,
      proposed_use: typeof attrs.PROPUSE === "string" ? attrs.PROPUSE.trim() : null,
      contractor_name:
        typeof attrs.CONTRNAME === "string" ? attrs.CONTRNAME.trim() : null,
      contractor_number:
        typeof attrs.CONTRNUM === "string" ? attrs.CONTRNUM.trim() : null,
      residential_or_commercial:
        typeof attrs.RESCOMM === "string" ? attrs.RESCOMM.trim() : null,
      issue_date: issueDate,
      status: attrs.BPSTATUS ?? null,
      raw: attrs as unknown as Record<string, unknown>,
    });
  }

  return parsed;
}

function buildRoofViolationWhereClause(openOnly = VIOLATIONS_OPEN_ONLY): string {
  const categoryFilter = ROOF_RELATED_VIOLATION_DESC_PATTERNS.map(
    (pattern) => `PROBLEM_DESC LIKE '%${pattern}%'`,
  ).join(" OR ");

  if (openOnly) {
    return `(${categoryFilter}) AND STAT_DESC LIKE '%Open%'`;
  }

  return categoryFilter;
}

export async function fetchRoofViolations(options?: {
  maxRecords?: number;
  openOnly?: boolean;
}): Promise<ParsedViolation[]> {
  const where = buildRoofViolationWhereClause(options?.openOnly);

  const features = await arcgisQueryAll<ViolationAttributes>(
    ARCGIS.codeViolations,
    {
      where,
      outFields:
        "OBJECTID,CASE_NUM,CASE_DATE,STAT_DESC,ADDRESS,FOLIO,PROBLEM,PROBLEM_DESC,CASE_STATUS",
      returnGeometry: "true",
      outSR: "4326",
      orderByFields: "CASE_DATE DESC",
      f: "json",
    },
    { pageSize: 500, maxRecords: options?.maxRecords ?? 500 },
  );

  const parsed: ParsedViolation[] = [];
  for (const feature of features) {
    const attrs = feature.attributes;
    const coords = geometryToLatLng(feature.geometry);
    parsed.push({
      id: `arcgis-violation-${attrs.OBJECTID}`,
      folio: normalizeFolio(attrs.FOLIO),
      case_number: attrs.CASE_NUM ?? null,
      address: attrs.ADDRESS?.trim() ?? null,
      case_date: arcgisDateToDate(attrs.CASE_DATE ?? undefined),
      problem_code: attrs.PROBLEM?.trim() ?? null,
      problem_desc: attrs.PROBLEM_DESC?.trim() ?? null,
      status_desc: attrs.STAT_DESC?.trim() ?? null,
      case_status: attrs.CASE_STATUS ?? null,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      raw: attrs as unknown as Record<string, unknown>,
    });
  }

  return parsed;
}

export async function fetchPropertiesByYearBuilt(options: {
  minYearBuilt: number;
  maxYearBuilt: number;
  maxRecords?: number;
}): Promise<ParsedProperty[]> {
  const { minYearBuilt, maxYearBuilt, maxRecords = 5000 } = options;

  const features = await arcgisQueryAll<ParcelAttributes>(
    ARCGIS.parcels,
    {
      where: AGING_PROPERTY_FILTER(minYearBuilt, maxYearBuilt),
      outFields: PARCEL_OUT_FIELDS,
      returnGeometry: "true",
      outSR: "4326",
      f: "json",
    },
    { pageSize: 1000, maxRecords },
  );

  const parsed: ParsedProperty[] = [];
  for (const feature of features) {
    const property = parseParcelFeature(feature);
    if (property) parsed.push(property);
  }

  return parsed;
}

export async function fetchAgingPropertiesByZip(
  zip: string,
  minYearBuilt: number,
  maxYearBuilt: number,
  maxPerZip = 500,
): Promise<ParsedProperty[]> {
  const features = await arcgisQueryAll<ParcelAttributes>(
    ARCGIS.parcels,
    {
      where: `${AGING_PROPERTY_FILTER(minYearBuilt, maxYearBuilt)} AND TRUE_SITE_ZIP_CODE LIKE '${zip}%'`,
      outFields: PARCEL_OUT_FIELDS,
      returnGeometry: "true",
      outSR: "4326",
      f: "json",
    },
    { pageSize: 1000, maxRecords: maxPerZip },
  );

  const parsed: ParsedProperty[] = [];
  for (const feature of features) {
    const property = parseParcelFeature(feature);
    if (property) parsed.push(property);
  }
  return parsed;
}
