"use client";

import { useEffect, useRef, useState } from "react";

const POLL_MS = 60000; // verifie la version toutes les 60 s

// Detecte qu'une nouvelle version de l'app a ete deployee (changement de BUILD_ID)
// et propose un rechargement. Evite que les employes restent bloques sur un vieux
// build en cache (boutons qui ne marchent plus, erreurs React, etc.).
export default function VersionWatcher() {
  const knownBuild = useRef(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const res = await fetch("/api/admin/version", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        const buildId = data?.buildId;
        if (!buildId || !active) return;
        if (knownBuild.current === null) {
          knownBuild.current = buildId; // 1re mesure: on memorise la version courante
        } else if (buildId !== knownBuild.current) {
          setUpdateAvailable(true); // le serveur a une nouvelle version
        }
      } catch {
        /* reseau coupe: on reessaiera au prochain tick */
      }
    }

    check();
    const interval = setInterval(check, POLL_MS);
    // re-verifie des que l'onglet redevient actif (cas classique: deploiement
    // pendant que l'employe etait sur un autre onglet).
    const onVisible = () => { if (!document.hidden) check(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[100] flex flex-wrap items-center justify-center gap-3 bg-cyan-600 px-4 py-2 text-sm font-bold text-white shadow-lg">
      <i className="fas fa-rotate"></i>
      <span>Une nouvelle version de l&apos;admin est disponible.</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-md bg-white/20 px-3 py-1 text-xs font-bold hover:bg-white/30"
      >
        Recharger maintenant
      </button>
    </div>
  );
}
