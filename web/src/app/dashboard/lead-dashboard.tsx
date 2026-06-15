"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import type { LeadRecord } from "@/lib/leads/types";
import { normalizeZipInput } from "@/lib/miami-dade/zips";
import { AREA_ZIP_SHORTCUTS } from "@/lib/miami-dade/areas";
import { LeadCard } from "./lead-card";

const LeadMap = dynamic(
  () => import("./lead-map").then((m) => m.LeadMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(70vh,640px)] items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-500">
        Loading map…
      </div>
    ),
  },
);

type ViewMode = "list" | "map";

type Props = {
  type: "aging_roof" | "code_violation";
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
        // Map "All county" — load every lead so all areas get pins
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

  const selectedLead = leads.find((l) => l.id === selectedId) ?? null;

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
          <p className="text-sm text-stone-500">
            {loading ? "Loading…" : `${leads.length} leads`}
            {!loading && !normalizeZipInput(zip) && view === "map" && totalLeads != null && (
              <span className="text-stone-400">
                {" "}
                · {leads.length >= totalLeads ? "full county" : `of ${totalLeads} total`}
              </span>
            )}
            {!loading && !normalizeZipInput(zip) && view === "list" && (
              <span className="text-stone-400"> · sampled across all zips</span>
            )}
          </p>
        </div>

        <div className="flex rounded-lg border border-stone-200 bg-stone-100 p-1">
          <ViewButton active={view === "list"} onClick={() => setView("list")}>
            List
          </ViewButton>
          <ViewButton active={view === "map"} onClick={() => setView("map")}>
            Map
          </ViewButton>
        </div>
      </div>

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

      {!normalizeZipInput(zip) && !loading && view === "map" && (
        <p className="text-sm text-stone-500">
          All county map loads every lead with coordinates
          {totalLeads != null ? ` (${totalLeads.toLocaleString()} in database)` : ""}.
          Use a ZIP shortcut to focus on one area.
        </p>
      )}

      {!normalizeZipInput(zip) && !loading && view === "list" && (
        <p className="text-sm text-stone-500">
          List view shows top leads from every ZIP. Use a shortcut above or enter a
          ZIP (e.g. 33131, 33139) to see all leads in that area.
        </p>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
          <p className="mt-2 text-xs text-red-700">
            Run <code className="rounded bg-red-100 px-1">npm run ingest</code> to
            load live Miami-Dade leads.
          </p>
        </div>
      )}

      {view === "map" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <LeadMap
            leads={leads}
            type={type}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <aside className="space-y-3">
            <h2 className="text-sm font-semibold text-stone-700">
              {selectedLead ? "Selected lead" : "Click a pin for details"}
            </h2>
            {selectedLead ? (
              <LeadCard lead={selectedLead} type={type} />
            ) : (
              <p className="rounded-xl border border-dashed border-stone-300 p-6 text-sm text-stone-500">
                Select a marker on the map to see full lead details here.
              </p>
            )}
          </aside>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} type={type} />
          ))}
        </div>
      )}

      {!loading && leads.length === 0 && !error && (
        <div className="rounded-xl border border-dashed border-stone-300 p-12 text-center text-stone-500">
          No leads yet. Run ingest to populate the database.
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
