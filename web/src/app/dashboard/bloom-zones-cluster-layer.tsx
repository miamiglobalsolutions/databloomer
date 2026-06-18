"use client";

import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import type { LeadRecord } from "@/lib/leads/types";
import { getBloomZoneColor } from "@/lib/leads/databloom-score";
import type { BloomMapStyle } from "./bloom-zones-map";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

type Props = {
  leads: LeadRecord[];
  mapStyle: BloomMapStyle;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  interactive: boolean;
};

export function BloomZonesClusterLayer({
  leads,
  mapStyle,
  selectedId,
  onSelect,
  interactive,
}: Props) {
  const map = useMap();

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 40,
      chunkDelay: 20,
      maxClusterRadius: 52,
      disableClusteringAtZoom: 15,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      removeOutsideVisibleBounds: true,
    });

    for (const lead of leads) {
      if (
        lead.lat == null ||
        lead.lng == null ||
        !Number.isFinite(lead.lat) ||
        !Number.isFinite(lead.lng)
      ) {
        continue;
      }

      const isSelected = lead.id === selectedId;
      const fillColor =
        mapStyle === "zones"
          ? getBloomZoneColor(lead.score)
          : isSelected
            ? getBloomZoneColor(lead.score)
            : "#78716c";

      const marker = L.circleMarker([lead.lat, lead.lng], {
        radius: isSelected ? 11 : 8,
        color: isSelected ? "#1c1917" : fillColor,
        fillColor,
        fillOpacity: isSelected ? 1 : 0.9,
        weight: isSelected ? 3 : 1.5,
      });

      if (interactive) {
        marker.on("click", () => onSelect(lead.id));
      }

      cluster.addLayer(marker);
    }

    map.addLayer(cluster);

    return () => {
      map.removeLayer(cluster);
    };
  }, [leads, mapStyle, selectedId, onSelect, interactive, map]);

  return null;
}
