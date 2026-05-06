"use client";

import { useState } from "react";
import Link from "next/link";

export default function OutsideCanadaVisitors({
  data = {},
  periodLabel = "la periode",
  formatDuration,
}) {
  const [open, setOpen] = useState(false);
  const visitors = data.visitors || [];
  const countryText = (data.countries || [])
    .slice(0, 4)
    .map((item) => `${item.country} (${item.visitors})`)
    .join(", ");

  const hasOutsideTraffic = (data.uniqueVisitors || 0) > 0 || (data.totalPageViews || 0) > 0;

  return (
    <div className="admin-card mb-8 rounded-xl border border-amber-500/25 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="admin-text flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider">
            <i className="fas fa-earth-americas text-amber-500"></i>
            Trafic hors Canada mis de cote
          </h2>
          <p className="admin-text-muted mt-1 text-xs">
            Les statistiques principales excluent les pays hors Canada connus pour {periodLabel}.
          </p>
          {countryText && (
            <p className="admin-text-muted mt-1 text-xs">
              Pays detectes: {countryText}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Visiteurs</p>
            <p className="text-xl font-black text-amber-700">{data.uniqueVisitors || 0}</p>
          </div>
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">Pages / clics</p>
            <p className="text-xl font-black text-cyan-700">{data.totalPageViews || 0}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            disabled={!hasOutsideTraffic}
            className="rounded-lg border admin-border px-4 py-2 text-xs font-bold admin-text hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {open ? "Masquer" : "Voir details"}
            <i className={`fas fa-chevron-down ml-2 text-[10px] transition-transform ${open ? "rotate-180" : ""}`}></i>
          </button>
        </div>
      </div>

      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="mt-5 overflow-x-auto border-t admin-border pt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="admin-text-muted text-[10px] uppercase tracking-wider">
                  <th className="pb-3 text-left">Visiteur</th>
                  <th className="pb-3 text-left">Pays</th>
                  <th className="pb-3 text-left">Lieu</th>
                  <th className="pb-3 text-left">Appareil</th>
                  <th className="pb-3 text-right">Pages</th>
                  <th className="pb-3 text-right">Duree</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visitors.map((visitor) => (
                  <tr key={visitor.visitorId + visitor.startedAt} className="hover:bg-white/[0.02]">
                    <td className="py-2.5">
                      <Link
                        href={`/admin/analytics/visitor/${visitor.visitorId}`}
                        className="font-mono text-xs text-blue-400 hover:text-blue-300"
                      >
                        {visitor.visitorId.substring(0, 10)}...
                      </Link>
                    </td>
                    <td className="py-2.5 text-xs font-bold text-amber-700">{visitor.country || "Inconnu"}</td>
                    <td className="py-2.5 admin-text-muted text-xs">
                      {visitor.city ? `${visitor.city}${visitor.region ? `, ${visitor.region}` : ""}` : "-"}
                    </td>
                    <td className="py-2.5 admin-text-muted text-xs">{visitor.device}</td>
                    <td className="py-2.5 text-right text-xs font-bold admin-text">{visitor.pages}</td>
                    <td className="py-2.5 text-right admin-text-muted text-xs">{formatDuration(visitor.duration)}</td>
                    <td className="py-2.5 text-right admin-text-muted text-[10px]">
                      {new Date(visitor.startedAt).toLocaleDateString("fr-CA", {
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
                    <td colSpan={7} className="py-7 text-center text-sm admin-text-muted">
                      Aucun trafic hors Canada connu pour cette periode.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
