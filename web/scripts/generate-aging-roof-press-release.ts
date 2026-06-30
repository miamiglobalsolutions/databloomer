/**
 * Generate EIN Presswire-formatted press release from live Aging Roof Index data.
 * Run: npx tsx scripts/generate-aging-roof-press-release.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { closeDb } from "../src/lib/db/client";
import { fetchAgingRoofIndexReport } from "../src/lib/reports/aging-roof-index-server";
import {
  AGING_ROOF_INDEX_PATH,
  formatCurrency,
  formatNumber,
} from "../src/lib/reports/aging-roof-index";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.databloomer.com";
const REPORT_URL = `${APP_URL}${AGING_ROOF_INDEX_PATH}`;
const OUT_DIR = join(process.cwd(), "..", "marketing", "press-releases");

function formatReleaseDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}

async function main() {
  const report = await fetchAgingRoofIndexReport();
  const { countyTotals, top10 } = report;

  if (top10.length === 0) {
    console.error("No report data — run leads:refresh first.");
    process.exit(1);
  }

  const top3Lines = top10
    .slice(0, 3)
    .map(
      (z, i) =>
        `${i + 1}. ZIP ${z.zip} (${z.areaLabel}) — bloom score ${z.neighborhoodScore}, ${formatNumber(z.replacementLikelyCount)} replacement-likely homes, avg roof age ${z.avgRoofAgeYears} years`,
    )
    .join("\n");

  const text = `FOR IMMEDIATE RELEASE

AI Analysis of Miami-Dade Homes Identifies Properties at Elevated Risk for Roof Replacement This Hurricane Season

MIAMI, Fla., ${formatReleaseDate()} — DataBloomer, a Miami-Dade roofing intelligence platform, released a public analysis showing where roof replacement risk is concentrated ahead of peak hurricane season. Built from county permit and property records, the report helps homeowners and roofing contractors see where aging roof exposure is rising and where replacement activity is likely to accelerate.

The full public report is available at:
${REPORT_URL}

DataBloomer's 2026 Miami-Dade Aging Roof Index analyzes ${formatNumber(countyTotals.totalAgingLeads)} homes in a well-aged cohort (roofs strictly over ${report.minRoofAgeYears} years old). In that cohort, ${formatNumber(countyTotals.replacementLikely)} homes currently score 80+ on DataBloom Score, DataBloomer's signal for near-term replacement likelihood. Average roof age in the analyzed set is ${countyTotals.avgRoofAgeYears} years. The analysis is produced from Miami-Dade building permit history and property appraiser records, then modeled at ZIP level so contractors and residents can compare neighborhoods without publishing individual property identifiers in the public edition.

"Hurricane season always exposes the same issue: many owners do not realize their roof is in a high-risk age band until an inspection, leak, or underwriting event forces a rushed decision," said a DataBloomer spokesperson. "This report helps contractors and homeowners act earlier, with neighborhood-level visibility, instead of reacting late under storm pressure."

Top-ranked ZIPs for 2026 replacement activity:

${top3Lines}

The complete Top 10 ZIP table, plus oldest-roof and highest-estimated-cost rankings, is in the full report at ${REPORT_URL}. Methodology and update context are published so readers can separate signal from noise in county-level data. Editors and trade readers seeking tables, rankings, and the published as-of date should use that page as the canonical source for the 2026 edition.

For contractors, the practical use case is canvassing efficiency. Random door-knocking burns fuel and labor when outreach is not aligned to where roof risk clusters. The Aging Roof Index helps crews prioritize ZIPs where aged inventory, replacement-likely scoring, and permit momentum overlap — so teams can stage routes around higher-probability opportunities before demand spikes. Sales managers can assign neighborhoods by current risk intensity instead of anecdotal hot spots; business owners can time staffing and materials around likely replacement corridors; smaller contractors can focus limited canvassing where close rates are stronger.

For homeowners, the report is an early-warning planning tool, not a scare tactic. Roofs in later service-life years are not automatically failing, but hidden deterioration and weather-driven loss risk rise with age and deferred maintenance — amplified during hurricane season by wind, wind-driven rain, and contractor bottlenecks after storm alerts. If your neighborhood ranks high, schedule inspection and budgeting before emergency conditions compress your options on scope, financing, and contractor availability. Owners who act early generally retain more leverage on timing and vendor choice than those who wait for storm advisories or insurance non-renewal notices.

Roofing companies can use the index as a weekly planning layer: pick two or three adjacent high-index ZIPs, align canvassing with permit activity, and lead with education — roof age context and storm-readiness — rather than generic pitches. Service-first messaging tends to improve homeowner response and long-term trust in neighborhoods where multiple contractors compete. Property owners and managers can use the same data for pre-season triage: inspection sequencing, storm-prep budgets, and better questions for licensed inspectors (flashing, underlayment, wind uplift, remaining service life under South Florida exposure).

Hurricane season planning is rarely linear. A forecast shift, insurance inspection cycle, or neighborhood wind event can trigger sudden surges in estimate requests. Contractors that pre-position in risk-forward ZIPs can respond with shorter lead times; homeowners in those ZIPs can document roof condition and build a decision window before severe weather shortens material and labor availability.

The public index combines permit-derived age signals, neighborhood bloom modeling, and replacement-likelihood scoring, plus estimated job-size benchmarks where county heated-area data exists. "Elevated risk" does not mean imminent failure at every address; it means roof age, local replacement momentum, and permit behavior point to higher probability than the county baseline — a starting point for both prospecting and household planning.

Contractors moving from ZIP intelligence to route planning and lead prioritization can use DataBloomer at:
• Public report: ${REPORT_URL}
• Platform overview: https://www.databloomer.com/about
• Subscription: https://www.databloomer.com/subscribe
• Contact: https://www.databloomer.com/contact

The public report is ZIP-level and free to read. Subscribers get expanded canvassing workflows — mapped Bloom Zones and lead-priority tools — to act on risk patterns faster. County-scale pattern detection gives contractors a better prospecting map and gives owners a clearer picture of neighborhood vulnerability before severe weather forces urgent decisions. DataBloomer emphasizes this analysis complements, not replaces, licensed inspection and contractor judgment; condition varies property to property even within the same ZIP.

About DataBloomer

DataBloomer is a SaaS platform for Miami-Dade roofing intelligence. It ingests county building permits, property appraiser records, and related housing data to surface aging-roof patterns, replacement likelihood, and canvassing-oriented neighborhood signals for contractors and property owners. Learn more at https://www.databloomer.com.

Media Contact:
DataBloomer
hello@databloomer.com
https://www.databloomer.com/contact

###

Editor note: EIN plans differ on hyperlink count and formatting. If needed for your plan tier, retain the primary report link (${REPORT_URL}) and include additional DataBloomer links in plain text.
`;

  mkdirSync(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, "ein-miami-dade-aging-roof-index-2026.txt");
  writeFileSync(outPath, text, "utf8");
  console.log(`Wrote ${outPath}`);
  console.log(`Top ZIP: ${top10[0].zip} (${top10[0].areaLabel}) — score ${top10[0].neighborhoodScore}`);

  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
