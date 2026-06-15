import { query, closeDb } from "../src/lib/db/client";

async function main() {
  for (const zip of ["33030", "33031", "33125", "33131", "33139", "33130", "33129"]) {
    const count = await query<{ n: number }>(
      `SELECT COUNT(*)::int AS n FROM leads WHERE lead_type = 'aging_roof' AND zip LIKE $1`,
      [`${zip}%`],
    );
    const samples = await query<{ address: string; zip: string }>(
      `SELECT address, zip FROM leads WHERE zip LIKE $1 ORDER BY score DESC LIMIT 2`,
      [`${zip}%`],
    );
    console.log(`${zip}: ${count.rows[0].n} leads`, samples.rows);
  }
  await closeDb();
}

main();
