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

// Indicateur de "page Google" à partir de la meilleure position.
function pageBadge(best) {
  if (best == null) return { label: "Absent", cls: "bg-slate-500/20 text-slate-300" };
  if (best <= 10) return { label: "Page 1", cls: "bg-emerald-500/20 text-emerald-300" };
  if (best <= 20) return { label: "Page 2", cls: "bg-amber-500/20 text-amber-300" };
  if (best <= 30) return { label: "Page 3", cls: "bg-orange-500/20 text-orange-300" };
  return { label: "Page 4+", cls: "bg-rose-500/20 text-rose-300" };
}

const SUM = [
  { key: "top3", label: "Top 3", cls: "text-emerald-300", dot: "bg-emerald-400" },
  { key: "top10", label: "Top 10", cls: "text-sky-300", dot: "bg-sky-400" },
  { key: "top20", label: "Page 2", cls: "text-amber-300", dot: "bg-amber-400" },
  { key: "beyond", label: "21+", cls: "text-orange-300", dot: "bg-orange-400" },
  { key: "absent", label: "Absent", cls: "text-slate-300", dot: "bg-slate-400" },
];

export default function SeoCityOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState({}); // villes dépliées

  useEffect(() => {
    fetch("/api/admin/seo/by-city", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-text-muted text-sm py-10 text-center"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement de la vue par ville…</div>;
  if (!data || !data.cities?.length) {
    return (
      <div className="admin-card border rounded-xl p-8 text-center admin-text-muted">
        <i className="fas fa-map-location-dot text-3xl opacity-30 mb-3 block"></i>
        Aucune donnée de classement par ville pour l&apos;instant. Lance un scan SEO pour les générer.
      </div>
    );
  }

  const stale = daysSince(data.lastCheckedAt);
  const pct = (n) => (data.summary.total ? Math.round((n / data.summary.total) * 100) : 0);

  return (
    <div className="space-y-4">
      {/* En-tête + dernier scan */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="admin-text text-lg font-extrabold">Où j&apos;en suis dans chaque ville</h2>
          <p className="admin-text-muted text-sm mt-0.5">
            {data.citiesTracked} villes suivies sur {data.citiesTargeted} ciblées · dernier scan : <strong className="admin-text">{fmtDate(data.lastCheckedAt)}</strong>
          </p>
        </div>
        {stale != null && stale > 14 && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300">
            <i className="fas fa-triangle-exclamation mr-1"></i>Données d&apos;il y a {stale} jours — relance un scan pour rafraîchir
          </span>
        )}
      </div>

      {/* Résumé global : barre + chips */}
      <div className="admin-card border rounded-xl p-4">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/5">
          {SUM.map((s) => {
            const w = pct(data.summary[s.key]);
            return w > 0 ? <div key={s.key} className={s.dot} style={{ width: `${w}%` }} title={`${s.label}: ${data.summary[s.key]}`}></div> : null;
          })}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">
          {SUM.map((s) => (
            <span key={s.key} className="text-xs admin-text-muted inline-flex items-center gap-1.5">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${s.dot}`}></span>
              <span className={`font-bold ${s.cls}`}>{data.summary[s.key]}</span> {s.label} <span className="opacity-60">({pct(data.summary[s.key])}%)</span>
            </span>
          ))}
          <span className="text-xs admin-text-muted ml-auto">{data.summary.total} couples ville × mot-clé</span>
        </div>
      </div>

      {/* Grille de villes */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.cities.map((c) => {
          const pb = pageBadge(c.best);
          const isOpen = !!open[c.slug];
          return (
            <div key={c.slug} className="admin-card border rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="admin-text font-bold">{c.name}</div>
                  <div className="admin-text-muted text-xs mt-0.5">
                    {c.best != null ? <>Meilleure <span className="admin-text font-semibold">#{c.best}</span>{c.avg != null && <> · moy. #{c.avg}</>}</> : "Aucun mot-clé classé"}
                  </div>
                </div>
                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap ${pb.cls}`}>{pb.label}</span>
              </div>

              {/* mini répartition */}
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-[11px] admin-text-muted">
                {c.counts.top3 > 0 && <span className="text-emerald-300">{c.counts.top3} top 3</span>}
                {c.counts.top10 > 0 && <span className="text-sky-300">{c.counts.top10} top 10</span>}
                {c.counts.top20 > 0 && <span className="text-amber-300">{c.counts.top20} p.2</span>}
                {c.counts.beyond > 0 && <span className="text-orange-300">{c.counts.beyond} 21+</span>}
                {c.counts.absent > 0 && <span className="text-slate-400">{c.counts.absent} absent</span>}
              </div>

              <button onClick={() => setOpen((o) => ({ ...o, [c.slug]: !o[c.slug] }))}
                className="mt-3 text-xs admin-text-muted hover:admin-text">
                <i className={`fas fa-chevron-${isOpen ? "up" : "down"} mr-1`}></i>{c.total} mot{c.total > 1 ? "s" : ""}-clé{c.total > 1 ? "s" : ""}
              </button>

              {isOpen && (
                <div className="mt-2 space-y-1 border-t admin-border pt-2">
                  {c.keywords.map((k, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-xs">
                      <span className="admin-text-muted truncate">{k.keyword}</span>
                      <span className={`inline-flex min-w-[42px] justify-center rounded-full px-2 py-0.5 font-extrabold ${posClass(k.position)}`}>
                        {k.position == null ? "—" : `#${k.position}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
