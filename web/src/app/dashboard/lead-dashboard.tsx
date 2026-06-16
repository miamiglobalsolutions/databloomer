"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BloomZoneFilter,
  defaultBloomZoneTiers,
} from "@/components/bloom-zone-filter";
import { DigestSubscribe } from "@/components/digest-subscribe";
import type { BloomZoneTier } from "@/lib/leads/databloom-score";
import { filterLeadsByBloomZone } from "@/lib/leads/databloom-score";
import { computeTopBloomZips } from "@/lib/leads/bloom-zips";
import { downloadLeadsCsv } from "@/lib/leads/export-csv";
import type { LeadRecord } from "@/lib/leads/types";
import { AREA_ZIP_SHORTCUTS } from "@/lib/miami-dade/areas";
import { normalizeZipInput } from "@/lib/miami-dade/zips";
import type { BloomMapStyle } from "./lead-map";
import { LeadCard } from "./lead-card";
import { TopBloomZipsPanel } from "./top-bloom-zips";

const LeadMap = dynamic(
  () => import("./lead-map").then((m) => m.LeadMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(70vh,640px)] items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-500">
        Loading Bloom Zones…
      </div>
    ),
  },
);

type ViewMode = "list" | "map";

type Props = {
  type: "aging_roof" | "code_violation" | "new_construction";
  initialZip: string;
  initialView?: ViewMode;
};

export function LeadDashboard({ type, initialZip, initialView = "list" }: Props) {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [zip, setZip] = useState(initialZip);
  const [view, setView] = useState<ViewMode>(initialView);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalLeads, setTotalLeads] = useState<number | null>(null);
  const [mapStyle, setMapStyle] = useState<BloomMapStyle>("zones");
  const [activeBloomTiers, setActiveBloomTiers] = useState<Set<BloomZoneTier>>(
    defaultBloomZoneTiers,
  );
  const [fullAccess, setFullAccess] = useState(true);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const zipFilter = normalizeZipInput(zip);
      const params = new URLSearchParams({ type });

      if (zipFilter) {
        params.set("zip", zipFilter);
        params.set("limit", "500");
      } else if (view === "map") {
        params.set("limit", "8500");
      } else {
        params.set("diverse", "true");
        params.set("perZip", "8");
        params.set("limit", "800");
      }

      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load leads");
      setLeads(data.leads ?? []);
      setTotalLeads(typeof data.total === "number" ? data.total : null);
      setFullAccess(Boolean(data.access?.full ?? true));
      setSelectedId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load leads");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [type, zip, view]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const filteredLeads = useMemo(
    () => filterLeadsByBloomZone(leads, activeBloomTiers),
    [leads, activeBloomTiers],
  );

  const selectedLead =
    filteredLeads.find((l) => l.id === selectedId) ?? null;
  const topBloomZips = useMemo(
    () => computeTopBloomZips(filteredLeads, 5),
    [filteredLeads],
  );
  const canExport = fullAccess;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
              Filter by ZIP
            </label>
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="e.g. 33145"
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={loadLeads}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            Refresh
          </button>
          <button
            type="button"
            disabled={filteredLeads.length === 0 || !canExport}
            onClick={() => downloadLeadsCsv(filteredLeads, type, fullAccess)}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-50"
            title={
              canExport
                ? "Download CSV"
                : "Subscribe for full CSV export with addresses"
            }
          >
            Export CSV
          </button>
          <p className="text-sm text-stone-500">
            {loading
              ? "Loading…"
              : `${filteredLeads.length} shown${filteredLeads.length !== leads.length ? ` of ${leads.length}` : ""}`}
            {!loading && !normalizeZipInput(zip) && view === "map" && totalLeads != null && (
              <span className="text-stone-400">
                {" "}
                · {leads.length >= totalLeads ? "full county" : `of ${totalLeads} total`}
              </span>
            )}
          </p>
        </div>

        <div className="flex rounded-lg border border-stone-200 bg-stone-100 p-1">
          <ViewButton active={view === "list"} onClick={() => setView("list")}>
            List
          </ViewButton>
          <ViewButton active={view === "map"} onClick={() => setView("map")}>
            Bloom Zones
          </ViewButton>
        </div>
      </div>

      <BloomZoneFilter
        activeTiers={activeBloomTiers}
        onChange={setActiveBloomTiers}
      />

      {!canExport && (
        <p className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-950">
          Preview mode: addresses and folios are masked.{" "}
          <Link href="/subscribe" className="font-medium underline">
            Subscribe
          </Link>{" "}
          for full canvassing data and CSV export.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {AREA_ZIP_SHORTCUTS.map((area) => {
          const active = zip === area.zip;
          return (
            <button
              key={area.label}
              type="button"
              onClick={() => setZip(area.zip)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                active
                  ? "border-orange-600 bg-orange-600 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
              }`}
            >
              {area.label}
              {area.zip ? ` (${area.zip})` : ""}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {view === "map" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
              <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
                Map style
              </span>
              <button
                type="button"
                onClick={() => setMapStyle("zones")}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  mapStyle === "zones"
                    ? "bg-stone-900 text-white"
                    : "bg-white text-stone-600"
                }`}
              >
                Bloom colors
              </button>
              <button
                type="button"
                onClick={() => setMapStyle("minimal")}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  mapStyle === "minimal"
                    ? "bg-stone-900 text-white"
                    : "bg-white text-stone-600"
                }`}
              >
                Minimal pins
              </button>
            </div>
            <LeadMap
              leads={filteredLeads}
              type={type}
              selectedId={selectedId}
              onSelect={setSelectedId}
              mapStyle={mapStyle}
            />
          </div>
          <aside className="space-y-4">
            <TopBloomZipsPanel
              zips={topBloomZips}
              activeZip={normalizeZipInput(zip)}
              onSelectZip={setZip}
            />
            <div>
              <h2 className="mb-2 text-sm font-semibold text-stone-700">
                {selectedLead ? "Selected lead" : "Click a pin for details"}
              </h2>
              {selectedLead ? (
                <LeadCard lead={selectedLead} type={type} fullAccess={fullAccess} />
              ) : (
                <p className="rounded-xl border border-dashed border-stone-300 p-6 text-sm text-stone-500">
                  Click a color-coded pin to see lead details here.
                </p>
              )}
            </div>
            <DigestSubscribe compact />
          </aside>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} type={type} fullAccess={fullAccess} />
            ))}
          </div>
          <aside className="space-y-4">
            <TopBloomZipsPanel
              zips={topBloomZips}
              activeZip={normalizeZipInput(zip)}
              onSelectZip={setZip}
            />
            <DigestSubscribe compact />
          </aside>
        </div>
      )}

      {!loading && filteredLeads.length === 0 && !error && (
        <div className="rounded-xl border border-dashed border-stone-300 p-12 text-center text-stone-500">
          {leads.length > 0
            ? "No leads match the selected Bloom Zones. Try enabling more color tiers."
            : "No leads yet. Run ingest to populate the database."}
        </div>
      )}
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-white text-stone-900 shadow-sm"
          : "text-stone-600 hover:text-stone-900"
      }`}
    >
      {children}
    </button>
  );
}
