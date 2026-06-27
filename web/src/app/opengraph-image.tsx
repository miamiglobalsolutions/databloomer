import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "DataBloomer — Miami-Dade roofing leads, Bloom Zones, and DataBloom Score for contractors";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #fff7ed 0%, #fafaf9 45%, #f0fdf4 100%)",
          padding: "56px 64px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#f0fdf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 23.5C16 23.5 8.5 19.5 9.5 12.5C10.2 8.5 13.5 8 15.5 11C15.8 11.5 16 12.2 16 13.2V23.5Z"
                fill="#22c55e"
              />
              <path
                d="M16 23.5C16 23.5 23.5 19.5 22.5 12.5C21.8 8.5 18.5 8 16.5 11C16.2 11.5 16 12.2 16 13.2V23.5Z"
                fill="#16a34a"
              />
            </svg>
          </div>
          <span style={{ fontSize: 36, fontWeight: 700, color: "#1c1917" }}>
            DataBloomer
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 58,
              fontWeight: 800,
              color: "#1c1917",
              lineHeight: 1.1,
              letterSpacing: -1,
              maxWidth: 980,
            }}
          >
            Miami Roofing Leads for Contractors
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#44403c",
              lineHeight: 1.35,
              maxWidth: 900,
            }}
          >
            Aging roof leads · Bloom Zone maps · DataBloom Score · Miami-Dade
            County
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {["55k+ aging roofs", "Canvassing maps", "Lead subscription"].map(
            (label) => (
              <div
                key={label}
                style={{
                  background: "#ea580c",
                  color: "white",
                  padding: "10px 18px",
                  borderRadius: 999,
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
