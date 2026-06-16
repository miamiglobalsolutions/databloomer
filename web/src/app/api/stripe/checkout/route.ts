export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAppUrl, getStripe, getStripePriceId, stripeConfigured } from "@/lib/stripe/client";

export async function POST() {
  try {
    if (!stripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID in Vercel." },
        { status: 503 },
      );
    }

    const priceId = getStripePriceId();
    if (!priceId) {
      return NextResponse.json(
        { error: "STRIPE_PRICE_ID is not configured in Vercel." },
        { status: 503 },
      );
    }

    const appUrl = getAppUrl().replace(/\/$/, "");
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
  } catch (error) {
    console.error("Stripe checkout error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          hint:
            error.code === "resource_missing"
              ? "Check that STRIPE_PRICE_ID is a price_... ID and matches your Stripe mode (test vs live)."
              : undefined,
        },
        { status: 502 },
      );
    }

    const message = error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
