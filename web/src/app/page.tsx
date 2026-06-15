import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-sm font-bold text-white">
              DB
            </span>
            <span className="text-lg font-semibold tracking-tight">DataBloomer</span>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Open dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-orange-600">
          Miami-Dade roofing leads
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Find homes with roofs approaching end of life — before your competitors do.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-stone-600">
          DataBloomer monitors Miami-Dade permits and property records to surface
          aging roof leads in the 13–17 year replacement window, plus active
          roofing code violations.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/dashboard?type=aging_roof"
            className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
          >
            View aging roof leads
          </Link>
          <Link
            href="/dashboard?view=map"
            className="rounded-lg border border-stone-300 bg-white px-6 py-3 font-medium text-stone-800 hover:bg-stone-50"
          >
            Map view
          </Link>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 sm:grid-cols-3">
          <FeatureCard
            title="Aging roofs (primary)"
            body="Homes built ~15 years ago or with last re-roof permit in the 13–17 year window. Scored by value and roof age proximity."
          />
          <FeatureCard
            title="Historical permit backfill"
            body="County GIS only keeps ~3 years. Plug in Shovels API for high-confidence 15-year permit history."
          />
          <FeatureCard
            title="Code violations"
            body="Open roof-related enforcement cases — hot leads when owners already have a compliance problem."
          />
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
