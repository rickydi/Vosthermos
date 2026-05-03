"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RecentVisitors({
  initialVisitors = [],
  query = "days=0",
  totalVisitors = 0,
  periodLabel = "la période",
  formatDuration,
}) {
  const [visitors, setVisitors] = useState(initialVisitors);
  const [showAll, setShowAll] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setVisitors(initialVisitors);
    setShowAll(false);
    setLoadingAll(false);
    setError("");
  }, [initialVisitors, query]);

  const visibleTotal = totalVisitors || visitors.length;
  const hasMore = visibleTotal > visitors.length;

  async function loadAllVisitors() {
    setLoadingAll(true);
    setError("");
    try {
      const joiner = query ? "&" : "";
      const res = await fetch(`/api/admin/analytics?${query}${joiner}visitors=all`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error || "Erreur analytics");
      setVisitors(data.recentVisitors || []);
      setShowAll(true);
    } catch (err) {
      setError(err.message || "Impossible de charger les visiteurs");
    } finally {
      setLoadingAll(false);
    }
  }

  function resetRecent() {
    setVisitors(initialVisitors);
    setShowAll(false);
    setError("");
  }

  const deviceEmoji = (d) =>
    d === "Mobile" ? "\u{1F4F1}" : d === "Tablette" ? "\u{1F4BB}" : "\u{1F5A5}\u{FE0F}";

  return (
    <div className="admin-card rounded-xl p-6 border">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider">VISITEURS RECENTS</h2>
          <p className="admin-text-muted text-xs mt-1">
            {showAll ? `Tous les visiteurs pour ${periodLabel}` : `Derniers visiteurs pour ${periodLabel}`}
          </p>
        </div>
        <span className="admin-text-muted text-xs font-bold">
          {visitors.length} / {visibleTotal}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="admin-text-muted text-[10px] uppercase tracking-wider">
              <th className="text-left pb-3">Visiteur</th>
              <th className="text-left pb-3">Appareil</th>
              <th className="text-left pb-3">Lieu</th>
              <th className="text-left pb-3">Navigateur</th>
              <th className="text-right pb-3">Pages</th>
              <th className="text-right pb-3">Duree</th>
              <th className="text-right pb-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {visitors.map((v) => (
              <tr key={v.visitorId + v.startedAt} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5">
                  <Link
                    href={`/admin/analytics/visitor/${v.visitorId}`}
                    className="text-blue-400 hover:text-blue-300 font-mono text-xs"
                  >
                    {v.visitorId.substring(0, 10)}...
                  </Link>
                </td>
                <td className="py-2.5 text-xs">
                  {deviceEmoji(v.device)} {v.device}
                </td>
                <td className="py-2.5 admin-text-muted text-xs">{v.city ? `${v.city}${v.region ? `, ${v.region}` : ""}` : "-"}</td>
                <td className="py-2.5 admin-text-muted text-xs">{v.browser}</td>
                <td className="py-2.5 text-right admin-text text-xs font-bold">{v.pages}</td>
                <td className="py-2.5 text-right admin-text-muted text-xs">{formatDuration(v.duration)}</td>
                <td className="py-2.5 text-right admin-text-muted text-[10px]">
                  {new Date(v.startedAt).toLocaleDateString("fr-CA", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
            {visitors.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center admin-text-muted text-sm">
                  Aucun visiteur
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {error && <p className="text-orange-400 text-xs font-bold mt-4">{error}</p>}

      <div className="flex justify-center mt-5">
        {showAll ? (
          <button
            type="button"
            onClick={resetRecent}
            className="admin-card admin-text-muted border rounded-lg px-4 py-2 text-xs font-bold hover:bg-white/5"
          >
            Revenir aux 20 derniers
          </button>
        ) : (
          <button
            type="button"
            onClick={loadAllVisitors}
            disabled={loadingAll || !hasMore}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-5 py-2 text-xs font-bold transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {loadingAll ? (
              <><i className="fas fa-spinner fa-spin mr-2"></i>Chargement...</>
            ) : hasMore ? (
              `Voir tous les visiteurs de ${periodLabel} (${visibleTotal})`
            ) : (
              "Tous les visiteurs sont affiches"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
