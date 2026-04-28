import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Apercu du portail gestionnaire Vosthermos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #002530 0%, #004d5e 62%, #0f1720 100%)",
          color: "#fff",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: 64,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: "48%" }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 900, letterSpacing: 0 }}>
            VOS<span style={{ color: "#ff3547" }}>THERMOS</span>
          </div>
          <div
            style={{
              marginTop: 58,
              display: "flex",
              color: "#6fb7c7",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 0,
              textTransform: "uppercase",
            }}
          >
            Portail gestionnaire
          </div>
          <div style={{ marginTop: 18, fontSize: 62, lineHeight: 1.02, fontWeight: 900, letterSpacing: 0 }}>
            Suivi clair des travaux de fenetres en copropriete.
          </div>
          <div style={{ marginTop: 26, fontSize: 25, lineHeight: 1.35, color: "rgba(255,255,255,0.78)" }}>
            Bons de travail, photos, historique par unite et facturation centralisee.
          </div>
        </div>
        <div
          style={{
            marginLeft: 54,
            marginTop: 24,
            width: 520,
            height: 448,
            borderRadius: 24,
            background: "rgba(0, 14, 19, 0.72)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 34px 80px rgba(0,0,0,0.38)",
            padding: 28,
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ fontSize: 19, fontWeight: 800 }}>Tableau de bord</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}>Les Jardins Fleuris - 24 unites</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#e30718" }} />
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {[
              ["247", "fenetres"],
              ["3", "bons actifs"],
              ["18", "photos"],
            ].map(([value, label]) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: 18,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontSize: 36, fontWeight: 900 }}>{value}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.62)", textTransform: "uppercase" }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["WO-2026-0412", "Unite 301 - remplacement thermos", "#22c55e"],
              ["WO-2026-0413", "Unite 204 - quincaillerie porte-patio", "#ff3547"],
              ["WO-2026-0414", "Inspection facade nord", "#6fb7c7"],
            ].map(([number, text, color]) => (
              <div
                key={number}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.52)" }}>{number}</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
