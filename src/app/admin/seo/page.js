"use client";

import { useState, useEffect } from "react";

function positionColor(pos) {
  if (pos === null || pos === undefined) return "bg-gray-500/20 text-gray-400";
  if (pos <= 3) return "bg-green-500/20 text-green-400";
  if (pos <= 10) return "bg-blue-500/20 text-blue-400";
  if (pos <= 20) return "bg-orange-500/20 text-orange-400";
  return "bg-red-500/20 text-red-400";
}

function positionLabel(pos) {
  if (pos === null || pos === undefined) return "—";
  return `#${pos}`;
}

function TrendArrow({ history }) {
  if (!history || history.length < 2) return <span className="admin-text-muted">—</span>;
  const latest = history[0].position;
  const previous = history[1].position;
  if (latest === null && previous === null) return <span className="admin-text-muted">—</span>;
  if (latest === null) return <i className="fas fa-arrow-down text-red-400"></i>;
  if (previous === null) return <i className="fas fa-arrow-up text-green-400"></i>;
  const diff = previous - latest;
  if (diff > 0) return <span className="text-green-400 font-bold"><i className="fas fa-arrow-up"></i> +{diff}</span>;
  if (diff < 0) return <span className="text-red-400 font-bold"><i className="fas fa-arrow-down"></i> {diff}</span>;
  return <span className="admin-text-muted">=</span>;
}

function PositionChart({ history }) {
  if (!history || history.length === 0) {
    return <p className="admin-text-muted text-sm text-center py-8">Aucune donnee disponible</p>;
  }
  const data = history.slice(0, 10).reverse();
  const W = 600, H = 200, padX = 50, padY = 25;
  const chartW = W - padX * 2, chartH = H - padY * 2;
  const maxPos = 25, minPos = 1;

  function getY(pos) {
    if (pos === null) return H - padY;
    return padY + ((Math.min(Math.max(pos, minPos), maxPos) - minPos) / (maxPos - minPos)) * chartH;
  }
  function getX(i) {
    if (data.length === 1) return padX + chartW / 2;
    return padX + (i / (data.length - 1)) * chartW;
  }

  const points = data.map((d, i) => (d.position !== null ? { x: getX(i), y: getY(d.position), pos: d.position } : null)).filter(Boolean);
  let pathD = points.length > 1 ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") : "";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: "220px" }}>
      {[1, 5, 10, 15, 20].map((pos) => (
        <g key={pos}>
          <line x1={padX} y1={getY(pos)} x2={W - padX} y2={getY(pos)} stroke="#666" strokeOpacity="0.3" strokeDasharray="4,4" />
          <text x={padX - 8} y={getY(pos) + 4} textAnchor="end" fill="#999" style={{ fontSize: "11px" }}>#{pos}</text>
        </g>
      ))}
      {pathD && (
        <>
          <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinejoin="round" />
          <path d={`${pathD} L ${points[points.length - 1].x} ${H - padY} L ${points[0].x} ${H - padY} Z`} fill="#3b82f6" fillOpacity="0.08" />
        </>
      )}
      {data.map((d, i) => {
        if (d.position === null) return <text key={`null-${i}`} x={getX(i)} y={H - padY + 4} textAnchor="middle" fill="#666" style={{ fontSize: "10px" }}>N/A</text>;
        const color = d.position <= 3 ? "#22c55e" : d.position <= 10 ? "#3b82f6" : d.position <= 20 ? "#f97316" : "#ef4444";
        return (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(d.position)} r="6" fill={color} />
            <text x={getX(i)} y={getY(d.position) - 12} textAnchor="middle" fill={color} style={{ fontSize: "12px", fontWeight: "bold" }}>#{d.position}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const date = new Date(d.checkedAt);
        return <text key={`date-${i}`} x={getX(i)} y={H - 4} textAnchor="middle" fill="#999" style={{ fontSize: "10px" }}>{date.getDate()}/{date.getMonth() + 1}</text>;
      })}
    </svg>
  );
}

