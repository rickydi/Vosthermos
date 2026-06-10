"use client";

import { useEffect, useState } from "react";

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("fr-CA", { day: "2-digit", month: "long", year: "numeric" }) : "—");
const daysSince = (v) => (v ? Math.floor((Date.now() - new Date(v).getTime()) / 86400000) : null);

function posClass(p) {
  if (p == null) return "bg-slate-500/20 text-slate-300";
  if (p <= 3) return "bg-emerald-500/20 text-emerald-300";
  if (p <= 10) return "bg-sky-500/20 text-sky-300";
  if (p <= 20) return "bg-amber-500/20 text-amber-300";
  return "bg-orange-500/20 text-orange-300";
}
function pageBadge(p) {
  if (p == null) return { label: "Absent", cls: "bg-slate-500/20 text-slate-300" };
  if (p <= 10) return { label: "Page 1", cls: "bg-emerald-500/20 text-emerald-300" };
  if (p <= 20) return { label: "Page 2", cls: "bg-amber-500/20 text-amber-300" };
  if (p <= 30) return { label: "Page 3", cls: "bg-orange-500/20 text-orange-300" };
  return { label: "Page 4+", cls: "bg-rose-500/20 text-rose-300" };
}
function Trend({ t }) {
  if (t == null) return null;
  if (t > 0) return <span className="text-emerald-400 text-[11px] font-bold" title="Position gagnée vs capture précédente"><i className="fas fa-arrow-up"></i> {t}</span>;
  if (t < 0) return <span className="text-rose-400 text-[11px] font-bold" title="Position perdue"><i className="fas fa-arrow-down"></i> {Math.abs(t)}</span>;
  return <span className="admin-text-muted text-[11px]" title="Stable">=</span>;
}

const SUM = [
  { key: "top3", label: "Top 3", dot: "bg-emerald-400", cls: "text-emerald-300" },
  { key: "top10", label: "Page 1 (4-10)", dot: "bg-sky-400", cls: "text-sky-300" },
  { key: "top20", label: "Page 2", dot: "bg-amber-400", cls: "text-amber-300" },
  { key: "beyond", label: "Page 3+", dot: "bg-orange-400", cls: "text-orange-300" },
  { key: "absent", label: "Hors top", dot: "bg-slate-400", cls: "text-slate-300" },
];

