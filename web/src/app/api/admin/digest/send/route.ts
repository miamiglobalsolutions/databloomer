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
    const result = await runWeeklyDigest({
      updateSchedule: false,
      skipStripeCheck: true,
      audience: "digest",
    });

    if (result.sent > 0) {
      await markDigestRunComplete();
    }

    const detail =
      result.errors.length > 0 ? ` ${result.errors.join(" ")}` : "";

    if (result.sent === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            result.errors[0] ??
            "No digest emails were sent. Check RESEND_API_KEY and recipient list.",
          result,
        },
        { status: 500 },
      );
    }

    const audienceNote =
      result.audience === "paid"
        ? " (no digest enrollees — sent to active paid Stripe subscribers)"
        : "";

    return NextResponse.json({
      ok: true,
      message: `Digest sent to ${result.sent} subscriber(s)${audienceNote}.${detail}`,
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Send failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
