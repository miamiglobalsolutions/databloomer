export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getStripe, stripeConfigured } from "@/lib/stripe/client";
import { setAccessCookies } from "@/lib/subscription/cookies";
import {
  handleCheckoutSessionCompleted,
  isActiveSubscriptionStatus,
} from "@/lib/stripe/webhook-handlers";
import { isActiveStripeSubscriber } from "@/lib/subscription/stripe-subscribers";

export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { sessionId?: string };
    const sessionId = body.sessionId?.trim();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json(
        { error: "Checkout session is not paid yet." },
        { status: 402 },
      );
    }

    await handleCheckoutSessionCompleted(session, stripe);

    const email = (
      session.customer_details?.email ??
      session.customer_email ??
      ""
    )
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "No email found on checkout session." },
        { status: 400 },
      );
    }

    const subscription =
      session.subscription && typeof session.subscription !== "string"
        ? session.subscription
        : null;

    const active =
      (subscription && isActiveSubscriptionStatus(subscription.status)) ||
      (await isActiveStripeSubscriber(email));

    if (!active) {
      return NextResponse.json(
        { error: "Subscription is not active yet. Try again in a minute." },
        { status: 403 },
      );
    }

    const res = NextResponse.json({ ok: true, level: "subscriber", email });
    setAccessCookies(res, { level: "subscriber", email });
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
