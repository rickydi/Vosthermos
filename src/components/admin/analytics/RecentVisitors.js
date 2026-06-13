"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Visiteurs récents — version compacte : 8 lignes par défaut, le lieu en
// premier (l'identifiant technique est devenu un simple lien "détail"),
// durées nulles estompées.

const COMPACT_COUNT = 8;

export default function RecentVisitors({
  initialVisitors = [],
  query = "days=0",
  totalVisitors = 0,
  periodLabel = "la période",
  formatDuration,
}) {
  const [visitors, setVisitors] = useState(initialVisitors);
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setVisitors(initialVisitors);
    setShowAll(false);
    setExpanded(false);
    setLoadingAll(false);
    setError("");
  }, [initialVisitors, query]);

  const visibleTotal = totalVisitors || visitors.length;
  const hasMore = visibleTotal > visitors.length;
  const list = showAll || expanded ? visitors : visitors.slice(0, COMPACT_COUNT);

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
    setExpanded(false);
    setError("");
  }

  const deviceIcon = (d) =>
    d === "Mobile" ? "fa-mobile-alt" : d === "Tablette" ? "fa-tablet-alt" : "fa-desktop";

  return (
    <div className="admin-card rounded-xl p-6 border">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider">Visiteurs récents</h2>
          <p className="admin-text-muted text-xs mt-1">
            {showAll ? `Tous les visiteurs pour ${periodLabel}` : `Derniers visiteurs pour ${periodLabel}`}
          </p>
        </div>
        <span className="admin-text-muted text-xs font-bold">
          {list.length} / {visibleTotal}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="admin-text-muted text-[10px] uppercase tracking-wider">
              <th className="text-left pb-3">Lieu</th>
              <th className="text-left pb-3">Appareil</th>
              <th className="text-left pb-3">Navigateur</th>
              <th className="text-right pb-3">Pages</th>
              <th className="text-right pb-3">Durée</th>
              <th className="text-right pb-3">Heure</th>
              <th className="text-right pb-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {list.map((v) => (
              <tr key={v.visitorId + v.startedAt} className="hover:bg-white/[0.03] transition-colors">
                <td className="py-2.5">
                  <span className="admin-text text-[13px] font-semibold">{v.city || "Lieu inconnu"}</span>
                  {v.region && <span className="admin-text-muted text-xs">, {v.region}</span>}
                </td>
                <td className="py-2.5 admin-text-muted text-xs">
                  <i className={`fas ${deviceIcon(v.device)} mr-1.5 opacity-70`}></i>
                  {v.device}
                </td>
                <td className="py-2.5 admin-text-muted text-xs">{v.browser}</td>
                <td className="py-2.5 text-right admin-text text-xs font-bold">{v.pages}</td>
                <td className={`py-2.5 text-right text-xs ${v.duration > 0 ? "admin-text-muted" : "admin-text-muted opacity-30"}`}>
                  {v.duration > 0 ? formatDuration(v.duration) : "—"}
                </td>
                <td className="py-2.5 text-right admin-text-muted text-[11px] whitespace-nowrap">
                  {new Date(v.startedAt).toLocaleDateString("fr-CA", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-2.5 text-right">
                  <Link
                    href={`/admin/analytics/visitor/${v.visitorId}`}
                    className="admin-text-muted hover:text-[var(--color-red)] transition-colors text-xs"
                    title="Voir le parcours complet"
                  >
                    <i className="fas fa-arrow-right"></i>
                  </Link>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
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

      <div className="flex justify-center gap-2 mt-5">
        {showAll ? (
          <button
            type="button"
            onClick={resetRecent}
            className="admin-card admin-text-muted border rounded-lg px-4 py-2 text-xs font-bold hover:bg-white/5"
          >
            Revenir à la vue compacte
          </button>
        ) : (
          <>
            {!expanded && visitors.length > COMPACT_COUNT && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="admin-card admin-text-muted border rounded-lg px-4 py-2 text-xs font-bold hover:bg-white/5"
              >
                Afficher les {visitors.length} derniers
              </button>
            )}
            <button
              type="button"
              onClick={loadAllVisitors}
              disabled={loadingAll || !hasMore}
              className="bg-[var(--color-red)] hover:opacity-90 text-white rounded-lg px-5 py-2 text-xs font-bold transition-opacity disabled:opacity-45 disabled:cursor-not-allowed"
            >
              {loadingAll ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i>Chargement...</>
              ) : hasMore ? (
                `Voir tous les visiteurs (${visibleTotal})`
              ) : expanded ? (
                "Tous les visiteurs sont affichés"
              ) : (
                `Voir tous les visiteurs (${visibleTotal})`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
