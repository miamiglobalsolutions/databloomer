import { closeDb } from "../src/lib/db/client";
import { backfillPropertyValuesFromGis } from "../src/lib/ingest/pipeline";
import { refreshAllLeads } from "../src/lib/leads/refresh";
import { getHeatedAreaValuePerSqft } from "../src/lib/miami-dade/property-value";

async function main() {
  const zipArg = process.argv.find((arg) => arg.startsWith("--zip="));
  const zipCodes = zipArg ? [zipArg.split("=")[1]] : undefined;

  console.log(
    `Heated-area value rate: $${getHeatedAreaValuePerSqft()}/sq ft (HEATED_AREA_VALUE_PER_SQFT)`,
  );

  const backfill = await backfillPropertyValuesFromGis({
    zipCodes,
    log: (message) => console.log(message),
  });

  console.log("Property value backfill:", backfill);

  const leads = await refreshAllLeads();
  console.log("Leads refreshed:", leads);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => closeDb());
