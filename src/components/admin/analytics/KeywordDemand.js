"use client";

import { useEffect, useMemo, useState } from "react";

// Demande par mots-clés = Google Trends (intérêt de recherche RÉEL au Québec,
// indice 0-100, 100 = pic du mot-clé sur la période). C'est la demande du
// marché, indépendante du trafic du site. Données tirées via le navigateur
// puis stockées en base (Google bloque les serveurs). Une ligne par mot-clé,
// agrégeable en jour / semaine / mois.

const PALETTE = ["#ef4444", "#34d399", "#60a5fa", "#fbbf24", "#a78bfa", "#f472b6", "#22d3ee"];
const MONTHS_FR = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];

function parseDate(s) { return new Date(s + "T12:00:00Z"); }

function monthlyFromWeekly(weekly) {
  // Indice = moyenne des semaines du mois.
  const groups = {};
  for (const p of weekly) {
    const d = parseDate(p.date);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    (groups[key] ||= []).push(p.value);
  }
  return Object.entries(groups)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([key, vals]) => {
      const [y, m] = key.split("-");
      return { date: `${key}-01`, label: `${MONTHS_FR[+m - 1]} ${y.slice(2)}`, value: Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) };
    });
}

export default function KeywordDemand() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gran, setGran] = useState("mois");
  const [hidden, setHidden] = useState([]); // mots-clés masqués
  const [tip, setTip] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/admin/analytics/sector", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => !cancelled && setError(e.message || "Erreur"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  // Séries par mot-clé selon la granularité. Toutes alignées sur la même grille
  // de dates (Trends renvoie les mêmes dates pour un même intervalle).
  const { labels, series } = useMemo(() => {
    if (!data?.keywords?.length) return { labels: [], series: [] };
    const built = data.keywords.map((k, i) => {
      let pts;
      if (gran === "jour") pts = (k.daily || []).slice(-90);
      else if (gran === "semaine") pts = (k.weekly || []).slice(-52);
      else pts = monthlyFromWeekly(k.weekly || []).slice(-24);
      return { key: k.key, label: k.label, color: PALETTE[i % PALETTE.length], pts };
    });
    const ref = built.reduce((a, b) => (b.pts.length > a.pts.length ? b : a), built[0]);
    const labels = (ref?.pts || []).map((p) =>
      p.label || `${parseDate(p.date).getUTCDate()} ${MONTHS_FR[parseDate(p.date).getUTCMonth()]}`
    );
    return { labels, series: built };
  }, [data, gran]);

  const visible = series.filter((s) => !hidden.includes(s.key));
  const n = labels.length;
  const H = 200, W = 1000;
  const labelEvery = Math.max(1, Math.ceil(n / (gran === "jour" ? 12 : 16)));

  const linePath = (pts) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${((i / Math.max(n - 1, 1)) * W).toFixed(1)},${(H - (p.value / 100) * (H - 8)).toFixed(1)}`).join(" ");

  function toggle(key) {
    setHidden((cur) => (cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key]));
  }

  return (
    <div className="admin-card rounded-xl p-6 border">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <div>
          <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider">Demande par mots-clés</h2>
          <p className="admin-text-muted text-[11px] mt-1 max-w-xl">
            Intérêt de recherche Google au Québec (indice 0-100, 100 = pic). La demande du marché, pas ton trafic.
            {data?.pulledAt && <span className="opacity-70"> · Mis à jour le {data.pulledAt}</span>}
          </p>
        </div>
        <div className="flex items-center gap-1 admin-card border rounded-lg p-1">
          {["jour", "semaine", "mois"].map((g) => (
            <button
              key={g}
              onClick={() => setGran(g)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-colors ${
                gran === g ? "bg-[var(--color-red)] text-white" : "admin-text-muted hover:bg-white/5"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="admin-text-muted text-sm text-center py-20"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement…</p>
      ) : error ? (
        <p className="text-orange-400 text-sm text-center py-16 font-bold">{error}</p>
      ) : !data?.keywords?.length ? (
        <div className="text-center py-16">
          <p className="admin-text-muted text-sm">Aucune donnée de demande pour l&apos;instant.</p>
          <p className="admin-text-muted text-xs mt-1">Les données Google Trends doivent être tirées (via le navigateur).</p>
        </div>
      ) : (
        <>
          <div className="relative mt-4">
            <svg width="100%" viewBox={`0 0 ${W} ${H + 26}`} className="overflow-visible">
              {[0, 25, 50, 75, 100].map((g) => (
                <g key={g}>
                  <line x1={0} x2={W} y1={H - (g / 100) * (H - 8)} y2={H - (g / 100) * (H - 8)} stroke="currentColor" strokeOpacity={0.07} />
                  <text x={-6} y={H - (g / 100) * (H - 8) + 3} textAnchor="end" className="fill-current admin-text-muted" style={{ fontSize: "9px" }}>{g}</text>
                </g>
              ))}
              {labels.map((lab, i) =>
                i % labelEvery === 0 ? (
                  <text key={i} x={(i / Math.max(n - 1, 1)) * W} y={H + 17} textAnchor="middle" className="fill-current admin-text-muted" style={{ fontSize: "9.5px" }}>{lab}</text>
                ) : null
              )}
              {visible.map((s) => (
                <path key={s.key} d={linePath(s.pts)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              ))}
              {tip != null && (
                <line x1={(tip / Math.max(n - 1, 1)) * W} x2={(tip / Math.max(n - 1, 1)) * W} y1={0} y2={H} stroke="currentColor" strokeOpacity={0.2} />
              )}
              {/* zones de survol */}
              {labels.map((_, i) => (
                <rect key={i} x={(i / Math.max(n - 1, 1)) * W - W / Math.max(n - 1, 1) / 2} y={0} width={W / Math.max(n - 1, 1)} height={H} fill="transparent"
                  onMouseEnter={() => setTip(i)} onMouseLeave={() => setTip(null)} />
              ))}
            </svg>

            {tip != null && (
              <div className="absolute bg-black/90 text-white text-xs rounded-lg px-3 py-2 pointer-events-none z-10 whitespace-nowrap shadow-xl"
                style={{ left: `${(tip / Math.max(n - 1, 1)) * 100}%`, top: "-10px", transform: "translateX(-50%)" }}>
                <div className="font-bold mb-1">{labels[tip]}</div>
                {visible
                  .map((s) => ({ label: s.label, color: s.color, v: s.pts[tip]?.value ?? 0 }))
                  .sort((a, b) => b.v - a.v)
                  .map((r) => (
                    <div key={r.label}>
                      <span className="inline-block w-2 h-2 rounded-sm mr-1.5" style={{ background: r.color }}></span>
                      {r.label} : {r.v}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Légende cliquable */}
          <div className="flex flex-wrap gap-2 mt-5">
            {series.map((s) => {
              const off = hidden.includes(s.key);
              return (
                <button key={s.key} onClick={() => toggle(s.key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${off ? "admin-card admin-text-muted opacity-50" : "admin-card admin-text hover:bg-white/5"}`}>
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: s.color, opacity: off ? 0.4 : 1 }}></span>
                  {s.label}
                </button>
              );
            })}
          </div>
          <p className="admin-text-muted text-[10px] mt-3">
            Source : Google Trends (Québec). Chaque ligne = indice 0-100 propre au mot-clé (100 = son pic sur la période). Compare la SAISON, pas les volumes entre mots-clés.
          </p>
        </>
      )}
    </div>
  );
}
