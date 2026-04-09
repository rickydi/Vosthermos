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
  const data = [...history].reverse();
  const W = Math.max(600, data.length * 50), H = 200, padX = 50, padY = 25;
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
    <div className="overflow-x-auto">
    <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: `${W}px`, height: "220px" }}>
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
    </div>
  );
}

// ─── GSC Tab ──────────────────────────────────────────────────────
function GscTab() {
  const PERIODS = [
    { days: 3, label: "3j" },
    { days: 7, label: "7j" },
    { days: 28, label: "28j" },
    { days: 90, label: "90j" },
    { days: 180, label: "6m" },
    { days: 365, label: "1an" },
  ];
  const PRIMARY = 2; // 28j for clicks/impressions

  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [expandedCities, setExpandedCities] = useState(new Set());
  const [cityQueries, setCityQueries] = useState({}); // { slug: { loading, queries } }

  async function fetchAllPeriods(kw) {
    setLoading(true);
    try {
      const params = kw ? `&keyword=${encodeURIComponent(kw)}` : "";
      const results = await Promise.all(
        PERIODS.map(p =>
          fetch(`/api/admin/seo/gsc?days=${p.days}${params}`)
            .then(r => r.json())
            .then(d => d.error ? null : d)
            .catch(() => null)
        )
      );
      setAllData(results);
    } catch (err) {
      console.error("GSC fetch error:", err);
    }
    setLoading(false);
  }

  useEffect(() => { fetchAllPeriods(keyword); }, [keyword]);

  // Fetch pages + queries for a specific city on expand
  async function fetchCityQueries(slug) {
    if (cityQueries[slug]?.pages || cityQueries[slug]?.queries) return; // already loaded
    setCityQueries(prev => ({ ...prev, [slug]: { loading: true, pages: [], queries: [] } }));
    try {
      const params = keyword ? `&keyword=${encodeURIComponent(keyword)}` : "";
      const res = await fetch(`/api/admin/seo/gsc?days=28&city=${slug}${params}`);
      const d = await res.json();
      setCityQueries(prev => ({ ...prev, [slug]: { loading: false, pages: d.pages || [], queries: d.queries || [] } }));
    } catch {
      setCityQueries(prev => ({ ...prev, [slug]: { loading: false, pages: [], queries: [] } }));
    }
  }

  function toggleCity(slug) {
    setExpandedCities(prev => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
        fetchCityQueries(slug);
      }
      return next;
    });
  }

  if (loading) {
    return <p className="admin-text-muted text-center py-12"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement Google Search Console...</p>;
  }

  const primaryData = allData?.[PRIMARY] || allData?.find(d => d) || null;
  if (!primaryData) {
    return <p className="admin-text-muted text-center py-12">Erreur de connexion a Google Search Console</p>;
  }

  // Merge cities across all periods
  const cityMap = {};
  PERIODS.forEach((p, i) => {
    const data = allData?.[i];
    if (!data) return;
    for (const city of data.cities) {
      if (!cityMap[city.slug]) {
        cityMap[city.slug] = {
          slug: city.slug,
          name: city.name,
          positions: {},
          totalClicks: 0,
          totalImpressions: 0,
          bestPage: null,
        };
      }
      cityMap[city.slug].positions[p.label] = city.bestPosition;
      if (i === PRIMARY) {
        cityMap[city.slug].totalClicks = city.totalClicks;
        cityMap[city.slug].totalImpressions = city.totalImpressions;
        cityMap[city.slug].bestPage = city.bestPage;
      }
    }
  });

  const mergedCities = Object.values(cityMap).sort((a, b) => {
    const posA = a.positions["28j"] ?? 999;
    const posB = b.positions["28j"] ?? 999;
    return posA - posB;
  });

  const allExpanded = mergedCities.length > 0 && expandedCities.size >= mergedCities.length;

  function toggleAll() {
    if (allExpanded) {
      setExpandedCities(new Set());
    } else {
      const all = new Set(mergedCities.map(c => c.slug));
      setExpandedCities(all);
      // Fetch queries for all cities that haven't been loaded yet
      for (const c of mergedCities) {
        if (!cityQueries[c.slug]?.queries) fetchCityQueries(c.slug);
      }
    }
  }

  const { summary } = primaryData;

  return (
    <div>
      {/* Keyword filter + expand all */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Filtrer par mot cle..."
          className="admin-input border rounded-lg px-4 py-2 text-sm flex-1 min-w-[200px]" />
        <button onClick={toggleAll}
          className="px-4 py-2.5 rounded-xl text-sm font-bold admin-card admin-text-muted border hover:admin-text transition-all">
          <i className={`fas fa-${allExpanded ? "compress-alt" : "expand-alt"} mr-2`}></i>
          {allExpanded ? "Fermer tout" : "Ouvrir tout"}
        </button>
      </div>

      <p className="admin-text-muted text-xs mb-4">Donnees reelles Google — Clics et impressions sur 28 jours. <span className="text-orange-400">Note: site nouveau, 90j/6m/1an peuvent etre identiques (manque d&apos;historique).</span></p>

      {/* Summary from 28j */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
        <div className="admin-card border rounded-2xl p-4">
          <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">#1</p>
          <p className="text-2xl font-extrabold text-green-400">{summary.inTop1}</p>
        </div>
        <div className="admin-card border rounded-2xl p-4">
          <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">Top 3</p>
          <p className="text-2xl font-extrabold text-green-400">{summary.inTop3}</p>
        </div>
        <div className="admin-card border rounded-2xl p-4">
          <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">Top 10</p>
          <p className="text-2xl font-extrabold text-blue-400">{summary.inTop10}</p>
        </div>
        <div className="admin-card border rounded-2xl p-4">
          <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">Pos. moy.</p>
          <p className="text-2xl font-extrabold text-orange-400">{summary.avgPosition ?? "—"}</p>
        </div>
        <div className="admin-card border rounded-2xl p-4">
          <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">Clics</p>
          <p className="text-2xl font-extrabold text-purple-400">{summary.totalClicks}</p>
        </div>
        <div className="admin-card border rounded-2xl p-4">
          <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">Impressions</p>
          <p className="text-2xl font-extrabold admin-text">{summary.totalImpressions.toLocaleString()}</p>
        </div>
        <div className="admin-card border rounded-2xl p-4">
          <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">Villes</p>
          <p className="text-2xl font-extrabold admin-text">{summary.citiesWithData}</p>
        </div>
      </div>

      {/* Cities table */}
      <div className="admin-card border rounded-2xl overflow-x-auto">
        <div style={{ minWidth: "1100px" }}>
          {/* Header */}
          <div className="flex items-center px-4 py-3 border-b gap-1" style={{ borderColor: "var(--admin-border)" }}>
            <div className="w-[150px] shrink-0 admin-text-muted text-[10px] font-bold uppercase tracking-wider">Ville</div>
            {PERIODS.map(p => (
              <div key={p.label} className="flex-1 text-center admin-text-muted text-[10px] font-bold uppercase tracking-wider">{p.label}</div>
            ))}
            <div className="w-[55px] text-center admin-text-muted text-[10px] font-bold uppercase tracking-wider">Clics</div>
            <div className="w-[55px] text-center admin-text-muted text-[10px] font-bold uppercase tracking-wider">Impr.</div>
            <div className="w-[340px] shrink-0 admin-text-muted text-[10px] font-bold uppercase tracking-wider">Meilleure page</div>
          </div>

          {/* Rows */}
          {mergedCities.map((city) => {
            const isExpanded = expandedCities.has(city.slug);
            return (
              <div key={city.slug} className="border-b last:border-0" style={{ borderColor: "var(--admin-border)" }}>
                <div className="flex items-center px-4 py-2.5 gap-1 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleCity(city.slug)}>
                  <div className="w-[150px] shrink-0 admin-text text-sm font-medium flex items-center gap-1.5">
                    <i className={`fas fa-chevron-right text-[9px] admin-text-muted transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}></i>
                    <span className="truncate">{city.name}</span>
                  </div>
                  {PERIODS.map(p => (
                    <div key={p.label} className="flex-1 text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-extrabold ${positionColor(city.positions[p.label] != null ? Math.round(city.positions[p.label]) : null)}`}>
                        {city.positions[p.label] != null ? `#${city.positions[p.label]}` : "—"}
                      </span>
                    </div>
                  ))}
                  <div className="w-[55px] text-center admin-text text-xs font-bold">{city.totalClicks}</div>
                  <div className="w-[55px] text-center admin-text-muted text-xs">{city.totalImpressions}</div>
                  <div className="w-[340px] shrink-0 admin-text-muted text-[10px] truncate" title={city.bestPage || ""}>{city.bestPage ? city.bestPage.replace("https://www.vosthermos.com", "").replace("https://vosthermos.com", "") : "—"}</div>
                </div>

                {/* Expanded: positions + pages + queries */}
                <div className="overflow-hidden transition-all duration-[1500ms] ease-in-out" style={{ maxHeight: isExpanded ? "1100px" : "0px", opacity: isExpanded ? 1 : 0 }}>
                  <div className="px-5 pb-4 pt-3 border-t" style={{ borderColor: "var(--admin-border)" }}>
                    {/* Position breakdown per period */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {PERIODS.map(p => {
                        const pos = city.positions[p.label];
                        return (
                          <div key={p.label} className="admin-card border rounded-xl px-3 py-2 text-center min-w-[70px]">
                            <p className="admin-text-muted text-[9px] font-bold uppercase tracking-wider mb-0.5">{p.label}</p>
                            <span className={`text-lg font-extrabold ${pos != null ? (Math.round(pos) <= 3 ? "text-green-400" : Math.round(pos) <= 10 ? "text-blue-400" : Math.round(pos) <= 20 ? "text-orange-400" : "text-red-400") : "admin-text-muted"}`}>
                              {pos != null ? `#${pos}` : "—"}
                            </span>
                          </div>
                        );
                      })}
                      <div className="admin-card border rounded-xl px-3 py-2 text-center min-w-[70px]">
                        <p className="admin-text-muted text-[9px] font-bold uppercase tracking-wider mb-0.5">Clics</p>
                        <span className="text-lg font-extrabold text-purple-400">{city.totalClicks}</span>
                      </div>
                      <div className="admin-card border rounded-xl px-3 py-2 text-center min-w-[70px]">
                        <p className="admin-text-muted text-[9px] font-bold uppercase tracking-wider mb-0.5">Impr.</p>
                        <span className="text-lg font-extrabold admin-text">{city.totalImpressions}</span>
                      </div>
                    </div>

                    {/* Pages + Queries — loaded on demand per city */}
                    {cityQueries[city.slug]?.loading ? (
                      <p className="admin-text-muted text-xs"><i className="fas fa-spinner fa-spin mr-1"></i>Chargement...</p>
                    ) : (
                      <>
                        {/* Pages list (donnees completes) */}
                        <p className="admin-text text-sm font-bold mb-2">Pages — {city.name}</p>
                        {!cityQueries[city.slug]?.pages?.length ? (
                          <p className="admin-text-muted text-xs mb-4">Aucune page indexee</p>
                        ) : (
                          <div className="space-y-1.5 mb-4 max-h-[200px] overflow-y-auto">
                            {cityQueries[city.slug].pages.map((p, i) => (
                              <div key={i} className="flex items-center gap-3 text-xs bg-white/5 rounded-lg px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-full font-bold ${positionColor(Math.round(p.position))}`}>#{p.position}</span>
                                <span className="admin-text flex-1 truncate font-mono" title={p.page}>{p.page.replace("https://www.vosthermos.com", "")}</span>
                                <span className="text-purple-400 font-bold">{p.clicks}c</span>
                                <span className="admin-text-muted">{p.impressions}i</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Queries list (peut etre incomplet) */}
                        <div className="flex items-center justify-between mb-2">
                          <p className="admin-text text-sm font-bold">Requetes — {city.name}</p>
                          <p className="admin-text-muted text-[10px] italic">Google anonymise certaines requetes</p>
                        </div>
                        {!cityQueries[city.slug]?.queries?.length ? (
                          <p className="admin-text-muted text-xs">Aucune requete revelee par Google</p>
                        ) : (
                          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                            {cityQueries[city.slug].queries.sort((a, b) => a.position - b.position).map((q, i) => (
                              <div key={i} className="flex items-center gap-3 text-xs bg-white/5 rounded-lg px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-full font-bold ${positionColor(Math.round(q.position))}`}>#{q.position}</span>
                                <span className="admin-text flex-1 truncate">{q.query}</span>
                                <span className="text-purple-400 font-bold">{q.clicks}c</span>
                                <span className="admin-text-muted">{q.impressions}i</span>
                                <span className="admin-text-muted">{q.ctr}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminSeoPage() {
  const [tab, setTab] = useState("gsc");
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
  const [refreshingCity, setRefreshingCity] = useState(null);

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

  async function refreshCity(slug) {
    setRefreshingCity(slug);
    try {
      // Start a single-city scan
      await fetch("/api/admin/seo/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", keyword: activeKeyword, city: slug }),
      });
      // Tick once to process it
      await fetch("/api/admin/seo/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "tick" }),
      });
      await fetchData(activeKeyword);
    } catch (err) {
      console.error("Refresh city error:", err);
    }
    setRefreshingCity(null);
  }

  // Run the tick loop: each POST processes one city, with 1.5s delay between
  async function runTickLoop() {
    let stopped = false;
    while (!stopped) {
      try {
        const res = await fetch("/api/admin/seo/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "tick" }),
        });
        const state = await res.json();
        setProgress(prev => ({
          current: state.current || 0,
          total: state.total || 53,
          city: state.city || "",
          results: [...(prev?.results || []), state.lastResult].filter(Boolean).slice(-15),
        }));
        if (state.done || !state.running) {
          stopped = true;
          break;
        }
        // 1.5s delay between cities (rate limiting)
        await new Promise(r => setTimeout(r, 1500));
      } catch (err) {
        console.error("Tick error:", err);
        stopped = true;
      }
    }
    setChecking(false);
    setProgress(null);
    fetchData(activeKeyword);
  }

  async function startCheck() {
    setChecking(true);
    setProgress({ current: 0, total: 53, city: "Demarrage...", results: [] });

    try {
      const res = await fetch("/api/admin/seo/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", keyword: activeKeyword }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        setChecking(false);
        setProgress(null);
        return;
      }
      // Run tick loop (fire and forget, no await)
      runTickLoop();
    } catch (err) {
      console.error("Check error:", err);
      setChecking(false);
      setProgress(null);
    }
  }

  // Check if a scan was left in progress (e.g. page reload during scan)
  // Note: with tick-based, we don't auto-resume because the frontend drives it
  useEffect(() => {
    fetch("/api/admin/seo/check").then(r => r.json()).then(state => {
      if (state.running && state.heartbeatAge !== null && state.heartbeatAge < 10) {
        // Another tab is running it, don't interfere
        setChecking(true);
        setProgress({ current: state.current, total: state.total, city: state.city + " (autre onglet)", results: state.results || [] });
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

  // Compute distinct scan runs (10-min buckets) across all cities
  function bucketKey(checkedAt) {
    const d = new Date(checkedAt);
    d.setSeconds(0, 0);
    d.setMinutes(Math.floor(d.getMinutes() / 10) * 10);
    return d.getTime();
  }
  const bucketSet = new Set();
  for (const c of cities) {
    for (const h of c.history || []) {
      bucketSet.add(bucketKey(h.checkedAt));
    }
  }
  const MONTHS_FR = ["jan", "fev", "mars", "avril", "mai", "juin", "juil", "aout", "sept", "oct", "nov", "dec"];
  const scanRuns = Array.from(bucketSet)
    .sort((a, b) => b - a) // most recent first
    .slice(0, 8) // top 8 most recent scan runs
    .map(ts => {
      const d = new Date(ts);
      return {
        ts,
        label: `${d.getDate()} ${MONTHS_FR[d.getMonth()]}`,
      };
    });

  // Get position for a specific city at a specific scan run
  function getPositionAtRun(city, runTs) {
    const match = (city.history || []).find(h => bucketKey(h.checkedAt) === runTs);
    return match ? match.position : null;
  }

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
        {tab === "serper" && (
          <button onClick={startCheck} disabled={checking || !activeKeyword}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${checking ? "bg-gray-500/30 text-gray-400 cursor-not-allowed" : "bg-[var(--color-red)] text-white hover:opacity-90"}`}>
            {checking ? <><i className="fas fa-spinner fa-spin mr-2"></i>Verification...</> : <><i className="fas fa-sync-alt mr-2"></i>Rafraichir</>}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("gsc")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "gsc" ? "bg-[var(--color-red)] text-white" : "admin-card admin-text-muted border"}`}>
          <i className="fab fa-google mr-2"></i>Google Search Console
        </button>
        <button onClick={() => setTab("serper")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "serper" ? "bg-[var(--color-red)] text-white" : "admin-card admin-text-muted border"}`}>
          <i className="fas fa-search mr-2"></i>Serper.dev (scan)
        </button>
      </div>

      {/* GSC Tab */}
      {tab === "gsc" && <GscTab />}

      {/* Serper Tab */}
      {tab === "serper" && <>

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
        <div className="admin-card border rounded-2xl overflow-x-auto">
          <div style={{ minWidth: "900px" }}>
            <div className="flex items-center px-4 py-3 border-b gap-1" style={{ borderColor: "var(--admin-border)" }}>
              <div className="w-[150px] shrink-0 admin-text-muted text-[10px] font-bold uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort("name")}>
                Ville {sortBy === "name" && <i className={`fas fa-caret-${sortDir === "asc" ? "up" : "down"} ml-1`}></i>}
              </div>
              {scanRuns.map((run) => (
                <div key={run.ts} className="flex-1 text-center admin-text-muted text-[10px] font-bold uppercase tracking-wider">
                  {run.label}
                </div>
              ))}
              {scanRuns.length === 0 && (
                <div className="flex-1 text-center admin-text-muted text-[10px] font-bold uppercase tracking-wider">
                  Aucun scan
                </div>
              )}
              <div className="w-[55px] text-center admin-text-muted text-[10px] font-bold uppercase tracking-wider">AI</div>
              <div className="w-[70px] text-center admin-text-muted text-[10px] font-bold uppercase tracking-wider">Action</div>
            </div>

          {sortedCities.map((city) => {
            const isExpanded = expandedCity === city.slug;

            return (
              <div key={city.slug} className="border-b last:border-0" style={{ borderColor: "var(--admin-border)" }}>
                <div className="flex items-center px-4 py-2.5 gap-1 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setExpandedCity(isExpanded ? null : city.slug)}>
                  <div className="w-[150px] shrink-0 admin-text text-sm font-medium flex items-center gap-1.5">
                    <i className={`fas fa-chevron-right text-[9px] admin-text-muted transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}></i>
                    <span className="truncate">{city.name}</span>
                  </div>
                  {scanRuns.map((run) => {
                    const pos = getPositionAtRun(city, run.ts);
                    return (
                      <div key={run.ts} className="flex-1 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-extrabold ${positionColor(pos)}`}>
                          {pos !== null ? `#${pos}` : "—"}
                        </span>
                      </div>
                    );
                  })}
                  <div className="w-[55px] text-center">
                    {city.latestAi ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold"><i className="fas fa-robot"></i></span>
                    ) : (
                      <span className="admin-text-muted text-xs">—</span>
                    )}
                  </div>
                  <div className="w-[70px] text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); refreshCity(city.slug); }}
                      disabled={refreshingCity === city.slug || checking}
                      className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 inline-flex items-center justify-center transition-colors disabled:opacity-30"
                      title="Actualiser cette ville"
                    >
                      <i className={`fas fa-sync-alt text-[10px] admin-text-muted ${refreshingCity === city.slug ? "fa-spin" : ""}`}></i>
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden transition-all duration-[1500ms] ease-in-out" style={{ maxHeight: isExpanded ? "400px" : "0px", opacity: isExpanded ? 1 : 0 }}>
                  <div className="px-5 pb-5 pt-2 border-t" style={{ borderColor: "var(--admin-border)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="admin-text text-sm font-bold">Historique — {city.name}</p>
                      <div className="flex items-center gap-3">
                        {city.url && <p className="text-blue-400 text-xs font-mono truncate max-w-[250px]">{city.url}</p>}
                        <button
                          onClick={(e) => { e.stopPropagation(); refreshCity(city.slug); }}
                          disabled={refreshingCity === city.slug || checking}
                          className="px-3 py-1.5 rounded-lg bg-[var(--color-red)]/20 text-[var(--color-red)] text-xs font-bold hover:bg-[var(--color-red)]/30 transition-colors disabled:opacity-30 shrink-0"
                        >
                          <i className={`fas fa-sync-alt mr-1 ${refreshingCity === city.slug ? "fa-spin" : ""}`}></i>
                          {refreshingCity === city.slug ? "Scan..." : "Actualiser"}
                        </button>
                      </div>
                    </div>
                    <PositionChart history={city.history} />
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      </>}
    </div>
  );
}
