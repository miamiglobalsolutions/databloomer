import type { PoolClient } from "pg";
import {
  fetchAgingPropertiesByZip,
  fetchPropertiesByYearBuilt,
  fetchRoofPermits,
  fetchRoofViolations,
  type ParsedProperty,
  type ParsedRoofPermit,
  type ParsedViolation,
} from "@/lib/miami-dade/arcgis";
import { getAgingRoofConfig } from "@/lib/leads/types";
import { fetchHistoricalRoofPermits, shovelsConfigured } from "@/lib/shovels/client";
import { MIAMI_DADE_ZIP_CODES } from "@/lib/miami-dade/zips";
import { query } from "@/lib/db/client";

const DEFAULT_MAX_PROPERTIES = Number(process.env.INGEST_MAX_PROPERTIES ?? 8500);

async function startRun(source: string): Promise<number> {
  const result = await query<{ id: number }>(
    `INSERT INTO ingest_runs (source, status) VALUES ($1, 'running') RETURNING id`,
    [source],
  );
  return result.rows[0].id;
}

async function finishRun(
  id: number,
  recordsSeen: number,
  recordsUpserted: number,
  error?: string,
) {
  await query(
    `UPDATE ingest_runs
     SET finished_at = NOW(), records_seen = $2, records_upserted = $3,
         status = $4, error_message = $5
     WHERE id = $1`,
    [id, recordsSeen, recordsUpserted, error ? "failed" : "completed", error ?? null],
  );
}

async function upsertProperty(property: ParsedProperty, client?: PoolClient) {
  const q = client?.query.bind(client) ?? query;
  await q(
    `INSERT INTO properties (folio, address, city, zip, year_built, assessed_value, lat, lng, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (folio) DO UPDATE SET
       address = EXCLUDED.address,
       city = EXCLUDED.city,
       zip = EXCLUDED.zip,
       year_built = EXCLUDED.year_built,
       assessed_value = EXCLUDED.assessed_value,
       lat = COALESCE(EXCLUDED.lat, properties.lat),
       lng = COALESCE(EXCLUDED.lng, properties.lng),
       updated_at = NOW()`,
    [
      property.folio,
      property.address,
      property.city,
      property.zip,
      property.year_built,
      property.assessed_value,
      property.lat,
      property.lng,
    ],
  );
}

async function upsertPermit(permit: ParsedRoofPermit, source: string) {
  if (permit.folio) {
    await upsertProperty({
      folio: permit.folio,
      address: permit.address ?? "Unknown address",
      city: "Miami",
      zip: null,
      year_built: null,
      assessed_value: null,
      lat: null,
      lng: null,
    });
  }

  await query(
    `INSERT INTO roof_permits (
      id, folio, permit_number, process_number, address, permit_type,
      issue_date, status, source, raw_json
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (id) DO UPDATE SET
      folio = COALESCE(EXCLUDED.folio, roof_permits.folio),
      issue_date = EXCLUDED.issue_date,
      status = EXCLUDED.status,
      raw_json = EXCLUDED.raw_json`,
    [
      permit.id,
      permit.folio,
      permit.permit_number,
      permit.process_number,
      permit.address,
      permit.permit_type,
      permit.issue_date.toISOString().slice(0, 10),
      permit.status,
      source,
      JSON.stringify(permit.raw),
    ],
  );
}

async function upsertViolation(violation: ParsedViolation) {
  await query(
    `INSERT INTO code_violations (
      id, folio, case_number, address, case_date, problem_code,
      problem_desc, status_desc, case_status, lat, lng, source, raw_json
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'arcgis', $12)
    ON CONFLICT (id) DO UPDATE SET
      status_desc = EXCLUDED.status_desc,
      case_status = EXCLUDED.case_status,
      raw_json = EXCLUDED.raw_json`,
    [
      violation.id,
      violation.folio,
      violation.case_number,
      violation.address,
      violation.case_date?.toISOString().slice(0, 10) ?? null,
      violation.problem_code,
      violation.problem_desc,
      violation.status_desc,
      violation.case_status,
      violation.lat,
      violation.lng,
      JSON.stringify(violation.raw),
    ],
  );
}

export type IngestSummary = {
  properties: number;
  permits: number;
  violations: number;
  shovelsPermits: number;
  shovelsConfigured: boolean;
};

export async function clearAllData(): Promise<void> {
  await query("DELETE FROM leads");
  await query("DELETE FROM code_violations");
  await query("DELETE FROM roof_permits");
  await query("DELETE FROM properties");
}

