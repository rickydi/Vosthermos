"use client";

import { useEffect } from "react";

// Enregistre le service worker terrain (installable sur l'écran d'accueil du cellulaire).
export default function TerrainPWA() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/terrain-sw.js", { scope: "/terrain" }).catch(() => {});
  }, []);
  return null;
}
