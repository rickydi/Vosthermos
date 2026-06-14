"use client";

// Cartes KPI repensées : valeur + delta vs période précédente + sparkline.
// Palette unifiée (accent rouge brand + neutres) — le vert/rouge est réservé
// aux variations, pas à la décoration.

function Delta({ now, before }) {
  if (before === null || before === undefined) return null;
  if (!before && !now) return <span className="text-[11px] font-bold admin-text-muted">—</span>;
  if (!before) {
    return (
      <span className="text-[11px] font-bold text-emerald-400">
        <i className="fas fa-arrow-up mr-0.5"></i>nouveau
      </span>
    );
  }
  const pct = Math.round(((now - before) / before) * 100);
  if (pct === 0) return <span className="text-[11px] font-bold admin-text-muted">stable</span>;
  const up = pct > 0;
  return (
    <span className={`text-[11px] font-bold ${up ? "text-emerald-400" : "text-rose-400"}`}>
      <i className={`fas fa-arrow-${up ? "up" : "down"} mr-0.5`}></i>
      {up ? "+" : ""}{pct}%
    </span>
  );
}

function Sparkline({ points = [], color = "var(--color-red)" }) {
  if (!points || points.length < 2 || !points.some((v) => v > 0)) return null;
  const max = Math.max(...points, 1);
  const w = 92;
  const h = 30;
  const step = w / (points.length - 1);
  const coords = points.map((v, i) => [i * step, h - (v / max) * (h - 4) - 2]);
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <path d={area} fill={color} fillOpacity={0.12} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StatsCards({ data = {}, formatDuration }) {
  const prev = data.prev || null;
  const hasHourly = Array.isArray(data.hourly) && data.hourly.some((p) => p.visitors || p.pageViews);
  const series = hasHourly ? data.hourly : data.daily || [];

  const stats = [
    {
      label: "Visiteurs",
      icon: "fa-users",
      value: data.uniqueVisitors || 0,
      raw: data.uniqueVisitors || 0,
      prev: prev?.uniqueVisitors,
      prevText: prev ? String(prev.uniqueVisitors) : null,
      spark: series.map((p) => p.visitors),
    },
    {
      label: "Pages vues",
      icon: "fa-eye",
      value: data.totalPageViews || 0,
      raw: data.totalPageViews || 0,
      prev: prev?.totalPageViews,
      prevText: prev ? String(prev.totalPageViews) : null,
      spark: series.map((p) => p.pageViews),
    },
    {
      label: "Temps moyen",
      icon: "fa-clock",
      value: formatDuration(data.avgDuration || 0),
      raw: data.avgDuration || 0,
      prev: prev?.avgDuration,
      prevText: prev ? formatDuration(prev.avgDuration || 0) : null,
    },
    {
      label: "Sessions",
      icon: "fa-chart-line",
      value: data.totalSessions || 0,
      raw: data.totalSessions || 0,
      prev: prev?.totalSessions,
      prevText: prev ? String(prev.totalSessions) : null,
    },
    {
      // Visiteurs venus d'un clic Google Ads (gclid détecté). Accent bleu Google
      // pour distinguer le canal PAYANT du trafic organique (rouge brand).
      label: "Google Ads",
      icon: "fa-bullhorn",
      accent: "#1a73e8",
      value: data.paidVisitors || 0,
      raw: data.paidVisitors || 0,
      prev: prev?.paidVisitors,
      prevText: prev ? String(prev.paidVisitors) : null,
      spark: series.map((p) => p.paid || 0),
      caption: "clics payants",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((s) => {
        const accent = s.accent || "var(--color-red)";
        return (
          <div key={s.label} className="admin-card rounded-xl p-5 border">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-7 h-7 rounded-lg inline-flex items-center justify-center flex-shrink-0"
                style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}
              >
                <i className={`fas ${s.icon} text-xs`}></i>
              </span>
              <p className="admin-text-muted text-[11px] font-bold uppercase tracking-wider">{s.label}</p>
            </div>
            <div className="flex items-end justify-between gap-2 min-h-[34px]">
              <p className="text-3xl font-extrabold admin-text leading-none whitespace-nowrap">{s.value}</p>
              {s.spark ? <Sparkline points={s.spark} color={accent} /> : null}
            </div>
            <div className="mt-3 flex items-baseline gap-2 flex-wrap">
              <Delta now={s.raw} before={s.prev} />
              {prev && s.prevText !== null ? (
                <span className="admin-text-muted text-[11px] truncate">
                  vs {prev.label} ({s.prevText})
                </span>
              ) : s.caption ? (
                <span className="admin-text-muted text-[11px] truncate">{s.caption}</span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