export async function ingestMiamiDade(options?: {
  maxProperties?: number;
  zipCodes?: string[];
  onProgress?: (message: string) => void;
}): Promise<IngestSummary> {
  const config = getAgingRoofConfig();
  const targetMinYear = config.currentYear - config.maxAgeYears;
  const targetMaxYear = config.currentYear - config.minAgeYears;
  const log = options?.onProgress ?? ((msg: string) => console.log(msg));

  const runId = await startRun("miami-dade");
  let properties = 0;
  let permits = 0;
  let violations = 0;
  let shovelsPermits = 0;

  try {
    const maxProperties = options?.maxProperties ?? DEFAULT_MAX_PROPERTIES;
    const seenFolios = new Set<string>();

    if (options?.zipCodes?.length) {
      log(
        `Fetching aging properties (built ${targetMinYear}–${targetMaxYear}) for ${options.zipCodes.length} zip code(s)…`,
      );
      for (const zip of options.zipCodes) {
        log(`  Zip ${zip}…`);
        const batch = await fetchAgingPropertiesByZip(
          zip,
          targetMinYear,
          targetMaxYear,
          2000,
        );
        for (const property of batch) {
          if (seenFolios.has(property.folio)) continue;
          seenFolios.add(property.folio);
          await upsertProperty(property);
          properties += 1;
        }
      }
    } else {
      log(
        `Fetching all aging properties county-wide (built ${targetMinYear}–${targetMaxYear}, up to ${maxProperties})…`,
      );
      const propertyRows = await fetchPropertiesByYearBuilt({
        minYearBuilt: targetMinYear,
        maxYearBuilt: targetMaxYear,
        maxRecords: maxProperties,
      });
      for (const property of propertyRows) {
        await upsertProperty(property);
        properties += 1;
      }
    }

    log("Fetching recent roofing permits (APPTYPE 13/18/20)…");
    const permitRows = await fetchRoofPermits();
    for (const permit of permitRows) {
      await upsertPermit(permit, "arcgis");
      permits += 1;
    }

    log("Fetching roof-related code violations…");
    try {
      const violationRows = await fetchRoofViolations();
      for (const violation of violationRows) {
        await upsertViolation(violation);
        violations += 1;
      }
    } catch (error) {
      log(
        `Violations fetch skipped: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    if (shovelsConfigured()) {
      const zips = options?.zipCodes ?? [...MIAMI_DADE_ZIP_CODES];
      const permitFrom = `${targetMinYear}-01-01`;
      const permitTo = `${targetMaxYear}-12-31`;
      const historical = await fetchHistoricalRoofPermits({
        zipCodes: zips,
        permitFrom,
        permitTo,
      });

      for (const item of historical) {
        const folioGuess = `shovels-${item.zip}-${item.address.replace(/\W/g, "").slice(0, 20)}`;
        await upsertProperty({
          folio: folioGuess,
          address: item.address,
          city: item.city,
          zip: item.zip,
          year_built: null,
          assessed_value: null,
          lat: null,
          lng: null,
        });
        await upsertPermit(
          {
            id: item.id,
            folio: folioGuess,
            permit_number: null,
            process_number: null,
            address: item.address,
            permit_type: item.permit_type ?? "roofing",
            issue_date: item.issue_date,
            status: null,
            raw: { source: "shovels", description: item.description },
          },
          "shovels",
        );
        shovelsPermits += 1;
      }
    }

    await finishRun(
      runId,
      properties + permits + violations + shovelsPermits,
      properties + permits + violations + shovelsPermits,
    );

    return {
      properties,
      permits,
      violations,
      shovelsPermits,
      shovelsConfigured: shovelsConfigured(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await finishRun(runId, 0, 0, message);
    throw error;
  }
}

export async function seedSampleData(): Promise<IngestSummary> {
  const config = getAgingRoofConfig();
  const targetYear = config.currentYear - 15;

  const samples: Array<{
    property: ParsedProperty;
    permits: ParsedRoofPermit[];
  }> = [
    {
      property: {
        folio: "0101010101010",
        address: "123 Coral Way",
        city: "Miami",
        zip: "33145",
        year_built: targetYear,
        assessed_value: 425000,
        lat: 25.7501,
        lng: -80.2682,
      },
      permits: [],
    },
    {
      property: {
        folio: "0202020202020",
        address: "456 Bird Rd",
        city: "Coral Gables",
        zip: "33146",
        year_built: 1985,
        assessed_value: 680000,
        lat: 25.7021,
        lng: -80.2891,
      },
      permits: [
        {
          id: "sample-permit-1",
          folio: "0202020202020",
          permit_number: "2020112345",
          process_number: "PRC123456",
          address: "456 Bird Rd",
          permit_type: "13",
          issue_date: new Date(targetYear, 2, 15),
          status: "F",
          raw: { sample: true },
        },
      ],
    },
    {
      property: {
        folio: "0303030303030",
        address: "789 SW 8th St",
        city: "Miami",
        zip: "33130",
        year_built: targetYear - 2,
        assessed_value: 310000,
        lat: 25.7654,
        lng: -80.2012,
      },
      permits: [],
    },
  ];

  for (const sample of samples) {
    await upsertProperty(sample.property);
    for (const permit of sample.permits) {
      await upsertPermit(permit, "sample");
    }
  }

  await upsertProperty({
    folio: "0404040404040",
    address: "321 NW 7th Ave",
    city: "Miami",
    zip: "33136",
    year_built: 1998,
    assessed_value: 275000,
    lat: 25.778,
    lng: -80.205,
  });

  await upsertViolation({
    id: "sample-violation-1",
    folio: "0404040404040",
    case_number: "ENF2026001",
    address: "321 NW 7th Ave",
    case_date: new Date(),
    problem_code: "RF01",
    problem_desc: "DETERIORATED ROOF COVERING",
    status_desc: "Open",
    case_status: "OPN",
    lat: 25.778,
    lng: -80.205,
    raw: { sample: true },
  });

  return {
    properties: samples.length,
    permits: samples.reduce((n, s) => n + s.permits.length, 0),
    violations: 1,
    shovelsPermits: 0,
    shovelsConfigured: shovelsConfigured(),
  };
}
