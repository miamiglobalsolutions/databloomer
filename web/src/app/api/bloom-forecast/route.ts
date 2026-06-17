export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { fetchNeighborhoodBloomForecasts } from "@/lib/leads/neighborhood-bloom-server";
import { isSubscriptionGatingEnabled } from "@/lib/subscription/access";
import { getAccessForRequest } from "@/lib/subscription/session";
import { normalizeZipInput } from "@/lib/miami-dade/zips";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zipFilter = searchParams.get("zip");
  const zip = zipFilter ? normalizeZipInput(zipFilter) : null;

  try {
    const access = await getAccessForRequest(request);
    let forecasts = await fetchNeighborhoodBloomForecasts();

    if (zip) {
      forecasts = forecasts.filter((row) => row.zip === zip);
    }

    const gating = isSubscriptionGatingEnabled() && !access.full;
    const previewLimit = 5;

    const payload = gating
      ? forecasts.slice(0, previewLimit).map((row) => ({
          ...row,
          bloomProbability: null,
          untappedRatio: null,
          preview: true,
        }))
      : forecasts;

    return NextResponse.json({
      forecasts: payload,
      total: forecasts.length,
      preview: gating,
      access,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
