"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { LeadRecord } from "@/lib/leads/types";
import "leaflet/dist/leaflet.css";

const MIAMI_CENTER: [number, number] = [25.7617, -80.1918];

type Basemap = "street" | "satellite";

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
    attribution:
      'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  },
} as const;

function markerColor(score: number): string {
  if (score >= 80) return "#c2410c";
  if (score >= 65) return "#ea580c";
  return "#78716c";
}

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
  type: "aging_roof" | "code_violation";
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function LeadMap({ leads, type, selectedId, onSelect }: Props) {
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

  const missing = leads.length - mappable.length;

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-stone-200 shadow-sm">
        <div className="absolute right-3 top-3 z-[1000] flex rounded-lg border border-stone-200 bg-white/95 p-1 shadow-md backdrop-blur-sm">
          {(Object.keys(BASEMAPS) as Basemap[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setBasemap(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                basemap === key
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              {BASEMAPS[key].label}
            </button>
          ))}
        </div>

        <MapContainer
          center={MIAMI_CENTER}
          zoom={11}
          className="h-[min(70vh,640px)] w-full"
          scrollWheelZoom
        >
          <BasemapLayers basemap={basemap} />
          <FitBounds leads={mappable} />
          {mappable.map((lead) => {
            const isSelected = lead.id === selectedId;
            return (
              <CircleMarker
                key={lead.id}
                center={[lead.lat!, lead.lng!]}
                radius={isSelected ? 11 : 8}
                pathOptions={{
                  color: isSelected ? "#1c1917" : markerColor(lead.score),
                  fillColor: markerColor(lead.score),
                  fillOpacity: isSelected ? 1 : 0.85,
                  weight: isSelected ? 3 : 2,
                }}
                eventHandlers={{
                  click: () => onSelect(lead.id),
                }}
              >
                <Popup>
                  <div className="min-w-[200px] text-sm">
                    <p className="font-semibold text-stone-900">{lead.address}</p>
                    <p className="mt-1 text-stone-600">
                      Score {lead.score} · {lead.confidence}
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

      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#c2410c]" />
          High score (80+)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#ea580c]" />
          Medium (65–79)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#78716c]" />
          Lower
        </span>
        <span>
          Showing {mappable.length} on map
          {missing > 0 ? ` · ${missing} without coordinates` : ""}
        </span>
      </div>
    </div>
  );
}
