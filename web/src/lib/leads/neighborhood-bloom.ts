export type BloomMomentumLabel =
  | "rising"
  | "active"
  | "emerging"
  | "steady"
  | "cooling";

export type NeighborhoodBloomForecast = {
  zip: string;
  neighborhoodScore: number;
  bloomProbability: number;
  momentumLabel: BloomMomentumLabel;
  momentumPct: number;
  agingLeadCount: number;
  recentPermits90d: number;
  priorPermits90d: number;
  permits12mo: number;
  avgLeadScore: number;
  untappedRatio: number;
  lat: number | null;
  lng: number | null;
};

export type ZipBloomStats = {
  zip: string;
  agingLeadCount: number;
  avgLeadScore: number;
  recentPermits90d: number;
  priorPermits90d: number;
  permits12mo: number;
  lat: number | null;
  lng: number | null;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function momentumLabelFrom(
  momentumPct: number,
  recentPermits90d: number,
  permits12mo: number,
  untappedRatio: number,
): BloomMomentumLabel {
  if (momentumPct <= -15) return "cooling";
  if (momentumPct >= 25 || (recentPermits90d >= 8 && momentumPct > 0)) {
    return "rising";
  }
  if (permits12mo >= 20 && recentPermits90d >= 5) return "active";
  if (untappedRatio >= 15 && momentumPct >= 0) return "emerging";
  return "steady";
}

export function computeNeighborhoodBloomForecasts(
  rows: ZipBloomStats[],
): NeighborhoodBloomForecast[] {
  const eligible = rows.filter((r) => r.agingLeadCount >= 3);
  if (eligible.length === 0) return [];

  const medianLeads = median(eligible.map((r) => r.agingLeadCount));
  const medianUntapped = median(
    eligible.map((r) => r.agingLeadCount / (r.permits12mo + 1)),
  );

  return eligible
    .map((row) => {
      const momentumPct =
        row.priorPermits90d > 0
          ? Math.round(
              ((row.recentPermits90d - row.priorPermits90d) /
                row.priorPermits90d) *
                100,
            )
          : row.recentPermits90d > 0
            ? 100
            : 0;

      const inventoryScore = clamp(
        (row.agingLeadCount / Math.max(medianLeads, 1)) * 55,
        0,
        100,
      );
      const momentumScore = clamp(50 + momentumPct * 0.5, 0, 100);
      const leadScore = clamp(row.avgLeadScore, 0, 100);
      const untappedRatio = row.agingLeadCount / (row.permits12mo + 1);
      const untappedScore = clamp(
        (untappedRatio / Math.max(medianUntapped, 1)) * 55,
        0,
        100,
      );

      const neighborhoodScore = Math.round(
        inventoryScore * 0.35 +
          momentumScore * 0.25 +
          leadScore * 0.25 +
          untappedScore * 0.15,
      );

      const bloomProbability = Math.round(
        neighborhoodScore * 0.65 + momentumScore * 0.35,
      );

      return {
        zip: row.zip,
        neighborhoodScore,
        bloomProbability,
        momentumLabel: momentumLabelFrom(
          momentumPct,
          row.recentPermits90d,
          row.permits12mo,
          untappedRatio,
        ),
        momentumPct,
        agingLeadCount: row.agingLeadCount,
        recentPermits90d: row.recentPermits90d,
        priorPermits90d: row.priorPermits90d,
        permits12mo: row.permits12mo,
        avgLeadScore: Math.round(row.avgLeadScore * 10) / 10,
        untappedRatio: Math.round(untappedRatio * 10) / 10,
        lat: row.lat,
        lng: row.lng,
      };
    })
    .sort((a, b) => b.neighborhoodScore - a.neighborhoodScore);
}

export const MOMENTUM_LABEL_COPY: Record<
  BloomMomentumLabel,
  { title: string; description: string }
> = {
  rising: {
    title: "Rising bloom",
    description: "Re-roof permits accelerating vs last quarter.",
  },
  active: {
    title: "Active bloom",
    description: "Heavy recent permit volume — crews are already here.",
  },
  emerging: {
    title: "Emerging bloom",
    description: "Large aging inventory with early permit momentum.",
  },
  steady: {
    title: "Steady",
    description: "Stable permit activity with solid aging-roof supply.",
  },
  cooling: {
    title: "Cooling",
    description: "Permit activity slowed vs the prior quarter.",
  },
};
