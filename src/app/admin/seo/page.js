"use client";

import { useState, useEffect, useRef } from "react";

// ─── Position badge color ────────────────────────────────────────────
function positionColor(pos) {
  if (pos === null || pos === undefined) return "bg-gray-500/20 text-gray-400";
  if (pos <= 3) return "bg-green-500/20 text-green-400";
  if (pos <= 10) return "bg-blue-500/20 text-blue-400";
  if (pos <= 20) return "bg-orange-500/20 text-orange-400";
  return "bg-red-500/20 text-red-400";
}

function positionLabel(pos) {
  if (pos === null || pos === undefined) return "Non trouve";
  return `#${pos}`;
}

// ─── Trend arrow ─────────────────────────────────────────────────────
function TrendArrow({ history }) {
  if (!history || history.length < 2) return <span className="admin-text-muted">—</span>;
  const latest = history[0].position;
  const previous = history[1].position;

  if (latest === null && previous === null) return <span className="admin-text-muted">—</span>;
  if (latest === null) return <i className="fas fa-arrow-down text-red-400"></i>;
  if (previous === null) return <i className="fas fa-arrow-up text-green-400"></i>;

  const diff = previous - latest; // positive = improved (lower position = better)
  if (diff > 0) return <span className="text-green-400"><i className="fas fa-arrow-up"></i> +{diff}</span>;
  if (diff < 0) return <span className="text-red-400"><i className="fas fa-arrow-down"></i> {diff}</span>;
  return <span className="admin-text-muted">=</span>;
}

