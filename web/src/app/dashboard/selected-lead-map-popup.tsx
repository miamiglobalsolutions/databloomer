"use client";

import { EstimatedJobValue } from "@/components/estimated-job-value";
import { CircleMarker, Popup } from "react-leaflet";
import type { LeadRecord } from "@/lib/leads/types";
import {
  formatDataBloomScore,
  getBloomZoneTier,
} from "@/lib/leads/databloom-score";
import { displayAddress } from "@/lib/subscription/access";

type Props = {
  lead: LeadRecord;
  type: "aging_roof" | "code_violation" | "new_construction";
};

function PopupBody({ lead, type }: Props) {
  return (
    <div className="min-w-[200px] text-sm">
      <p className="font-semibold text-stone-900">
        {displayAddress(lead.address)}
      </p>
      <p className="mt-1 text-stone-600">
        {formatDataBloomScore(lead.score)} · {getBloomZoneTier(lead.score).label}
      </p>
      {lead.zip ? <p className="text-stone-500">ZIP {lead.zip}</p> : null}
      {type === "aging_roof" && lead.roof_age_years != null ? (
        <p className="mt-1 text-stone-700">Roof age: {lead.roof_age_years} yrs</p>
      ) : null}
      {lead.estimated_job_value != null ? (
        <div className="mt-2">
          <EstimatedJobValue
            value={lead.estimated_job_value}
            heatedSqft={lead.building_heated_area}
            compact
            showDisclaimer={false}
          />
        </div>
      ) : null}
      <p className="mt-2 text-xs leading-snug text-stone-600">
        {lead.signal_summary}
      </p>
    </div>
  );
}

export function SelectedLeadMapPopup({ lead, type }: Props) {
  if (
    lead.lat == null ||
    lead.lng == null ||
    !Number.isFinite(lead.lat) ||
    !Number.isFinite(lead.lng)
  ) {
    return null;
  }

  return (
    <CircleMarker
      key={lead.id}
      center={[lead.lat, lead.lng]}
      radius={0}
      pathOptions={{
        opacity: 0,
        fillOpacity: 0,
        weight: 0,
      }}
      eventHandlers={{
        add: (event) => {
          event.target.openPopup();
        },
      }}
    >
      <Popup autoPan maxWidth={320} minWidth={200}>
        <PopupBody lead={lead} type={type} />
      </Popup>
    </CircleMarker>
  );
}