export default function AdminSeoPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [progress, setProgress] = useState(null);
  const [expandedCity, setExpandedCity] = useState(null);
  const [sortBy, setSortBy] = useState("position");
  const [sortDir, setSortDir] = useState("asc");
  const [keywords, setKeywords] = useState([]);
  const [activeKeyword, setActiveKeyword] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

  // Load keywords
  useEffect(() => {
    fetch("/api/admin/seo/keywords")
      .then((r) => r.json())
      .then((d) => {
        setKeywords(d.keywords || ["remplacement vitre thermos"]);
        setActiveKeyword(d.keywords?.[0] || "remplacement vitre thermos");
      })
      .catch(() => {
        setKeywords(["remplacement vitre thermos"]);
        setActiveKeyword("remplacement vitre thermos");
      });
  }, []);

  async function fetchData(keyword) {
    setLoading(true);
    try {
      const kw = keyword || activeKeyword;
      const res = await fetch(`/api/admin/seo?days=30&keyword=${encodeURIComponent(kw)}`);
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error("Error fetching SEO data:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (activeKeyword) fetchData(activeKeyword);
  }, [activeKeyword]);

  async function addKeyword() {
    const kw = newKeyword.trim().toLowerCase();
    if (!kw || keywords.includes(kw)) return;
    const updated = [...keywords, kw];
    setKeywords(updated);
    setNewKeyword("");
    await fetch("/api/admin/seo/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: updated }),
    });
  }

  async function removeKeyword(kw) {
    if (keywords.length <= 1) return;
    const updated = keywords.filter((k) => k !== kw);
    setKeywords(updated);
    if (activeKeyword === kw) setActiveKeyword(updated[0]);
    await fetch("/api/admin/seo/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: updated }),
    });
  }

  async function startCheck() {
    setChecking(true);
    setProgress({ current: 0, total: 53, city: "Demarrage...", results: [] });

    try {
      const res = await fetch("/api/admin/seo/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: activeKeyword }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        setChecking(false);
        setProgress(null);
        return;
      }
      // Poll for progress
      pollProgress();
    } catch (err) {
      console.error("Check error:", err);
      setChecking(false);
      setProgress(null);
    }
  }

  function pollProgress() {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/seo/check");
        const state = await res.json();
        setProgress({
          current: state.current,
          total: state.total,
          city: state.city,
          results: state.results || [],
        });
        if (!state.running) {
          clearInterval(interval);
          setChecking(false);
          setProgress(null);
          fetchData(activeKeyword);
        }
      } catch {}
    }, 1500);
  }

  // Check if a scan is already running on page load
  useEffect(() => {
    fetch("/api/admin/seo/check").then(r => r.json()).then(state => {
      if (state.running) {
        setChecking(true);
        setProgress({ current: state.current, total: state.total, city: state.city, results: state.results || [] });
        pollProgress();
      }
    }).catch(() => {});
  }, []);

  const cities = data?.cities || [];
  const inTop1 = cities.filter((c) => c.latestPosition === 1).length;
  const inTop2 = cities.filter((c) => c.latestPosition === 2).length;
  const inTop3 = cities.filter((c) => c.latestPosition === 3).length;
  const inTop10 = cities.filter((c) => c.latestPosition !== null && c.latestPosition <= 10).length;
  const withPosition = cities.filter((c) => c.latestPosition !== null);
  const avgPosition = withPosition.length > 0
    ? (withPosition.reduce((sum, c) => sum + c.latestPosition, 0) / withPosition.length).toFixed(1)
    : "—";
  const aiMentions = cities.filter((c) => c.latestAi).length;

  const sortedCities = [...cities].sort((a, b) => {
    if (sortBy === "name") return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    const posA = a.latestPosition ?? 999;
    const posB = b.latestPosition ?? 999;
    return sortDir === "asc" ? posA - posB : posB - posA;
  });

  function toggleSort(col) {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold admin-text">Suivi SEO</h1>
        <button onClick={startCheck} disabled={checking || !activeKeyword}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${checking ? "bg-gray-500/30 text-gray-400 cursor-not-allowed" : "bg-[var(--color-red)] text-white hover:opacity-90"}`}>
          {checking ? <><i className="fas fa-spinner fa-spin mr-2"></i>Verification...</> : <><i className="fas fa-sync-alt mr-2"></i>Rafraichir</>}
        </button>
      </div>

      {/* Keywords manager */}
      <div className="admin-card border rounded-2xl p-5 mb-6">
        <p className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-3">Mots cles recherches (+ nom de la ville)</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {keywords.map((kw) => (
            <button
              key={kw}
              onClick={() => setActiveKeyword(kw)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeKeyword === kw
                  ? "bg-[var(--color-red)] text-white"
                  : "admin-card border admin-text-muted hover:admin-text"
              }`}
            >
              <span>&quot;{kw} [ville]&quot;</span>
              {keywords.length > 1 && (
                <i
                  className="fas fa-times text-xs opacity-50 hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); removeKeyword(kw); }}
                ></i>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addKeyword()}
            placeholder="Ajouter un mot cle (ex: reparation fenetre)"
            className="admin-input flex-1 rounded-lg px-4 py-2 text-sm border"
          />
          <button
            onClick={addKeyword}
            disabled={!newKeyword.trim()}
            className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all disabled:opacity-30"
          >
            <i className="fas fa-plus mr-1"></i>Ajouter
          </button>
        </div>
      </div>

      {/* Progress */}
      {checking && progress && (
        <div className="admin-card border rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="admin-text text-sm font-bold">{progress.current}/{progress.total} — {progress.city}</span>
            <span className="admin-text-muted text-xs font-mono">&quot;{activeKeyword} [ville]&quot;</span>
          </div>
          <div className="w-full bg-gray-700/30 rounded-full h-3 overflow-hidden mb-3">
            <div className="h-full bg-[var(--color-red)] rounded-full transition-all duration-500" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
          </div>
          {progress.results?.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-1.5">
              {progress.results.slice(-8).reverse().map((r, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="admin-text w-40 truncate">{r.city}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${positionColor(r.position)}`}>{positionLabel(r.position)}</span>
                  {r.aiMention && <span className="text-purple-400 text-xs font-bold"><i className="fas fa-robot mr-1"></i>IA</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <p className="admin-text-muted text-center py-12"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement...</p>
      )}

      {/* Summary cards */}
      {!loading && cities.length > 0 && (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="admin-card border rounded-2xl p-4">
            <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">#1 Premier</p>
            <p className="text-3xl font-extrabold text-green-400">{inTop1}</p>
          </div>
          <div className="admin-card border rounded-2xl p-4">
            <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">#2 Deuxieme</p>
            <p className="text-3xl font-extrabold text-green-400">{inTop2}</p>
          </div>
          <div className="admin-card border rounded-2xl p-4">
            <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">#3 Troisieme</p>
            <p className="text-3xl font-extrabold text-green-400">{inTop3}</p>
          </div>
          <div className="admin-card border rounded-2xl p-4">
            <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">Top 10</p>
            <p className="text-3xl font-extrabold text-blue-400">{inTop10}</p>
          </div>
          <div className="admin-card border rounded-2xl p-4">
            <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">Pos. moyenne</p>
            <p className="text-3xl font-extrabold text-orange-400">{avgPosition}</p>
          </div>
          <div className="admin-card border rounded-2xl p-4">
            <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">Mentions IA</p>
            <p className="text-3xl font-extrabold text-purple-400">{aiMentions}</p>
          </div>
        </div>
      )}

      {/* No data */}
      {!loading && cities.length === 0 && (
        <div className="admin-card border rounded-2xl p-12 text-center">
          <i className="fas fa-search text-4xl admin-text-muted mb-4 block"></i>
          <p className="admin-text font-bold text-lg mb-2">Aucune donnee pour ce mot cle</p>
          <p className="admin-text-muted text-sm">Cliquez &quot;Rafraichir&quot; pour scanner &quot;{activeKeyword} [ville]&quot; sur les 53 villes.</p>
        </div>
      )}

      {/* Table */}
      {!loading && cities.length > 0 && (
        <div className="admin-card border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
            <div className="col-span-4 admin-text-muted text-xs font-bold uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort("name")}>
              Ville {sortBy === "name" && <i className={`fas fa-caret-${sortDir === "asc" ? "up" : "down"} ml-1`}></i>}
            </div>
            <div className="col-span-2 text-center admin-text-muted text-xs font-bold uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort("position")}>
              Position {sortBy === "position" && <i className={`fas fa-caret-${sortDir === "asc" ? "up" : "down"} ml-1`}></i>}
            </div>
            <div className="col-span-2 text-center admin-text-muted text-xs font-bold uppercase tracking-wider">Tendance</div>
            <div className="col-span-2 text-center admin-text-muted text-xs font-bold uppercase tracking-wider">AI Overview</div>
            <div className="col-span-2 text-right admin-text-muted text-xs font-bold uppercase tracking-wider hidden lg:block">Verifie</div>
          </div>

          {sortedCities.map((city) => {
            const isExpanded = expandedCity === city.slug;
            const lastCheck = city.history[0]?.checkedAt;
            const lastDate = lastCheck
              ? new Date(lastCheck).toLocaleDateString("fr-CA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
              : "—";

            return (
              <div key={city.slug} className="border-b last:border-0" style={{ borderColor: "var(--admin-border)" }}>
                <div className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setExpandedCity(isExpanded ? null : city.slug)}>
                  <div className="col-span-4 admin-text text-sm font-medium flex items-center gap-2">
                    <i className={`fas fa-chevron-right text-[10px] admin-text-muted transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}></i>
                    {city.name}
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-extrabold ${positionColor(city.latestPosition)}`}>
                      {positionLabel(city.latestPosition)}
                    </span>
                  </div>
                  <div className="col-span-2 text-center text-sm"><TrendArrow history={city.history} /></div>
                  <div className="col-span-2 text-center">
                    {city.latestAi ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold"><i className="fas fa-robot"></i> Oui</span>
                    ) : (
                      <span className="admin-text-muted text-xs">Non</span>
                    )}
                  </div>
                  <div className="col-span-2 text-right admin-text-muted text-xs hidden lg:block">{lastDate}</div>
                </div>

                <div className="overflow-hidden transition-all duration-[1500ms] ease-in-out" style={{ maxHeight: isExpanded ? "400px" : "0px", opacity: isExpanded ? 1 : 0 }}>
                  <div className="px-5 pb-5 pt-2 border-t" style={{ borderColor: "var(--admin-border)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="admin-text text-sm font-bold">Historique — {city.name}</p>
                      {city.url && <p className="text-blue-400 text-xs font-mono truncate max-w-[300px]">{city.url}</p>}
                    </div>
                    <PositionChart history={city.history} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
