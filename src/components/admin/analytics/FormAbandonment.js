"use client";

import { useState, useEffect } from "react";

export default function FormAbandonment({ days }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics/forms?days=${days}`);
        const d = await res.json();
        setData(d);
      } catch {}
      setLoading(false);
    }
    load();
  }, [days]);

  const empty = { starts: 0, submits: 0, abandons: 0, completionRate: 0, dropoffFields: [], recentAbandons: [] };

  if (loading || !data) {
    return (
      <div className="admin-card rounded-xl p-6 border">
        <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-4">ABANDON DE FORMULAIRES</h2>
        <p className="admin-text-muted text-center py-8"><i className="fas fa-spinner fa-spin mr-2"></i></p>
      </div>
    );
  }

  function FormCard({ title, icon, stats }) {
    return (
      <div className="bg-white/[0.02] rounded-lg p-5 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <i className={`fas ${icon} text-[var(--color-red)] text-sm`}></i>
          <h3 className="admin-text font-bold text-sm">{title}</h3>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center">
            <p className="text-lg font-extrabold text-blue-400">{stats.starts}</p>
            <p className="text-[10px] admin-text-muted">Debuts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-green-400">{stats.submits}</p>
            <p className="text-[10px] admin-text-muted">Soumis</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-red-400">{stats.abandons}</p>
            <p className="text-[10px] admin-text-muted">Abandons</p>
          </div>
          <div className="text-center">
            <p className={`text-lg font-extrabold ${stats.completionRate >= 50 ? "text-green-400" : "text-orange-400"}`}>
              {stats.completionRate}%
            </p>
            <p className="text-[10px] admin-text-muted">Taux</p>
          </div>
        </div>

        {/* Completion rate bar */}
        <div className="w-full bg-white/5 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all ${
              stats.completionRate >= 50 ? "bg-green-500" : "bg-orange-500"
            }`}
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>

        {/* Dropoff fields */}
        {stats.dropoffFields.length > 0 && (
          <div className="mb-3">
            <p className="admin-text-muted text-[10px] uppercase tracking-wider mb-2">Champs d&apos;abandon</p>
            <div className="space-y-1">
              {stats.dropoffFields.map((f) => (
                <div key={f.field} className="flex items-center justify-between text-xs">
                  <span className="admin-text font-mono">{f.field}</span>
                  <span className="text-red-400 font-bold">{f.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent abandons */}
        {stats.recentAbandons.length > 0 && (
          <div>
            <p className="admin-text-muted text-[10px] uppercase tracking-wider mb-2">Abandons recents</p>
            <div className="space-y-2">
              {stats.recentAbandons.slice(0, 5).map((a) => {
                const v = a.fieldValues || {};
                return (
                  <div key={a.id} className="bg-white/[0.02] rounded p-2 text-[10px]">
                    <div className="flex items-center gap-2 admin-text-muted">
                      {v.name && <span>{v.name}</span>}
                      {v.phone && <span>{v.phone}</span>}
                      {v.email && <span>{v.email}</span>}
                    </div>
                    <div className="admin-text-muted mt-1">
                      Arrete a: <span className="text-red-400 font-mono">{a.fieldName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stats.starts === 0 && (
          <p className="admin-text-muted text-xs text-center py-2">Aucune donnee</p>
        )}
      </div>
    );
  }

  return (
    <div className="admin-card rounded-xl p-6 border">
      <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-4">ABANDON DE FORMULAIRES</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormCard title="Soumission (Hero)" icon="fa-file-alt" stats={data.soumission || empty} />
        <FormCard title="Contact" icon="fa-envelope" stats={data.contact || empty} />
      </div>
    </div>
  );
}
