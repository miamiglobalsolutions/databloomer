"use client";

import {
  BLOOM_ZONE_TIERS,
  type BloomZoneTier,
} from "@/lib/leads/databloom-score";

type Props = {
  activeTiers: Set<BloomZoneTier>;
  onChange: (tiers: Set<BloomZoneTier>) => void;
};

export function BloomZoneFilter({ activeTiers, onChange }: Props) {
  function toggle(tier: BloomZoneTier) {
    const next = new Set(activeTiers);
    if (next.has(tier)) {
      next.delete(tier);
    } else {
      next.add(tier);
    }
    onChange(next);
  }

  function selectAll() {
    onChange(new Set(BLOOM_ZONE_TIERS.map((t) => t.tier)));
  }

  const noneSelected = activeTiers.size === 0;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Filter by Bloom Zone
          </p>
          <p className="text-xs text-stone-500">
            Show only leads in the selected color tiers.
          </p>
        </div>
        <button
          type="button"
          onClick={selectAll}
          className="text-xs font-medium text-orange-700 hover:underline"
        >
          Select all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {BLOOM_ZONE_TIERS.map((tier) => {
          const active = activeTiers.has(tier.tier);
          return (
            <button
              key={tier.tier}
              type="button"
              onClick={() => toggle(tier.tier)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 bg-stone-50 text-stone-500 line-through opacity-60"
              }`}
            >
              <span
                className="inline-block h-3 w-3 rounded-full ring-1 ring-white/50"
                style={{ backgroundColor: tier.color }}
              />
              {tier.shortLabel}
              <span className="opacity-75">
                ({tier.minScore}–{tier.maxScore})
              </span>
            </button>
          );
        })}
      </div>
      {noneSelected && (
        <p className="mt-2 text-xs text-amber-700">
          Select at least one zone to see leads.
        </p>
      )}
    </div>
  );
}

export function defaultBloomZoneTiers(): Set<BloomZoneTier> {
  return new Set(BLOOM_ZONE_TIERS.map((t) => t.tier));
}
