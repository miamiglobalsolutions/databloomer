"use client";

import type { BloomZipSummary } from "@/lib/leads/bloom-zips";
import { getBloomZoneColor } from "@/lib/leads/databloom-score";

type Props = {
  zips: BloomZipSummary[];
  activeZip: string;
  onSelectZip: (zip: string) => void;
};

export function TopBloomZipsPanel({ zips, activeZip, onSelectZip }: Props) {
  if (zips.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-stone-800">Top Bloom ZIPs</h2>
        <p className="mt-2 text-sm text-stone-500">
          Load more leads to see ranked ZIP opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4">
      <h2 className="text-sm font-semibold text-stone-900">Top Bloom ZIPs</h2>
      <p className="mt-1 text-xs text-stone-600">
        Send canvassers to these areas first this week.
      </p>
      <ol className="mt-3 space-y-2">
        {zips.map((row, index) => {
          const active = activeZip === row.zip;
          const color = getBloomZoneColor(Math.round(row.avgScore));
          return (
            <li key={row.zip}>
              <button
                type="button"
                onClick={() => onSelectZip(row.zip)}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${
                  active
                    ? "border-orange-600 bg-white shadow-sm"
                    : "border-stone-200 bg-white/80 hover:border-stone-300"
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-medium text-stone-900">{row.zip}</span>
                  <span className="block text-xs text-stone-500">
                    {row.leadCount} leads · avg {row.avgScore}
                    {row.replacementLikelyCount > 0
                      ? ` · ${row.replacementLikelyCount} replacement-likely`
                      : ""}
                  </span>
                </span>
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                  title="Average zone color"
                />
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
