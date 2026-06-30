import type { AgingRoofIndexReport } from "@/lib/reports/aging-roof-index";
import snapshot from "@/data/reports/miami-dade-aging-roofs-hurricane-season-2026.json";

/** Published static edition — regenerate via `npm run report:snapshot`. */
export function getAgingRoofIndexReportSnapshot(): AgingRoofIndexReport {
  return snapshot as AgingRoofIndexReport;
}
