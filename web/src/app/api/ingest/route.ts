export const runtime = "nodejs";

/** Full county ingest can exceed Hobby serverless limits; Pro allows up to 300s */
export const maxDuration = 300;

import { NextResponse } from "next/server";
import { ingestMiamiDade, seedSampleData } from "@/lib/ingest/pipeline";
import { refreshAllLeads } from "@/lib/leads/refresh";

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

async function runIngest(body: { sample?: boolean; maxProperties?: number }) {
  const summary = body.sample
    ? await seedSampleData()
    : await ingestMiamiDade({ maxProperties: body.maxProperties });

  const leads = await refreshAllLeads();
  return { summary, leads };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runIngest({});
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
    maxProperties?: number;
  };

  try {
    const result = await runIngest(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
