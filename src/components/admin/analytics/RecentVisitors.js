"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function RecentVisitors({ initialVisitors, formatDuration }) {
  const [filter, setFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [visitors, setVisitors] = useState(initialVisitors || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (filter === "all") {
      setVisitors(initialVisitors || []);
      return;
    }

    async function fetchFiltered() {
      setLoading(true);
      let days = 7;
      if (filter === "today") days = 1;
      else if (filter === "30") days = 30;

      let url = `/api/admin/analytics?days=${days}`;
      if (filter === "custom" && customDate) {
        url = `/api/admin/analytics?days=1&date=${customDate}`;
      }

      try {
        const res = await fetch(url);
        const data = await res.json();
        setVisitors(data.recentVisitors || []);
      } catch {}
      setLoading(false);
    }

    fetchFiltered();
  }, [filter, customDate]);

  const deviceEmoji = (d) =>
    d === "Mobile" ? "\u{1F4F1}" : d === "Tablette" ? "\u{1F4BB}" : "\u{1F5A5}\u{FE0F}";

  return (
    <div className="admin-card rounded-xl p-6 border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider">VISITEURS RECENTS</h2>
        <div className="flex gap-1">
          {[
            { key: "all", label: "Tous" },
            { key: "today", label: "Auj" },
            { key: "7", label: "7j" },
            { key: "30", label: "30j" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                filter === f.key ? "bg-[var(--color-red)] text-white" : "admin-text-muted hover:bg-white/5"
              }`}
            >
              {f.label}
            </button>
          ))}
          <input
            type="date"
            value={customDate}
            onChange={(e) => {
              setCustomDate(e.target.value);
              setFilter("custom");
            }}
            className="admin-input rounded text-[10px] px-1 py-0.5 w-28"
          />
        </div>
      </div>

      {loading ? (
        <p className="admin-text-muted text-center py-8"><i className="fas fa-spinner fa-spin mr-2"></i></p>
      ) : (
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
                  <td className="py-2.5 admin-text-muted text-xs">{v.city ? `${v.city}${v.region ? `, ${v.region}` : ""}` : "—"}</td>
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
      )}
    </div>
  );
}
