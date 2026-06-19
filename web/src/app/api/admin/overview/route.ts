export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin/require-admin";
import { query } from "@/lib/db/client";
import { getDigestSettings } from "@/lib/email/digest-settings";
import { nextDigestRunAt } from "@/lib/email/digest-schedule";
import { isActiveStripeSubscriber } from "@/lib/subscription/stripe-subscribers";

export async function GET(request: Request) {
  const admin = await requireAdminAccess(request);
  if (!admin.ok) return admin.response;

  const [stripeResult, digestResult, settings] = await Promise.all([
    query<{
      id: number;
      email: string;
      status: string;
      current_period_end: Date | null;
      created_at: Date;
      updated_at: Date;
    }>(
      `SELECT id, email, status, current_period_end, created_at, updated_at
       FROM stripe_subscribers
       ORDER BY updated_at DESC`,
    ),
    query<{
      id: number;
      email: string;
      subscribed_at: Date;
      active: boolean;
      last_sent_at: Date | null;
    }>(
      `SELECT id, email, subscribed_at, active, last_sent_at
       FROM digest_subscribers
       ORDER BY subscribed_at DESC`,
    ),
    getDigestSettings(),
  ]);

  const digestWithStripe = await Promise.all(
    digestResult.rows.map(async (row) => ({
      ...row,
      subscribed_at: row.subscribed_at.toISOString(),
      last_sent_at: row.last_sent_at?.toISOString() ?? null,
      paid_active: await isActiveStripeSubscriber(row.email),
    })),
  );

  const stripeRows = stripeResult.rows.map((row) => ({
    id: row.id,
    email: row.email,
    status: row.status,
    currentPeriodEnd: row.current_period_end?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }));

  const digestOnStripe = digestWithStripe.filter(
    (row) => row.active && row.paid_active,
  ).length;

  return NextResponse.json({
    stripeSubscribers: stripeRows,
    digestSubscribers: digestWithStripe,
    digestSettings: {
      ...settings,
      nextRunAt: nextDigestRunAt(settings.lastRunAt, settings.frequency)?.toISOString() ?? null,
    },
    stats: {
      stripeCount: stripeRows.length,
      digestCount: digestWithStripe.filter((row) => row.active).length,
      digestActivePaidCount: digestOnStripe,
    },
  });
}