// ─── SVG mini chart ──────────────────────────────────────────────────
function PositionChart({ history }) {
  if (!history || history.length === 0) {
    return <p className="admin-text-muted text-sm text-center py-8">Aucune donnee disponible</p>;
  }

  // Take last 10 checks, reversed so oldest first
  const data = history.slice(0, 10).reverse();
  const W = 600;
  const H = 200;
  const padX = 60;
  const padY = 30;
  const chartW = W - padX * 2;
  const chartH = H - padY * 2;

  // Y axis: position 1 at top, 25 at bottom
  const maxPos = 25;
  const minPos = 1;

  function getY(pos) {
    if (pos === null) return H - padY; // off the bottom
    const clamped = Math.min(Math.max(pos, minPos), maxPos);
    return padY + ((clamped - minPos) / (maxPos - minPos)) * chartH;
  }

  function getX(i) {
    if (data.length === 1) return padX + chartW / 2;
    return padX + (i / (data.length - 1)) * chartW;
  }

  // Build path for non-null points
  const points = data
    .map((d, i) => (d.position !== null ? { x: getX(i), y: getY(d.position), pos: d.position } : null))
    .filter(Boolean);

  let pathD = "";
  if (points.length > 1) {
    pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: "220px" }}>
      {/* Grid lines */}
      {[1, 5, 10, 15, 20, 25].map((pos) => (
        <g key={pos}>
          <line
            x1={padX} y1={getY(pos)} x2={W - padX} y2={getY(pos)}
            stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4,4"
          />
          <text x={padX - 8} y={getY(pos) + 4} textAnchor="end" className="fill-current" style={{ fontSize: "11px", opacity: 0.5 }}>
            #{pos}
          </text>
        </g>
      ))}

      {/* Line */}
      {pathD && (
        <path d={pathD} fill="none" stroke="var(--color-red, #e30718)" strokeWidth="2.5" strokeLinejoin="round" />
      )}

      {/* Points */}
      {data.map((d, i) => {
        if (d.position === null) return null;
        return (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(d.position)} r="5" fill="var(--color-red, #e30718)" />
            <text
              x={getX(i)} y={getY(d.position) - 10}
              textAnchor="middle" className="fill-current" style={{ fontSize: "10px", fontWeight: "bold" }}
            >
              #{d.position}
            </text>
          </g>
        );
      })}

      {/* Null positions marker */}
      {data.map((d, i) => {
        if (d.position !== null) return null;
        return (
          <g key={`null-${i}`}>
            <text x={getX(i)} y={H - padY + 4} textAnchor="middle" style={{ fontSize: "10px", opacity: 0.4 }} className="fill-current">
              N/A
            </text>
          </g>
        );
      })}

      {/* X axis dates */}
      {data.map((d, i) => {
        const date = new Date(d.checkedAt);
        const label = `${date.getDate()}/${date.getMonth() + 1}`;
        return (
          <text
            key={`date-${i}`} x={getX(i)} y={H - 5}
            textAnchor="middle" className="fill-current" style={{ fontSize: "10px", opacity: 0.5 }}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Main page ───────────────────────────────────────────────────────
export default function AdminSeoPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [progress, setProgress] = useState(null);
  const [expandedCity, setExpandedCity] = useState(null);
  const [sortBy, setSortBy] = useState("position"); // "position" | "name"
  const [sortDir, setSortDir] = useState("asc");
  const abortRef = useRef(null);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo?days=30");
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error("Error fetching SEO data:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function startCheck() {
    setChecking(true);
    setProgress({ current: 0, total: 53, city: "Demarrage...", results: [] });

    try {
      const res = await fetch("/api/admin/seo/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6));
              if (event.done) {
                setChecking(false);
                setProgress(null);
                fetchData();
                return;
              }
              setProgress((prev) => ({
                ...prev,
                current: event.current,
                total: event.total,
                city: event.city,
                status: event.status,
                results:
                  event.status === "done"
                    ? [...(prev?.results || []), event]
                    : prev?.results || [],
              }));
            } catch {}
          }
        }
      }
    } catch (err) {
      console.error("Check error:", err);
    }

    setChecking(false);
    setProgress(null);
    fetchData();
  }

  // ─── Summary stats ──────────────────────────────────────────────────
  const cities = data?.cities || [];
  const inTop3 = cities.filter((c) => c.latestPosition !== null && c.latestPosition <= 3).length;
  const inTop10 = cities.filter((c) => c.latestPosition !== null && c.latestPosition <= 10).length;
  const withPosition = cities.filter((c) => c.latestPosition !== null);
  const avgPosition =
    withPosition.length > 0
      ? (withPosition.reduce((sum, c) => sum + c.latestPosition, 0) / withPosition.length).toFixed(1)
      : "—";
  const aiMentions = cities.filter((c) => c.latestAi).length;

  // ─── Sorting ────────────────────────────────────────────────────────
  const sortedCities = [...cities].sort((a, b) => {
    if (sortBy === "name") {
      return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    // Sort by position: nulls at the end
    const posA = a.latestPosition ?? 999;
    const posB = b.latestPosition ?? 999;
    return sortDir === "asc" ? posA - posB : posB - posA;
  });

  function toggleSort(col) {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  }

  if (loading || !data) {
    return (
      <div className="p-6 lg:p-8">
        <p className="admin-text-muted text-center py-20">
          <i className="fas fa-spinner fa-spin mr-2"></i>Chargement des donnees SEO...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold admin-text">Suivi SEO</h1>
        <button
          onClick={startCheck}
          disabled={checking}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            checking
              ? "bg-gray-500/30 text-gray-400 cursor-not-allowed"
              : "bg-[var(--color-red)] text-white hover:opacity-90"
          }`}
        >
          {checking ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>Verification en cours...
            </>
          ) : (
            <>
              <i className="fas fa-sync-alt mr-2"></i>Rafraichir les positions
            </>
          )}
        </button>
      </div>

      {/* Progress bar */}
      {checking && progress && (
        <div className="admin-card border rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="admin-text text-sm font-bold">
              Verification {progress.current}/{progress.total} — {progress.city}
            </span>
            <span className="admin-text-muted text-sm">
              {Math.round((progress.current / progress.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700/30 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-[var(--color-red)] rounded-full transition-all duration-500"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
          {/* Live results */}
          {progress.results && progress.results.length > 0 && (
            <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
              {progress.results
                .slice(-5)
                .reverse()
                .map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="admin-text-muted">{r.city}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${positionColor(r.position)}`}>
                      {positionLabel(r.position)}
                    </span>
                    {r.aiMention && <i className="fas fa-robot text-green-400 text-xs"></i>}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="admin-card border rounded-2xl p-5">
          <p className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-1">Top 3</p>
          <p className="text-3xl font-extrabold text-green-400">{inTop3}</p>
          <p className="admin-text-muted text-xs mt-1">villes en position 1-3</p>
        </div>
        <div className="admin-card border rounded-2xl p-5">
          <p className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-1">Top 10</p>
          <p className="text-3xl font-extrabold text-blue-400">{inTop10}</p>
          <p className="admin-text-muted text-xs mt-1">villes en position 1-10</p>
        </div>
        <div className="admin-card border rounded-2xl p-5">
          <p className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-1">Position moyenne</p>
          <p className="text-3xl font-extrabold admin-text">{avgPosition}</p>
          <p className="admin-text-muted text-xs mt-1">sur les villes trouvees</p>
        </div>
        <div className="admin-card border rounded-2xl p-5">
          <p className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-1">Mentions IA</p>
          <p className="text-3xl font-extrabold text-purple-400">{aiMentions}</p>
          <p className="admin-text-muted text-xs mt-1">villes avec mention AI Overview</p>
        </div>
      </div>

      {/* No data message */}
      {cities.length === 0 && (
        <div className="admin-card border rounded-2xl p-12 text-center">
          <i className="fas fa-search text-4xl admin-text-muted mb-4"></i>
          <p className="admin-text font-bold text-lg mb-2">Aucune donnee SEO</p>
          <p className="admin-text-muted text-sm">
            Cliquez sur "Rafraichir les positions" pour lancer la premiere verification.
          </p>
        </div>
      )}

      {/* Cities table */}
      {cities.length > 0 && (
        <div className="admin-card border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--admin-border)" }}>
                <th
                  className="text-left px-5 py-4 admin-text-muted text-xs font-bold uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => toggleSort("name")}
                >
                  Ville
                  {sortBy === "name" && (
                    <i className={`fas fa-caret-${sortDir === "asc" ? "up" : "down"} ml-1`}></i>
                  )}
                </th>
                <th
                  className="text-center px-5 py-4 admin-text-muted text-xs font-bold uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => toggleSort("position")}
                >
                  Position
                  {sortBy === "position" && (
                    <i className={`fas fa-caret-${sortDir === "asc" ? "up" : "down"} ml-1`}></i>
                  )}
                </th>
                <th className="text-center px-5 py-4 admin-text-muted text-xs font-bold uppercase tracking-wider">
                  Tendance
                </th>
                <th className="text-center px-5 py-4 admin-text-muted text-xs font-bold uppercase tracking-wider">
                  IA
                </th>
                <th className="text-right px-5 py-4 admin-text-muted text-xs font-bold uppercase tracking-wider hidden lg:table-cell">
                  Derniere verification
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCities.map((city) => {
                const isExpanded = expandedCity === city.slug;
                const lastCheck = city.history[0]?.checkedAt;
                const lastDate = lastCheck
                  ? new Date(lastCheck).toLocaleDateString("fr-CA", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";

                return (
                  <tr key={city.slug} className="group">
                    <td colSpan={5} className="p-0">
                      {/* Row */}
                      <div
                        className="flex items-center cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => setExpandedCity(isExpanded ? null : city.slug)}
                      >
                        <div className="flex-1 px-5 py-4 admin-text text-sm font-medium flex items-center gap-2">
                          <i
                            className={`fas fa-chevron-right text-[10px] admin-text-muted transition-transform duration-300 ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          ></i>
                          {city.name}
                        </div>
                        <div className="px-5 py-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${positionColor(city.latestPosition)}`}
                          >
                            {positionLabel(city.latestPosition)}
                          </span>
                        </div>
                        <div className="px-5 py-4 text-center text-sm">
                          <TrendArrow history={city.history} />
                        </div>
                        <div className="px-5 py-4 text-center">
                          {city.latestAi ? (
                            <i className="fas fa-check-circle text-green-400"></i>
                          ) : (
                            <span className="admin-text-muted">—</span>
                          )}
                        </div>
                        <div className="px-5 py-4 text-right admin-text-muted text-xs hidden lg:block">
                          {lastDate}
                        </div>
                      </div>

                      {/* Expanded: history chart */}
                      <div
                        className="overflow-hidden transition-all duration-[1500ms] ease-in-out"
                        style={{
                          maxHeight: isExpanded ? "400px" : "0px",
                          opacity: isExpanded ? 1 : 0,
                        }}
                      >
                        <div className="px-5 pb-5 pt-2 border-t" style={{ borderColor: "var(--admin-border)" }}>
                          <div className="flex items-center justify-between mb-3">
                            <p className="admin-text text-sm font-bold">
                              Historique des positions — {city.name}
                            </p>
                            <p className="admin-text-muted text-xs">
                              Mot cle: <span className="font-mono">{city.keyword || `remplacement vitre thermos ${city.name}`}</span>
                            </p>
                          </div>
                          {city.url && (
                            <p className="admin-text-muted text-xs mb-3">
                              URL: <span className="font-mono text-blue-400">{city.url}</span>
                            </p>
                          )}
                          <PositionChart history={city.history} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
