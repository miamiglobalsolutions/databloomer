"use client";

import { CircleMarker, Popup } from "react-leaflet";
import type { NeighborhoodBloomForecast } from "@/lib/leads/neighborhood-bloom";
import { MOMENTUM_LABEL_COPY } from "@/lib/leads/neighborhood-bloom";

function forecastColor(score: number): string {
  if (score >= 75) return "#dc2626";
  if (score >= 60) return "#ea580c";
  if (score >= 45) return "#ca8a04";
  return "#14532d";
}

type Props = {
  forecasts: NeighborhoodBloomForecast[];
  selectedZip: string | null;
  onSelectZip: (zip: string) => void;
  preview?: boolean;
};

export function BloomForecastMapLayer({
  forecasts,
  selectedZip,
  onSelectZip,
  preview,
}: Props) {
  const mappable = forecasts.filter(
    (f) =>
      f.lat != null &&
      f.lng != null &&
      Number.isFinite(f.lat) &&
      Number.isFinite(f.lng),
  );

  return (
    <>
      {mappable.map((row) => {
        const isSelected = selectedZip === row.zip;
        const fill = forecastColor(row.neighborhoodScore);
        const radius = 12 + Math.round(row.neighborhoodScore / 8);
        const momentum = MOMENTUM_LABEL_COPY[row.momentumLabel];

        return (
          <CircleMarker
            key={`forecast-${row.zip}`}
            center={[row.lat!, row.lng!]}
            radius={isSelected ? radius + 4 : radius}
            pathOptions={{
              color: isSelected ? "#1c1917" : fill,
              fillColor: fill,
              fillOpacity: isSelected ? 0.55 : 0.35,
              weight: isSelected ? 3 : 2,
              dashArray: "4 4",
            }}
            eventHandlers={{
              click: () => onSelectZip(row.zip),
            }}
          >
            <Popup>
              <div className="min-w-[200px] text-sm">
                <p className="font-semibold text-stone-900">ZIP {row.zip}</p>
                <p className="mt-1 text-stone-600">{momentum.title}</p>
                {!preview ? (
                  <>
                    <p className="mt-2 text-stone-700">
                      Neighborhood Bloom Score:{" "}
                      <strong>{row.neighborhoodScore}</strong>
                    </p>
                    <p className="text-stone-700">
                      Bloom probability:{" "}
                      <strong>{row.bloomProbability}%</strong>
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-stone-500">
                    Subscribe for full forecast scores.
                  </p>
                )}
                <p className="mt-2 text-xs text-stone-500">
                  {row.agingLeadCount} aging roofs · {row.recentPermits90d}{" "}
                  re-roof permits (90d)
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

export function BloomForecastMapLegend() {
  return (
    <div className="rounded-lg border border-stone-200 bg-white/95 px-3 py-2 text-xs text-stone-600 shadow-sm backdrop-blur-sm">
      <p className="font-semibold uppercase tracking-wide text-stone-500">
        Bloom forecast layer
      </p>
      <p className="mt-1">
        Dashed circles = ZIP-level bloom score (red = hottest).
      </p>
    </div>
  );
}
