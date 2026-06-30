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

DataBloomer Publishes Miami-Dade Aging Roof Index: Top 10 ZIPs for Replacement Activity Ahead of 2026 Hurricane Season

MIAMI, Fla., ${formatReleaseDate()} — DataBloomer, the Miami-Dade roofing lead intelligence platform, today published the 2026 Miami-Dade Aging Roof Index — a county-wide analysis of where roof replacement activity is most likely to accelerate before hurricane season. The full report, including ZIP-level tables, oldest-roof rankings, and estimated re-roof costs, is available free at:

${REPORT_URL}

The index analyzes ${formatNumber(countyTotals.totalAgingLeads)} well-aged Miami-Dade properties — roofs strictly over ${report.minRoofAgeYears} years old per county permit and property appraiser records. ${formatNumber(countyTotals.replacementLikely)} homes score 80+ on DataBloomer's DataBloom Score, indicating replacement is likely in the near term. Average roof age in this cohort is ${countyTotals.avgRoofAgeYears} years.

"Most Miami-Dade homeowners do not know their roof's permit age until an insurer or inspector flags it," said a DataBloomer spokesperson. "Contractors face the same problem at scale — which ZIPs have both old roofs and rising permit momentum? We built this index so the public can see what our subscribers work from every day."

Top-ranked ZIPs for 2026 replacement activity:

${top3Lines}

The complete top 10, plus rankings for oldest average roof age and highest estimated replacement cost by ZIP, are in the full report at ${REPORT_URL}.

Key findings available in the report include:
• Neighborhood bloom scores combining permit momentum and untapped aging inventory
• Replacement-likely counts and average DataBloom Scores by ZIP
• Estimated re-roof job size benchmarks from county heated living area
• Guidance for homeowners considering inspection before June 2026
• Deployment notes for roofing contractors planning canvassing routes

About DataBloomer

DataBloomer (databloomer.com) is a subscription SaaS platform for Miami-Dade roofing contractors. The service ingests county building permits, property appraiser data, and code enforcement records to surface aging roof leads, Bloom Zone canvassing maps, and DataBloom Score ranking. Subscribers receive address-level leads, interactive maps, and weekly updates.

Media Contact:
DataBloomer
hello@databloomer.com
https://www.databloomer.com/contact

###

Note to editors: High-resolution map screenshots and methodology detail available on request. Link to full report: ${REPORT_URL}
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
