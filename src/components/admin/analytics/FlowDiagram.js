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
      return label + " / " + (sub.length > 15 ? sub.substring(0, 15) + "..." : sub);
    }
  }
  return page.length > 20 ? page.substring(0, 20) + "..." : page;
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

  const nodeRadius = 16;
  const svgPad = nodeRadius + 20;
  const nodeCount = Math.max(fromPages.length, toPages.length, 1);
  const contentHeight = Math.max(nodeCount - 1, 1) * 55;
  const svgWidth = 800;
  const svgHeight = contentHeight + svgPad * 2;
  const leftX = 180;
  const rightX = svgWidth - 180;


  return (
    <div className="admin-card rounded-xl p-4 border" style={{ overflow: "visible" }}>
      <h3 className="admin-text-muted text-xs uppercase tracking-wider mb-3">Flow de navigation</h3>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full" style={{ display: "block", overflow: "visible" }}>
            <defs>
              {flows.map((f, i) => (
                <marker
                  key={`arrow-${i}`}
                  id={`arrow-${i}`}
                  viewBox="0 0 10 6"
                  refX={10}
                  refY={3}
                  markerWidth={8}
                  markerHeight={6}
                  orient="auto"
                >
                  <path d="M 0 0 L 10 3 L 0 6 Z" fill={getColor(f.from)} fillOpacity={0.7} />
                </marker>
              ))}
            </defs>

            {/* From nodes (left) */}
            {fromPages.map((page, i) => {
              const y = svgPad + i * contentHeight / Math.max(fromPages.length - 1, 1);
              const total = fromTotals.get(page) || 0;
              return (
                <g key={`from-${page}`}>
                  <circle cx={leftX} cy={y} r={nodeRadius} fill={getColor(page)} fillOpacity={0.2} stroke={getColor(page)} strokeWidth={2} />
                  <text x={leftX} y={y + 5} textAnchor="middle" fill="#ffffff" fontSize={11} fontWeight="bold">
                    {total}
                  </text>
                  <text x={leftX - nodeRadius - 6} y={y + 4} textAnchor="end" fill="#a0a0a0" fontSize={11}>
                    {getLabel(page)}
                  </text>
                </g>
              );
            })}

            {/* To nodes (right) */}
            {toPages.map((page, i) => {
              const y = svgPad + i * contentHeight / Math.max(toPages.length - 1, 1);
              const total = toTotals.get(page) || 0;
              return (
                <g key={`to-${page}`}>
                  <circle cx={rightX} cy={y} r={nodeRadius} fill={getColor(page)} fillOpacity={0.2} stroke={getColor(page)} strokeWidth={2} />
                  <text x={rightX} y={y + 5} textAnchor="middle" fill="#ffffff" fontSize={11} fontWeight="bold">
                    {total}
                  </text>
                  <text x={rightX + nodeRadius + 6} y={y + 4} textAnchor="start" fill="#a0a0a0" fontSize={11}>
                    {getLabel(page)}
                  </text>
                </g>
              );
            })}

            {/* Flow paths with animated arrows */}
            {flows.map((f, i) => {
              const fromIdx = fromPages.indexOf(f.from);
              const toIdx = toPages.indexOf(f.to);
              const y1 = svgPad + fromIdx * contentHeight / Math.max(fromPages.length - 1, 1);
              const y2 = svgPad + toIdx * contentHeight / Math.max(toPages.length - 1, 1);
              const thickness = Math.max(1, (f.count / maxCount) * 8);
              const midX = (leftX + rightX) / 2;
              const pathD = `M ${leftX + nodeRadius + 2} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${rightX - nodeRadius - 2} ${y2}`;
              const pathId = `flow-path-${i}`;
              const color = getColor(f.from);
              const particleCount = Math.max(1, Math.round((f.count / maxCount) * 3));
              const duration = 3;

              return (
                <g key={i}>
                  {/* Background curve */}
                  <path
                    id={pathId}
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth={thickness}
                    strokeOpacity={0.15}
                  />
                  {/* Animated dashed curve */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth={thickness}
                    strokeOpacity={0.4}
                    strokeDasharray={`${thickness * 3} ${thickness * 6}`}
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from={thickness * 9}
                      to={0}
                      dur={`${duration}s`}
                      repeatCount="indefinite"
                    />
                  </path>
                  {/* Arrow at end */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={1}
                    markerEnd={`url(#arrow-${i})`}
                  />
                  {/* Animated particles along path */}
                  {Array.from({ length: particleCount }).map((_, p) => (
                    <circle key={p} r={thickness * 0.6 + 1} fill={color} fillOpacity={0.8}>
                      <animateMotion
                        dur={`${duration}s`}
                        begin={`${(p / particleCount) * duration}s`}
                        repeatCount="indefinite"
                        path={pathD}
                      />
                    </circle>
                  ))}
                  {/* Tooltip hitbox */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={Math.max(thickness, 12)}
                    style={{ cursor: "pointer" }}
                  >
                    <title>{`${getLabel(f.from)} → ${getLabel(f.to)}: ${f.count}`}</title>
                  </path>
                </g>
              );
            })}
      </svg>
    </div>
  );
}
