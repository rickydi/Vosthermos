"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const fmtHM = (dt) => {
  if (!dt) return "";
  const d = new Date(dt);
  return isNaN(d.getTime()) ? "" : `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// Position GPS captée uniquement au tap (Loi 25). Échec/refus -> on continue sans coordonnées.
function getPosition() {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  });
}

export default function TerrainDashboard() {
  const [workOrders, setWorkOrders] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/technician/work-orders?date=today")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setWorkOrders(data); })
      .catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/technician/auth", { method: "DELETE" });
    router.push("/terrain/login");
  }

  async function doField(wo, action) {
    if (busyId) return;
    setBusyId(wo.id);
    let coords = null;
    if (action === "arrived") coords = await getPosition();
    try {
      const res = await fetch(`/api/technician/work-orders/${wo.id}/field`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, lat: coords?.lat, lng: coords?.lng }),
      });
      if (res.ok) {
        const d = await res.json();
        setWorkOrders((list) => list.map((w) => (w.id === wo.id ? { ...w, arrivalAt: d.arrivalAt, departureAt: d.departureAt, statut: d.statut } : w)));
      }
    } catch {}
    setBusyId(null);
  }

  const statusColors = {
    draft: "bg-yellow-500/20 text-yellow-400",
    completed: "bg-green-500/20 text-green-400",
    sent: "bg-blue-500/20 text-blue-400",
  };
  const statusLabels = { draft: "Brouillon", completed: "Complete", sent: "Envoye" };

  return (
    <div className="min-h-dvh bg-[#0a0f1a] text-white">
      <div className="px-4 py-4 flex items-center justify-between border-b border-white/10">
        <div>
          <h1 className="text-lg font-bold">Vosthermos Terrain</h1>
          <p className="text-white/40 text-xs">{new Date().toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <button onClick={logout} className="text-white/40 hover:text-white text-sm"><i className="fas fa-sign-out-alt"></i></button>
      </div>

      <div className="px-4 py-6">
        <Link href="/terrain/nouveau" className="flex items-center justify-center gap-3 bg-[var(--color-red)] text-white font-bold py-5 rounded-2xl text-lg shadow-lg active:scale-[0.98] transition-transform">
          <i className="fas fa-plus-circle text-xl"></i>Nouveau bon de travail
        </Link>
      </div>

      <div className="px-4 pb-10">
        <h2 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">Bons du jour ({workOrders.length})</h2>

        {workOrders.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <i className="fas fa-clipboard-list text-4xl mb-3"></i>
            <p>Aucun bon de travail aujourd&apos;hui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workOrders.map((wo) => {
              const arrived = !!wo.arrivalAt;
              const done = wo.statut === "completed" || wo.statut === "sent" || !!wo.departureAt;
              const busy = busyId === wo.id;
              return (
                <div key={wo.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  <Link href={`/terrain/${wo.id}`} className="block p-4 active:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono text-white/50">{wo.number}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColors[wo.statut] || ""}`}>{statusLabels[wo.statut] || wo.statut}</span>
                    </div>
                    <p className="font-semibold">{wo.client?.name}</p>
                    <p className="text-white/40 text-sm">{wo.client?.address}{wo.client?.city ? `, ${wo.client.city}` : ""}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-white/40 text-xs">{fmtHM(wo.arrivalAt)}{wo.departureAt ? ` - ${fmtHM(wo.departureAt)}` : ""}</span>
                      <span className="text-[var(--color-red)] font-bold">{Number(wo.total || 0).toFixed(2)}$</span>
                    </div>
                  </Link>

                  {/* Actions terrain */}
                  <div className="px-4 pb-3 pt-1 border-t border-white/5">
                    {done ? (
                      <div className="text-green-400 text-sm font-semibold py-1.5 text-center">
                        <i className="fas fa-circle-check mr-1.5"></i>Job terminée{wo.departureAt ? ` · ${fmtHM(wo.departureAt)}` : ""}
                      </div>
                    ) : !arrived ? (
                      <button onClick={() => doField(wo, "arrived")} disabled={busy}
                        className="w-full bg-blue-600 active:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                        <i className={`fas ${busy ? "fa-spinner fa-spin" : "fa-location-dot"}`}></i>
                        {busy ? "Localisation…" : "Je suis arrivé"}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-300 text-xs font-semibold flex-1"><i className="fas fa-location-dot mr-1"></i>Arrivé · {fmtHM(wo.arrivalAt)}</span>
                        <button onClick={() => doField(wo, "completed")} disabled={busy}
                          className="bg-green-600 active:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                          <i className={`fas ${busy ? "fa-spinner fa-spin" : "fa-circle-check"}`}></i>Job terminée
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-white/25 text-[11px] text-center mt-5">
          <i className="fas fa-shield-halved mr-1"></i>Ta position n&apos;est enregistrée qu&apos;au moment où tu touches « Je suis arrivé ».
        </p>
      </div>
    </div>
  );
}
