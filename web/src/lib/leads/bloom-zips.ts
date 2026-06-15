import type { LeadRecord } from "@/lib/leads/types";
import { getBloomZoneTier } from "@/lib/leads/databloom-score";

export type BloomZipSummary = {
  zip: string;
  label: string;
  leadCount: number;
  avgScore: number;
  highOpportunityCount: number;
  replacementLikelyCount: number;
  bloomRank: number;
};

/** Rank ZIPs for canvassing — higher avg score + more high-tier leads wins. */
export function computeTopBloomZips(
  leads: LeadRecord[],
  limit = 5,
): BloomZipSummary[] {
  const byZip = new Map<
    string,
    { scores: number[]; high: number; replacement: number }
  >();

  for (const lead of leads) {
    const zip = lead.zip?.slice(0, 5) ?? "unknown";
    const bucket = byZip.get(zip) ?? { scores: [], high: 0, replacement: 0 };
    bucket.scores.push(lead.score);
    const tier = getBloomZoneTier(lead.score).tier;
    if (tier === "high" || tier === "replacement") bucket.high += 1;
    if (tier === "replacement") bucket.replacement += 1;
    byZip.set(zip, bucket);
  }

  return [...byZip.entries()]
    .filter(([zip, data]) => zip !== "unknown" && data.scores.length >= 3)
    .map(([zip, data]) => {
      const avgScore =
        data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      return {
        zip,
        label: zip,
        leadCount: data.scores.length,
        avgScore: Math.round(avgScore * 10) / 10,
        highOpportunityCount: data.high,
        replacementLikelyCount: data.replacement,
        bloomRank: avgScore * 0.6 + data.high * 2 + data.replacement * 5,
      };
    })
    .sort((a, b) => b.bloomRank - a.bloomRank)
    .slice(0, limit);
}
