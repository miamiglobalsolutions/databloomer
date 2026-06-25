import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getFeaturedAreas, MIAMI_AREA_PAGES } from "@/lib/miami-dade/areas";

export default function HomePage() {
  const featured = getFeaturedAreas();

  return (
    <main className="flex-1">
      <SiteHeader active="home" />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-orange-600">
          Miami-Dade roofing leads
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Find homes with roofs approaching end of life — before your competitors
          do.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-stone-600">
          DataBloomer monitors Miami-Dade permits and property records to surface
          aging roof leads in the 13–17 year sweet spot plus homes up to 25 years,
          plus open code enforcement cases. Bloom Zones show your canvassing crews
          exactly where to go.
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
            Watch 40s overview
          </Link>
          <Link
            href="/subscribe"
            className="rounded-lg border border-orange-300 bg-orange-50 px-6 py-3 font-medium text-orange-900 hover:bg-orange-100"
          >
            What you get as a subscriber
          </Link>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 sm:grid-cols-3">
          <FeatureCard
            title="Interactive Map View"
            body="Subscribers zoom and pan color-coded Bloom Zone pins from green to red by DataBloom Score — see exactly where to send canvassers."
          />
          <FeatureCard
            title="DataBloom Score"
            body="Every lead ranked 0–100 by roof age, home value, and permit confidence so your sales team works the best prospects first."
          />
          <FeatureCard
            title="Code violations"
            body="Open structure and housing enforcement cases — homeowners who may already need roof work."
          />
        </div>
      </section>

      <section className="border-t border-stone-200 bg-stone-50">
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
