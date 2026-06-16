"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { LeadRecord } from "@/lib/leads/types";
import {
  BLOOM_ZONE_TIERS,
  DATABLOOM_SCORE_LABEL,
  formatDataBloomScore,
  getBloomZoneColor,
  getBloomZoneTier,
} from "@/lib/leads/databloom-score";
import { displayAddress } from "@/lib/subscription/access";
import "leaflet/dist/leaflet.css";

const MIAMI_CENTER: [number, number] = [25.7617, -80.1918];

type Basemap = "street" | "satellite";
export type BloomMapStyle = "zones" | "minimal";

const BASEMAPS = {
  street: {
    label: "Street",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    labelsUrl:
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a>',
  },
} as const;

function FitBounds({ leads }: { leads: LeadRecord[] }) {
  const map = useMap();

  useEffect(() => {
    const points = leads
      .filter((l) => l.lat != null && l.lng != null)
      .map((l) => [l.lat!, l.lng!] as [number, number]);

    if (points.length === 0) {
      map.setView(MIAMI_CENTER, 11);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }

    map.fitBounds(points, { padding: [48, 48], maxZoom: 14 });
  }, [leads, map]);

  return null;
}

function LockMapInteractions({ locked }: { locked: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!locked) return;

    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    map.zoomControl?.remove();

    return () => {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    };
  }, [locked, map]);

  return null;
}

function BasemapLayers({ basemap }: { basemap: Basemap }) {
  if (basemap === "street") {
    return (
      <TileLayer
        key="street"
        attribution={BASEMAPS.street.attribution}
        url={BASEMAPS.street.url}
      />
    );
  }

  return (
    <>
      <TileLayer
        key="satellite"
        attribution={BASEMAPS.satellite.attribution}
        url={BASEMAPS.satellite.url}
      />
      <TileLayer
        key="satellite-labels"
        url={BASEMAPS.satellite.labelsUrl}
        opacity={0.75}
        pane="overlayPane"
      />
    </>
  );
}

type Props = {
  leads: LeadRecord[];
  type: "aging_roof" | "code_violation" | "new_construction";
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  mapStyle?: BloomMapStyle;
  /** When false, map is visible but pan/zoom/pin clicks are disabled. */
  interactive?: boolean;
};

export function BloomZonesMap({
  leads,
  type,
  selectedId,
  onSelect,
  mapStyle = "zones",
  interactive = true,
}: Props) {
  const [basemap, setBasemap] = useState<Basemap>("street");

  const mappable = useMemo(
    () =>
      leads.filter(
        (l) =>
          l.lat != null &&
          l.lng != null &&
          Number.isFinite(l.lat) &&
          Number.isFinite(l.lng),
      ),
    [leads],
  );

  const selectedLead = mappable.find((l) => l.id === selectedId) ?? null;
  const missing = leads.length - leads.filter((l) => l.lat != null && l.lng != null).length;

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-stone-200 shadow-sm">
        <div className="absolute left-3 top-3 z-[1000] rounded-lg border border-stone-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Bloom Zones
          </p>
          <p className="text-sm font-medium text-stone-800">
            {mapStyle === "zones"
              ? `Color-coded by ${DATABLOOM_SCORE_LABEL}`
              : "Minimal pin view"}
          </p>
        </div>

        <div className="absolute right-3 top-3 z-[1000] flex rounded-lg border border-stone-200 bg-white/95 p-1 shadow-md backdrop-blur-sm">
          {(Object.keys(BASEMAPS) as Basemap[]).map((key) => (
            <button
              key={key}
              type="button"
              disabled={!interactive}
              onClick={() => setBasemap(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                basemap === key
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              {BASEMAPS[key].label}
            </button>
          ))}
        </div>

        {!interactive && (
          <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-stone-900/50 p-6">
            <div className="max-w-sm rounded-xl border border-stone-200 bg-white p-6 text-center shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                Subscribers only
              </p>
              <h3 className="mt-2 text-lg font-semibold text-stone-900">
                Interactive map view
              </h3>
              <p className="mt-2 text-sm text-stone-600">
                Subscribe to zoom, pan, switch basemaps, and click pins for lead
                details on the map.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link
                  href="/subscribe"
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                >
                  Subscribe
                </Link>
                <Link
                  href="/subscribe#sign-in"
                  className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        )}

        <MapContainer
          center={MIAMI_CENTER}
          zoom={11}
          className={`h-[min(70vh,640px)] w-full ${interactive ? "" : "pointer-events-none"}`}
          scrollWheelZoom={interactive}
          dragging={interactive}
          doubleClickZoom={interactive}
          touchZoom={interactive}
          boxZoom={interactive}
          keyboard={interactive}
          zoomControl={interactive}
        >
          <BasemapLayers basemap={basemap} />
          <FitBounds leads={mappable} />
          {!interactive && <LockMapInteractions locked />}
          {mappable.map((lead) => {
            const isSelected = lead.id === selectedId;
            const fillColor =
              mapStyle === "zones"
                ? getBloomZoneColor(lead.score)
                : isSelected
                  ? getBloomZoneColor(lead.score)
                  : "#78716c";

            return (
              <CircleMarker
                key={lead.id}
                center={[lead.lat!, lead.lng!]}
                radius={isSelected ? 11 : 8}
                pathOptions={{
                  color: isSelected ? "#1c1917" : fillColor,
                  fillColor,
                  fillOpacity: isSelected ? 1 : 0.9,
                  weight: isSelected ? 3 : 1.5,
                }}
                eventHandlers={
                  interactive
                    ? { click: () => onSelect(lead.id) }
                    : undefined
                }
              >
                <Popup>
                  <div className="min-w-[200px] text-sm">
                    <p className="font-semibold text-stone-900">
                      {displayAddress(lead.address)}
                    </p>
                    <p className="mt-1 text-stone-600">
                      {formatDataBloomScore(lead.score)} ·{" "}
                      {getBloomZoneTier(lead.score).label}
                    </p>
                    {lead.zip && (
                      <p className="text-stone-500">ZIP {lead.zip}</p>
                    )}
                    {type === "aging_roof" && lead.roof_age_years != null && (
                      <p className="mt-1 text-stone-700">
                        Roof age: {lead.roof_age_years} yrs
                      </p>
                    )}
                    <p className="mt-2 text-xs leading-snug text-stone-600">
                      {lead.signal_summary}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Bloom Zone legend
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {BLOOM_ZONE_TIERS.map((tier) => (
            <div key={tier.tier} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block h-4 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: tier.color }}
              />
              <span className="text-stone-700">
                <span className="font-medium">{tier.label}</span>
                <span className="text-stone-500">
                  {" "}
                  ({tier.minScore}–{tier.maxScore})
                </span>
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-stone-500">
          Each pin is color-coded by {DATABLOOM_SCORE_LABEL}. Focus canvassing on
          orange and red pins. Showing {mappable.length} on map
          {missing > 0 ? ` · ${missing} without coordinates` : ""}.
          {selectedLead && (
            <span className="ml-1 font-medium text-stone-700">
              Selected: {getBloomZoneTier(selectedLead.score).label} (
              {formatDataBloomScore(selectedLead.score)}).
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
