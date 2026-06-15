import { query, closeDb } from "../src/lib/db/client";

async function main() {
  const top100 = await query<{ zip: string | null; c: number }>(
    `SELECT zip, COUNT(*)::int AS c FROM (
       SELECT zip FROM leads WHERE lead_type = 'aging_roof'
       ORDER BY score DESC LIMIT 100
     ) t GROUP BY zip ORDER BY c DESC LIMIT 15`,
  );
  console.log("Top 100 leads by zip:", top100.rows);

  const top500 = await query<{ zip: string | null; c: number }>(
    `SELECT zip, COUNT(*)::int AS c FROM (
       SELECT zip FROM leads WHERE lead_type = 'aging_roof'
       ORDER BY score DESC LIMIT 500
     ) t GROUP BY zip ORDER BY c DESC LIMIT 15`,
  );
  console.log("Top 500 leads by zip:", top500.rows);

  await closeDb();
}

main();
