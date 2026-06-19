import { NextResponse } from "next/server";
import { runWeeklyDigest } from "@/lib/email/digest";
import { isDigestDue } from "@/lib/email/digest-schedule";
import { getDigestSettings } from "@/lib/email/digest-settings";

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
    const settings = await getDigestSettings();

    if (!settings.enabled) {
      return NextResponse.json({
        skipped: true,
        reason: "Digest is disabled in admin settings",
        settings,
      });
    }

    if (!isDigestDue(settings.lastRunAt, settings.frequency)) {
      return NextResponse.json({
        skipped: true,
        reason: `Not due yet for ${settings.frequency} schedule`,
        settings,
      });
    }

    const result = await runWeeklyDigest({ updateSchedule: true });
    return NextResponse.json({ ...result, settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Digest failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
