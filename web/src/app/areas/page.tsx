import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import {
  getAreasByRegion,
  MIAMI_AREA_PAGES,
} from "@/lib/miami-dade/areas";
import { AREA_REGION_LABELS, AREA_REGION_ORDER } from "@/lib/miami-dade/area-regions";
import { APP_URL, CONTRACTOR_SEO_KEYWORDS, defaultOpenGraph } from "@/lib/site/seo";

export const metadata: Metadata = {
  title: "Miami-Dade Roofing Lead Markets — Cities, ZIPs & Neighborhoods",
  description:
    "Browse DataBloomer roofing lead pages for every major Miami-Dade city, town, village, and neighborhood. Aging roof leads, Bloom Zones, ZIP-level bloom forecast, and contractor canvassing data.",
  keywords: [
    ...CONTRACTOR_SEO_KEYWORDS,
    "Miami-Dade roofing leads by city",
    "Miami neighborhood roofing leads",
    "Florida roofing contractor markets",
    "Miami-Dade ZIP roofing leads",
  ],
  alternates: { canonical: `${APP_URL}/areas` },
  openGraph: defaultOpenGraph(
    "Miami-Dade Roofing Lead Markets — DataBloomer",
    "Roofing lead pages for cities and neighborhoods across Miami-Dade County.",
    "/areas",
  ),
};

export default function AreasIndexPage() {
  const byRegion = getAreasByRegion();

  return (
    <main className="flex-1">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-orange-600">
          Markets we cover
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-stone-900">
          Miami-Dade roofing leads by city &amp; neighborhood
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-stone-600">
          DataBloomer publishes local lead pages for {MIAMI_AREA_PAGES.length}{" "}
          Miami-Dade markets — incorporated cities, villages, and major
          neighborhoods. Each page links to live Bloom Zones, aging roof lists,
          and Neighborhood Bloom forecast for that ZIP.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/dashboard?type=aging_roof&view=map"
            className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
          >
            Open county map
          </Link>
          <Link
            href="/subscribe"
            className="rounded-lg border border-stone-300 bg-white px-6 py-3 font-medium text-stone-800 hover:bg-stone-50"
          >
            Subscribe for full access
          </Link>
        </div>

        <div className="mt-14 space-y-12">
          {AREA_REGION_ORDER.map((region) => {
            const areas = byRegion[region];
            if (areas.length === 0) return null;

            return (
              <section key={region} id={region} className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-stone-900">
                  {AREA_REGION_LABELS[region]}
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {areas.map((area) => (
                    <li key={area.slug}>
                      <Link
                        href={`/areas/${area.slug}`}
                        className="flex flex-col rounded-lg border border-stone-200 bg-white px-4 py-3 transition hover:border-orange-300 hover:shadow-sm"
                      >
                        <span className="font-medium text-stone-900">
                          {area.name}
                        </span>
                        <span className="text-xs text-stone-500">
                          ZIP {area.zip} · {area.kind}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
