import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { DigestSubscribe } from "@/components/digest-subscribe";
import { NeighborhoodBloomCard } from "@/components/neighborhood-bloom-card";
import { fetchNeighborhoodBloomForZip } from "@/lib/leads/neighborhood-bloom-server";
import { getAreaBySlug, getAreaSlugs } from "@/lib/miami-dade/areas";
import { APP_URL, defaultOpenGraph } from "@/lib/site/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAreaSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  if (!area) return {};

  return {
    title: area.title,
    description: area.description,
    keywords: area.keywords,
    alternates: { canonical: `${APP_URL}/areas/${area.slug}` },
    openGraph: defaultOpenGraph(area.title, area.description, `/areas/${area.slug}`),
    twitter: {
      card: "summary_large_image",
      title: area.title,
      description: area.description,
    },
  };
}

export default async function AreaPage({ params }: PageProps) {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  if (!area) notFound();

  let bloomForecast = null;
  try {
    bloomForecast = await fetchNeighborhoodBloomForZip(area.zip);
  } catch {
    bloomForecast = null;
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: area.title,
    description: area.description,
    url: `${APP_URL}/areas/${area.slug}`,
    about: {
      "@type": "Place",
      name: area.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: area.name,
        addressRegion: "FL",
        postalCode: area.zip,
      },
    },
  };

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <article className="mx-auto max-w-3xl px-6 py-16">
        <nav className="mb-6 text-sm text-stone-500">
          <Link href="/areas" className="hover:text-orange-700 hover:underline">
            All markets
          </Link>
          <span className="mx-2">/</span>
          <span className="text-stone-700">{area.name}</span>
        </nav>
        <p className="mb-2 text-sm font-medium text-orange-600">
          Miami-Dade · ZIP {area.zip}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-stone-900">
          {area.name} roofing leads
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-stone-600">{area.intro}</p>

        <ul className="mt-8 space-y-3">
          {area.highlights.map((item) => (
            <li key={item} className="flex gap-2 text-stone-700">
              <span className="text-orange-600">✓</span>
              {item}
            </li>
          ))}
        </ul>

        {bloomForecast ? (
          <NeighborhoodBloomCard forecast={bloomForecast} areaName={area.name} />
        ) : null}

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={`/dashboard?type=aging_roof&zip=${area.zip}&view=map`}
            className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
          >
            Bloom Zones — {area.name}
          </Link>
          <Link
            href={`/dashboard?type=aging_roof&zip=${area.zip}`}
            className="rounded-lg border border-stone-300 bg-white px-6 py-3 font-medium text-stone-800 hover:bg-stone-50"
          >
            View lead list
          </Link>
        </div>

        <div className="mt-12">
          <DigestSubscribe />
        </div>
      </article>
    </main>
  );
}
