"use client";

import { useEffect, useRef } from "react";

// Une seule EventSource partagee pour tout l'admin (les navigateurs limitent
// le nombre de connexions par domaine). Les hooks s'abonnent via un pub/sub local.
let source = null;
const listeners = new Set();

// Identifiant stable de CET onglet. Envoye avec les mutations (header
// X-Admin-Tab) puis rejoue dans les evenements SSE (champ origin): permet a
// une page d'ignorer l'echo de ses propres actions (deja appliquees en
// optimiste) au lieu de recharger toute sa liste a chaque clic.
export const ADMIN_TAB_ID =
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function ensureSource() {
  if (source || typeof window === "undefined") return;
  source = new EventSource("/api/admin/stream");
  source.onmessage = (e) => {
    let data;
    try {
      data = JSON.parse(e.data);
    } catch {
      return;
    }
    for (const fn of listeners) {
      try {
        fn(data);
      } catch {
        /* un listener qui throw ne casse pas les autres */
      }
    }
  };
  // EventSource se reconnecte automatiquement; on ne fait rien sur onerror.
}

function closeIfIdle() {
  if (source && listeners.size === 0) {
    source.close();
    source = null;
  }
}

// useAdminStream(onEvent): appelle onEvent(data) a chaque evenement temps reel.
// La derniere version de onEvent est toujours utilisee (via ref), donc pas besoin
// de la memoiser cote appelant.
export function useAdminStream(onEvent) {
  const ref = useRef(onEvent);
  useEffect(() => {
    ref.current = onEvent;
  });

  useEffect(() => {
    const listener = (data) => ref.current?.(data);
    listeners.add(listener);
    ensureSource();
    return () => {
      listeners.delete(listener);
      closeIfIdle();
    };
  }, []);
}
