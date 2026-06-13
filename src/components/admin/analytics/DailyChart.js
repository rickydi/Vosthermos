"use client";

import { useState } from "react";

// Graphique de trafic principal.
// - Vue « Aujourd'hui » / date précise : courbe HEURE PAR HEURE (la vue d'avant
//   n'affichait que 2 gros chiffres dans du vide).
// - Vue 7/30/90 j : barres par jour + ligne des pages vues.
// Barres = visiteurs (accent rouge brand), ligne blanche = pages vues.

export default function DailyChart({ daily = [], hourly = null }) {
  const [tip, setTip] = useState(null);

  const isHourly = Array.isArray(hourly) && hourly.length > 0;
  const points = isHourly
    ? hourly.map((p) => ({
        key: `h${p.hour}`,
        label: `${p.hour}h`,
        full: `${String(p.hour).padStart(2, "0")}:00 – ${String(p.hour).padStart(2, "0")}:59`,
        visitors: p.visitors,
        pageViews: p.pageViews,
      }))
    : daily.map((d) => ({
        key: d.date,
        label: new Date(d.date + "T12:00:00").toLocaleDateString("fr-CA", { day: "numeric", month: "short" }).replace(".", ""),
        full: new Date(d.date + "T12:00:00").toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" }),
        visitors: d.visitors,
        pageViews: d.pageViews,
      }));

  const totalV = points.reduce((s, p) => s + p.visitors, 0);
  const totalP = points.reduce((s, p) => s + p.pageViews, 0);
  const maxV = Math.max(...points.map((p) => p.visitors), 1);
  const maxP = Math.max(...points.map((p) => p.pageViews), 1);

  // viewBox de largeur FIXE : ratio constant peu importe le nombre de colonnes
  // (sinon, avec peu de barres comme la vue 7 jours, le SVG s'étire en hauteur).
  const H = 170;
  const W = 1000;
  const colW = W / Math.max(points.length, 1);
  const labelEvery = Math.max(1, Math.ceil(points.length / 14));

  const lineD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * colW + colW / 2).toFixed(1)},${(H - (p.pageViews / maxP) * (H - 14)).toFixed(1)}`)
    .join(" ");

  return (
    <div className="admin-card rounded-xl p-6 border h-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider">
          {isHourly ? "Trafic heure par heure" : "Trafic par jour"}
        </h2>
        <div className="flex items-center gap-4 text-[11px] admin-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[var(--color-red)]"></span>
            <strong className="admin-text">{totalV}</strong> visiteur{totalV > 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 h-[2px] rounded bg-white/60"></span>
            <strong className="admin-text">{totalP}</strong> page{totalP > 1 ? "s" : ""} vue{totalP > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {totalV === 0 && totalP === 0 ? (
        <p className="admin-text-muted text-sm text-center py-16">Aucun trafic pour cette période.</p>
      ) : (
        <div className="relative">
          <svg width="100%" viewBox={`0 0 ${W} ${H + 26}`} className="overflow-visible">
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke="currentColor" strokeOpacity={0.07} />
            ))}
            {points.map((p, i) => {
              const bh = p.visitors > 0 ? Math.max((p.visitors / maxV) * (H - 14), 3) : 0;
              const x = i * colW + colW * 0.18;
              const bw = colW * 0.64;
              return (
                <g
                  key={p.key}
                  onMouseEnter={() => setTip({ i, p })}
                  onMouseLeave={() => setTip(null)}
                  className="cursor-pointer"
                >
                  <rect x={i * colW} y={0} width={colW} height={H} fill="transparent" />
                  {tip?.i === i && (
                    <rect x={i * colW} y={0} width={colW} height={H} fill="currentColor" fillOpacity={0.05} rx={4} />
                  )}
                  {bh > 0 && (
                    <rect
                      x={x}
                      y={H - bh}
                      width={bw}
                      height={bh}
                      rx={3}
                      fill="var(--color-red)"
                      fillOpacity={tip?.i === i ? 1 : 0.78}
                    />
                  )}
                  {i % labelEvery === 0 && (
                    <text
                      x={i * colW + colW / 2}
                      y={H + 17}
                      textAnchor="middle"
                      className="fill-current admin-text-muted"
                      style={{ fontSize: "9.5px" }}
                    >
                      {p.label}
                    </text>
                  )}
                </g>
              );
            })}
            <path d={lineD} fill="none" stroke="white" strokeOpacity={0.5} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" style={{ pointerEvents: "none" }} />
            {points.map((p, i) =>
              tip?.i === i ? (
                <circle
                  key={`dot-${p.key}`}
                  cx={i * colW + colW / 2}
                  cy={H - (p.pageViews / maxP) * (H - 14)}
                  r={3}
                  fill="white"
                  style={{ pointerEvents: "none" }}
                />
              ) : null
            )}
          </svg>

          {tip && (
            <div
              className="absolute bg-black/90 text-white text-xs rounded-lg px-3 py-2 pointer-events-none z-10 whitespace-nowrap shadow-xl"
              style={{
                left: `${((tip.i + 0.5) / points.length) * 100}%`,
                top: "-10px",
                transform: "translateX(-50%)",
              }}
            >
              <div className="font-bold mb-0.5">{tip.p.full}</div>
              <div>
                <span className="inline-block w-2 h-2 rounded-sm bg-[var(--color-red)] mr-1.5"></span>
                {tip.p.visitors} visiteur{tip.p.visitors > 1 ? "s" : ""}
              </div>
              <div>
                <span className="inline-block w-2 h-[2px] rounded bg-white/70 mr-1.5 align-middle"></span>
                {tip.p.pageViews} page{tip.p.pageViews > 1 ? "s" : ""} vue{tip.p.pageViews > 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
