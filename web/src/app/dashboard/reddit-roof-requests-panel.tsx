"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RedditRoofCategory, RedditRoofPost } from "@/lib/reddit/types";
import {
  REDDIT_ROOF_CATEGORY_LABELS,
  REDDIT_ROOF_LOOKBACK_DAYS,
} from "@/lib/reddit/types";

const CATEGORY_STYLES: Record<RedditRoofCategory, string> = {
  roof_repair: "bg-amber-100 text-amber-900",
  roof_replacement: "bg-orange-100 text-orange-900",
  roof_leak: "bg-red-100 text-red-900",
  contractor_recommendation: "bg-sky-100 text-sky-900",
};

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const days = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

type Props = {
  preview?: boolean;
};

export function RedditRoofRequestsPanel({ preview }: Props) {
  const [posts, setPosts] = useState<RedditRoofPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(Boolean(preview));

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/reddit-roof-requests", { cache: "no-store" })
      .then((res) => res.json())
      .then(
        (data: {
          posts?: RedditRoofPost[];
          preview?: boolean;
          error?: string;
        }) => {
          if (data.error) throw new Error(data.error);
          setPosts(data.posts ?? []);
          setIsPreview(Boolean(data.preview));
        },
      )
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load Reddit posts");
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, [preview]);

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-stone-900">
        Reddit roofing requests
      </h2>
      <p className="mt-1 text-xs text-stone-600">
        Recent posts from r/Miami and r/southflorida (past {REDDIT_ROOF_LOOKBACK_DAYS}{" "}
        days) likely asking for roof repair, replacement, leak help, or contractor
        recommendations.
      </p>

      {isPreview ? (
        <p className="mt-2 text-xs text-orange-800">
          Subscribers only.{" "}
          <Link href="/subscribe" className="font-medium underline">
            Subscribe
          </Link>{" "}
          to see live Reddit leads.
        </p>
      ) : null}

      {loading ? (
        <p className="mt-3 text-sm text-stone-500">Scanning Reddit…</p>
      ) : error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : !isPreview && posts.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500">
          No matching posts in the last {REDDIT_ROOF_LOOKBACK_DAYS} days. Check back
          soon — we refresh throughout the day.
        </p>
      ) : !isPreview ? (
        <ol className="mt-3 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
          {posts.map((post) => {
            const label = REDDIT_ROOF_CATEGORY_LABELS[post.primaryCategory];
            return (
              <li key={post.id}>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-stone-200 px-3 py-2 text-sm transition hover:border-orange-300 hover:bg-orange-50/50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${CATEGORY_STYLES[post.primaryCategory]}`}
                    >
                      {label.title}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      r/{post.subreddit} · {formatRelativeDate(post.publishedAt)}
                    </span>
                  </div>
                  <p className="mt-1 font-medium leading-snug text-stone-900">
                    {post.title}
                  </p>
                  {post.snippet ? (
                    <p className="mt-1 line-clamp-2 text-xs text-stone-600">
                      {post.snippet}
                    </p>
                  ) : null}
                </a>
              </li>
            );
          })}
        </ol>
      ) : null}

      <p className="mt-3 text-[10px] text-stone-400">
        Links open Reddit in a new tab. Respond thoughtfully — follow each subreddit&apos;s
        rules.
      </p>
    </div>
  );
}
