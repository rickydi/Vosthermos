"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

// ─── Helpers ──────────────────────────────────────────────────────
function posColor(pos) {
  if (pos == null) return "bg-gray-500/20 text-gray-400";
  const p = Math.round(pos);
  if (p <= 3) return "bg-green-500/20 text-green-400";
  if (p <= 10) return "bg-blue-500/20 text-blue-400";
  if (p <= 20) return "bg-orange-500/20 text-orange-400";
  return "bg-red-500/20 text-red-400";
}

function DeltaBadge({ delta, better = "lower" }) {
  // better="lower" for position (smaller is better)
  // better="higher" for clicks/impressions (higher is better)
  if (delta == null || delta === 0) return <span className="text-white/30 text-[10px]">—</span>;
  const isUp = delta > 0;
  const isGood = better === "lower" ? delta > 0 : delta > 0; // delta already expresses "improvement" when computed correctly
  const cls = isGood ? "text-green-400" : "text-red-400";
  const icon = isUp ? "fa-arrow-up" : "fa-arrow-down";
  const abs = Math.abs(delta);
  const val = Number.isInteger(abs) ? abs : abs.toFixed(1);
  return <span className={`${cls} text-[10px] font-bold whitespace-nowrap`}>
    <i className={`fas ${icon} mr-0.5`}></i>{val}
  </span>;
}

// CTR "acceptable" by position bucket (for color flag)
function expectedCtr(pos) {
  if (pos == null) return 0;
  const p = Math.round(pos);
  if (p === 1) return 27;
  if (p === 2) return 15;
  if (p === 3) return 11;
  if (p <= 5) return 6;
  if (p <= 10) return 2.5;
  return 1;
}
function ctrColor(ctr, pos) {
  if (!ctr || !pos) return "admin-text-muted";
  const exp = expectedCtr(pos);
  if (ctr >= exp * 0.9) return "text-green-400";
  if (ctr >= exp * 0.5) return "text-orange-400";
  return "text-red-400";
}

// CSV export helper
function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const PERIODS = [
  { days: 3, label: "3j" },
  { days: 7, label: "7j" },
  { days: 28, label: "28j" },
  { days: 90, label: "90j" },
  { days: 180, label: "6m" },
  { days: 365, label: "1an" },
];
const PRIMARY = 2; // 28j

const DEVICES = [
  { value: "ALL", label: "Tous" },
  { value: "DESKTOP", label: "Desktop" },
  { value: "MOBILE", label: "Mobile" },
  { value: "TABLET", label: "Tablette" },
];

const BRANDED = [
  { value: "all", label: "Tous" },
  { value: "exclude", label: "Sans marque" },
  { value: "only", label: "Marque" },
];

const COUNTRIES = [
  { value: "ALL", label: "Tous" },
  { value: "can", label: "Canada" },
];

