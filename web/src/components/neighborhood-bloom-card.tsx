import Link from "next/link";
import {
  MOMENTUM_LABEL_COPY,
  type NeighborhoodBloomForecast,
} from "@/lib/leads/neighborhood-bloom";

const MOMENTUM_STYLES = {
  rising: "bg-red-100 text-red-800",
  active: "bg-orange-100 text-orange-900",
  emerging: "bg-amber-100 text-amber-900",
  steady: "bg-stone-100 text-stone-700",
  cooling: "bg-sky-100 text-sky-900",
} as const;

type Props = {
  forecast: NeighborhoodBloomForecast;
  areaName: string;
};

export function NeighborhoodBloomCard({ forecast, areaName }: Props) {
  const momentum = MOMENTUM_LABEL_COPY[forecast.momentumLabel];

  return (
    <section className="mt-10 rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
        Neighborhood Bloom forecast
      </p>
      <h2 className="mt-2 text-xl font-semibold text-stone-900">
        {areaName} ({forecast.zip}) — {momentum.title}
      </h2>
      <p className="mt-2 text-sm text-stone-600">{momentum.description}</p>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-white/80 px-4 py-3">
          <dt className="text-xs font-medium uppercase text-stone-500">
            Bloom probability
          </dt>
          <dd className="text-2xl font-bold text-red-700">
            {forecast.bloomProbability}%
          </dd>
        </div>
        <div className="rounded-lg bg-white/80 px-4 py-3">
          <dt className="text-xs font-medium uppercase text-stone-500">
            Neighborhood score
          </dt>
          <dd className="text-2xl font-bold text-stone-900">
            {forecast.neighborhoodScore}
          </dd>
        </div>
        <div className="rounded-lg bg-white/80 px-4 py-3">
          <dt className="text-xs font-medium uppercase text-stone-500">
            Aging roofs in ZIP
          </dt>
          <dd className="text-lg font-semibold text-stone-900">
            {forecast.agingLeadCount}
          </dd>
        </div>
        <div className="rounded-lg bg-white/80 px-4 py-3">
          <dt className="text-xs font-medium uppercase text-stone-500">
            Re-roof permits (90d)
          </dt>
          <dd className="text-lg font-semibold text-stone-900">
            {forecast.recentPermits90d}
            {forecast.momentumPct !== 0 ? (
              <span className="ml-2 text-sm font-medium text-red-700">
                {forecast.momentumPct > 0 ? "+" : ""}
                {forecast.momentumPct}% vs prior quarter
              </span>
            ) : null}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-stone-600">
        Score blends aging inventory, permit momentum, DataBloom lead quality, and
        untapped replacement pressure ({forecast.untappedRatio} aging roofs per
        recent re-roof).
      </p>

      <span
        className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${MOMENTUM_STYLES[forecast.momentumLabel]}`}
      >
        {momentum.title}
      </span>

      <div className="mt-6">
        <Link
          href={`/dashboard?type=aging_roof&zip=${forecast.zip}&view=map`}
          className="text-sm font-medium text-orange-700 underline"
        >
          Open bloom forecast on map →
        </Link>
      </div>
    </section>
  );
}
