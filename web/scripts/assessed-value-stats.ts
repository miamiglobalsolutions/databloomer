import { closeDb, query } from "../src/lib/db/client";

async function main() {
  const properties = await query<{
    total: number;
    populated: number;
    estimated: number;
    county: number;
    avg_value: string | null;
    median_value: string | null;
  }>(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(assessed_value) FILTER (WHERE assessed_value IS NOT NULL AND assessed_value > 0)::int AS populated,
      COUNT(*) FILTER (WHERE assessed_value_source = 'heated_area_estimate')::int AS estimated,
      COUNT(*) FILTER (WHERE assessed_value_source = 'county')::int AS county,
      ROUND(AVG(assessed_value) FILTER (WHERE assessed_value IS NOT NULL AND assessed_value > 0))::bigint AS avg_value,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY assessed_value)
        FILTER (WHERE assessed_value IS NOT NULL AND assessed_value > 0))::bigint AS median_value
    FROM properties
  `);

  const leads = await query<{
    total: number;
    populated: number;
    replacement_likely: number;
    avg_score: string | null;
  }>(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(assessed_value) FILTER (WHERE assessed_value IS NOT NULL AND assessed_value > 0)::int AS populated,
      COUNT(*) FILTER (WHERE score >= 80)::int AS replacement_likely,
      ROUND(AVG(score)::numeric, 1)::float AS avg_score
    FROM leads
    WHERE lead_type = 'aging_roof'
  `);

  console.log(
    JSON.stringify(
      {
        properties: properties.rows[0],
        aging_roof_leads: leads.rows[0],
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => closeDb());
