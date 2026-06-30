import type { Metadata } from "next";
import Link from "next/link";
import { ReportPdfDownload } from "@/components/report-pdf-download";
import { SiteHeader } from "@/components/site-header";
import { MOMENTUM_LABEL_COPY } from "@/lib/leads/neighborhood-bloom";
import { ROOF_JOB_VALUE_DISCLAIMER } from "@/lib/leads/roof-job-value";
import { getAgingRoofIndexReportSnapshot } from "@/lib/reports/aging-roof-index-snapshot";
import {
  AGING_ROOF_INDEX_PATH,
  PUBLIC_REPORT_PRIVACY_NOTICE,
  formatCurrency,
  formatNumber,
} from "@/lib/reports/aging-roof-index";
import {
  APP_URL,
  CONTRACTOR_SEO_KEYWORDS,
  defaultOpenGraph,
} from "@/lib/site/seo";

const REPORT_TITLE =
  "Miami-Dade Aging Roofs & Hurricane Season 2026 — ZIP Replacement Index";
const REPORT_DESCRIPTION =
  "Free Miami-Dade hurricane season 2026 report: aging roofs over 15 years ranked by ZIP for replacement risk, permit momentum, and estimated re-roof cost before storm season.";

export const metadata: Metadata = {
  title: REPORT_TITLE,
  description: REPORT_DESCRIPTION,
  keywords: [
    ...CONTRACTOR_SEO_KEYWORDS,
    "Miami aging roofs hurricane season",
    "Miami-Dade hurricane season 2026",
    "Miami roof replacement hurricane season",
    "Miami-Dade roof replacement ZIP codes",
    "hurricane season roof replacement Miami",
    "oldest roofs Miami-Dade",
  ],
  alternates: {
    canonical: `${APP_URL}${AGING_ROOF_INDEX_PATH}`,
  },
  openGraph: defaultOpenGraph(
    "Miami-Dade Aging Roofs & Hurricane Season 2026 — DataBloomer",
    REPORT_DESCRIPTION,
    AGING_ROOF_INDEX_PATH,
  ),
  twitter: {
    card: "summary_large_image",
    title: "Miami-Dade Aging Roofs & Hurricane Season 2026",
    description: REPORT_DESCRIPTION,
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

function formatPct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${Math.round(value)}%`;
}

export default function AgingRoofIndexReportPage() {
  const report = getAgingRoofIndexReportSnapshot();
  const { countyTotals, top10, oldestByAvgAge, highestEstimatedValue } = report;
  const generatedLabel = formatDate(report.generatedAt);
  const reportUrl = `${APP_URL}${AGING_ROOF_INDEX_PATH}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Report",
        "@id": `${reportUrl}#report`,
        url: reportUrl,
        name: REPORT_TITLE,
        description: REPORT_DESCRIPTION,
        datePublished: report.generatedAt,
        dateModified: report.generatedAt,
        author: {
          "@type": "Organization",
          name: "DataBloomer",
          url: APP_URL,
        },
        publisher: {
          "@type": "Organization",
          name: "DataBloomer",
          url: APP_URL,
        },
        about: {
          "@type": "Place",
          name: "Miami-Dade County, Florida",
        },
        inLanguage: "en-US",
        isAccessibleForFree: true,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Aging Roofs Hurricane Season 2026",
            item: reportUrl,
          },
        ],
      },
    ],
  };

  const hasData = countyTotals.totalAgingLeads > 0 && top10.length > 0;

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader showBenefitsBar={false} />

      <article className="mx-auto max-w-4xl px-6 py-16">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-orange-600">
          Miami-Dade hurricane season report · 2026
        </p>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">
            Data as of {generatedLabel}
          </span>
          <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-900">
            Roofs over {report.minRoofAgeYears} years only
          </span>
          <span className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-600">
            ZIP / area aggregates only
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-[2.65rem] sm:leading-tight">
          Miami-Dade aging roofs ahead of 2026 hurricane season: top ZIPs for
          replacement
        </h1>
        <p className="mt-4 text-sm text-stone-500">
          Published by{" "}
          <Link href="/" className="font-medium text-orange-700 hover:underline">
            DataBloomer
          </Link>
          . Static published edition — county permit and property records;
          well-aged inventory (roof age &gt; {report.minRoofAgeYears} years).
        </p>
        <p className="mt-2 text-xs text-stone-500">{PUBLIC_REPORT_PRIVACY_NOTICE}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <ReportPdfDownload />
          <span className="text-xs text-stone-500">
            Optional PDF snapshot of this page (same as-of date).
          </span>
        </div>

        {!hasData ? (
          <div className="mt-12 rounded-xl border border-amber-200 bg-amber-50 p-6 text-stone-700">
            <p className="font-medium text-stone-900">Report data loading</p>
            <p className="mt-2 text-sm">
              County lead data is not yet available in this environment. The full
              report will populate automatically once aging-roof leads are ingested.
            </p>
          </div>
        ) : (
          <>
            <section className="mt-10 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/70 p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-stone-900">
                Executive summary
              </h2>
              <p className="mt-4 leading-relaxed text-stone-700">
                This index covers only well-aged roofs — properties with roof
                systems strictly over {report.minRoofAgeYears} years old per county
                permit history. Miami-Dade has{" "}
                <strong>{formatNumber(countyTotals.totalAgingLeads)}</strong> such
                homes in DataBloomer&apos;s inventory. Of those,{" "}
                <strong>{formatNumber(countyTotals.replacementLikely)}</strong> score
                80+ on the DataBloom Score, meaning replacement is statistically
                likely in the near term. County-wide average roof age sits at{" "}
                <strong>{countyTotals.avgRoofAgeYears} years</strong>.
                {countyTotals.medianEstimatedJobValue != null && (
                  <>
                    {" "}
                    Median estimated re-roof size across analyzed ZIPs is{" "}
                    <strong>
                      {formatCurrency(countyTotals.medianEstimatedJobValue)}
                    </strong>{" "}
                    (heated living area × ${report.jobValueRatePerSqft}/sq ft).
                  </>
                )}
              </p>
              <p className="mt-4 leading-relaxed text-stone-700">
                The hurricane season replacement index ranks {countyTotals.zipsAnalyzed} ZIP codes
                where at least 10 aging-roof properties exist, combining neighborhood
                bloom forecast (permit momentum + untapped aging inventory), average
                roof age, replacement-likely counts, and estimated job size. The top
                ZIP for 2026 replacement activity is{" "}
                <strong>
                  {top10[0].zip} ({top10[0].areaLabel})
                </strong>{" "}
                with a neighborhood bloom score of{" "}
                <strong>{top10[0].neighborhoodScore}</strong> and{" "}
                <strong>{formatNumber(top10[0].replacementLikelyCount)}</strong>{" "}
                replacement-likely homes.
              </p>
            </section>

            <section className="mt-14">
              <h2 className="text-2xl font-bold text-stone-900">
                Top 10 ZIP codes — hurricane season replacement index
              </h2>
              <p className="mt-3 text-stone-600">
                Ranked by neighborhood bloom score (permit momentum, aging inventory,
                and untapped replacement potential), with replacement-likely count as
                tiebreaker. Bloom probability is the modeled chance of elevated
                re-roof activity in the next 12 months.
              </p>

              <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-600">
                    <tr>
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">ZIP / area</th>
                      <th className="px-4 py-3">Bloom score</th>
                      <th className="px-4 py-3">Repl. likely</th>
                      <th className="px-4 py-3">Avg roof age</th>
                      <th className="px-4 py-3">Avg est. job</th>
                      <th className="px-4 py-3">Momentum</th>
                      <th className="px-4 py-3">Permits 12mo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {top10.map((row) => {
                      const momentum = MOMENTUM_LABEL_COPY[row.momentumLabel];
                      return (
                        <tr key={row.zip} className="bg-white hover:bg-stone-50/80">
                          <td className="px-4 py-3 font-semibold text-stone-900">
                            #{row.rank}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-stone-900">
                              {row.zip}
                            </span>
                            <span className="mt-0.5 block text-xs text-stone-500">
                              {row.areaLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-orange-700">
                              {row.neighborhoodScore}
                            </span>
                            <span className="block text-xs text-stone-500">
                              {row.bloomProbability}% bloom prob.
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {formatNumber(row.replacementLikelyCount)}
                            <span className="block text-xs text-stone-500">
                              of {formatNumber(row.agingLeadCount)} aging
                            </span>
                          </td>
                          <td className="px-4 py-3">{row.avgRoofAgeYears} yr</td>
                          <td className="px-4 py-3">
                            {formatCurrency(row.avgEstimatedJobValue)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium">{momentum.title}</span>
                            <span className="block text-xs text-stone-500">
                              {formatPct(row.momentumPct)} vs prior 90d
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {row.permits12mo}
                            <span className="block text-xs text-stone-500">
                              {row.recentPermits90d} last 90d
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-14 grid gap-8 sm:grid-cols-2">
              <div className="rounded-xl border border-stone-200 p-6">
                <h2 className="text-xl font-bold text-stone-900">
                  Oldest roof inventory by ZIP
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  Average roof age among aging-roof leads — where shingle life is
                  most stretched before hurricane season.
                </p>
                <ol className="mt-4 space-y-3">
                  {oldestByAvgAge.map((row) => (
                    <li
                      key={`old-${row.zip}`}
                      className="flex items-baseline justify-between gap-4 border-b border-stone-100 pb-3 last:border-0"
                    >
                      <span>
                        <span className="font-semibold text-stone-900">
                          {row.zip}
                        </span>
                        <span className="ml-2 text-sm text-stone-500">
                          {row.areaLabel}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold text-orange-800">
                        {row.avgRoofAgeYears} yr avg
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-xl border border-stone-200 p-6">
                <h2 className="text-xl font-bold text-stone-900">
                  Highest estimated replacement cost
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  Average projected re-roof value by ZIP from county heated living
                  area — larger homes, higher ticket jobs.
                </p>
                <ol className="mt-4 space-y-3">
                  {highestEstimatedValue.map((row) => (
                    <li
                      key={`val-${row.zip}`}
                      className="flex items-baseline justify-between gap-4 border-b border-stone-100 pb-3 last:border-0"
                    >
                      <span>
                        <span className="font-semibold text-stone-900">
                          {row.zip}
                        </span>
                        <span className="ml-2 text-sm text-stone-500">
                          {row.areaLabel}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold text-orange-800">
                        {formatCurrency(row.avgEstimatedJobValue)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            <section className="mt-14 space-y-4">
              <h2 className="text-2xl font-bold text-stone-900">
                If you own a home in these ZIP codes
              </h2>
              <p className="leading-relaxed text-stone-600">
                Florida building codes and insurer requirements have tightened
                after successive hurricane seasons. A roof installed in the early
                2000s — now {countyTotals.avgRoofAgeYears}+ years old on average
                across Miami-Dade&apos;s aging inventory — is often past
                manufacturer design life for asphalt shingles. Wind-rated
                underwriting and renewal inspections increasingly flag roofs at
                15–20 years even when visible damage is minor.
              </p>
              <p className="leading-relaxed text-stone-600">
                Homeowners in the top-index ZIPs are not alone:{" "}
                {top10[0].areaLabel} ({top10[0].zip}) alone has{" "}
                {formatNumber(top10[0].agingLeadCount)} tracked aging roofs, and{" "}
                {formatNumber(top10[0].replacementLikelyCount)} already score as
                replacement-likely. Permit filings in that ZIP show{" "}
                {top10[0].permits12mo} re-roof permits in the last 12 months —
                your neighbors are already replacing. Waiting until a leak or
                insurance non-renewal notice often means emergency pricing and
                contractor backlogs when storms approach.
              </p>
              <p className="leading-relaxed text-stone-600">
                A professional inspection before June 2026 — especially if your
                roof is 17+ years old or you are in{" "}
                {oldestByAvgAge[0]?.areaLabel ?? "a high-age ZIP"} — is the
                practical first step. Compare at least two licensed Miami-Dade
                contractors; ask about wind-mitigation documentation that can
                affect premiums.
              </p>
            </section>

            <section className="mt-14 space-y-4">
              <h2 className="text-2xl font-bold text-stone-900">
                For roofing contractors — where to deploy crews
              </h2>
              <p className="leading-relaxed text-stone-600">
                Canvassing without ZIP-level intelligence burns fuel. This
                hurricane season index highlights where aging inventory, permit momentum, and
                job size overlap at the neighborhood level — the same ZIP signals
                DataBloomer subscribers use to route Bloom Zone canvassing.
              </p>
              <p className="leading-relaxed text-stone-600">
                Consider {top10.slice(0, 3).map((z, i) => (
                  <span key={z.zip}>
                    {i > 0 && (i === 2 ? ", and " : ", ")}
                    <strong>
                      {z.zip} ({z.areaLabel})
                    </strong>
                  </span>
                ))}: combined, they represent{" "}
                {formatNumber(
                  top10.slice(0, 3).reduce((s, z) => s + z.replacementLikelyCount, 0),
                )}{" "}
                replacement-likely leads with neighborhood scores of{" "}
                {top10
                  .slice(0, 3)
                  .map((z) => z.neighborhoodScore)
                  .join(", ")}
                . ZIPs marked &ldquo;rising bloom&rdquo; or &ldquo;emerging
                bloom&rdquo; are where permit velocity is accelerating against a
                large untapped aging base — ideal for door-knocking before
                competitors arrive.
              </p>
              <p className="leading-relaxed text-stone-600">
                Subscribers unlock property-level detail — addresses, folio numbers,
                and interactive Bloom Zone pins. This public index is a ZIP-only
                snapshot; exclusive ZIP subscriptions are available for crews
                that want to own a territory.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/subscribe"
                  className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
                >
                  Roofing lead subscription
                </Link>
                <ReportPdfDownload />
              </div>
            </section>

            <section className="mt-14 space-y-4 border-t border-stone-200 pt-12">
              <h2 className="text-2xl font-bold text-stone-900">Methodology</h2>
              <p className="leading-relaxed text-stone-600">
                This report is produced entirely from DataBloomer&apos;s Miami-Dade
                lead intelligence platform — a subscription SaaS that ingests county
                building permit history, property appraiser records (including heated
                living area and year built), and code enforcement data. The public
                index includes only roofs over {report.minRoofAgeYears} years old
                (the well-aged band where replacement urgency and insurer scrutiny
                typically rise). The DataBloom Score (0–100) weights roof age,
                assessed value confidence, and permit match quality. Neighborhood
                bloom forecast layers 12-month permit volume, 90-day momentum, and
                the ratio of aging inventory to recent permit uptake.
              </p>
              <p className="leading-relaxed text-stone-600">
                Estimated job values use county heated square footage multiplied by
                ${report.jobValueRatePerSqft}/sq ft — a planning benchmark, not a
                quote. ZIP rankings require at least 10 qualifying records.
                Published edition; data as of {generatedLabel}.{" "}
                {PUBLIC_REPORT_PRIVACY_NOTICE}
              </p>
              <p className="text-xs leading-relaxed text-stone-500">
                {ROOF_JOB_VALUE_DISCLAIMER}
              </p>
            </section>
          </>
        )}

        <footer className="mt-16 border-t border-stone-200 pt-8 text-sm text-stone-500">
          <p>
            © {new Date().getFullYear()} DataBloomer ·{" "}
            <Link href="/" className="text-orange-700 hover:underline">
              databloomer.com
            </Link>{" "}
            ·{" "}
            <Link href="/contact" className="text-orange-700 hover:underline">
              Media inquiries
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
