export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { fetchRedditRoofRequests } from "@/lib/reddit/fetch-feed";
import { REDDIT_ROOF_LOOKBACK_DAYS, REDDIT_ROOF_SUBREDDITS } from "@/lib/reddit/types";
import { isSubscriptionGatingEnabled } from "@/lib/subscription/access";
import { getAccessForRequest } from "@/lib/subscription/session";

export async function GET(request: Request) {
  try {
    const access = await getAccessForRequest(request);
    const gating = isSubscriptionGatingEnabled() && !access.full;

    const posts = gating ? [] : await fetchRedditRoofRequests();

    return NextResponse.json({
      posts,
      total: posts.length,
      lookbackDays: REDDIT_ROOF_LOOKBACK_DAYS,
      subreddits: [...REDDIT_ROOF_SUBREDDITS],
      preview: gating,
      access,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
