import type { RedditRoofCategory } from "./types";

const CATEGORY_PATTERNS: Record<RedditRoofCategory, RegExp[]> = {
  roof_leak: [
    /\broof\s*leak/i,
    /\bleak(?:ing)?\s+(?:on|in|from)?\s*(?:my|the|our)?\s*roof/i,
    /\bleak.*\broof/i,
    /\bwater\b.*\b(?:ceiling|roof|attic)\b/i,
    /\bstorm\s+damage\b.*\broof/i,
  ],
  roof_replacement: [
    /\broof\s*replac/i,
    /\bre-?roof/i,
    /\bnew\s+roof\b/i,
    /\breplace\s+(?:my|the|our)\s+roof/i,
    /\bfull\s+roof\b/i,
  ],
  roof_repair: [
    /\broof\s*repair/i,
    /\brepair\s+(?:my|the|our)\s+roof/i,
    /\bfix\s+(?:my|the|our)\s+roof/i,
    /\bpatch\s+(?:my|the|our)\s+roof/i,
  ],
  contractor_recommendation: [
    /\b(?:looking|searching)\s+for\s+(?:a\s+)?(?:roof|roofer|roofing)/i,
    /\bneed\s+(?:a\s+)?(?:roof|roofer|roofing)/i,
    /\brecommend(?:ation)?s?\s+.*\b(?:roof|roofer|roofing)/i,
    /\b(?:anyone|somebody)\s+know\s+(?:a\s+)?(?:good\s+)?(?:roof|roofer)/i,
    /\bwho\s+(?:do|did)\s+you\s+use\s+.*\broof/i,
    /\broofing\s+contractor/i,
    /\bgood\s+roofer/i,
    /\bbest\s+roofer/i,
    /\broofer\s+recommend/i,
  ],
};

const ROOF_CONTEXT = /\b(?:roof|roofer|roofing|shingle|tile\s+roof|flat\s+roof)\b/i;

const REQUEST_INTENT =
  /\b(?:need|looking|searching|recommend|anyone|somebody|who|help|quote|estimate|suggest|hire|fix|repair|replace|leak|damaged|broken)\b/i;

const EXCLUDE_PATTERNS = [
  /\b(?:hiring|now hiring|job opening|apply now)\b/i,
  /\bi\s+am\s+a\s+roofer\b/i,
  /\bwe\s+are\s+(?:a\s+)?roofing\s+company\b/i,
  /\b(?:selling|promo|discount|coupon)\b.*\broof/i,
  /\b(?:news|article|study)\b/i,
];

export function classifyRedditRoofPost(text: string): {
  categories: RedditRoofCategory[];
  primaryCategory: RedditRoofCategory | null;
  score: number;
} {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return { categories: [], primaryCategory: null, score: 0 };
  }

  if (!ROOF_CONTEXT.test(normalized)) {
    return { categories: [], primaryCategory: null, score: 0 };
  }

  if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return { categories: [], primaryCategory: null, score: 0 };
  }

  const categories: RedditRoofCategory[] = [];
  let score = 0;

  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS) as [
    RedditRoofCategory,
    RegExp[],
  ][]) {
    if (patterns.some((pattern) => pattern.test(normalized))) {
      categories.push(category);
      score += 3;
    }
  }

  if (REQUEST_INTENT.test(normalized)) score += 2;
  if (/\?/.test(normalized)) score += 1;

  if (categories.length === 0 && REQUEST_INTENT.test(normalized)) {
    categories.push("contractor_recommendation");
    score += 2;
  }

  if (categories.length === 0 || score < 3) {
    return { categories: [], primaryCategory: null, score };
  }

  const priority: RedditRoofCategory[] = [
    "roof_leak",
    "roof_replacement",
    "roof_repair",
    "contractor_recommendation",
  ];

  const primaryCategory =
    priority.find((cat) => categories.includes(cat)) ?? categories[0];

  return { categories, primaryCategory, score };
}

export function isLikelyRoofingRequest(text: string): boolean {
  return classifyRedditRoofPost(text).primaryCategory != null;
}
