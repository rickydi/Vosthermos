import { ImageResponse } from "next/og";

// Aperçu du lien texté/courriellé au client (carte SMS, Messenger, iMessage…).
// Sans ce fichier, l'aperçu retombait sur le logo noir par défaut du site.
export const runtime = "edge";
export const alt = "Envoyez vos photos a Vosthermos";
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #002530 0%, #004d5e 62%, #0f1720 100%)",
          color: "#fff",
          fontFamily: "Arial, Helvetica, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 148,
            height: 148,
            borderRadius: 40,
            background: "#e30718",
            boxShadow: "0 24px 60px rgba(227,7,24,0.35)",
            fontSize: 76,
            marginBottom: 44,
          }}
        >
          📷
        </div>
        <div style={{ display: "flex", fontSize: 74, fontWeight: 900, letterSpacing: 0, textAlign: "center" }}>
          Envoyez-nous vos photos
        </div>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            fontSize: 32,
            color: "rgba(255,255,255,0.8)",
            textAlign: "center",
          }}
        >
          2 minutes avec votre téléphone — directement dans votre dossier
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 44,
            display: "flex",
            fontSize: 34,
            fontWeight: 900,
          }}
        >
          VOS<span style={{ color: "#ff3547" }}>THERMOS</span>
          <span style={{ color: "rgba(255,255,255,0.55)", marginLeft: 18, fontWeight: 700 }}>514-825-8411</span>
        </div>
      </div>
    ),
    size
  );
}
