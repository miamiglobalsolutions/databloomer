import { fetchTopBloomZipsFromDb } from "@/lib/leads/bloom-zips-server";
import { isActiveStripeSubscriber } from "@/lib/subscription/stripe-subscribers";
import { markDigestRunComplete } from "@/lib/email/digest-settings";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://databloomer.com";

function buildDigestHtml(
  zips: Awaited<ReturnType<typeof fetchTopBloomZipsFromDb>>,
): string {
  const rows = zips
    .map(
      (z, i) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${i + 1}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;"><strong>${z.zip}</strong></td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${z.leadCount}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${z.avgScore}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${z.replacementLikelyCount}</td>
        </tr>`,
    )
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:560px;color:#1c1917;">
      <h1 style="color:#ea580c;">DataBloomer — Bloom Zone digest</h1>
      <p>Top Miami-Dade ZIP codes for canvassing, ranked by DataBloom Score.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#fafaf9;text-align:left;">
            <th style="padding:8px;">#</th>
            <th style="padding:8px;">ZIP</th>
            <th style="padding:8px;">Leads</th>
            <th style="padding:8px;">Avg score</th>
            <th style="padding:8px;">Replacement likely</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p><a href="${appUrl}/dashboard?view=map" style="color:#ea580c;">Open Bloom Zones map →</a></p>
      <p style="font-size:12px;color:#78716c;">You're receiving this as a DataBloomer subscriber at ${appUrl}</p>
    </div>
  `;
}

export async function sendWeeklyDigestEmail(options: {
  to: string;
  zips: Awaited<ReturnType<typeof fetchTopBloomZipsFromDb>>;
}): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.DIGEST_FROM_EMAIL ?? "DataBloomer <digest@databloomer.com>";

  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }

  const html = buildDigestHtml(options.zips);
  const text = options.zips
    .map(
      (z, i) =>
        `${i + 1}. ZIP ${z.zip} — ${z.leadCount} leads, avg ${z.avgScore}, ${z.replacementLikelyCount} replacement-likely`,
    )
    .join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [options.to],
      subject: "Your DataBloomer Bloom Zone digest",
      html,
      text: `Top Bloom ZIPs:\n\n${text}\n\n${appUrl}/dashboard?view=map`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { sent: false, reason: `Resend error ${response.status}: ${body}` };
  }

  return { sent: true };
}

/** Admin test — sends to any address without digest enrollment. */
export async function sendDigestTestEmail(
  to: string,
): Promise<{ sent: boolean; reason?: string }> {
  const zips = await fetchTopBloomZipsFromDb("aging_roof", 5);
  return sendWeeklyDigestEmail({ to: to.trim().toLowerCase(), zips });
}

type DigestRecipient = {
  id?: number;
  email: string;
};

async function getDigestRecipients(options?: {
  onlyEmail?: string;
  audience?: "digest" | "paid";
}): Promise<DigestRecipient[]> {
  const { query } = await import("@/lib/db/client");

  if (options?.onlyEmail) {
    return [{ email: options.onlyEmail.trim().toLowerCase() }];
  }

  if (options?.audience === "paid") {
    const paid = await query<{ email: string }>(
      `SELECT email
       FROM stripe_subscribers
       WHERE status IN ('active', 'trialing')
         AND (current_period_end IS NULL OR current_period_end > NOW())
       ORDER BY email`,
    );
    return paid.rows.map((row) => ({ email: row.email }));
  }

  const subs = await query<{ id: number; email: string }>(
    `SELECT id, email FROM digest_subscribers WHERE active = TRUE ORDER BY email`,
  );
  return subs.rows.map((row) => ({ id: row.id, email: row.email }));
}

export async function runWeeklyDigest(options?: {
  onlyEmail?: string;
  updateSchedule?: boolean;
  skipStripeCheck?: boolean;
  /** When digest list is empty, admin send can target all paid Stripe subscribers. */
  audience?: "digest" | "paid";
}): Promise<{
  subscribers: number;
  sent: number;
  skipped: number;
  errors: string[];
  audience: "digest" | "paid";
}> {
  const { query } = await import("@/lib/db/client");
  const zips = await fetchTopBloomZipsFromDb("aging_roof", 5);

  let audience: "digest" | "paid" = options?.audience ?? "digest";
  let recipients = await getDigestRecipients({
    onlyEmail: options?.onlyEmail,
    audience: options?.audience,
  });

  if (recipients.length === 0 && audience === "digest" && !options?.onlyEmail) {
    audience = "paid";
    recipients = await getDigestRecipients({ audience: "paid" });
  }

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  if (recipients.length === 0) {
    errors.push(
      "No recipients found. Enroll paid subscribers in the digest on the dashboard, or confirm stripe_subscribers has active rows.",
    );
    return { subscribers: 0, sent, skipped, errors, audience };
  }

  for (const sub of recipients) {
    if (
      !options?.skipStripeCheck &&
      !(await isActiveStripeSubscriber(sub.email))
    ) {
      skipped += 1;
      errors.push(`${sub.email}: not an active paid subscriber`);
      continue;
    }

    const result = await sendWeeklyDigestEmail({ to: sub.email, zips });
    if (result.sent) {
      sent += 1;
      if (sub.id != null) {
        await query(
          `UPDATE digest_subscribers SET last_sent_at = NOW() WHERE id = $1`,
          [sub.id],
        );
      }
    } else {
      skipped += 1;
      if (result.reason) errors.push(`${sub.email}: ${result.reason}`);
    }
  }

  if (!options?.onlyEmail && options?.updateSchedule !== false && sent > 0) {
    await markDigestRunComplete();
  }

  return {
    subscribers: recipients.length,
    sent,
    skipped,
    errors,
    audience,
  };
}
