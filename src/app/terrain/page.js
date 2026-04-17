"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TerrainDashboard() {
  const [workOrders, setWorkOrders] = useState([]);
  const [techName, setTechName] = useState("");
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

  const statusColors = {
    draft: "bg-yellow-500/20 text-yellow-400",
    completed: "bg-green-500/20 text-green-400",
    sent: "bg-blue-500/20 text-blue-400",
  };
  const statusLabels = { draft: "Brouillon", completed: "Complete", sent: "Envoye" };

  return (
    <div className="min-h-dvh bg-[#0a0f1a] text-white">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-white/10">
        <div>
          <h1 className="text-lg font-bold">Vosthermos Terrain</h1>
          <p className="text-white/40 text-xs">
            {new Date().toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <button onClick={logout} className="text-white/40 hover:text-white text-sm">
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>

      {/* New work order button */}
      <div className="px-4 py-6">
        <Link
          href="/terrain/nouveau"
          className="flex items-center justify-center gap-3 bg-[var(--color-red)] text-white font-bold py-5 rounded-2xl text-lg shadow-lg active:scale-[0.98] transition-transform"
        >
          <i className="fas fa-plus-circle text-xl"></i>
          Nouveau bon de travail
        </Link>
      </div>

      {/* Today's work orders */}
      <div className="px-4">
        <h2 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">
          Bons du jour ({workOrders.length})
        </h2>

        {workOrders.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <i className="fas fa-clipboard-list text-4xl mb-3"></i>
            <p>Aucun bon de travail aujourd&apos;hui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workOrders.map((wo) => (
              <Link
                key={wo.id}
                href={`/terrain/${wo.id}`}
                className="block bg-white/5 rounded-xl p-4 border border-white/10 active:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-white/50">{wo.number}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColors[wo.statut] || ""}`}>
                    {statusLabels[wo.statut] || wo.statut}
                  </span>
                </div>
                <p className="font-semibold">{wo.client?.name}</p>
                <p className="text-white/40 text-sm">{wo.client?.address}{wo.client?.city ? `, ${wo.client.city}` : ""}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-white/40 text-xs">
                    {(() => {
                      const fmtHM = (dt) => {
                        if (!dt) return "";
                        const d = new Date(dt);
                        return isNaN(d.getTime()) ? "" : `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                      };
                      const a = fmtHM(wo.arrivalAt);
                      const dp = fmtHM(wo.departureAt);
                      return `${a}${dp ? ` - ${dp}` : ""}`;
                    })()}
                  </span>
                  <span className="text-[var(--color-red)] font-bold">{wo.total.toFixed(2)}$</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
