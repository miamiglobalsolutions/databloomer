import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function stripeConfigured(): boolean {
  return Boolean(sanitizeEnv(process.env.STRIPE_SECRET_KEY));
}

export function getStripe(): Stripe {
  const key = sanitizeEnv(process.env.STRIPE_SECRET_KEY);
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function getStripePriceId(): string | null {
  const priceId = sanitizeEnv(process.env.STRIPE_PRICE_ID);
  if (!priceId) return null;
  if (!priceId.startsWith("price_")) {
    throw new Error(
      `STRIPE_PRICE_ID must start with "price_" (got "${priceId.slice(0, 12)}..."). Use the Price ID, not the Product ID.`,
    );
  }
  return priceId;
}

function sanitizeEnv(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.replace(/^["']|["']$/g, "");
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://databloomer.com";
}
