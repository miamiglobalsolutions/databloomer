import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getFeaturedAreas, MIAMI_AREA_PAGES } from "@/lib/miami-dade/areas";
import { AGING_ROOF_INDEX_PATH } from "@/lib/reports/aging-roof-index";
import {
  CONTRACTOR_SEO_KEYWORDS,
  HOME_PAGE_DESCRIPTION,
  HOME_PAGE_TITLE,
  buildHomePageJsonLd,
  defaultOpenGraph,
  APP_URL,
} from "@/lib/site/seo";

export const metadata: Metadata = {
  title: { absolute: HOME_PAGE_TITLE },
  description: HOME_PAGE_DESCRIPTION,
  keywords: [...CONTRACTOR_SEO_KEYWORDS],
  alternates: { canonical: APP_URL },
  openGraph: defaultOpenGraph(
    "Miami Roofing Leads for Contractors — DataBloomer",
    HOME_PAGE_DESCRIPTION,
  ),
  twitter: {
    card: "summary_large_image",
    title: "Miami Roofing Leads for Contractors — DataBloomer",
    description: HOME_PAGE_DESCRIPTION,
  },
};

export default function HomePage() {
  const featured = getFeaturedAreas();
  const jsonLd = buildHomePageJsonLd();

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader active="home" />

      <section className="border-b border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <p className="text-sm text-stone-700">
            <span className="font-semibold text-stone-900">New report:</span>{" "}
            Miami-Dade Aging Roof Index — top 10 ZIPs ahead of 2026 hurricane
            season
          </p>
          <Link
            href={AGING_ROOF_INDEX_PATH}
            className="shrink-0 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Read the full report
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-orange-600">
          Miami-Dade roofing contractor leads
        </p>
        <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Miami roofing leads for contractors — find aging roofs before your
          competitors do
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-stone-600">
          DataBloomer is a roofing lead subscription built for Miami-Dade
          contractors. We monitor county permits and property records to surface
          aging roof leads in the 13–17 year sweet spot plus homes up to 25 years,
          open code enforcement cases, and Bloom Zones that show canvassing crews
          exactly where to knock.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/dashboard?type=aging_roof&view=map"
            className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
          >
            Open Bloom Zones
          </Link>
          <Link
            href="/dashboard?type=aging_roof"
            className="rounded-lg border border-stone-300 bg-white px-6 py-3 font-medium text-stone-800 hover:bg-stone-50"
          >
            View lead list
          </Link>
          <Link
            href="/promo"
            className="rounded-lg border border-stone-300 bg-white px-6 py-3 font-medium text-stone-800 hover:bg-stone-50"
          >
            Watch promo video
          </Link>
          <Link
            href="/subscribe"
            className="rounded-lg border border-orange-300 bg-orange-50 px-6 py-3 font-medium text-orange-900 hover:bg-orange-100"
          >
            Roofing lead subscription
          </Link>
        </div>

        <div className="mt-12 max-w-3xl rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/80 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-800">
            Simple ROI
          </p>
          <p className="mt-3 text-lg leading-relaxed text-stone-800 sm:text-xl">
            Close one{" "}
            <strong className="font-semibold text-stone-900">$25,000</strong> re-roof
            from DataBloomer leads in a quarter, and that&apos;s roughly{" "}
            <strong className="font-semibold text-orange-800">16× return</strong> on
            the quarter&apos;s subscription cost — before the second or third job.
          </p>
          <p className="mt-3 text-sm text-stone-600">
            One good week of canvassing in the right Bloom Zone can cover months of
            access. When the data puts your crew on the right doors, the subscription
            sells itself.
          </p>
          <p className="mt-4 text-xs text-stone-500">
            Example assumes one closed job vs. a ~$500/month plan (~$1,500 per
            quarter). Your results will vary.
          </p>
          <Link
            href="/subscribe"
            className="mt-6 inline-flex rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
          >
            See subscription benefits
          </Link>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            title="Interactive Map View"
            body="Subscribers zoom and pan color-coded Bloom Zone pins from green to red by DataBloom Score — see exactly where to send canvassers."
          />
          <FeatureCard
            title="DataBloom Score"
            body="Every lead ranked 0–100 by roof age, home value, and permit confidence so your sales team works the best prospects first."
          />
          <FeatureCard
            title="Estimated job value"
            body="Compare projected re-roof size on every lead from county heated area — a guide to weigh bigger jobs vs smaller ones, not a binding quote."
          />
          <FeatureCard
            title="Code violations"
            body="Open structure and housing enforcement cases — homeowners who may already need roof work."
          />
        </div>
      </section>

      <section className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-bold text-stone-900">
            Roofing lead generation for Miami-Dade contractors
          </h2>
          <p className="mt-4 leading-relaxed text-stone-600">
            Whether you search for Miami roofing leads, Miami-Dade roof replacement
            prospects, aging shingle roof opportunities, or roof canvassing routes
            in Kendall, Brickell, Coral Gables, Homestead, or Hialeah — DataBloomer
            ranks every address with the DataBloom Score and maps replacement-likely
            homes in Bloom Zones.
          </p>
          <p className="mt-4 leading-relaxed text-stone-600">
            Unlike generic lead lists, we combine county permit history, property
            appraiser data, code enforcement cases, and neighborhood bloom forecast
            so Florida roofing contractors can deploy crews to high-opportunity ZIPs
            first. Subscribe for full addresses, folio numbers, interactive maps, and
            weekly lead updates.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/about"
              className="font-medium text-orange-700 hover:underline"
            >
              How DataBloomer works →
            </Link>
            <Link
              href="/areas"
              className="font-medium text-orange-700 hover:underline"
            >
              Browse Miami-Dade markets →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-orange-600">
                Markets we cover
              </p>
              <h2 className="mt-2 text-2xl font-bold text-stone-900">
                Roofing leads in every major Miami-Dade market
              </h2>
              <p className="mt-2 max-w-2xl text-stone-600">
                {MIAMI_AREA_PAGES.length} city, town, village, and neighborhood
                pages with ZIP-level Bloom forecast and aging roof data.
              </p>
            </div>
            <Link
              href="/areas"
              className="shrink-0 rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-100"
            >
              View all markets
            </Link>
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {featured.map((area) => (
              <li key={area.slug}>
                <Link
                  href={`/areas/${area.slug}`}
                  className="block rounded-xl border border-stone-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-sm"
                >
                  <span className="font-semibold text-stone-900">{area.name}</span>
                  <span className="mt-1 block text-xs text-stone-500">
                    ZIP {area.zip}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-stone-200 p-6">
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{body}</p>
    </div>
  );
}
