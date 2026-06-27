import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import {
  PROMO_PAGE_URL,
  PROMO_POSTER_SRC,
  PROMO_VIDEO_SRC,
} from "@/lib/site/promo-video";
import { APP_URL, CONTRACTOR_SEO_KEYWORDS } from "@/lib/site/seo";

const absoluteVideoUrl = PROMO_VIDEO_SRC.startsWith("http")
  ? PROMO_VIDEO_SRC
  : `${APP_URL}${PROMO_VIDEO_SRC}`;

export const metadata: Metadata = {
  title: "Promo Video — Miami Roofing Leads for Contractors",
  description:
    "Watch the DataBloomer promo: Miami-Dade aging roof leads, Bloom Zone canvassing maps, DataBloom Score, and roofing contractor lead subscription overview.",
  keywords: [...CONTRACTOR_SEO_KEYWORDS],
  alternates: { canonical: PROMO_PAGE_URL },
  openGraph: {
    title: "DataBloomer Promo — Miami Roofing Leads for Contractors",
    description:
      "Video overview: aging roof leads, Bloom Zones, and canvassing intelligence for Miami-Dade roofers.",
    url: PROMO_PAGE_URL,
    siteName: "DataBloomer",
    type: "video.other",
    videos: [
      {
        url: absoluteVideoUrl,
        width: 1920,
        height: 1080,
        type: "video/mp4",
      },
    ],
    images: [
      {
        url: `${APP_URL}${PROMO_POSTER_SRC}`,
        width: 1920,
        height: 1080,
        alt: "DataBloomer promo video",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DataBloomer — Miami Roofing Leads",
    description:
      "Watch how Bloom Zones and the DataBloom Score help Miami-Dade roofing crews find the best prospects.",
    images: [`${APP_URL}${PROMO_POSTER_SRC}`],
  },
};

export default function PromoPage() {
  return (
    <main className="flex-1">
      <SiteHeader active="promo" />

      <section className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-orange-600">
          Promo video
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          See DataBloomer in action
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-stone-600">
          How Miami-Dade roofing contractors use Bloom Zones, aging roof leads,
          and the DataBloom Score to send canvassers to the highest-opportunity
          homes first.
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl border border-stone-200 bg-black shadow-xl">
          <video
            className="aspect-video w-full"
            controls
            playsInline
            preload="metadata"
            poster={PROMO_POSTER_SRC}
          >
            <source src={absoluteVideoUrl} type="video/mp4" />
            Your browser does not support embedded video.{" "}
            <a href={absoluteVideoUrl} className="text-orange-400 underline">
              Download the video
            </a>
            .
          </video>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/subscribe"
            className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
          >
            Subscribe
          </Link>
          <Link
            href="/dashboard?view=map"
            className="rounded-lg border border-stone-300 bg-white px-6 py-3 font-medium text-stone-800 hover:bg-stone-50"
          >
            Open Bloom Zones
          </Link>
          <Link
            href="/dashboard?type=aging_roof"
            className="rounded-lg border border-stone-300 bg-white px-6 py-3 font-medium text-stone-800 hover:bg-stone-50"
          >
            View lead list
          </Link>
        </div>
      </section>
    </main>
  );
}
