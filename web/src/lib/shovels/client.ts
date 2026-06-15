import { SHOVELS_API_BASE } from "@/lib/miami-dade/constants";

export type ShovelsPermit = {
  id: string;
  address: string;
  city: string | null;
  zip: string | null;
  issue_date: Date;
  permit_type: string | null;
  description: string | null;
  property_type: string | null;
};

type ShovelsSearchResponse = {
  items?: Array<{
    id?: string;
    address?: string;
    city?: string;
    zip_code?: string;
    permit_date?: string;
    tag?: string;
    description?: string;
    property_type?: string;
  }>;
  next?: string | null;
};

function hasApiKey(): boolean {
  return Boolean(process.env.SHOVELS_API_KEY?.trim());
}

/**
 * Fetches historical roofing permits from Shovels for Miami-Dade zip codes.
 * This is the primary path to high-confidence 15-year aging roof leads.
 */
export async function fetchHistoricalRoofPermits(options: {
  zipCodes: string[];
  permitFrom: string;
  permitTo: string;
  maxPerZip?: number;
}): Promise<ShovelsPermit[]> {
  const apiKey = process.env.SHOVELS_API_KEY;
  if (!apiKey) {
    return [];
  }

  const { zipCodes, permitFrom, permitTo, maxPerZip = 500 } = options;
  const results: ShovelsPermit[] = [];

  for (const zip of zipCodes) {
    let cursor: string | null = null;
    let fetched = 0;

    do {
      const url = new URL(`${SHOVELS_API_BASE}/permits/search`);
      url.searchParams.set("geo_id", zip);
      url.searchParams.set("tags", "roofing");
      url.searchParams.set("permit_from", permitFrom);
      url.searchParams.set("permit_to", permitTo);
      url.searchParams.set("size", "100");
      if (cursor) url.searchParams.set("cursor", cursor);

      const response = await fetch(url.toString(), {
        headers: {
          Accept: "application/json",
          "X-API-Key": apiKey,
        },
        signal: AbortSignal.timeout(60_000),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Shovels API error (${response.status}): ${body}`);
      }

      const data = (await response.json()) as ShovelsSearchResponse;
      for (const item of data.items ?? []) {
        if (!item.address || !item.permit_date) continue;
        results.push({
          id: `shovels-${item.id ?? `${zip}-${item.address}-${item.permit_date}`}`,
          address: item.address,
          city: item.city ?? null,
          zip: item.zip_code ?? zip,
          issue_date: new Date(item.permit_date),
          permit_type: item.tag ?? "roofing",
          description: item.description ?? null,
          property_type: item.property_type ?? null,
        });
        fetched += 1;
        if (fetched >= maxPerZip) break;
      }

      cursor = fetched >= maxPerZip ? null : (data.next ?? null);
    } while (cursor);
  }

  return results;
}

export function shovelsConfigured(): boolean {
  return hasApiKey();
}
