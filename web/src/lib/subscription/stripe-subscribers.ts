import { query } from "@/lib/db/client";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export type StripeSubscriberRow = {
  email: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_end: Date | null;
};

export async function upsertStripeSubscriber(input: {
  email: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  status: string;
  currentPeriodEnd?: Date | null;
}): Promise<void> {
  const email = input.email.trim().toLowerCase();
  await query(
    `INSERT INTO stripe_subscribers (
      email, stripe_customer_id, stripe_subscription_id, status, current_period_end, updated_at
    ) VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (email) DO UPDATE SET
      stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, stripe_subscribers.stripe_customer_id),
      stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, stripe_subscribers.stripe_subscription_id),
      status = EXCLUDED.status,
      current_period_end = EXCLUDED.current_period_end,
      updated_at = NOW()`,
    [
      email,
      input.stripeCustomerId ?? null,
      input.stripeSubscriptionId ?? null,
      input.status,
      input.currentPeriodEnd ?? null,
    ],
  );
}

export async function isActiveStripeSubscriber(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const result = await query<{ status: string; current_period_end: Date | null }>(
    `SELECT status, current_period_end
     FROM stripe_subscribers
     WHERE email = $1`,
    [normalized],
  );

  const row = result.rows[0];
  if (!row) return false;
  if (!ACTIVE_STATUSES.has(row.status)) return false;
  if (row.current_period_end && row.current_period_end.getTime() < Date.now()) {
    return false;
  }
  return true;
}

export function isActiveSubscriptionStatus(status: string): boolean {
  return ACTIVE_STATUSES.has(status);
}
