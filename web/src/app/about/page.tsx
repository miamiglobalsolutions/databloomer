import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { DigestSubscribe } from "@/components/digest-subscribe";
import { MIAMI_AREA_PAGES } from "@/lib/miami-dade/areas";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://databloomer.com";

export const metadata: Metadata = {
  title: "About DataBloomer — Miami Roofing Leads & Bloom Zones",
  description:
    "DataBloomer helps Miami-Dade roofing contractors find aging roof leads, code enforcement opportunities, and canvassing routes with Bloom Zones maps and the DataBloom Score.",
  keywords: [
    "Miami roofing leads",
    "Miami-Dade roofing contractor leads",
    "roof replacement leads Miami",
    "aging roof leads Florida",
    "roofing sales leads Miami-Dade",
    "canvassing routes Miami roofers",
    "roofing lead generation Miami",
    "Miami roof replacement window",
    "Brickell roofing leads",
    "South Beach roofing contractor",
    "Kendall roof replacement",
    "Homestead roofing leads",
    "Coral Gables roof leads",
    "Miami code violation roofing",
    "DataBloom Score",
    "Bloom Zones heat map",
  ],
  alternates: {
    canonical: `${appUrl}/about`,
  },
  openGraph: {
    title: "About DataBloomer — Miami Roofing Lead Intelligence",
    description:
      "Find aging roofs and enforcement leads across Miami-Dade with Bloom Zones and the DataBloom Score.",
    url: `${appUrl}/about`,
    siteName: "DataBloomer",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DataBloomer",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: appUrl,
  description:
    "Miami-Dade roofing lead intelligence for contractors — aging roof leads, Bloom Zones color-coded maps, and DataBloom Score ranking.",
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Miami-Dade County, Florida",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function AboutPage() {
  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader active="about" />

      <article className="mx-auto max-w-3xl px-6 py-16">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-orange-600">
          About DataBloomer
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-stone-900">
          Miami-Dade roofing lead intelligence built for canvassing crews
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-stone-600">
          DataBloomer helps roofing contractors in Miami-Dade County find homes
          approaching roof end-of-life, spot open code enforcement cases, and
          deploy canvassers to the highest-opportunity neighborhoods — before
          competitors do.
        </p>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold text-stone-900">
            Who DataBloomer is for
          </h2>
          <p className="leading-relaxed text-stone-600">
            Residential and commercial roofing companies serving Miami,
            Miami Beach, Brickell, Coral Gables, Kendall, Homestead, Doral,
            Hialeah, Aventura, Cutler Bay, Palmetto Bay, and all of unincorporated
            Miami-Dade. If you run door-to-door canvassing, storm-season marketing,
            or neighborhood blitz campaigns, DataBloomer tells you where to go
            next.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold text-stone-900">
            Bloom Zones — color-coded canvassing map
          </h2>
          <p className="leading-relaxed text-stone-600">
            Bloom Zones show every lead as a color-coded pin by DataBloom Score.
            Dark green is lower priority. Yellow is moderate opportunity. Orange
            is high opportunity. Red means roof replacement is likely — send
            canvassers to those blocks first.
          </p>
          <ul className="list-disc space-y-2 pl-6 text-stone-600">
            <li>Dark green — low priority (DataBloom Score 0–49)</li>
            <li>Yellow — moderate opportunity (50–64)</li>
            <li>Orange — high opportunity (65–79)</li>
            <li>Red — roof replacement likely (80–100)</li>
          </ul>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold text-stone-900">
            DataBloom Score — how leads are ranked
          </h2>
          <p className="leading-relaxed text-stone-600">
            Every lead receives a DataBloom Score from 0 to 100. For aging roofs,
            we combine roof age (13–17 year sweet spot plus aging roofs up to 25
            years),
            Miami-Dade property appraiser data, permit history, and home value.
            Higher scores mean a stronger replacement opportunity. Code enforcement
            leads are scored by case urgency and open status.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold text-stone-900">
            Data sources
          </h2>
          <p className="leading-relaxed text-stone-600">
            DataBloomer ingests public Miami-Dade County GIS data: property
            appraiser parcels (year built, assessed value, location), building
            permits, and code enforcement cases. Leads refresh on a weekly
            schedule so your team works from current county records.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold text-stone-900">
            Miami roofing keywords we cover
          </h2>
          <p className="leading-relaxed text-stone-600">
            Whether you search for Miami roof replacement leads, aging shingle
            roof prospects, tile roof replacement in South Florida, Miami-Dade
            roofing sales leads, hurricane season re-roof targets, or code
            violation roofing opportunities — DataBloomer surfaces actionable
            addresses and ZIP-level Bloom Zones for your crew.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold text-stone-900">
            Neighborhood lead pages
          </h2>
          <p className="leading-relaxed text-stone-600">
            Explore roofing leads by Miami-Dade market:
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {MIAMI_AREA_PAGES.map((area) => (
              <li key={area.slug}>
                <Link
                  href={`/areas/${area.slug}`}
                  className="text-orange-700 hover:underline"
                >
                  {area.name} roofing leads ({area.zip})
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <DigestSubscribe />
        </section>

        <section className="mt-12 space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Google Search Console
          </h2>
          <p className="text-sm leading-relaxed text-stone-600">
            After deploy, add your site at{" "}
            <a
              href="https://search.google.com/search-console"
              className="text-orange-700 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              Google Search Console
            </a>
            , verify ownership (set{" "}
            <code className="rounded bg-stone-200 px-1">GOOGLE_SITE_VERIFICATION</code>{" "}
            in Vercel env vars), and submit{" "}
            <code className="rounded bg-stone-200 px-1">/sitemap.xml</code>.
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/dashboard?view=map"
            className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
          >
            Open Bloom Zones map
          </Link>
          <Link
            href="/dashboard?type=aging_roof"
            className="rounded-lg border border-stone-300 bg-white px-6 py-3 font-medium text-stone-800 hover:bg-stone-50"
          >
            View aging roof leads
          </Link>
        </div>
      </article>
    </main>
  );
}
