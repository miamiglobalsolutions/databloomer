import type Stripe from "stripe";
import {
  isActiveSubscriptionStatus,
  upsertStripeSubscriber,
} from "@/lib/subscription/stripe-subscribers";

function periodEndFromSubscription(
  subscription: Stripe.Subscription,
): Date | null {
  const end = subscription.items.data[0]?.current_period_end;
  return end ? new Date(end * 1000) : null;
}

export async function syncSubscriptionRecord(
  subscription: Stripe.Subscription,
  email?: string | null,
): Promise<void> {
  const customerEmail =
    email ??
    (typeof subscription.customer === "object" && subscription.customer
      ? ("email" in subscription.customer ? subscription.customer.email : null)
      : null);

  if (!customerEmail) return;

  await upsertStripeSubscriber({
    email: customerEmail,
    stripeCustomerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id ?? null,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodEnd: periodEndFromSubscription(subscription),
  });
}

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
): Promise<void> {
  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) return;

  if (session.subscription) {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await syncSubscriptionRecord(subscription, email);
    return;
  }

  if (session.payment_status === "paid") {
    await upsertStripeSubscriber({
      email,
      stripeCustomerId:
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id ?? null,
      stripeSubscriptionId: null,
      status: "active",
      currentPeriodEnd: null,
    });
  }
}

export async function handleSubscriptionChanged(
  subscription: Stripe.Subscription,
): Promise<void> {
  await syncSubscriptionRecord(subscription);
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  stripe: Stripe,
): Promise<void> {
  let email: string | null = null;
  if (typeof subscription.customer === "string") {
    const customer = await stripe.customers.retrieve(subscription.customer);
    if (!customer.deleted && "email" in customer) {
      email = customer.email;
    }
  }

  if (!email) {
    await syncSubscriptionRecord({ ...subscription, status: "canceled" } as Stripe.Subscription);
    return;
  }

  await upsertStripeSubscriber({
    email,
    stripeCustomerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id ?? null,
    stripeSubscriptionId: subscription.id,
    status: "canceled",
    currentPeriodEnd: periodEndFromSubscription(subscription),
  });

  const { query } = await import("@/lib/db/client");
  await query(`UPDATE digest_subscribers SET active = FALSE WHERE email = $1`, [
    email.trim().toLowerCase(),
  ]);
}

export { isActiveSubscriptionStatus };
