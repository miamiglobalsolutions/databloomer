export const runtime = "nodejs";

/** Full county ingest can exceed Hobby serverless limits; Pro allows up to 300s */
export const maxDuration = 300;

import { NextResponse } from "next/server";
import { ingestMiamiDade, seedSampleData } from "@/lib/ingest/pipeline";
import { refreshAllLeads } from "@/lib/leads/refresh";

const DEFAULT_ZIPS_PER_CRON = Number(process.env.INGEST_ZIPS_PER_CRON ?? 20);

function isAuthorized(request: Request): boolean {
  const auth = request.headers.get("authorization");
  const ingestSecret = process.env.INGEST_SECRET;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;
  if (ingestSecret && auth === `Bearer ${ingestSecret}`) return true;

  // Local dev without secrets
  if (!process.env.VERCEL && !ingestSecret && !cronSecret) return true;

  return false;
}

type IngestOptions = {
  sample?: boolean;
  /** Full county parcel fetch (default for POST / npm run ingest). */
  fullProperties?: boolean;
  /** Cron: refresh a batch of ZIPs per run to stay within serverless limits. */
  zipBatchSize?: number;
};

async function runIngest(body: IngestOptions) {
  const summary = body.sample
    ? await seedSampleData()
    : await ingestMiamiDade(
        body.fullProperties === false
          ? { skipProperties: true }
          : body.zipBatchSize != null && body.zipBatchSize > 0
            ? { zipBatchSize: body.zipBatchSize }
            : {},
      );

  const leads = await refreshAllLeads();
  return { summary, leads };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runIngest({
      zipBatchSize: DEFAULT_ZIPS_PER_CRON,
    });
    return NextResponse.json({ ...result, trigger: "cron" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    sample?: boolean;
    fullProperties?: boolean;
    zipBatchSize?: number;
  };

  try {
    const result = await runIngest({
      sample: body.sample,
      fullProperties: body.fullProperties ?? true,
      zipBatchSize: body.zipBatchSize,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
