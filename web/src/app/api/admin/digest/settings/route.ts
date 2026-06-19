export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin/require-admin";
import {
  getDigestSettings,
  updateDigestSettings,
} from "@/lib/email/digest-settings";
import { isDigestFrequency, nextDigestRunAt } from "@/lib/email/digest-schedule";

export async function GET(request: Request) {
  const admin = await requireAdminAccess(request);
  if (!admin.ok) return admin.response;

  const settings = await getDigestSettings();
  return NextResponse.json({
    settings: {
      ...settings,
      nextRunAt:
        nextDigestRunAt(settings.lastRunAt, settings.frequency)?.toISOString() ??
        null,
    },
  });
}

export async function PATCH(request: Request) {
  const admin = await requireAdminAccess(request);
  if (!admin.ok) return admin.response;

  try {
    const body = (await request.json()) as {
      enabled?: boolean;
      frequency?: string;
    };

    if (
      body.frequency != null &&
      !isDigestFrequency(body.frequency)
    ) {
      return NextResponse.json(
        { error: "Invalid frequency. Use hourly, daily, weekly, or monthly." },
        { status: 400 },
      );
    }

    const settings = await updateDigestSettings({
      enabled: body.enabled,
      frequency: body.frequency as Parameters<
        typeof updateDigestSettings
      >[0]["frequency"],
    });

    return NextResponse.json({
      settings: {
        ...settings,
        nextRunAt:
          nextDigestRunAt(settings.lastRunAt, settings.frequency)?.toISOString() ??
          null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
