import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { AccessLoginForm } from "@/components/access-login-form";
import { StripeCheckoutButton } from "@/components/stripe-checkout-button";
import { SubscriberEmailLoginForm } from "@/components/subscriber-email-login-form";
import { DigestSubscribe } from "@/components/digest-subscribe";
import {
  SUBSCRIPTION_BENEFITS,
  SUBSCRIPTION_TAGLINE,
} from "@/lib/subscription/benefits";
import {
  APP_URL,
  CONTRACTOR_SEO_KEYWORDS,
  defaultOpenGraph,
} from "@/lib/site/seo";

export const metadata: Metadata = {
  title: "Roofing Lead Subscription — Miami-Dade Contractors",
  description:
    "Subscribe to DataBloomer: unlimited Miami-Dade roofing leads, full addresses, folio numbers, Bloom Zone maps, DataBloom Score, estimated job values, code violations, and weekly email updates for Florida roofers.",
  keywords: [
    ...CONTRACTOR_SEO_KEYWORDS,
    "Miami roofing leads subscription",
    "roofing contractor lead service",
    "DataBloomer subscription",
  ],
  alternates: { canonical: `${APP_URL}/subscribe` },
  openGraph: defaultOpenGraph(
    "Roofing Lead Subscription — Miami-Dade Contractors",
    "Full Miami-Dade roofing lead access: Bloom Zones, addresses, DataBloom Score, and weekly updates.",
    "/subscribe",
  ),
  twitter: {
    card: "summary_large_image",
    title: "DataBloomer Roofing Lead Subscription",
    description:
      "Miami-Dade aging roof leads, Bloom Zones, and canvassing tools for roofing contractors.",
  },
};

export default function SubscribePage() {
  const included = SUBSCRIPTION_BENEFITS.filter((b) => b.status === "included");
  const comingSoon = SUBSCRIPTION_BENEFITS.filter(
    (b) => b.status === "coming_soon",
  );

  return (
    <main className="flex-1">
      <SiteHeader active="subscribe" />

      <section className="border-b border-orange-200 bg-gradient-to-b from-orange-50 to-stone-50">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-600">
            DataBloomer Subscription
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
            What you get as a subscriber
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600">
            {SUBSCRIPTION_TAGLINE}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm text-stone-500">
            Free preview shows the lead list and scores with addresses blurred.
            Subscribers unlock the interactive Map View, full addresses, and
            everything needed to canvass and close jobs.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/promo"
              className="rounded-lg border border-stone-300 bg-white px-6 py-3 font-medium text-stone-800 hover:bg-stone-50"
            >
              Watch promo video
            </Link>
            <Link
              href="/dashboard?view=map"
              className="rounded-lg border border-stone-300 bg-white px-6 py-3 font-medium text-stone-800 hover:bg-stone-50"
            >
              Try free preview
            </Link>
            <StripeCheckoutButton />
          </div>
        </div>
      </section>

      <section id="sign-in" className="mx-auto max-w-4xl scroll-mt-24 px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-stone-900">
              Already subscribed? Sign in
            </h3>
            <p className="mt-1 text-sm text-stone-600">
              Enter the email you used at Stripe checkout to unlock this browser.
            </p>
            <div className="mt-4">
              <SubscriberEmailLoginForm />
            </div>
          </div>
          <AccessLoginForm
            target="subscriber"
            title="Have an access code?"
            subtitle="Use a manual subscriber code if we granted access directly."
          />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-2xl font-bold text-stone-900">
          Unlimited monthly access includes
        </h2>
        <p className="mt-2 text-stone-600">
          One flat subscription — no per-lead fees. Use these features all month
          long across Miami-Dade County.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {included.map((benefit) => (
            <BenefitCard key={benefit.id} benefit={benefit} />
          ))}
        </div>
      </section>

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold text-stone-900">
            Free preview vs subscriber
          </h2>
          <div className="mt-8 overflow-hidden rounded-xl border border-stone-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-100 text-stone-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Feature</th>
                  <th className="px-4 py-3 font-medium">Free preview</th>
                  <th className="px-4 py-3 font-medium">Subscriber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <CompareRow
                  feature="Interactive map view"
                  free="Locked preview"
                  paid="✓ Zoom, pan & pins"
                />
                <CompareRow
                  feature="List view"
                  free="✓ Sample leads"
                  paid="✓ Full county"
                />
                <CompareRow
                  feature="DataBloom Score"
                  free="✓ Visible"
                  paid="✓ Visible"
                />
                <CompareRow
                  feature="Bloom Zone filters"
                  free="✓ All tiers"
                  paid="✓ All tiers"
                />
                <CompareRow
                  feature="Street addresses"
                  free="Blurred"
                  paid="✓ Full address"
                />
                <CompareRow
                  feature="Folio numbers"
                  free="Hidden / blurred"
                  paid="✓ Full folio"
                />
                <CompareRow
                  feature="Estimated job value"
                  free="Hidden"
                  paid="✓ Relative job size guide"
                />
                <CompareRow
                  feature="Top Bloom ZIPs"
                  free="✓ Rankings"
                  paid="✓ Rankings"
                />
                <CompareRow
                  feature="Weekly email lead updates"
                  free="—"
                  paid="✓ Refreshed leads & hot ZIPs"
                />
                <CompareRow
                  feature="Code violation leads"
                  free="Limited preview"
                  paid="✓ Full access"
                />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <p className="text-sm leading-relaxed text-stone-600">
            <strong className="text-stone-800">About estimated job values:</strong>{" "}
            Projected re-roof figures are derived from county heated living area
            and a default cost-per-square-foot rate. They are not binding quotes
            — use them only to compare relative job size between leads when
            planning canvassing and sales priorities.
          </p>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold text-stone-900">Coming soon for subscribers</h2>
          <p className="mt-2 text-stone-600">
            We&apos;re building more tools to help Miami roofers win — included
            in your subscription as they launch.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {comingSoon.map((benefit) => (
              <li
                key={benefit.id}
                className="rounded-lg border border-dashed border-stone-300 bg-white px-4 py-3"
              >
                <p className="font-medium text-stone-800">{benefit.title}</p>
                <p className="mt-1 text-xs text-stone-500">{benefit.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-6 py-16">
        <DigestSubscribe />
        <p className="mt-6 text-center text-sm text-stone-500">
          Questions? Email{" "}
          <a
            href="mailto:hello@databloomer.com"
            className="text-orange-700 hover:underline"
          >
            hello@databloomer.com
          </a>
        </p>
        <p className="mt-2 text-center text-xs text-stone-400">
          Admin only: <Link href="/admin" className="underline">admin login</Link>
        </p>
      </section>
    </main>
  );
}

function BenefitCard({
  benefit,
}: {
  benefit: (typeof SUBSCRIPTION_BENEFITS)[number];
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        benefit.highlight
          ? "border-orange-300 bg-orange-50/60"
          : "border-stone-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg text-orange-600">✓</span>
        <div>
          <h3 className="font-semibold text-stone-900">{benefit.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            {benefit.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function CompareRow({
  feature,
  free,
  paid,
}: {
  feature: string;
  free: string;
  paid: string;
}) {
  return (
    <tr>
      <td className="px-4 py-3 font-medium text-stone-800">{feature}</td>
      <td className="px-4 py-3 text-stone-500">{free}</td>
      <td className="px-4 py-3 text-stone-800">{paid}</td>
    </tr>
  );
}
