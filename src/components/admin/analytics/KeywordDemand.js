"use client";

import { useEffect, useMemo, useState } from "react";

// Demande par mots-clés. Deux lectures :
//  • « Volume réel » = recherches estimées par jour/semaine/mois, calculées à
//    partir des VRAIS volumes Google Keyword Planner (moyenne mensuelle, région)
//    × la forme saisonnière de Google Trends. Axe Y en recherches réelles.
//  • « Indice » = courbe Trends 0-100 brute (compare la forme/saison).
// Plus « Toi » (ligne blanche) = ta visibilité Google Search Console : en volume,
// ce sont tes IMPRESSIONS réelles → tu vois si tu captes la demande.

const PALETTE = ["#ef4444", "#34d399", "#60a5fa", "#fbbf24", "#a78bfa", "#f472b6", "#22d3ee", "#fb923c"];
const SELF_COLOR = "#ffffff";
const MONTHS_FR = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];
const DAYS_PER_MONTH = 30.4, WEEKS_PER_MONTH = 4.345;

const pd = (s) => new Date(s + "T12:00:00Z");
const fmtDay = (s) => `${pd(s).getUTCDate()} ${MONTHS_FR[pd(s).getUTCMonth()]}`;
const mean = (arr) => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0);

function fmtNum(n) {
  if (n == null) return "—";
  if (n >= 1000) {
    const k = n / 1000;
    return `${(k >= 10 ? Math.round(k) : Number(k.toFixed(1)))}`.replace(".", ",") + " k";
  }
  return String(Math.round(n));
}

function niceCeil(x) {
  if (!x || x <= 0) return 0;
  const e = Math.pow(10, Math.floor(Math.log10(x)));
  const f = x / e;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * e;
}

// Regroupe une série hebdo en points mensuels (indice moyen + somme des « raw »).
function monthlyPoints(weekly) {
  const g = {};
  for (const p of weekly) {
    const d = pd(p.date);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    (g[key] ||= []).push(p);
  }
  return Object.entries(g).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([key, arr]) => {
    const [y, m] = key.split("-");
    const hasRaw = arr.some((p) => typeof p.raw === "number");
    return {
      dateKey: `${key}-01`,
      label: `${MONTHS_FR[+m - 1]} ${y.slice(2)}`,
      value: Math.round(mean(arr.map((p) => p.value))),
      rawSum: hasRaw ? arr.reduce((s, p) => s + (p.raw || 0), 0) : null,
    };
  });
}

// Construit les points d'une granularité avec value (indice) ET real (volume).
function granPoints(series, gran) {
  const v = typeof series.volume === "number" ? series.volume : null;
  if (gran === "mois") {
    const m = monthlyPoints(series.weekly || []);
    const idxMean = mean(m.map((p) => p.value));
    const scale = v && idxMean ? v / idxMean : 0; // → recherches/mois
    return m.map((p) => ({
      dateKey: p.dateKey, label: p.label, value: p.value,
      real: series.self ? p.rawSum : v ? p.value * scale : null,
    }));
  }
  const src = gran === "jour" ? (series.daily || []).slice(-90) : (series.weekly || []).slice(-52);
  const idxMean = mean(src.map((p) => p.value));
  const per = gran === "jour" ? DAYS_PER_MONTH : WEEKS_PER_MONTH;
  const scale = v && idxMean ? v / idxMean / per : 0; // → recherches/jour ou /sem.
  const pts = src.map((p) => ({
    dateKey: p.date, label: fmtDay(p.date), value: p.value,
    real: series.self ? (typeof p.raw === "number" ? p.raw : null) : v ? p.value * scale : null,
  }));
  // Jour : les petits mots-clés ont des données Trends quotidiennes très éparses
  // (journées vides + pics aléatoires). Moyenne mobile 7 j pour lisser ce bruit.
  return gran === "jour" ? smoothDaily(pts) : pts;
}

