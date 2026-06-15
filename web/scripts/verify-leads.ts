import { query, closeDb } from "../src/lib/db/client";

async function main() {
  const result = await query<{ address: string; zip: string | null; score: number }>(
    `SELECT address, zip, score FROM leads WHERE lead_type = 'aging_roof' ORDER BY score DESC LIMIT 5`,
  );
  console.log("Top aging roof leads:", result.rows);
  const count = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM leads WHERE lead_type = 'aging_roof'`,
  );
  console.log("Total aging roof leads:", count.rows[0].count);
  await closeDb();
}

main();
