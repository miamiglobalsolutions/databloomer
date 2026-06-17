export type RedditRoofCategory =
  | "roof_repair"
  | "roof_replacement"
  | "roof_leak"
  | "contractor_recommendation";

export type RedditRoofPost = {
  id: string;
  title: string;
  url: string;
  subreddit: string;
  publishedAt: string;
  snippet: string;
  categories: RedditRoofCategory[];
  primaryCategory: RedditRoofCategory;
  score: number;
};

export const REDDIT_ROOF_CATEGORY_LABELS: Record<
  RedditRoofCategory,
  { title: string; description: string }
> = {
  roof_repair: {
    title: "Roof repair",
    description: "Posts about fixing or patching an existing roof.",
  },
  roof_replacement: {
    title: "Roof replacement",
    description: "Full re-roof or new roof requests.",
  },
  roof_leak: {
    title: "Roof leak",
    description: "Active leaks, water intrusion, or storm damage.",
  },
  contractor_recommendation: {
    title: "Contractor recommendations",
    description: "Asking who to hire or for roofer referrals.",
  },
};

export const REDDIT_ROOF_SUBREDDITS = ["Miami", "southflorida"] as const;

/** How far back to scan posts */
export const REDDIT_ROOF_LOOKBACK_DAYS = 14;
