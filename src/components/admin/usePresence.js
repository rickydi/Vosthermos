"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminStream } from "./adminStream";

const HEARTBEAT_MS = 15_000; // < PRESENCE_TTL_MS (30 s) cote serveur

// Signale que l'employe courant consulte/edite une entite, et retourne la liste
// des AUTRES employes presents en meme temps. Heartbeat toutes les 15 s, retrait
// automatique a la fermeture (cleanup + keepalive pour la fermeture d'onglet).
// Temps reel: re-ping immediat quand un collegue rejoint/quitte la meme entite.
//
//   const viewers = usePresence("client", clientId);
//
// Passe entityId null/undefined pour desactiver (ex: pas encore de client lie).
export function usePresence(entityType, entityId) {
  const [viewers, setViewers] = useState([]);
  const enabled = !!entityType && entityId !== undefined && entityId !== null;

  const paramsRef = useRef({ entityType, entityId });
  useEffect(() => {
    paramsRef.current = { entityType, entityId };
  }, [entityType, entityId]);
  const activeRef = useRef(false);

  const beat = useCallback(async (action) => {
    const { entityType: et, entityId: eid } = paramsRef.current;
    if (!et || eid === undefined || eid === null) return;
    try {
      const res = await fetch("/api/admin/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType: et, entityId: eid, action }),
        keepalive: action === "leave", // survit a la fermeture d'onglet
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      if (activeRef.current && data?.viewers) setViewers(data.viewers);
    } catch {
      /* reseau coupe: on ignore, le TTL serveur nettoiera */
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    activeRef.current = true;
    beat();
    const interval = setInterval(() => beat(), HEARTBEAT_MS);
    return () => {
      activeRef.current = false;
      clearInterval(interval);
      beat("leave");
    };
  }, [entityType, entityId, enabled, beat]);

  // Re-ping immediat quand le serveur signale un changement sur CETTE entite.
  useAdminStream((event) => {
    if (event?.type !== "presence.changed" || !enabled) return;
    if (String(event.entityType) === String(entityType) && String(event.entityId) === String(entityId)) {
      beat();
    }
  });

  // Derive plutot que reset dans l'effet: si desactive, on n'expose personne.
  return enabled ? viewers : [];
}

// Bandeau "X consulte aussi ce dossier". N'affiche rien si personne d'autre.
export function PresenceBadge({ viewers, verb = "consulte" }) {
  if (!viewers?.length) return null;
  const names = viewers.map((v) => v.name).filter(Boolean);
  const label =
    names.length === 1
      ? `${names[0]} ${verb} aussi ce dossier`
      : `${names.slice(0, -1).join(", ")} et ${names[names.length - 1]} ${verb}nt aussi ce dossier`;
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-300">
      <i className="fas fa-user-group"></i>
      <span className="truncate">{label}</span>
    </div>
  );
}
