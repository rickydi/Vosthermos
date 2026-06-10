import "../globals.css";
import TerrainPWA from "./TerrainPWA";

export const metadata = {
  title: "Vosthermos Terrain",
  robots: "noindex, nofollow",
  manifest: "/terrain.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "VT Terrain" },
  icons: { apple: "/terrain-icon-192.png" },
};

export const viewport = {
  themeColor: "#0a0f1a",
};

export default function TerrainLayout({ children }) {
  return (
    <>
      {children}
      <TerrainPWA />
    </>
  );
}
