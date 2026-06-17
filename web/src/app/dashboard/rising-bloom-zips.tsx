"use client";

import Link from "next/link";
import type { NeighborhoodBloomForecast } from "@/lib/leads/neighborhood-bloom";
import { MOMENTUM_LABEL_COPY } from "@/lib/leads/neighborhood-bloom";

const MOMENTUM_STYLES = {
  rising: "bg-red-100 text-red-800",
  active: "bg-orange-100 text-orange-900",
  emerging: "bg-amber-100 text-amber-900",
  steady: "bg-stone-100 text-stone-700",
  cooling: "bg-sky-100 text-sky-900",
} as const;

type Props = {
  forecasts: NeighborhoodBloomForecast[];
  activeZip: string;
  preview?: boolean;
  onSelectZip: (zip: string) => void;
};

export function RisingBloomZipsPanel({
  forecasts,
  activeZip,
  preview,
  onSelectZip,
}: Props) {
  const rising = [...forecasts]
    .sort((a, b) => b.neighborhoodScore - a.neighborhoodScore)
    .slice(0, 5);

  if (rising.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-stone-800">
          Neighborhood Bloom forecast
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          Run ingest to load permit trends and aging-roof inventory by ZIP.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-gradient-to-b from-red-50/80 to-white p-4">
      <h2 className="text-sm font-semibold text-stone-900">
        Neighborhood Bloom forecast
      </h2>
      <p className="mt-1 text-xs text-stone-600">
        ZIPs ranked by aging inventory, permit momentum, and replacement
        pressure.
      </p>
      {preview ? (
        <p className="mt-2 text-xs text-orange-800">
          Preview: top 5 only.{" "}
          <Link href="/subscribe" className="font-medium underline">
            Subscribe
          </Link>{" "}
          for full forecast scores.
        </p>
      ) : null}
      <ol className="mt-3 space-y-2">
        {rising.map((row, index) => {
          const active = activeZip === row.zip;
          const momentum = MOMENTUM_LABEL_COPY[row.momentumLabel];
          return (
            <li key={row.zip}>
              <button
                type="button"
                onClick={() => onSelectZip(row.zip)}
                className={`flex w-full flex-col gap-1 rounded-lg border px-3 py-2 text-left text-sm transition ${
                  active
                    ? "border-red-600 bg-white shadow-sm"
                    : "border-stone-200 bg-white/90 hover:border-stone-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-700 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-medium text-stone-900">{row.zip}</span>
                    <span className="block text-xs text-stone-500">
                      {row.agingLeadCount} aging roofs · {row.recentPermits90d}{" "}
                      permits (90d)
                      {row.momentumPct !== 0
                        ? ` · ${row.momentumPct > 0 ? "+" : ""}${row.momentumPct}% momentum`
                        : ""}
                    </span>
                  </span>
                  {!preview && row.bloomProbability != null ? (
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-bold text-red-700">
                        {row.bloomProbability}%
                      </span>
                      <span className="text-[10px] uppercase text-stone-500">
                        bloom
                      </span>
                    </span>
                  ) : null}
                </div>
                <span
                  className={`ml-10 inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${MOMENTUM_STYLES[row.momentumLabel]}`}
                >
                  {momentum.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
