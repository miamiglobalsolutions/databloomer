import { NextResponse } from "next/server";
import { runWeeklyDigest } from "@/lib/email/digest";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  return request.headers.get("x-cron-secret") === secret;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runWeeklyDigest();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Digest failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