function smoothDaily(pts, win = 7) {
  if (pts.length < win) return pts;
  const h = Math.floor(win / 2);
  return pts.map((p, i) => {
    let sv = 0, nv = 0, sr = 0, nr = 0;
    for (let j = Math.max(0, i - h); j <= Math.min(pts.length - 1, i + h); j++) {
      if (pts[j].value != null) { sv += pts[j].value; nv++; }
      if (pts[j].real != null) { sr += pts[j].real; nr++; }
    }
    return { ...p, value: nv ? Math.round((sv / nv) * 10) / 10 : p.value, real: nr ? sr / nr : p.real };
  });
}

export default function KeywordDemand() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gran, setGran] = useState("mois");
  const [mode, setMode] = useState("volume"); // "volume" | "indice"
  const [hidden, setHidden] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tip, setTip] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/admin/analytics/sector", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { if (d.error) throw new Error(d.error); setData(d); } })
      .catch((e) => !cancelled && setError(e.message || "Erreur"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const canVolume = !!data?.hasVolumes;
  const effMode = canVolume ? mode : "indice";
  const useVol = effMode === "volume";

  const allSeries = useMemo(() => {
    if (!data?.keywords?.length) return [];
    const arr = data.keywords.map((k, i) => ({ key: k.key, label: k.label, color: PALETTE[i % PALETTE.length], weekly: k.weekly, daily: k.daily, volume: k.volume }));
    if (data.self) arr.push({ key: "_self", label: data.self.label, self: true, color: SELF_COLOR, weekly: data.self.weekly, daily: data.self.daily });
    return arr;
  }, [data]);

  const { grid, valueOf, realOf } = useMemo(() => {
    if (!allSeries.length) return { grid: [], valueOf: () => null, realOf: () => null };
    const trans = {};
    for (const s of allSeries) trans[s.key] = granPoints(s, gran);
    const ref = trans[allSeries[0].key] || [];
    const fromB = from ? `${from}-01` : null;
    const toB = to ? `${to}-31` : null;
    const grid = ref
      .map((p, oi) => ({ oi, dateKey: p.dateKey, label: p.label }))
      .filter((g) => (!fromB || g.dateKey >= fromB) && (!toB || g.dateKey <= toB));
    return {
      grid,
      valueOf: (key, oi) => trans[key]?.[oi]?.value ?? null,
      realOf: (key, oi) => trans[key]?.[oi]?.real ?? null,
    };
  }, [allSeries, gran, from, to]);

  const visible = allSeries.filter((s) => !hidden.includes(s.key));
  const n = grid.length;
  const H = 210, W = 1000;
  const labelEvery = Math.max(1, Math.ceil(n / (gran === "jour" ? 12 : 16)));
  const X = (i) => (i / Math.max(n - 1, 1)) * W;

  // Échelle Y. En volume, l'axe est piloté par la demande, et « Toi » (tes clics)
  // partage le MÊME axe : les clics étant une fraction des recherches, la ligne
  // se place naturellement SOUS la demande = la part que tu captes. En indice,
  // tout partage l'échelle 0-100.
  let vMax = 100;
  if (useVol) {
    let m = 0;
    for (const s of visible) for (const g of grid) {
      const r = realOf(s.key, g.oi);
      if (r != null && r > m) m = r;
    }
    vMax = niceCeil(m) || 100;
  }
  const Y = (v) => H - (v / vMax) * (H - 8);
  const ticks = useVol ? [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(vMax * f)) : [0, 25, 50, 75, 100];
  const perLabel = gran === "jour" ? "jour" : gran === "semaine" ? "sem." : "mois";

  const displayVal = (key, oi) => (useVol ? realOf(key, oi) : valueOf(key, oi));

  const linePath = (key) => {
    let started = false;
    return grid.map((g, i) => {
      const v = displayVal(key, g.oi);
      if (v == null) { started = false; return ""; }
      const cmd = started ? "L" : "M"; started = true;
      return `${cmd}${X(i).toFixed(1)},${Y(v).toFixed(1)}`;
    }).join(" ");
  };

  function preset(months) {
    if (!grid.length && !allSeries.length) return;
    const last = allSeries[0]?.weekly?.at(-1)?.date || new Date().toISOString().slice(0, 10);
    const d = pd(last);
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - (months - 1), 1));
    setFrom(`${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`);
    setTo(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  const resetRange = () => { setFrom(""); setTo(""); };

  return (
    <div className="admin-card rounded-xl p-6 border">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider">Demande par mots-clés</h2>
          <p className="admin-text-muted text-[11px] mt-1 max-w-2xl">
            {useVol ? (
              <>Recherches estimées par {perLabel} dans la région (Keyword Planner × saison Trends) vs <span style={{ color: SELF_COLOR }}>tes clics depuis Google</span>. Vois quelle part tu captes.</>
            ) : (
              <>Intérêt de recherche Google au Québec (indice 0-100, 100 = pic) vs <span style={{ color: SELF_COLOR }}>tes clics</span>.</>
            )}
            {data?.pulledAt && <span className="opacity-70"> · Trends màj {data.pulledAt}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canVolume && (
            <div className="flex items-center gap-1 admin-card border rounded-lg p-1">
              {[["volume", "Volume réel"], ["indice", "Indice"]].map(([m, lab]) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${mode === m ? "bg-[var(--color-red)] text-white" : "admin-text-muted hover:bg-white/5"}`}>
                  {lab}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1 admin-card border rounded-lg p-1">
            {["jour", "semaine", "mois"].map((g) => (
              <button key={g} onClick={() => setGran(g)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-colors ${gran === g ? "bg-[var(--color-red)] text-white" : "admin-text-muted hover:bg-white/5"}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <p className="admin-text-muted text-sm text-center py-20"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement…</p>
      ) : error ? (
        <p className="text-orange-400 text-sm text-center py-16 font-bold">{error}</p>
      ) : !data?.keywords?.length ? (
        <div className="text-center py-16">
          <p className="admin-text-muted text-sm">Aucune donnée de demande pour l&apos;instant.</p>
          <p className="admin-text-muted text-xs mt-1">Données Google Trends à tirer (via le navigateur).</p>
        </div>
      ) : (
        <>
          {/* Sélecteur de période */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="admin-text-muted text-[11px] font-bold uppercase tracking-wider mr-1">Période</span>
            {[["3 m", 3], ["6 m", 6], ["12 m", 12]].map(([lab, m]) => (
              <button key={lab} onClick={() => preset(m)} className="admin-card admin-text-muted border rounded-md px-2.5 py-1 text-[11px] font-bold hover:bg-white/5">{lab}</button>
            ))}
            <button onClick={resetRange} className={`rounded-md px-2.5 py-1 text-[11px] font-bold border ${!from && !to ? "bg-[var(--color-red)] text-white border-transparent" : "admin-card admin-text-muted hover:bg-white/5"}`}>Tout</button>
            <span className="admin-text-muted text-[11px] ml-1">du</span>
            <input type="month" value={from} onChange={(e) => setFrom(e.target.value)} className="admin-input rounded-md border px-2 py-1 text-[11px]" />
            <span className="admin-text-muted text-[11px]">au</span>
            <input type="month" value={to} onChange={(e) => setTo(e.target.value)} className="admin-input rounded-md border px-2 py-1 text-[11px]" />
          </div>

          {n === 0 ? (
            <p className="admin-text-muted text-sm text-center py-16">Aucune donnée pour cette période (essaie une autre granularité ou « Tout »).</p>
          ) : (
            <div className="relative">
              <svg width="100%" viewBox={`0 0 ${W} ${H + 26}`} className="overflow-visible">
                {ticks.map((g) => (
                  <g key={g}>
                    <line x1={0} x2={W} y1={Y(g)} y2={Y(g)} stroke="currentColor" strokeOpacity={0.07} />
                    <text x={-6} y={Y(g) + 3} textAnchor="end" className="fill-current admin-text-muted" style={{ fontSize: "9px" }}>{useVol ? fmtNum(g) : g}</text>
                  </g>
                ))}
                {grid.map((g, i) => i % labelEvery === 0 ? (
                  <text key={i} x={X(i)} y={H + 17} textAnchor="middle" className="fill-current admin-text-muted" style={{ fontSize: "9.5px" }}>{g.label}</text>
                ) : null)}
                {visible.filter((s) => !s.self).map((s) => (
                  <path key={s.key} d={linePath(s.key)} fill="none" stroke={s.color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
                ))}
                {visible.filter((s) => s.self).map((s) => (
                  <path key={s.key} d={linePath(s.key)} fill="none" stroke={SELF_COLOR} strokeWidth={3} strokeDasharray="7 4" strokeLinejoin="round" strokeLinecap="round" />
                ))}
                {tip != null && <line x1={X(tip)} x2={X(tip)} y1={0} y2={H} stroke="currentColor" strokeOpacity={0.2} />}
                {grid.map((_, i) => (
                  <rect key={i} x={X(i) - W / Math.max(n - 1, 1) / 2} y={0} width={W / Math.max(n - 1, 1)} height={H} fill="transparent"
                    onMouseEnter={() => setTip(i)} onMouseLeave={() => setTip(null)} />
                ))}
              </svg>

              {tip != null && (
                <div className="absolute bg-black/90 text-white text-xs rounded-lg px-3 py-2 pointer-events-none z-10 whitespace-nowrap shadow-xl"
                  style={{ left: `${(tip / Math.max(n - 1, 1)) * 100}%`, top: "-10px", transform: "translateX(-50%)" }}>
                  <div className="font-bold mb-1">{grid[tip].label}{useVol && <span className="opacity-60 font-normal"> · /{perLabel}</span>}</div>
                  {visible.map((s) => ({ label: s.label, color: s.color, self: s.self, v: displayVal(s.key, grid[tip].oi) }))
                    .filter((r) => r.v != null)
                    .sort((a, b) => b.v - a.v)
                    .map((r) => (
                      <div key={r.label}>
                        <span className="inline-block w-2 h-2 rounded-sm mr-1.5" style={{ background: r.color }}></span>
                        {r.label} : {useVol ? fmtNum(r.v) : r.v}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Légende cliquable */}
          <div className="flex flex-wrap gap-2 mt-5">
            {allSeries.map((s) => {
              const off = hidden.includes(s.key);
              return (
                <button key={s.key} onClick={() => setHidden((c) => (c.includes(s.key) ? c.filter((x) => x !== s.key) : [...c, s.key]))}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${s.self ? "border-white/30" : ""} ${off ? "admin-card admin-text-muted opacity-50" : "admin-card admin-text hover:bg-white/5"}`}>
                  <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: s.color, opacity: off ? 0.4 : 1, outline: s.self ? "1px dashed rgba(255,255,255,0.6)" : "none" }}></span>
                  {s.label}
                  {useVol && typeof s.volume === "number" && <span className="admin-text-muted font-normal opacity-70">· {fmtNum(s.volume)}/mois</span>}
                </button>
              );
            })}
          </div>
          <p className="admin-text-muted text-[10px] mt-3">
            {useVol ? (
              <>Volume mensuel estimé au Québec (palier Keyword Planner 1k–10k pondéré par la comparaison Google Trends{data?.volumesAt ? `, màj ${data.volumesAt}` : ""}), réparti selon la saison. La ligne blanche « Toi » = tes <b>clics</b> réels depuis Google (Search Console), sur le MÊME axe que la demande → tu es donc sous la demande = la part que tu captes ; l&apos;écart = ta marge de progression. Vue Jour lissée (7 j). Ordre de grandeur — précision accrue avec la dépense de la campagne.</>
            ) : (
              <>Source : Google Trends (Québec) + Search Console pour « Toi ». Chaque ligne = indice 0-100 propre (100 = son pic). Compare la SAISON et si tes clics suivent la demande.</>
            )}
          </p>
        </>
      )}
    </div>
  );
}
