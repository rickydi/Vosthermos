"use client";

import { useState } from "react";

export default function DailyChart({ daily }) {
  const [tooltip, setTooltip] = useState(null);
  const maxVisitors = Math.max(...daily.map((d) => d.visitors), 1);
  const chartHeight = 160;

  // Single day — show compact summary instead of bar chart
  if (daily.length <= 1) {
    const today = daily[0] || { date: new Date().toISOString().split("T")[0], visitors: 0, pageViews: 0 };
    return (
      <div className="admin-card rounded-xl p-6 border">
        <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-6">
          AUJOURD&apos;HUI
        </h2>
        <div className="flex items-center justify-center gap-12 py-8">
          <div className="text-center">
            <p className="text-4xl font-extrabold text-blue-400">{today.visitors}</p>
            <p className="admin-text-muted text-xs mt-1 uppercase tracking-wider">Visiteur{today.visitors !== 1 ? "s" : ""}</p>
          </div>
          <div className="w-px h-12 bg-current opacity-10"></div>
          <div className="text-center">
            <p className="text-4xl font-extrabold text-green-400">{today.pageViews}</p>
            <p className="admin-text-muted text-xs mt-1 uppercase tracking-wider">Page{today.pageViews !== 1 ? "s" : ""} vue{today.pageViews !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <p className="admin-text-muted text-xs text-center">
          {new Date(today.date).toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-card rounded-xl p-6 border">
      <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-6">
        VISITEURS PAR JOUR
      </h2>
      <div className="relative">
        <svg width="100%" viewBox={`0 0 ${daily.length * 40} ${chartHeight + 30}`} className="overflow-visible">
          {daily.map((d, i) => {
            const barHeight = Math.max((d.visitors / maxVisitors) * chartHeight, 2);
            const x = i * 40 + 8;
            const barWidth = 24;
            const y = chartHeight - barHeight;

            return (
              <g
                key={d.date}
                onMouseEnter={() => setTooltip({ i, d })}
                onMouseLeave={() => setTooltip(null)}
                className="cursor-pointer"
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={3}
                  className={tooltip?.i === i ? "fill-blue-400" : "fill-blue-500/70"}
                />
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  className="fill-current admin-text-muted"
                  style={{ fontSize: "9px" }}
                >
                  {new Date(d.date).toLocaleDateString("fr-CA", { day: "numeric", month: "short" }).replace(".", "")}
                </text>
              </g>
            );
          })}
        </svg>

        {tooltip && (
          <div
            className="absolute bg-black/90 text-white text-xs rounded-lg px-3 py-2 pointer-events-none z-10 whitespace-nowrap"
            style={{
              left: `${(tooltip.i / daily.length) * 100}%`,
              top: "-8px",
              transform: "translateX(-50%)",
            }}
          >
            <div className="font-bold">{tooltip.d.date}</div>
            <div>{tooltip.d.visitors} visiteur{tooltip.d.visitors > 1 ? "s" : ""}</div>
            <div>{tooltip.d.pageViews} page{tooltip.d.pageViews > 1 ? "s" : ""} vue{tooltip.d.pageViews > 1 ? "s" : ""}</div>
          </div>
        )}
      </div>
    </div>
  );
}
