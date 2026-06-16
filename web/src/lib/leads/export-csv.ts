import type { LeadRecord } from "@/lib/leads/types";
import { getBloomZoneTier } from "@/lib/leads/databloom-score";
import {
  displayAddress,
  displayFolio,
  hasFullSubscriberAccess,
} from "@/lib/subscription/access";

function escapeCsv(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function leadsToCsv(
  leads: LeadRecord[],
  leadType: "aging_roof" | "code_violation" | "new_construction",
): string {
  const headers =
    leadType === "aging_roof"
      ? [
          "Address",
          "ZIP",
          "Folio",
          "DataBloom Score",
          "Bloom Zone",
          "Confidence",
          "Roof Age Years",
          "Year Built",
          "Assessed Value",
          "Lat",
          "Lng",
          "Summary",
        ]
      : leadType === "code_violation"
        ? [
          "Address",
          "ZIP",
          "Folio",
          "DataBloom Score",
          "Bloom Zone",
          "Confidence",
          "Violation Case",
          "Violation Description",
          "Lat",
          "Lng",
          "Summary",
        ]
        : [
          "Address",
          "ZIP",
          "Folio",
          "DataBloom Score",
          "Bloom Zone",
          "Confidence",
          "Permit / Process",
          "Builder",
          "Lat",
          "Lng",
          "Summary",
        ];

  const rows = leads.map((lead) => {
    const zone = getBloomZoneTier(lead.score).label;
    const cells =
      leadType === "aging_roof"
        ? [
            hasFullSubscriberAccess() ? lead.address : displayAddress(lead.address),
            lead.zip,
            hasFullSubscriberAccess() ? lead.folio : displayFolio(lead.folio),
            lead.score,
            zone,
            lead.confidence,
            lead.roof_age_years,
            lead.year_built,
            lead.assessed_value,
            lead.lat,
            lead.lng,
            lead.signal_summary,
          ]
        : leadType === "code_violation"
          ? [
            hasFullSubscriberAccess() ? lead.address : displayAddress(lead.address),
            lead.zip,
            hasFullSubscriberAccess() ? lead.folio : displayFolio(lead.folio),
            lead.score,
            zone,
            lead.confidence,
            lead.violation_case,
            lead.violation_desc,
            lead.lat,
            lead.lng,
            lead.signal_summary,
          ]
          : [
            hasFullSubscriberAccess() ? lead.address : displayAddress(lead.address),
            lead.zip,
            hasFullSubscriberAccess() ? lead.folio : displayFolio(lead.folio),
            lead.score,
            zone,
            lead.confidence,
            lead.violation_case,
            lead.violation_desc,
            lead.lat,
            lead.lng,
            lead.signal_summary,
          ];
    return cells.map(escapeCsv).join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function downloadLeadsCsv(
  leads: LeadRecord[],
  leadType: "aging_roof" | "code_violation" | "new_construction",
  filename?: string,
): void {
  if (!hasFullSubscriberAccess()) {
    window.alert(
      "CSV export with full addresses and folios is available to subscribers. Visit /subscribe to learn more.",
    );
    return;
  }

  const csv = leadsToCsv(leads, leadType);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download =
    filename ??
    `databloomer-${leadType}-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
