export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin/require-admin";
import { sendDigestTestEmail } from "@/lib/email/digest";

export const maxDuration = 60;

export async function POST(request: Request) {
  const admin = await requireAdminAccess(request);
  if (!admin.ok) return admin.response;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
    };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Test email address is required." },
        { status: 400 },
      );
    }

    const result = await sendDigestTestEmail(email);

    if (!result.sent) {
      return NextResponse.json(
        {
          ok: false,
          error: result.reason ?? "Test email could not be sent.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Test digest sent to ${email}.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Test send failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
