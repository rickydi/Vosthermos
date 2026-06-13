"use client";

import { useEffect, useState } from "react";

// Flow de navigation — version dégraissée :
// - replié par défaut (le top parcours est résumé dans l'en-tête)
// - seuls les chemins empruntés par 2+ visiteurs sont tracés (fini les 30
//   lignes à 1 visiteur qui noyaient le diagramme)
// - étiquettes plus grandes, hauteur compacte

const PAGE_COLORS = {
  "/": "#9ca3af",
  "/boutique": "#3b82f6",
  "/services": "#22c55e",
  "/contact": "#f59e0b",
  "/panier": "#8b5cf6",
  "/checkout": "#ec4899",
  "/produit": "#14b8a6",
  "/reparation-portes-et-fenetres": "#34d399",
  "/blogue": "#a78bfa",
  "/prix": "#fbbf24",
};

const PAGE_LABELS = {
  "/": "Accueil",
  "/boutique": "Boutique",
  "/services": "Services",
  "/contact": "Contact",
  "/panier": "Panier",
  "/checkout": "Checkout",
  "/reparation-portes-et-fenetres": "Ville",
  "/blogue": "Blogue",
  "/prix": "Prix",
};

function getColor(page) {
  for (const [prefix, color] of Object.entries(PAGE_COLORS)) {
    if (page === prefix || page.startsWith(prefix + "/")) return color;
  }
  return "#9ca3af";
}

function getLabel(page) {
  for (const [prefix, label] of Object.entries(PAGE_LABELS)) {
    if (page === prefix) return label;
    if (page.startsWith(prefix + "/")) {
      const sub = page.replace(prefix + "/", "");
      return label + " / " + (sub.length > 24 ? sub.substring(0, 24) + "…" : sub);
    }
  }
  return page.length > 32 ? page.substring(0, 32) + "…" : page;
}

function getPageHref(page) {
  if (!page) return "/";
  if (page.startsWith("http://") || page.startsWith("https://")) return page;
  return page.startsWith("/") ? page : `/${page}`;
}

function PageLink({ page, x, y, textAnchor }) {
  return (
    <a href={getPageHref(page)} target="_blank" rel="noopener noreferrer">
      <title>{`Ouvrir ${page}`}</title>
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        fill="#cbd5e1"
        fontSize={6.5}
        style={{ cursor: "pointer" }}
      >
        {getLabel(page)}
      </text>
    </a>
  );
}

