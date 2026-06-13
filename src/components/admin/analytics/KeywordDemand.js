"use client";

import { useEffect, useMemo, useState } from "react";

// Graphique de la DEMANDE par mots-clés (pas le trafic du site).
// Source : impressions Google Search Console sur les recherches du métier
// (fenêtre, porte, thermos/vitre, calfeutrage, moustiquaire, coupe-froid),
// hors marque. Agrégeable en jour / semaine / mois.

const THEME_COLORS = {
  fenetre: "#34d399",
  porte: "#60a5fa",
  thermos: "#fbbf24",
  calfeutrage: "#a78bfa",
  moustiquaire: "#f472b6",
  "coupe-froid": "#22d3ee",
};

const MONTHS_FR = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];

function parseDate(s) {
  return new Date(s + "T12:00:00Z");
}

// Lundi de la semaine d'une date (en UTC, sur la base midi pour éviter les
// décalages de fuseau).
function weekStart(d) {
  const x = new Date(d);
  const dow = (x.getUTCDay() + 6) % 7; // lundi = 0
  x.setUTCDate(x.getUTCDate() - dow);
  return x;
}

function bucketize(total, themesDaily, gran) {
  // Index date -> { total, themes:{key:val} }
  const byDate = {};
  for (const p of total) byDate[p.date] = { total: p.impressions, themes: {} };
  for (const t of themesDaily) {
    for (const p of t.daily) {
      if (!byDate[p.date]) byDate[p.date] = { total: 0, themes: {} };
      byDate[p.date].themes[t.key] = p.impressions;
    }
  }

  const buckets = {};
  for (const date of Object.keys(byDate)) {
    const d = parseDate(date);
    let key;
    let label;
    let sortKey;
    if (gran === "mois") {
      key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      label = `${MONTHS_FR[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`;
      sortKey = key;
    } else if (gran === "semaine") {
      const ws = weekStart(d);
      key = ws.toISOString().slice(0, 10);
      label = `${ws.getUTCDate()} ${MONTHS_FR[ws.getUTCMonth()]}`;
      sortKey = key;
    } else {
      key = date;
      label = `${d.getUTCDate()} ${MONTHS_FR[d.getUTCMonth()]}`;
      sortKey = date;
    }
    if (!buckets[key]) buckets[key] = { key, label, sortKey, total: 0, themes: {} };
    buckets[key].total += byDate[date].total;
    for (const [tk, v] of Object.entries(byDate[date].themes)) {
      buckets[key].themes[tk] = (buckets[key].themes[tk] || 0) + v;
    }
  }

  const limit = gran === "mois" ? 16 : gran === "semaine" ? 52 : 90;
  return Object.values(buckets)
    .sort((a, b) => (a.sortKey < b.sortKey ? -1 : 1))
    .slice(-limit);
}

