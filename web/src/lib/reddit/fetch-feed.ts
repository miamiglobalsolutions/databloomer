import { classifyRedditRoofPost } from "./classify";
import type { RedditRoofPost } from "./types";
import { REDDIT_ROOF_LOOKBACK_DAYS } from "./types";

const USER_AGENT =
  process.env.REDDIT_USER_AGENT ??
  "web:com.databloomer.leads:v1.0.0 (Miami roofing lead tool)";

const CACHE_TTL_MS = 15 * 60 * 1000;
let cachedPosts: { fetchedAt: number; posts: RedditRoofPost[] } | null = null;

const SEARCH_QUERY = encodeURIComponent(
  "roof OR roofer OR roofing OR leak OR shingles",
);

type RawAtomEntry = {
  id: string;
  title: string;
  url: string;
  publishedAt: Date;
  snippet: string;
};

function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match?.[1]?.trim() ?? "";
}

function parsePostId(url: string): string {
  const match = url.match(/comments\/([a-z0-9]+)\//i);
  return match?.[1] ?? url;
}

function parseAtomFeed(xml: string): RawAtomEntry[] {
  const chunks = xml.split("<entry>").slice(1);
  const entries: RawAtomEntry[] = [];

  for (const chunk of chunks) {
    const title = decodeXml(extractTag(chunk, "title"));
    const updatedRaw = extractTag(chunk, "updated");
    const link =
      chunk.match(/<link[^>]+href="([^"]+)"/)?.[1] ??
      extractTag(chunk, "link");
    const content = decodeXml(
      extractTag(chunk, "content") || extractTag(chunk, "summary"),
    );

    if (!title || !link) continue;

    const publishedAt = new Date(updatedRaw);
    if (Number.isNaN(publishedAt.getTime())) continue;

    entries.push({
      id: parsePostId(link),
      title,
      url: link.replace(/&amp;/g, "&"),
      publishedAt,
      snippet: content.slice(0, 280),
    });
  }

  return entries;
}

async function fetchSubredditSearch(
  subreddit: string,
): Promise<RawAtomEntry[]> {
  const url = `https://www.reddit.com/r/${subreddit}/search.rss?q=${SEARCH_QUERY}&restrict_sr=on&sort=new&t=month`;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/atom+xml" },
  });

  if (!response.ok) {
    throw new Error(
      `Reddit feed failed for r/${subreddit}: ${response.status}`,
    );
  }

  const xml = await response.text();
  return parseAtomFeed(xml);
}

export async function fetchRedditRoofRequests(options?: {
  subreddits?: string[];
  lookbackDays?: number;
}): Promise<RedditRoofPost[]> {
  if (
    cachedPosts &&
    Date.now() - cachedPosts.fetchedAt < CACHE_TTL_MS &&
    !options?.subreddits &&
    !options?.lookbackDays
  ) {
    return cachedPosts.posts;
  }

  const subreddits = options?.subreddits ?? ["Miami", "southflorida"];
  const lookbackDays = options?.lookbackDays ?? REDDIT_ROOF_LOOKBACK_DAYS;
  const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;

  const batches: RawAtomEntry[][] = [];
  for (const sub of subreddits) {
    if (batches.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
    batches.push(await fetchSubredditSearch(sub).catch(() => []));
  }

  const seen = new Set<string>();
  const posts: RedditRoofPost[] = [];

  for (let i = 0; i < subreddits.length; i++) {
    const subreddit = subreddits[i];
    for (const entry of batches[i]) {
      if (entry.publishedAt.getTime() < cutoff) continue;

      const text = `${entry.title} ${entry.snippet}`;
      const classification = classifyRedditRoofPost(text);
      if (!classification.primaryCategory) continue;

      const dedupeKey = entry.id;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      posts.push({
        id: dedupeKey,
        title: entry.title,
        url: entry.url,
        subreddit,
        publishedAt: entry.publishedAt.toISOString(),
        snippet: entry.snippet,
        categories: classification.categories,
        primaryCategory: classification.primaryCategory,
        score: classification.score,
      });
    }
  }

  posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime() ||
      b.score - a.score,
  );

  if (!options?.subreddits && !options?.lookbackDays) {
    cachedPosts = { fetchedAt: Date.now(), posts };
  }

  return posts;
}