export default function FlowDiagram({ query }) {
  const [flows, setFlows] = useState([]);
  const [entries, setEntries] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/analytics/flow?${query || "days=7"}`)
      .then((r) => r.json())
      .then((d) => {
        setFlows(d.flows || []);
        setEntries(d.entries || []);
      })
      .catch(() => {});
  }, [query]);

  if (entries.length === 0) {
    return (
      <div className="admin-card rounded-xl p-5 border">
        <h3 className="admin-text-muted text-xs font-bold uppercase tracking-wider">Flow de navigation</h3>
        <p className="admin-text-muted text-sm mt-2">Pas assez de données pour cette période.</p>
      </div>
    );
  }

  // Filtrage du bruit : chemins à 2+ visiteurs si on en a, sinon les 12 premiers.
  const strongFlows = flows.filter((f) => f.count >= 2);
  const shownFlows = (strongFlows.length >= 3 ? strongFlows : flows).slice(0, 20);
  const usedFrom = new Set(shownFlows.map((f) => f.from));
  const shownEntries = entries
    .filter((e) => e.count >= 2 || usedFrom.has(e.page))
    .slice(0, 14);
  const hiddenFlows = flows.length - shownFlows.length;

  const maxCount = Math.max(shownEntries[0]?.count || 1, shownFlows[0]?.count || 1);
  const fromPages = shownEntries.map((e) => e.page);
  const toPages = [...new Set(shownFlows.map((f) => f.to))].slice(0, 14);

  const fromTotals = new Map();
  for (const e of shownEntries) fromTotals.set(e.page, e.count);
  const toTotals = new Map();
  for (const f of shownFlows) toTotals.set(f.to, (toTotals.get(f.to) || 0) + f.count);

  const topFlow = shownFlows[0] || flows[0];
  const nodeCount = Math.max(fromPages.length, toPages.length, 1);
  const rowH = 18;
  const pad = 18;
  const h = (nodeCount - 1) * rowH + pad * 2;
  const w = 700;
  const lx = 170;
  const rx = w - 170;

  return (
    <div className="admin-card rounded-xl p-5 border">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="admin-text-muted text-xs font-bold uppercase tracking-wider">Flow de navigation</h3>
          {topFlow && (
            <p className="admin-text-muted text-xs mt-1">
              Parcours nº 1 : <span className="admin-text font-semibold">{getLabel(topFlow.from)}</span>
              <i className="fas fa-arrow-right mx-1.5 text-[9px] opacity-60"></i>
              <span className="admin-text font-semibold">{getLabel(topFlow.to)}</span>
              <span className="ml-1.5">({topFlow.count} visiteur{topFlow.count > 1 ? "s" : ""})</span>
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="admin-card admin-text-muted border rounded-lg px-4 py-2 text-xs font-bold hover:bg-white/5"
        >
          {open ? "Masquer le diagramme" : "Voir le diagramme"}
          <i className={`fas fa-chevron-down ml-2 text-[10px] transition-transform ${open ? "rotate-180" : ""}`}></i>
        </button>
      </div>

      {open && (
        <div className="overflow-x-auto pb-1 mt-4 border-t admin-border pt-4">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[640px]" style={{ display: "block" }}>
            <defs>
              {shownFlows.map((f, i) => (
                <marker key={`a${i}`} id={`fa${i}`} viewBox="0 0 10 6" refX={10} refY={3} markerWidth={8} markerHeight={6} orient="auto">
                  <path d="M0 0L10 3L0 6Z" fill={getColor(f.from)} fillOpacity={0.8} />
                </marker>
              ))}
            </defs>

            {fromPages.map((page, i) => {
              const y = pad + i * rowH;
              return (
                <g key={`f-${page}`}>
                  <circle cx={lx} cy={y} r={6} fill={getColor(page)} fillOpacity={0.18} stroke={getColor(page)} strokeWidth={1.2} />
                  <text x={lx} y={y + 2.2} textAnchor="middle" fill="#fff" fontSize={5.5} fontWeight="bold">{fromTotals.get(page) || 0}</text>
                  <PageLink page={page} x={lx - 10} y={y + 2.2} textAnchor="end" />
                </g>
              );
            })}

            {toPages.map((page, i) => {
              const y = pad + i * rowH;
              return (
                <g key={`t-${page}`}>
                  <circle cx={rx} cy={y} r={6} fill={getColor(page)} fillOpacity={0.18} stroke={getColor(page)} strokeWidth={1.2} />
                  <text x={rx} y={y + 2.2} textAnchor="middle" fill="#fff" fontSize={5.5} fontWeight="bold">{toTotals.get(page) || 0}</text>
                  <PageLink page={page} x={rx + 10} y={y + 2.2} textAnchor="start" />
                </g>
              );
            })}

            {shownFlows.map((f, i) => {
              const fi = fromPages.indexOf(f.from);
              const ti = toPages.indexOf(f.to);
              if (fi === -1 || ti === -1) return null;
              const y1 = pad + fi * rowH;
              const y2 = pad + ti * rowH;
              const t = Math.max(1.4, (f.count / maxCount) * 7);
              const mx = (lx + rx) / 2;
              const d = `M${lx + 8} ${y1}C${mx} ${y1},${mx} ${y2},${rx - 8} ${y2}`;
              const color = getColor(f.from);

              return (
                <g key={i}>
                  <path d={d} fill="none" stroke={color} strokeWidth={t} strokeOpacity={0.3} />
                  <path d={d} fill="none" stroke="transparent" strokeWidth={1} markerEnd={`url(#fa${i})`} />
                  <circle r={t * 0.45 + 0.8} fill={color} fillOpacity={0.9}>
                    <animateMotion dur="3s" repeatCount="indefinite" path={d} />
                  </circle>
                  <a href={getPageHref(f.to)} target="_blank" rel="noopener noreferrer">
                    <title>{`${f.from} → ${f.to} : ${f.count} visiteur${f.count > 1 ? "s" : ""}`}</title>
                    <path d={d} fill="none" stroke="transparent" strokeWidth={Math.max(t, 10)} style={{ cursor: "pointer" }} />
                  </a>
                </g>
              );
            })}
          </svg>
          {hiddenFlows > 0 && (
            <p className="admin-text-muted text-[11px] text-center mt-2">
              {hiddenFlows} parcours à 1 visiteur masqué{hiddenFlows > 1 ? "s" : ""} pour la lisibilité.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
