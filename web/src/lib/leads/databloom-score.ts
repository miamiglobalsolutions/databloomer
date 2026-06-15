/** DataBloom Score tiers — used for Bloom Zones map and lead cards. */

export type BloomZoneTier = "low" | "moderate" | "high" | "replacement";

export type BloomZoneTierInfo = {
  tier: BloomZoneTier;
  label: string;
  shortLabel: string;
  color: string;
  minScore: number;
  maxScore: number;
};

export const BLOOM_ZONE_TIERS: BloomZoneTierInfo[] = [
  {
    tier: "low",
    label: "Low priority",
    shortLabel: "Low",
    color: "#14532d",
    minScore: 0,
    maxScore: 49,
  },
  {
    tier: "moderate",
    label: "Moderate opportunity",
    shortLabel: "Moderate",
    color: "#ca8a04",
    minScore: 50,
    maxScore: 64,
  },
  {
    tier: "high",
    label: "High opportunity",
    shortLabel: "High",
    color: "#ea580c",
    minScore: 65,
    maxScore: 79,
  },
  {
    tier: "replacement",
    label: "Roof replacement likely",
    shortLabel: "Replacement likely",
    color: "#dc2626",
    minScore: 80,
    maxScore: 100,
  },
];

export const DATABLOOM_SCORE_LABEL = "DataBloom Score";

export function getBloomZoneTier(score: number): BloomZoneTierInfo {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  return (
    BLOOM_ZONE_TIERS.find(
      (t) => clamped >= t.minScore && clamped <= t.maxScore,
    ) ?? BLOOM_ZONE_TIERS[0]
  );
}

export function getBloomZoneColor(score: number): string {
  return getBloomZoneTier(score).color;
}

export function formatDataBloomScore(score: number): string {
  return `${DATABLOOM_SCORE_LABEL} ${Math.round(score)}`;
}

export function filterLeadsByBloomZone<T extends { score: number }>(
  leads: T[],
  activeTiers: Set<BloomZoneTier>,
): T[] {
  if (activeTiers.size === 0) return [];
  return leads.filter((lead) =>
    activeTiers.has(getBloomZoneTier(lead.score).tier),
  );
}
