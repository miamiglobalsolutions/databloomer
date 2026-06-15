import { readFileSync } from "node:fs";
import { join } from "node:path";
import { closeDb, execSql, getConnectionString, usesEmbeddedDb } from "../src/lib/db/client";

async function main() {
  const sql = readFileSync(
    join(process.cwd(), "src/lib/db/schema.sql"),
    "utf8",
  );

  const mode = usesEmbeddedDb() ? "embedded PGlite" : "PostgreSQL";
  console.log(`Applying schema (${mode}) at ${getConnectionString()}`);

  await execSql(sql);
  console.log("Database schema applied.");
  await closeDb();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
