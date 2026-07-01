import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0fdf4",
          borderRadius: 40,
        }}
      >
        <svg width="140" height="140" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 23.5C16 23.5 8.5 19.5 9.5 12.5C10.2 8.5 13.5 8 15.5 11C15.8 11.5 16 12.2 16 13.2V23.5Z"
            fill="#22c55e"
          />
          <path
            d="M16 23.5C16 23.5 23.5 19.5 22.5 12.5C21.8 8.5 18.5 8 16.5 11C16.2 11.5 16 12.2 16 13.2V23.5Z"
            fill="#16a34a"
          />
          <path
            d="M16 13.2V23.5"
            stroke="#15803d"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
