import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { closeDb } from "../src/lib/db/client";
import {
  AGING_ROOF_INDEX_SNAPSHOT_JSON,
  AGING_ROOF_INDEX_STATIC_PDF,
  AGING_ROOF_INDEX_STATIC_PDF_PUBLIC_PATH,
} from "../src/lib/reports/aging-roof-index-paths";
import { fetchAgingRoofIndexReport } from "../src/lib/reports/aging-roof-index-server";
import { buildAgingRoofIndexPdf } from "../src/lib/reports/generate-aging-roof-index-pdf";

async function main() {
  const report = await fetchAgingRoofIndexReport();

  if (report.top10.length === 0) {
    console.error("No report data — run leads:refresh first.");
    process.exit(1);
  }

  mkdirSync(join(process.cwd(), "src", "data", "reports"), { recursive: true });
  writeFileSync(
    AGING_ROOF_INDEX_SNAPSHOT_JSON,
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
  console.log(`Wrote ${AGING_ROOF_INDEX_SNAPSHOT_JSON}`);

  const pdf = await buildAgingRoofIndexPdf(report);
  mkdirSync(join(process.cwd(), "public", "reports"), { recursive: true });
  writeFileSync(AGING_ROOF_INDEX_STATIC_PDF, pdf);
  console.log(`Wrote ${AGING_ROOF_INDEX_STATIC_PDF}`);
  console.log(`Public URL path: ${AGING_ROOF_INDEX_STATIC_PDF_PUBLIC_PATH}`);
  console.log(
    `Top ZIP: ${report.top10[0].zip} (${report.top10[0].areaLabel}) — score ${report.top10[0].neighborhoodScore}`,
  );
  console.log(`As of: ${report.generatedAt}`);

  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
