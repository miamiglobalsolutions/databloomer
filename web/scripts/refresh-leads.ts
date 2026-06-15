import { refreshAllLeads } from "../src/lib/leads/refresh";

async function main() {
  const result = await refreshAllLeads();
  console.log("Leads refreshed:", result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
