import { clearAllData, ingestMiamiDade, seedSampleData } from "../src/lib/ingest/pipeline";
import { refreshAllLeads } from "../src/lib/leads/refresh";
import { closeDb } from "../src/lib/db/client";

async function main() {
  const useSample = process.argv.includes("--sample");
  const keepExisting = process.argv.includes("--keep");

  if (!useSample && !keepExisting) {
    console.log("Clearing existing data (use --keep to skip)…");
    await clearAllData();
  }

  if (useSample) {
    console.log("Seeding sample data…");
  } else {
    console.log("Ingesting live Miami-Dade data from county ArcGIS APIs…");
  }

  const summary = useSample ? await seedSampleData() : await ingestMiamiDade();
  console.log("Ingest summary:", summary);

  console.log("Refreshing leads…");
  const leads = await refreshAllLeads();
  console.log("Leads refreshed:", leads);
  await closeDb();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
