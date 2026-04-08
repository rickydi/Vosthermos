"use client";

import { useEffect, useState } from "react";

const PAGE_COLORS = {
  "/": "#6b7280",
  "/boutique": "#3b82f6",
  "/services": "#22c55e",
  "/contact": "#f59e0b",
  "/panier": "#8b5cf6",
  "/checkout": "#ec4899",
  "/produit": "#14b8a6",
  "/secteurs": "#f97316",
};

const PAGE_LABELS = {
  "/": "Accueil",
  "/boutique": "Boutique",
  "/services": "Services",
  "/contact": "Contact",
  "/panier": "Panier",
  "/checkout": "Checkout",
  "/secteurs": "Secteurs",
};

function getColor(page) {
  for (const [prefix, color] of Object.entries(PAGE_COLORS)) {
    if (page === prefix || page.startsWith(prefix + "/")) return color;
  }
  return "#6b7280";
}

function getLabel(page) {
  for (const [prefix, label] of Object.entries(PAGE_LABELS)) {
    if (page === prefix) return label;
    if (page.startsWith(prefix + "/")) {
      const sub = page.replace(prefix + "/", "");
      return label + " / " + (sub.length > 10 ? sub.substring(0, 10) + "…" : sub);
    }
  }
  return page.length > 16 ? page.substring(0, 16) + "…" : page;
}

export default function FlowDiagram({ days }) {
  const [flows, setFlows] = useState([]);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetch(`/api/admin/analytics/flow?days=${days}`)
      .then((r) => r.json())
      .then((d) => {
        setFlows(d.flows || []);
        setEntries(d.entries || []);
      })
      .catch(() => {});
  }, [days]);

  if (entries.length === 0) {
    return (
      <div className="admin-card rounded-xl p-4 border">
        <h3 className="admin-text-muted text-xs uppercase tracking-wider mb-3">Flow de navigation</h3>
        <p className="admin-text-muted text-sm">Pas assez de donnees</p>
      </div>
    );
  }

  const maxCount = Math.max(entries[0]?.count || 1, flows[0]?.count || 1);
  const fromPages = entries.map((e) => e.page);
  const toPages = [...new Set(flows.map((f) => f.to))];

  const fromTotals = new Map();
  for (const e of entries) {
    fromTotals.set(e.page, e.count);
  }
  const toTotals = new Map();
  for (const f of flows) {
    toTotals.set(f.to, (toTotals.get(f.to) || 0) + f.count);
  }

  const nodeCount = Math.max(fromPages.length, toPages.length, 1);
  const rowH = 9;
  const pad = 20;
  const h = (nodeCount - 1) * rowH + pad * 2;
  const w = 700;
  const lx = 140;
  const rx = w - 140;

  return (
    <div className="admin-card rounded-xl p-4 border">
      <h3 className="admin-text-muted text-xs uppercase tracking-wider mb-3">Flow de navigation</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ display: "block" }}>
        <defs>
          {flows.map((f, i) => (
            <marker key={`a${i}`} id={`a${i}`} viewBox="0 0 10 6" refX={10} refY={3} markerWidth={8} markerHeight={6} orient="auto">
              <path d="M0 0L10 3L0 6Z" fill={getColor(f.from)} fillOpacity={0.7} />
            </marker>
          ))}
        </defs>

        {fromPages.map((page, i) => {
          const y = pad + i * rowH;
          return (
            <g key={`f-${page}`}>
              <circle cx={lx} cy={y} r={5} fill={getColor(page)} fillOpacity={0.2} stroke={getColor(page)} strokeWidth={1} />
              <text x={lx} y={y + 2} textAnchor="middle" fill="#fff" fontSize={4.5} fontWeight="bold">{fromTotals.get(page) || 0}</text>
              <text x={lx - 8} y={y + 2} textAnchor="end" fill="#9ca3af" fontSize={5}>{getLabel(page)}</text>
            </g>
          );
        })}

        {toPages.map((page, i) => {
          const y = pad + i * rowH;
          return (
            <g key={`t-${page}`}>
              <circle cx={rx} cy={y} r={5} fill={getColor(page)} fillOpacity={0.2} stroke={getColor(page)} strokeWidth={1} />
              <text x={rx} y={y + 2} textAnchor="middle" fill="#fff" fontSize={4.5} fontWeight="bold">{toTotals.get(page) || 0}</text>
              <text x={rx + 8} y={y + 2} textAnchor="start" fill="#9ca3af" fontSize={5}>{getLabel(page)}</text>
            </g>
          );
        })}

        {flows.map((f, i) => {
          const fi = fromPages.indexOf(f.from);
          const ti = toPages.indexOf(f.to);
          if (fi === -1 || ti === -1) return null;
          const y1 = pad + fi * rowH;
          const y2 = pad + ti * rowH;
          const t = Math.max(1, (f.count / maxCount) * 6);
          const mx = (lx + rx) / 2;
          const d = `M${lx + 7} ${y1}C${mx} ${y1},${mx} ${y2},${rx - 7} ${y2}`;
          const color = getColor(f.from);
          const pc = Math.max(1, Math.round((f.count / maxCount) * 3));

          return (
            <g key={i}>
              <path d={d} fill="none" stroke={color} strokeWidth={t} strokeOpacity={0.15} />
              <path d={d} fill="none" stroke={color} strokeWidth={t} strokeOpacity={0.4} strokeDasharray={`${t * 3} ${t * 6}`}>
                <animate attributeName="stroke-dashoffset" from={t * 9} to={0} dur="3s" repeatCount="indefinite" />
              </path>
              <path d={d} fill="none" stroke="transparent" strokeWidth={1} markerEnd={`url(#a${i})`} />
              {Array.from({ length: pc }).map((_, p) => (
                <circle key={p} r={t * 0.5 + 0.8} fill={color} fillOpacity={0.8}>
                  <animateMotion dur="3s" begin={`${(p / pc) * 3}s`} repeatCount="indefinite" path={d} />
                </circle>
              ))}
              <path d={d} fill="none" stroke="transparent" strokeWidth={Math.max(t, 10)} style={{ cursor: "pointer" }}>
                <title>{`${getLabel(f.from)} → ${getLabel(f.to)}: ${f.count}`}</title>
              </path>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
