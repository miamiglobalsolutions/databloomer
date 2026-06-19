import { NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { isSubscriptionGatingEnabled } from "@/lib/subscription/access";
import { isActiveStripeSubscriber } from "@/lib/subscription/stripe-subscribers";
import { getAccessForRequest } from "@/lib/subscription/session";

export async function POST(request: Request) {
  try {
    const access = await getAccessForRequest(request);
    const gating = isSubscriptionGatingEnabled();

    if (gating && !access.full) {
      return NextResponse.json(
        { error: "Bloom Zone digest is available to paid subscribers only." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    if (access.level !== "admin" && !(await isActiveStripeSubscriber(email))) {
      return NextResponse.json(
        { error: "This email is not an active paid subscriber." },
        { status: 403 },
      );
    }

    if (
      access.level !== "admin" &&
      access.email &&
      access.email !== email
    ) {
      return NextResponse.json(
        { error: "Use the email address from your Stripe subscription." },
        { status: 403 },
      );
    }

    await query(
      `INSERT INTO digest_subscribers (email, active)
       VALUES ($1, TRUE)
       ON CONFLICT (email) DO UPDATE SET active = TRUE, subscribed_at = NOW()`,
      [email],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Subscribe failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const access = await getAccessForRequest(request);
    if (!access.full) {
      return NextResponse.json({ subscribed: false, eligible: false });
    }

    const email = access.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ subscribed: false, eligible: access.full });
    }

    const result = await query<{ active: boolean }>(
      `SELECT active FROM digest_subscribers WHERE email = $1`,
      [email],
    );

    return NextResponse.json({
      subscribed: Boolean(result.rows[0]?.active),
      eligible: true,
      email,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Status check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const access = await getAccessForRequest(request);
    if (!access.full) {
      return NextResponse.json({ error: "Subscriber access required" }, { status: 403 });
    }

    const body = (await request.json()) as { email?: string };
    const email = (body.email ?? access.email)?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    if (access.level !== "admin" && access.email && access.email !== email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await query(
      `UPDATE digest_subscribers SET active = FALSE WHERE email = $1`,
      [email],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unsubscribe failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