export default function KeywordDemand() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gran, setGran] = useState("mois");
  const [activeThemes, setActiveThemes] = useState([]); // overlays
  const [tip, setTip] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
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

  const buckets = useMemo(
    () => (data ? bucketize(data.total, data.themes, gran) : []),
    [data, gran]
  );

  const themeTotals = useMemo(() => {
    const map = {};
    for (const b of buckets) for (const [k, v] of Object.entries(b.themes)) map[k] = (map[k] || 0) + v;
    return map;
  }, [buckets]);

  const maxTotal = Math.max(...buckets.map((b) => b.total), 1);
  const grandTotal = buckets.reduce((s, b) => s + b.total, 0);

  function toggleTheme(k) {
    setActiveThemes((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));
  }

  const H = 200;
  const colW = buckets.length ? Math.max(8, Math.min(48, Math.floor(980 / buckets.length))) : 40;
  const W = buckets.length * colW;
  const labelEvery = Math.max(1, Math.ceil(buckets.length / (gran === "jour" ? 12 : 16)));

  const themeLine = (themeKey) => {
    const max = Math.max(...buckets.map((b) => b.themes[themeKey] || 0), 1);
    return buckets
      .map((b, i) => {
        const v = b.themes[themeKey] || 0;
        const x = i * colW + colW / 2;
        const y = H - (v / max) * (H - 12);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  return (
    <div className="admin-card rounded-xl p-6 border">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <div>
          <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider">
            Demande par mots-clés
          </h2>
          <p className="admin-text-muted text-[11px] mt-1 max-w-xl">
            Recherches Google du métier (hors « vosthermos »). Mesure la demande, pas ton trafic.
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
        <p className="admin-text-muted text-sm text-center py-20">
          <i className="fas fa-spinner fa-spin mr-2"></i>Chargement de la demande Google…
        </p>
      ) : error ? (
        <p className="text-orange-400 text-sm text-center py-16 font-bold">{error}</p>
      ) : buckets.length === 0 ? (
        <p className="admin-text-muted text-sm text-center py-16">Aucune donnée de demande.</p>
      ) : (
        <>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-extrabold admin-text">{grandTotal.toLocaleString("fr-CA")}</span>
            <span className="admin-text-muted text-xs">recherches affichées sur la période</span>
          </div>

          <div className="relative">
            <svg width="100%" viewBox={`0 0 ${W} ${H + 26}`} className="overflow-visible">
              {[0.25, 0.5, 0.75].map((g) => (
                <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke="currentColor" strokeOpacity={0.07} />
              ))}
              {buckets.map((b, i) => {
                const bh = b.total > 0 ? Math.max((b.total / maxTotal) * (H - 12), 2) : 0;
                const x = i * colW + colW * 0.18;
                const bw = colW * 0.64;
                return (
                  <g
                    key={b.key}
                    onMouseEnter={() => setTip({ i, b })}
                    onMouseLeave={() => setTip(null)}
                    className="cursor-pointer"
                  >
                    <rect x={i * colW} y={0} width={colW} height={H} fill={tip?.i === i ? "currentColor" : "transparent"} fillOpacity={tip?.i === i ? 0.05 : 0} rx={4} />
                    {bh > 0 && (
                      <rect x={x} y={H - bh} width={bw} height={bh} rx={3} fill="var(--color-red)" fillOpacity={tip?.i === i ? 1 : 0.7} />
                    )}
                    {i % labelEvery === 0 && (
                      <text x={i * colW + colW / 2} y={H + 17} textAnchor="middle" className="fill-current admin-text-muted" style={{ fontSize: "9.5px" }}>
                        {b.label}
                      </text>
                    )}
                  </g>
                );
              })}
              {activeThemes.map((tk) => (
                <path key={tk} d={themeLine(tk)} fill="none" stroke={THEME_COLORS[tk]} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" style={{ pointerEvents: "none" }} />
              ))}
            </svg>

            {tip && (
              <div
                className="absolute bg-black/90 text-white text-xs rounded-lg px-3 py-2 pointer-events-none z-10 whitespace-nowrap shadow-xl"
                style={{ left: `${((tip.i + 0.5) / buckets.length) * 100}%`, top: "-10px", transform: "translateX(-50%)" }}
              >
                <div className="font-bold mb-1">{tip.b.label}</div>
                <div className="mb-1">
                  <span className="inline-block w-2 h-2 rounded-sm bg-[var(--color-red)] mr-1.5"></span>
                  {tip.b.total.toLocaleString("fr-CA")} recherches
                </div>
                {Object.entries(tip.b.themes)
                  .filter(([, v]) => v > 0)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([k, v]) => (
                    <div key={k} className="opacity-80">
                      <span className="inline-block w-2 h-2 rounded-sm mr-1.5" style={{ background: THEME_COLORS[k] }}></span>
                      {(data.themes.find((t) => t.key === k)?.label) || k} : {v.toLocaleString("fr-CA")}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Chips par thème — cliquer ajoute la ligne au graphique */}
          <div className="flex flex-wrap gap-2 mt-5">
            {data.themes
              .slice()
              .sort((a, b) => (themeTotals[b.key] || 0) - (themeTotals[a.key] || 0))
              .map((t) => {
                const on = activeThemes.includes(t.key);
                return (
                  <button
                    key={t.key}
                    onClick={() => toggleTheme(t.key)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      on ? "border-transparent text-white" : "admin-card admin-text-muted hover:bg-white/5"
                    }`}
                    style={on ? { background: THEME_COLORS[t.key] } : {}}
                  >
                    <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: on ? "rgba(255,255,255,0.9)" : THEME_COLORS[t.key] }}></span>
                    {t.label}
                    <span className={on ? "opacity-90" : "opacity-60"}>
                      {(themeTotals[t.key] || 0).toLocaleString("fr-CA")}
                    </span>
                  </button>
                );
              })}
          </div>
          <p className="admin-text-muted text-[10px] mt-3">
            Astuce : clique un mot-clé pour superposer sa courbe. Données Google Search Console (2-3 j de décalage).
          </p>
        </>
      )}
    </div>
  );
}