// ─── Main component ───────────────────────────────────────────────
export default function GscTab() {
  const [allData, setAllData] = useState(null);
  const [opportunities, setOpportunities] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [device, setDevice] = useState("ALL");
  const [branded, setBranded] = useState("all");
  const [country, setCountry] = useState("ALL");
  const [expandedCities, setExpandedCities] = useState(new Set());
  const [cityQueries, setCityQueries] = useState({});
  const [sortMode, setSortMode] = useState("position");

  const buildQuery = useCallback((extra = {}) => {
    const p = new URLSearchParams();
    if (keyword) p.set("keyword", keyword);
    if (device !== "ALL") p.set("device", device);
    if (branded !== "all") p.set("branded", branded);
    if (country !== "ALL") p.set("country", country);
    for (const [k, v] of Object.entries(extra)) p.set(k, v);
    return p.toString();
  }, [keyword, device, branded, country]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        PERIODS.map((p) =>
          fetch(`/api/admin/seo/gsc?${buildQuery({ days: p.days })}`)
            .then((r) => r.json())
            .then((d) => (d.error ? null : d))
            .catch(() => null),
        ),
      );
      setAllData(results);

      // Opportunités (28j, exclude branded by default)
      const oppRes = await fetch(`/api/admin/seo/gsc/opportunities?${buildQuery({ days: 28 })}`)
        .then((r) => r.json())
        .catch(() => ({ opportunities: [] }));
      setOpportunities(oppRes.opportunities || []);

      // Tendances (7j vs 7j précédents)
      const trRes = await fetch(`/api/admin/seo/gsc/trends?${buildQuery({ window: 7 })}`)
        .then((r) => r.json())
        .catch(() => ({ rising: [], falling: [] }));
      setTrends(trRes);
    } catch (err) {
      console.error("GSC fetch error:", err);
    }
    setLoading(false);
  }, [buildQuery]);

  useEffect(() => {
    const t = setTimeout(() => { fetchAll(); }, 0);
    return () => clearTimeout(t);
  }, [fetchAll]);

  const fetchCityQueries = useCallback(async (slug) => {
    if (cityQueries[slug]?.pages || cityQueries[slug]?.queries) return;
    setCityQueries((prev) => ({ ...prev, [slug]: { loading: true, pages: [], queries: [] } }));
    try {
      const res = await fetch(`/api/admin/seo/gsc?days=28&city=${slug}&${buildQuery()}`);
      const d = await res.json();
      setCityQueries((prev) => ({
        ...prev,
        [slug]: { loading: false, pages: d.pages || [], queries: d.queries || [] },
      }));
    } catch {
      setCityQueries((prev) => ({ ...prev, [slug]: { loading: false, pages: [], queries: [] } }));
    }
  }, [buildQuery, cityQueries]);

  function toggleCity(slug) {
    setExpandedCities((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else { next.add(slug); fetchCityQueries(slug); }
      return next;
    });
  }

  const mergedCities = useMemo(() => {
    if (!allData) return [];
    const map = {};
    PERIODS.forEach((p, i) => {
      const d = allData[i];
      if (!d) return;
      for (const c of d.cities) {
        if (!map[c.slug]) {
          map[c.slug] = {
            slug: c.slug,
            name: c.name,
            population: c.population || 0,
            positions: {},
            totalClicks: 0,
            totalImpressions: 0,
            ctr: 0,
            bestPage: null,
          };
        }
        map[c.slug].positions[p.label] = c.bestPosition;
        if (i === PRIMARY) {
          map[c.slug].totalClicks = c.totalClicks;
          map[c.slug].totalImpressions = c.totalImpressions;
          map[c.slug].ctr = c.ctr;
          map[c.slug].bestPage = c.bestPage;
        }
      }
    });
    const arr = Object.values(map);
    if (sortMode === "alpha") arr.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    else if (sortMode === "population") arr.sort((a, b) => (b.population || 0) - (a.population || 0));
    else if (sortMode === "clicks") arr.sort((a, b) => (b.totalClicks || 0) - (a.totalClicks || 0));
    else arr.sort((a, b) => (a.positions["28j"] ?? 999) - (b.positions["28j"] ?? 999));
    return arr;
  }, [allData, sortMode]);

  const primaryData = allData?.[PRIMARY] || allData?.find((d) => d) || null;
  const summary = primaryData?.summary;

  function handleExport() {
    const rows = mergedCities.map((c) => ({
      Ville: c.name,
      Population: c.population || "",
      ...Object.fromEntries(PERIODS.map((p) => [p.label, c.positions[p.label] ?? ""])),
      "Delta_7j_vs_28j": c.positions["28j"] != null && c.positions["7j"] != null
        ? Math.round((c.positions["28j"] - c.positions["7j"]) * 10) / 10
        : "",
      Clics_28j: c.totalClicks,
      Impressions_28j: c.totalImpressions,
      "CTR%_28j": c.ctr,
      Meilleure_page: c.bestPage || "",
    }));
    const today = new Date().toISOString().slice(0, 10);
    downloadCsv(`gsc-villes-${today}.csv`, rows);
  }

  const allExpanded = mergedCities.length > 0 && expandedCities.size >= mergedCities.length;

  function toggleAll() {
    if (allExpanded) {
      setExpandedCities(new Set());
    } else {
      const all = new Set(mergedCities.map((c) => c.slug));
      setExpandedCities(all);
      for (const c of mergedCities) {
        if (!cityQueries[c.slug]?.queries) fetchCityQueries(c.slug);
      }
    }
  }

  if (loading && !allData) {
    return <p className="admin-text-muted text-center py-12">
      <i className="fas fa-spinner fa-spin mr-2"></i>Chargement Google Search Console...
    </p>;
  }
  if (!primaryData) {
    return <p className="admin-text-muted text-center py-12">Erreur de connexion a Google Search Console</p>;
  }

  return (
    <div>
      {/* Filters */}
      <div className="admin-card border rounded-2xl p-4 mb-5 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text" value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Filtrer par mot cle (contient)..."
            className="admin-input border rounded-lg px-4 py-2 text-sm flex-1 min-w-[200px]"
          />
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value)}
            className="admin-input border rounded-lg px-3 py-2 text-sm cursor-pointer">
            <option value="position">Tri: Position</option>
            <option value="clicks">Tri: Clics</option>
            <option value="alpha">Tri: A → Z</option>
            <option value="population">Tri: Population</option>
          </select>
          <button onClick={handleExport}
            className="px-3 py-2 rounded-lg text-sm font-bold bg-white/5 border admin-border admin-text hover:bg-white/10 transition-all">
            <i className="fas fa-file-csv mr-2"></i>Export CSV
          </button>
          <button onClick={toggleAll}
            className="px-3 py-2 rounded-lg text-sm font-bold bg-white/5 border admin-border admin-text-muted hover:admin-text transition-all">
            <i className={`fas fa-${allExpanded ? "compress-alt" : "expand-alt"} mr-2`}></i>
            {allExpanded ? "Fermer" : "Ouvrir"} tout
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="admin-text-muted text-[10px] font-bold uppercase tracking-wider">Appareil</span>
            <div className="flex gap-1">
              {DEVICES.map((d) => (
                <button key={d.value} onClick={() => setDevice(d.value)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    device === d.value ? "bg-[var(--color-red)] text-white" : "bg-white/5 admin-text-muted hover:bg-white/10"
                  }`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="admin-text-muted text-[10px] font-bold uppercase tracking-wider">Marque</span>
            <div className="flex gap-1">
              {BRANDED.map((b) => (
                <button key={b.value} onClick={() => setBranded(b.value)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    branded === b.value ? "bg-[var(--color-red)] text-white" : "bg-white/5 admin-text-muted hover:bg-white/10"
                  }`}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="admin-text-muted text-[10px] font-bold uppercase tracking-wider">Pays</span>
            <div className="flex gap-1">
              {COUNTRIES.map((c) => (
                <button key={c.value} onClick={() => setCountry(c.value)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    country === c.value ? "bg-[var(--color-red)] text-white" : "bg-white/5 admin-text-muted hover:bg-white/10"
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="admin-text-muted text-xs mb-4">
        Donnees reelles Google (cache 1h). Clics/impressions = 28j. Les periodes excluent les donnees GSC non finalisees.
      </p>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          <SummaryCard label="#1" value={summary.inTop1} color="text-green-400" />
          <SummaryCard label="Top 3" value={summary.inTop3} color="text-green-400" />
          <SummaryCard label="Top 10" value={summary.inTop10} color="text-blue-400" />
          <SummaryCard label="Pos. moy." value={summary.avgPosition ?? "—"} color="text-orange-400" />
          <SummaryCard label="Clics" value={summary.totalClicks} color="text-purple-400" />
          <SummaryCard label="Impress." value={(summary.totalImpressions || 0).toLocaleString()} color="admin-text" />
          <SummaryCard label="CTR moy." value={`${summary.ctr ?? 0}%`} color="text-cyan-400" />
          <SummaryCard label="Villes" value={summary.citiesWithData} color="admin-text" />
        </div>
      )}

      {/* Opportunités */}
      <OpportunitiesSection data={opportunities} />

      {/* Tendances */}
      <TrendsSection data={trends} />

      {/* Cities table */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="admin-text font-bold text-sm uppercase tracking-wider">Positions par ville</h2>
      </div>

      <div className="admin-card border rounded-2xl overflow-x-auto">
        <div style={{ minWidth: "1280px" }}>
          {/* Header */}
          <div className="flex items-center px-4 py-3 border-b gap-1" style={{ borderColor: "var(--admin-border)" }}>
            <div className="w-[150px] shrink-0 admin-text-muted text-[10px] font-bold uppercase tracking-wider">Ville</div>
            {PERIODS.map((p) => (
              <div key={p.label} className="flex-1 text-center admin-text-muted text-[10px] font-bold uppercase tracking-wider">
                {p.label}
              </div>
            ))}
            <div className="w-[65px] text-center admin-text-muted text-[10px] font-bold uppercase tracking-wider">Δ 7/28j</div>
            <div className="w-[55px] text-center admin-text-muted text-[10px] font-bold uppercase tracking-wider">Clics</div>
            <div className="w-[55px] text-center admin-text-muted text-[10px] font-bold uppercase tracking-wider">Impr.</div>
            <div className="w-[55px] text-center admin-text-muted text-[10px] font-bold uppercase tracking-wider">CTR</div>
            <div className="w-[250px] shrink-0 admin-text-muted text-[10px] font-bold uppercase tracking-wider">Meilleure page</div>
          </div>

          {mergedCities.map((city) => {
            const isExpanded = expandedCities.has(city.slug);
            const pos7 = city.positions["7j"];
            const pos28 = city.positions["28j"];
            const delta7v28 = (pos7 != null && pos28 != null)
              ? Math.round((pos28 - pos7) * 10) / 10
              : null;
            const pageUrl = city.bestPage;

            return (
              <div key={city.slug} className="border-b last:border-0" style={{ borderColor: "var(--admin-border)" }}>
                <div className="flex items-center px-4 py-2.5 gap-1 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleCity(city.slug)}>
                  <div className="w-[150px] shrink-0 admin-text text-sm font-medium flex items-center gap-1.5">
                    <i className={`fas fa-chevron-right text-[9px] admin-text-muted transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}></i>
                    <span className="truncate">{city.name}</span>
                  </div>
                  {PERIODS.map((p) => {
                    const pos = city.positions[p.label];
                    return (
                      <div key={p.label} className="flex-1 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-extrabold ${posColor(pos != null ? Math.round(pos) : null)}`}>
                          {pos != null ? `#${pos}` : "—"}
                        </span>
                      </div>
                    );
                  })}
                  <div className="w-[65px] text-center">
                    <DeltaBadge delta={delta7v28} better="lower" />
                  </div>
                  <div className="w-[55px] text-center admin-text text-xs font-bold">{city.totalClicks}</div>
                  <div className="w-[55px] text-center admin-text-muted text-xs">{city.totalImpressions}</div>
                  <div className={`w-[55px] text-center text-xs font-bold ${ctrColor(city.ctr, pos28)}`}>
                    {city.totalImpressions > 0 ? `${city.ctr}%` : "—"}
                  </div>
                  <div className="w-[250px] shrink-0 truncate text-[10px]">
                    {pageUrl ? (
                      <a href={pageUrl} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-400 hover:text-blue-300" title={pageUrl}>
                        {pageUrl.replace("https://www.vosthermos.com", "").replace("https://vosthermos.com", "")}
                      </a>
                    ) : <span className="admin-text-muted">—</span>}
                  </div>
                </div>

                {/* Expanded */}
                <div className="overflow-hidden transition-all duration-[1500ms] ease-in-out"
                  style={{ maxHeight: isExpanded ? "1200px" : "0px", opacity: isExpanded ? 1 : 0 }}>
                  <div className="px-5 pb-4 pt-3 border-t" style={{ borderColor: "var(--admin-border)" }}>
                    {/* Positions per period */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {PERIODS.map((p) => {
                        const pos = city.positions[p.label];
                        return (
                          <div key={p.label} className="admin-card border rounded-xl px-3 py-2 text-center min-w-[70px]">
                            <p className="admin-text-muted text-[9px] font-bold uppercase tracking-wider mb-0.5">{p.label}</p>
                            <span className={`text-lg font-extrabold ${pos != null
                              ? (Math.round(pos) <= 3 ? "text-green-400" : Math.round(pos) <= 10 ? "text-blue-400" : Math.round(pos) <= 20 ? "text-orange-400" : "text-red-400")
                              : "admin-text-muted"}`}>
                              {pos != null ? `#${pos}` : "—"}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {cityQueries[city.slug]?.loading ? (
                      <p className="admin-text-muted text-xs"><i className="fas fa-spinner fa-spin mr-1"></i>Chargement...</p>
                    ) : (
                      <>
                        <p className="admin-text text-sm font-bold mb-2">Pages</p>
                        {!cityQueries[city.slug]?.pages?.length ? (
                          <p className="admin-text-muted text-xs mb-4">Aucune page indexee</p>
                        ) : (
                          <div className="space-y-1.5 mb-4 max-h-[200px] overflow-y-auto">
                            {cityQueries[city.slug].pages.map((p, i) => (
                              <div key={i} className="flex items-center gap-3 text-xs bg-white/5 rounded-lg px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-full font-bold ${posColor(Math.round(p.position))}`}>#{p.position}</span>
                                <a href={p.page} target="_blank" rel="noopener noreferrer"
                                  className="admin-text flex-1 truncate font-mono hover:text-blue-400" title={p.page}>
                                  {p.page.replace("https://www.vosthermos.com", "")}
                                </a>
                                <span className="text-purple-400 font-bold">{p.clicks}c</span>
                                <span className="admin-text-muted">{p.impressions}i</span>
                                <span className={`font-bold ${ctrColor(p.ctr, p.position)}`}>{p.ctr}%</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-2">
                          <p className="admin-text text-sm font-bold">Requetes</p>
                          <p className="admin-text-muted text-[10px] italic">Google anonymise certaines requetes</p>
                        </div>
                        {!cityQueries[city.slug]?.queries?.length ? (
                          <p className="admin-text-muted text-xs">Aucune requete revelee par Google</p>
                        ) : (
                          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                            {cityQueries[city.slug].queries.sort((a, b) => a.position - b.position).map((q, i) => (
                              <div key={i} className="flex items-center gap-3 text-xs bg-white/5 rounded-lg px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-full font-bold ${posColor(Math.round(q.position))}`}>#{q.position}</span>
                                <span className="admin-text flex-1 truncate">{q.query}</span>
                                <span className="text-purple-400 font-bold">{q.clicks}c</span>
                                <span className="admin-text-muted">{q.impressions}i</span>
                                <span className={`font-bold ${ctrColor(q.ctr, q.position)}`}>{q.ctr}%</span>
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

// ─── Subcomponents ───────────────────────────────────────────────
function SummaryCard({ label, value, color }) {
  return (
    <div className="admin-card border rounded-2xl p-4">
      <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function OpportunitiesSection({ data }) {
  if (!data) return null;
  if (data.length === 0) {
    return (
      <div className="admin-card border rounded-2xl p-5 mb-6">
        <h3 className="admin-text font-bold text-sm uppercase tracking-wider mb-2">
          <i className="fas fa-bullseye text-yellow-400 mr-2"></i>Opportunites
        </h3>
        <p className="admin-text-muted text-xs">Aucune requete entre pos 4-20 avec ≥50 impressions sur 28j.</p>
      </div>
    );
  }
  return (
    <div className="admin-card border rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="admin-text font-bold text-sm uppercase tracking-wider">
          <i className="fas fa-bullseye text-yellow-400 mr-2"></i>Opportunites ({data.length})
        </h3>
        <p className="admin-text-muted text-[10px]">Pos 4-20, impressions ≥ 50, 28j, sans marque</p>
      </div>
      <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
        {data.map((o, i) => (
          <div key={i} className="flex items-center gap-3 text-xs bg-white/5 rounded-lg px-3 py-2">
            <span className={`px-2 py-0.5 rounded-full font-bold ${posColor(Math.round(o.position))}`}>#{o.position}</span>
            <span className="admin-text flex-1 truncate" title={o.query}>{o.query}</span>
            <span className="admin-text-muted text-[10px] truncate hidden md:inline max-w-[180px]" title={o.page}>
              {(o.page || "").replace("https://www.vosthermos.com", "")}
            </span>
            <span className="text-purple-400">{o.clicks}c</span>
            <span className="admin-text-muted">{o.impressions}i</span>
            {o.potentialClicks > 0 && (
              <span className="text-green-400 font-bold whitespace-nowrap">
                <i className="fas fa-arrow-up mr-0.5"></i>+{o.potentialClicks} si top 3
              </span>
            )}
            <a href={o.page} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-[10px] px-2">
              <i className="fas fa-external-link-alt"></i>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendsSection({ data }) {
  if (!data) return null;
  const { rising = [], falling = [] } = data;
  if (rising.length === 0 && falling.length === 0) {
    return (
      <div className="admin-card border rounded-2xl p-5 mb-6">
        <h3 className="admin-text font-bold text-sm uppercase tracking-wider mb-2">
          <i className="fas fa-chart-line text-cyan-400 mr-2"></i>Tendances 7j
        </h3>
        <p className="admin-text-muted text-xs">Pas assez de donnees pour comparer les 2 semaines.</p>
      </div>
    );
  }
  return (
    <div className="admin-card border rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="admin-text font-bold text-sm uppercase tracking-wider">
          <i className="fas fa-chart-line text-cyan-400 mr-2"></i>Tendances 7j vs 7j precedents
        </h3>
        <p className="admin-text-muted text-[10px]">
          {data.windows?.current?.start} → {data.windows?.current?.end} vs {data.windows?.previous?.start} → {data.windows?.previous?.end}
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="admin-text-muted text-xs font-bold mb-2">
            <i className="fas fa-arrow-up text-green-400 mr-1"></i>En hausse ({rising.length})
          </p>
          <div className="space-y-1 max-h-[240px] overflow-y-auto">
            {rising.length === 0 ? (
              <p className="admin-text-muted text-xs">Aucune</p>
            ) : rising.map((t, i) => <TrendRow key={i} t={t} direction="up" />)}
          </div>
        </div>
        <div>
          <p className="admin-text-muted text-xs font-bold mb-2">
            <i className="fas fa-arrow-down text-red-400 mr-1"></i>En chute ({falling.length})
          </p>
          <div className="space-y-1 max-h-[240px] overflow-y-auto">
            {falling.length === 0 ? (
              <p className="admin-text-muted text-xs">Aucune</p>
            ) : falling.map((t, i) => <TrendRow key={i} t={t} direction="down" />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendRow({ t, direction }) {
  const deltaClicksCls = t.deltaClicks > 0 ? "text-green-400" : t.deltaClicks < 0 ? "text-red-400" : "admin-text-muted";
  return (
    <div className="flex items-center gap-2 text-xs bg-white/5 rounded-lg px-2.5 py-1.5">
      <span className="admin-text flex-1 truncate" title={t.query}>{t.query}</span>
      {t.posNow != null && (
        <span className={`px-1.5 py-0.5 rounded-full font-bold text-[10px] ${posColor(Math.round(t.posNow))}`}>#{t.posNow}</span>
      )}
      <span className={`font-bold whitespace-nowrap ${deltaClicksCls}`}>
        {t.deltaClicks > 0 ? "+" : ""}{t.deltaClicks}c
      </span>
      {t.deltaPos != null && t.deltaPos !== 0 && (
        <span className={`text-[10px] whitespace-nowrap ${t.deltaPos > 0 ? "text-green-400" : "text-red-400"}`}>
          <i className={`fas fa-arrow-${t.deltaPos > 0 ? "up" : "down"} mr-0.5`}></i>{Math.abs(t.deltaPos)}
        </span>
      )}
      <a href={t.page} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-[10px]">
        <i className="fas fa-external-link-alt"></i>
      </a>
    </div>
  );
}
