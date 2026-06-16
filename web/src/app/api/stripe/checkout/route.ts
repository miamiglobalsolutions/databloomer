export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAppUrl, getStripe, stripeConfigured } from "@/lib/stripe/client";

export async function POST() {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID." },
      { status: 503 },
    );
  }

  const priceId = process.env.STRIPE_PRICE_ID?.trim();
  if (!priceId) {
    return NextResponse.json(
      { error: "STRIPE_PRICE_ID is not configured." },
      { status: 503 },
    );
  }

  const appUrl = getAppUrl();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/subscribe?canceled=1`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
