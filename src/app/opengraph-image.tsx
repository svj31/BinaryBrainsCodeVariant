import { ImageResponse } from "next/og";

export const alt = "SecondWind logo beside the line: Every unfinished project deserves a second look.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5f0e6",
          padding: "72px 80px",
          color: "#1e2721",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="88" height="88" viewBox="0 0 48 48" fill="none">
            <path d="M6 42.5h36" stroke="#1e2721" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M12.5 42.5V21a11.5 11.5 0 0 1 23 0v21.5" stroke="#1e2721" strokeWidth="2.6" />
            <path d="M24 42.5v-15" stroke="#2d5a43" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M24 31.5c-1-4.6-4.4-6.6-8.4-6.2.5 4.1 3.6 6.7 8.4 6.2z" fill="#2d5a43" />
            <path d="M24 28c.8-5 4.6-7.4 9.2-7-.4 4.6-3.9 7.5-9.2 7z" fill="#e9a53a" />
            <path d="M31 8.5c3.5-2.6 8.6-2.3 10 .6 1.1 2.4-1.4 4.3-3.6 3" stroke="#e9a53a" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <div style={{ display: "flex", fontSize: 52, fontWeight: 700 }}>
            Second<span style={{ color: "#2d5a43" }}>Wind</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, fontWeight: 700, maxWidth: 940 }}>
            Every unfinished project deserves a second look.
          </div>
          <div style={{ fontSize: 30, color: "#434e47", maxWidth: 900, fontFamily: "sans-serif" }}>
            Record why it stalled. Get a verdict you can argue with. Revive, pivot, salvage, merge or archive.
          </div>
        </div>
        <div style={{ display: "flex", height: 10, width: "100%" }}>
          <div style={{ flex: 3, background: "#2d6a4a" }} />
          <div style={{ flex: 2, background: "#e9a53a" }} />
          <div style={{ flex: 2, background: "#22617a" }} />
          <div style={{ flex: 1, background: "#84452a" }} />
          <div style={{ flex: 1, background: "#cfc8ba" }} />
        </div>
      </div>
    ),
    size,
  );
}
