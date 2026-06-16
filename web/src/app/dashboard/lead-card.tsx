import Link from "next/link";
import type { LeadRecord } from "@/lib/leads/types";
import {
  formatDataBloomScore,
  getBloomZoneTier,
} from "@/lib/leads/databloom-score";
import {
  displayAddress,
  displayFolio,
  hasFullSubscriberAccess,
  isSubscriptionGatingEnabled,
} from "@/lib/subscription/access";

export function LeadCard({
  lead,
  type,
  compact,
}: {
  lead: LeadRecord;
  type: "aging_roof" | "code_violation" | "new_construction";
  compact?: boolean;
}) {
  const confidenceColors = {
    high: "bg-emerald-100 text-emerald-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-stone-100 text-stone-600",
  };

  const bloomZone = getBloomZoneTier(lead.score);
  const address = displayAddress(lead.address);
  const folio = displayFolio(lead.folio);
  const gated = isSubscriptionGatingEnabled() && !hasFullSubscriberAccess();

  return (
    <article
      className={`rounded-xl border border-stone-200 bg-white shadow-sm ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`font-semibold text-stone-900 ${gated ? "select-none blur-[3px]" : ""}`}
          >
            {address}
          </h3>
          <p className="text-sm text-stone-500">
            {lead.zip ? `ZIP ${lead.zip}` : "Miami-Dade"}
            {folio ? (
              <span className={gated ? "select-none blur-[3px]" : ""}>
                {" "}
                · Folio {folio}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: bloomZone.color }}
          >
            {formatDataBloomScore(lead.score)}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-stone-500">
            {bloomZone.label}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${confidenceColors[lead.confidence]}`}
          >
            {lead.confidence}
          </span>
        </div>
      </div>

      {gated && !compact && (
        <p className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-900">
          <Link href="/subscribe" className="font-medium underline">
            Subscribe
          </Link>{" "}
          to unlock full address and folio for canvassing.
        </p>
      )}

      {!compact && (
        <p className="mt-3 text-sm leading-relaxed text-stone-700">
          {lead.signal_summary}
        </p>
      )}

      {type === "aging_roof" && !compact && (
        <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-stone-600">
          <div>
            <dt className="font-medium text-stone-500">Roof age</dt>
            <dd>{lead.roof_age_years != null ? `${lead.roof_age_years} yrs` : "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-stone-500">Last roof / built</dt>
            <dd>
              {lead.last_roof_date
                ? new Date(lead.last_roof_date).getFullYear()
                : lead.year_built ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-stone-500">Year built</dt>
            <dd>{lead.year_built ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-stone-500">Assessed value</dt>
            <dd>
              {lead.assessed_value != null
                ? `$${Number(lead.assessed_value).toLocaleString()}`
                : "—"}
            </dd>
          </div>
        </dl>
      )}

      {type === "code_violation" && lead.violation_desc && !compact && (
        <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-700">
          {lead.violation_desc}
          {lead.violation_case ? ` (Case ${lead.violation_case})` : ""}
        </p>
      )}

      {type === "new_construction" && !compact && (
        <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-900">
          {lead.violation_desc ? `Builder: ${lead.violation_desc}` : "Builder not listed"}
          {lead.violation_case ? ` · Permit ${lead.violation_case}` : ""}
        </p>
      )}
    </article>
  );
}