export default function SeoCityOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState({});

  const load = () => {
    setLoading(true);
    fetch("/api/admin/seo/by-city", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  async function refresh() {
    if (refreshing) return;
    setRefreshing(true); setMsg("Capture des positions Google Search Console…");
    try {
      const res = await fetch("/api/admin/seo/snapshot", { method: "POST" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Erreur");
      setMsg(`Capture faite : ${d.cityMatched} positions par ville.`);
      load();
    } catch (e) { setMsg(`Échec : ${e.message}`); }
    setRefreshing(false);
    setTimeout(() => setMsg(""), 6000);
  }

  const stale = data ? daysSince(data.lastCheckedAt) : null;
  const pct = (n) => (data?.summary?.total ? Math.round((n / data.summary.total) * 100) : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="admin-text text-lg font-extrabold">Où j&apos;en suis dans chaque ville</h2>
          <p className="admin-text-muted text-sm mt-0.5">
            Position <strong className="admin-text">moyenne pondérée par le volume de recherche</strong> (Google Search Console, gratuit)
            {data?.hasData && <> · capture du <strong className="admin-text">{fmtDate(data.lastCheckedAt)}</strong></>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data?.hasData && stale != null && stale > 9 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300"><i className="fas fa-clock mr-1"></i>il y a {stale} j</span>
          )}
          <button onClick={refresh} disabled={refreshing} className="px-3 py-2 rounded-lg text-sm font-bold bg-[var(--color-red)] text-white disabled:opacity-50">
            <i className={`fas ${refreshing ? "fa-spinner fa-spin" : "fa-rotate"} mr-2`}></i>{refreshing ? "Capture…" : "Rafraîchir"}
          </button>
        </div>
      </div>

      {msg && <p className="text-sm admin-text-muted">{msg}</p>}

      {loading ? (
        <div className="admin-text-muted text-sm py-10 text-center"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement…</div>
      ) : !data?.hasData ? (
        <div className="admin-card border rounded-xl p-10 text-center admin-text-muted">
          <i className="fas fa-map-location-dot text-3xl opacity-30 mb-3 block"></i>
          <p className="mb-1 admin-text font-semibold">Aucune capture pour l&apos;instant</p>
          <p className="text-sm">Clique sur <strong>Rafraîchir</strong> pour ta première capture. Ensuite ça se met à jour seul chaque semaine.</p>
        </div>
      ) : (
        <>
          {/* Résumé global pondéré par impressions (= % de ton trafic potentiel) */}
          <div className="admin-card border rounded-xl p-4">
            <p className="admin-text-muted text-xs mb-2">Répartition de tes <strong className="admin-text">{data.totalImpressions?.toLocaleString("fr-CA")} impressions</strong> (vues dans Google) par position :</p>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/5">
              {SUM.map((s) => { const w = pct(data.summary[s.key]); return w > 0 ? <div key={s.key} className={s.dot} style={{ width: `${w}%` }} title={`${s.label}: ${pct(data.summary[s.key])}%`}></div> : null; })}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">
              {SUM.map((s) => (
                <span key={s.key} className="text-xs admin-text-muted inline-flex items-center gap-1.5">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${s.dot}`}></span>
                  <span className={`font-bold ${s.cls}`}>{pct(data.summary[s.key])}%</span> {s.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.cities.map((c) => {
              const pb = pageBadge(c.weightedPos);
              const isGeneral = c.slug === "_general";
              const isOpen = !!open[c.slug];
              return (
                <div key={c.slug} className={`admin-card border rounded-xl p-4 ${isGeneral ? "ring-1 ring-[var(--color-red)]/30" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="admin-text font-bold flex items-center gap-2">
                        {isGeneral && <i className="fas fa-globe text-[var(--color-red)] text-xs"></i>}{c.name}
                        <Trend t={c.trend} />
                      </div>
                      <div className="admin-text-muted text-xs mt-0.5">
                        {c.weightedPos != null ? <>Position moy. <span className="admin-text font-bold">#{c.weightedPos}</span></> : "Pas de position"}
                        <span className="opacity-60"> · {c.impressions?.toLocaleString("fr-CA")} vues</span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap ${pb.cls}`}>{pb.label}</span>
                  </div>

                  {c.topQuery && (
                    <div className="mt-2 text-xs admin-text-muted">
                      Requête #1 : <span className="admin-text">{c.topQuery.keyword}</span>
                      <span className={`ml-1 inline-flex min-w-[36px] justify-center rounded-full px-1.5 py-0.5 font-extrabold ${posClass(c.topQuery.position)}`}>{c.topQuery.position == null ? "—" : `#${c.topQuery.position}`}</span>
                    </div>
                  )}

                  <button onClick={() => setOpen((o) => ({ ...o, [c.slug]: !o[c.slug] }))} className="mt-3 text-xs admin-text-muted hover:admin-text">
                    <i className={`fas fa-chevron-${isOpen ? "up" : "down"} mr-1`}></i>{c.total} mot{c.total > 1 ? "s" : ""}-clé{c.total > 1 ? "s" : ""}
                  </button>

                  {isOpen && (
                    <div className="mt-2 space-y-1 border-t admin-border pt-2 max-h-64 overflow-y-auto">
                      {c.keywords.map((k, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 text-xs">
                          <span className="admin-text-muted truncate" title={k.keyword}>{k.keyword} <span className="opacity-50">· {k.impressions}v</span></span>
                          <span className={`inline-flex min-w-[42px] justify-center rounded-full px-2 py-0.5 font-extrabold ${posClass(k.position)}`}>{k.position == null ? "—" : `#${k.position}`}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
