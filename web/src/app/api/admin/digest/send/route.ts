export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin/require-admin";
import { runWeeklyDigest } from "@/lib/email/digest";
import { markDigestRunComplete } from "@/lib/email/digest-settings";

export const maxDuration = 60;

export async function POST(request: Request) {
  const admin = await requireAdminAccess(request);
  if (!admin.ok) return admin.response;

  try {
    const result = await runWeeklyDigest({ updateSchedule: false });
    if (result.sent > 0) {
      await markDigestRunComplete();
    }

    return NextResponse.json({
      ok: true,
      message: `Digest sent to ${result.sent} subscriber(s).`,
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Send failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
