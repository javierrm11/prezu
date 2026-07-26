import { ImageResponse } from "next/og";

export const alt = "Prezu — Del tajo al presupuesto en 30 segundos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A2B6D",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
              fill="#F4A623"
            />
            <path
              d="M8.5 10.5v2.5M12 8.5v6M15.5 10v3.5"
              stroke="#1A2B6D"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, color: "#FFFFFF" }}>
            Prezu
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 40,
            fontWeight: 700,
            color: "#F4A623",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Del tajo al presupuesto en 30 segundos
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 26,
            color: "rgba(255,255,255,0.75)",
            textAlign: "center",
            maxWidth: 880,
          }}
        >
          Presupuestos y facturas por voz para autónomos de oficios
        </div>
      </div>
    ),
    { ...size },
  );
}
