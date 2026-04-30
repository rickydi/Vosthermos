"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_CITY = "delson";
const SITE = "https://www.vosthermos.com";

const DEVICES = [
  { value: "ALL", label: "Tous" },
  { value: "DESKTOP", label: "Desktop" },
  { value: "MOBILE", label: "Mobile" },
];

const BRANDED = [
  { value: "exclude", label: "Sans marque" },
  { value: "all", label: "Tous" },
  { value: "only", label: "Marque" },
];

const COUNTRIES = [
  { value: "ALL", label: "Tous" },
  { value: "can", label: "Canada" },
];

const FILTERS = [
  { value: "all", label: "Tout" },
  { value: "work", label: "A travailler" },
  { value: "page", label: "Mauvaise page" },
  { value: "missing", label: "Aucune lecture" },
  { value: "good", label: "OK" },
];

const STATUS_ORDER = {
  "not-found": 0,
  page: 1,
  weak: 2,
  "no-data": 3,
  unscanned: 3,
  ok: 4,
  strong: 5,
};

function formatNumber(value) {
  return Number(value || 0).toLocaleString("fr-CA");
}

function roundPosition(value) {
  if (value == null) return null;
  return Number.isInteger(value) ? value : value.toFixed(1);
}

function formatDate(value) {
  if (!value) return "Jamais";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Jamais";
  return date.toLocaleString("fr-CA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortUrl(url) {
  if (!url) return "";
  return String(url)
    .replace(SITE, "")
    .replace("https://vosthermos.com", "")
    .replace(/\/$/, "") || "/";
}

function publicUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

function googleSearchUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=ca&hl=fr`;
}

function positionClass(position) {
  if (position == null) return "bg-slate-500/20 text-slate-300";
  if (position <= 3) return "bg-emerald-500/20 text-emerald-300";
  if (position <= 10) return "bg-sky-500/20 text-sky-300";
  if (position <= 20) return "bg-amber-500/20 text-amber-300";
  return "bg-orange-500/20 text-orange-300";
}

function statusClass(level) {
  if (level === "strong") return "bg-emerald-500/20 text-emerald-300";
  if (level === "ok") return "bg-sky-500/20 text-sky-300";
  if (level === "page") return "bg-violet-500/20 text-violet-300";
  if (level === "weak") return "bg-amber-500/20 text-amber-300";
  if (level === "not-found") return "bg-orange-500/20 text-orange-300";
  return "bg-slate-500/20 text-slate-300";
}

function hasGscReading(metric) {
  return Boolean(metric && metric.impressions > 0);
}

function getRowPriority(row) {
  const level = row.status?.level || "no-data";
  return STATUS_ORDER[level] ?? 9;
}

function matchesFilter(row, filter) {
  const level = row.status?.level || "no-data";
  if (filter === "all") return true;
  if (filter === "work") return ["not-found", "page", "weak", "no-data", "unscanned"].includes(level);
  if (filter === "page") return level === "page";
  if (filter === "missing") return ["not-found", "no-data", "unscanned"].includes(level);
  if (filter === "good") return ["ok", "strong"].includes(level);
  return true;
}

function exportCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value) => {
    const text = value == null ? "" : String(value);
    return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function PositionBadge({ position }) {
  return (
    <span className={`inline-flex min-w-[48px] justify-center rounded-full px-2 py-1 text-xs font-extrabold ${positionClass(position)}`}>
      {position == null ? "N/A" : `#${roundPosition(position)}`}
    </span>
  );
}

function DeltaBadge({ delta }) {
  if (delta == null || delta === 0) {
    return <span className="admin-text-muted text-[10px]">stable</span>;
  }
  const good = delta > 0;
  return (
    <span className={`text-[10px] font-bold ${good ? "text-emerald-300" : "text-amber-300"}`}>
      <i className={`fas ${good ? "fa-arrow-up" : "fa-arrow-down"} mr-1`}></i>
      {good ? "+" : ""}{delta}
    </span>
  );
}

function MetricStack({ metric }) {
  const hasData = hasGscReading(metric);
  return (
    <div className="min-w-[86px] text-center">
      <PositionBadge position={metric?.position ?? null} />
      <div className="admin-text-muted mt-1 text-[10px]">
        {hasData ? `${formatNumber(metric.impressions)} imp.` : "aucune lecture"}
      </div>
      {hasData && (
        <div className="admin-text-muted text-[10px]">
          {formatNumber(metric.clicks)} clics / {metric.ctr || 0}%
        </div>
      )}
    </div>
  );
}

function SummaryTile({ label, value, tone = "admin-text", icon }) {
  return (
    <div className="admin-card rounded-xl border p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider">{label}</p>
        {icon && <i className={`fas ${icon} admin-text-muted text-xs`}></i>}
      </div>
      <p className={`text-2xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

function LinkButton({ href, children, icon }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center rounded-lg border px-3 py-2 text-xs font-bold admin-border admin-text hover:bg-white/5"
    >
      {icon && <i className={`fas ${icon} mr-2`}></i>}
      {children}
    </a>
  );
}

function EmptyReading({ loading }) {
  return (
    <div className="admin-card rounded-xl border p-8 text-center">
      <i className={`fas ${loading ? "fa-spinner fa-spin" : "fa-search"} mb-3 block text-2xl admin-text-muted`}></i>
      <p className="admin-text font-bold">{loading ? "Chargement du suivi SEO..." : "Aucune donnee a afficher"}</p>
      {!loading && <p className="admin-text-muted mt-1 text-sm">Choisis une ville ou lance un scan live.</p>}
    </div>
  );
}

function verdictClass(value) {
  if (!value) return "admin-text-muted";
  if (["PASS", "VERDICT_PASS"].includes(value)) return "text-emerald-300";
  if (["PARTIAL", "VERDICT_PARTIAL"].includes(value)) return "text-amber-300";
  return "text-orange-300";
}

function InspectionResult({ inspection, loading, error }) {
  if (loading) {
    return <p className="admin-text-muted mt-2 text-xs"><i className="fas fa-spinner fa-spin mr-2"></i>Inspection en cours...</p>;
  }
  if (error) {
    return <p className="mt-2 rounded-lg bg-orange-500/10 px-3 py-2 text-xs text-orange-300">{error}</p>;
  }
  if (!inspection) return null;

  const index = inspection.result?.indexStatusResult || {};
  return (
    <div className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs">
      <div className={`font-bold ${verdictClass(index.verdict)}`}>
        {index.verdict || "Verdict inconnu"} - {index.coverageState || "etat non fourni"}
      </div>
      <div className="admin-text-muted mt-1 space-y-0.5">
        <p>Dernier crawl: {index.lastCrawlTime ? formatDate(index.lastCrawlTime) : "non fourni"}</p>
        <p>Canonique Google: {shortUrl(index.googleCanonical) || "non fourni"}</p>
        <p>Canonique page: {shortUrl(index.userCanonical) || "non fourni"}</p>
      </div>
    </div>
  );
}

function InspectionButton({ url, inspection, loading, error, onInspect }) {
  if (!url) return null;
  return (
    <div>
      <button
        type="button"
        onClick={() => onInspect(url)}
        disabled={loading}
        className="inline-flex items-center rounded-lg border px-3 py-2 text-xs font-bold admin-border admin-text hover:bg-white/5 disabled:opacity-40"
      >
        <i className={`fas ${loading ? "fa-spinner fa-spin" : "fa-circle-check"} mr-2`}></i>
        Inspection
      </button>
      <InspectionResult inspection={inspection} loading={loading} error={error} />
    </div>
  );
}

function InvestigationDetails({ row, inspectionState, onInspect }) {
  const live = row.latestSerper;
  const gsc28 = row.gsc?.current28;
  const history = live?.history || [];
  const gscQueries = gsc28?.queries || [];
  const expected = row.expectedPaths || [];
  const visibleUrl = live?.url || gsc28?.bestPage || gsc28?.page || "";
  const expectedUrl = expected[0] ? publicUrl(expected[0]) : "";
  const inspection = inspectionState[expectedUrl] || {};

  return (
    <div className="grid gap-4 p-4 md:grid-cols-3">
      <div>
        <p className="admin-text-muted mb-2 text-[10px] font-bold uppercase tracking-wider">Diagnostic</p>
        <p className="admin-text text-sm font-bold">{row.status?.label || "Aucune lecture"}</p>
        <p className="admin-text-muted mt-1 text-xs">{row.status?.action || "A verifier avec un scan live."}</p>
        <p className="admin-text-muted mt-3 text-[10px] font-mono">{row.query}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <LinkButton href={googleSearchUrl(row.query)} icon="fa-magnifying-glass">Google</LinkButton>
          <LinkButton href={expectedUrl} icon="fa-up-right-from-square">Page cible</LinkButton>
        </div>
        <div className="mt-3">
          <InspectionButton
            url={expectedUrl}
            inspection={inspection.data}
            loading={inspection.loading}
            error={inspection.error}
            onInspect={onInspect}
          />
        </div>
      </div>

      <div>
        <p className="admin-text-muted mb-2 text-[10px] font-bold uppercase tracking-wider">Historique live</p>
        {history.length === 0 ? (
          <p className="admin-text-muted text-xs">Aucun scan live enregistre.</p>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 5).map((item) => (
              <div key={`${item.checkedAt}-${item.position}-${item.url}`} className="flex items-center gap-2 text-xs">
                <PositionBadge position={item.position} />
                <span className="admin-text-muted min-w-[76px]">{formatDate(item.checkedAt)}</span>
                <span className="admin-text truncate" title={item.url || ""}>{shortUrl(item.url) || "absent top 100"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="admin-text-muted mb-2 text-[10px] font-bold uppercase tracking-wider">GSC revele</p>
        {gscQueries.length === 0 ? (
          <p className="admin-text-muted text-xs">Google Search Console ne revele pas encore de requete utile.</p>
        ) : (
          <div className="space-y-2">
            {gscQueries.map((query) => (
              <div key={query.query} className="rounded-lg bg-white/5 px-3 py-2 text-xs">
                <div className="admin-text truncate" title={query.query}>{query.query}</div>
                <div className="admin-text-muted mt-1">
                  #{roundPosition(query.position)} / {formatNumber(query.impressions)} imp. / {formatNumber(query.clicks)} clics
                </div>
              </div>
            ))}
          </div>
        )}
        {visibleUrl && (
          <div className="mt-3">
            <LinkButton href={visibleUrl} icon="fa-link">Page qui sort</LinkButton>
          </div>
        )}
      </div>
    </div>
  );
}

function SegmentedControl({ label, value, options, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="admin-text-muted text-[10px] font-bold uppercase tracking-wider">{label}</span>
      <div className="flex rounded-lg bg-white/5 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-md px-2.5 py-1 text-xs font-bold ${
              value === option.value
                ? "bg-cyan-500/20 text-cyan-200"
                : "admin-text-muted hover:bg-white/5"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function GscTab() {
  const [data, setData] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITY);
  const [device, setDevice] = useState("ALL");
  const [branded, setBranded] = useState("exclude");
  const [country, setCountry] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("work");
  const [newKeyword, setNewKeyword] = useState("");
  const [openRow, setOpenRow] = useState("");
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [savingKeywords, setSavingKeywords] = useState(false);
  const [error, setError] = useState("");
  const [inspectionState, setInspectionState] = useState({});

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("city", selectedCity);
    if (device !== "ALL") params.set("device", device);
    if (branded !== "all") params.set("branded", branded);
    if (country !== "ALL") params.set("country", country);
    return params.toString();
  }, [branded, country, device, selectedCity]);

  const fetchKeywords = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/seo/keywords");
      const body = await res.json();
      setKeywords(body.keywords || []);
    } catch {
      setKeywords([]);
    }
  }, []);

  const fetchTracker = useCallback(async ({ keepLoading = false } = {}) => {
    if (!keepLoading) setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/seo/keyword-tracker?${queryString}`);
      const body = await res.json();
      if (!res.ok || body.error) throw new Error(body.error || "Erreur suivi SEO");
      setData(body);
      setKeywords(body.keywords || []);
      setOpenRow("");
    } catch (err) {
      setError(err.message || "Erreur suivi SEO");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchTracker(); }, 0);
    return () => clearTimeout(timer);
  }, [fetchTracker]);

  const cityOptions = useMemo(() => {
    const cities = data?.cities || [];
    return [...cities].sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }, [data]);

  const rows = useMemo(() => {
    return [...(data?.rows || [])]
      .filter((row) => matchesFilter(row, statusFilter))
      .sort((a, b) => getRowPriority(a) - getRowPriority(b) || a.keyword.localeCompare(b.keyword, "fr"));
  }, [data, statusFilter]);

  const summary = data?.summary || {};
  const lastScan = useMemo(() => {
    const dates = (data?.rows || [])
      .map((row) => row.latestSerper?.checkedAt)
      .filter(Boolean)
      .map((value) => new Date(value).getTime())
      .filter((value) => !Number.isNaN(value));
    if (dates.length === 0) return "Jamais";
    return formatDate(new Date(Math.max(...dates)).toISOString());
  }, [data]);

  async function scanCity() {
    setScanning(true);
    setError("");
    try {
      const res = await fetch("/api/admin/seo/keyword-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: selectedCity,
          device,
          branded,
          country: country === "ALL" ? "" : country,
        }),
      });
      const body = await res.json();
      if (!res.ok || body.error) throw new Error(body.error || "Erreur scan SEO");
      setData(body);
      setKeywords(body.keywords || []);
      setOpenRow("");
    } catch (err) {
      setError(err.message || "Erreur scan SEO");
    } finally {
      setScanning(false);
      setLoading(false);
    }
  }

  async function saveKeywords(nextKeywords) {
    setSavingKeywords(true);
    setError("");
    try {
      const res = await fetch("/api/admin/seo/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: nextKeywords }),
      });
      const body = await res.json();
      if (!res.ok || body.error) throw new Error(body.error || "Erreur mots-cles");
      setKeywords(body.keywords || nextKeywords);
      await fetchTracker({ keepLoading: true });
    } catch (err) {
      setError(err.message || "Erreur mots-cles");
    } finally {
      setSavingKeywords(false);
    }
  }

  async function addKeyword() {
    const keyword = newKeyword.trim().toLowerCase();
    if (!keyword || keywords.includes(keyword)) return;
    setNewKeyword("");
    await saveKeywords([...keywords, keyword]);
  }

  async function removeKeyword(keyword) {
    if (keywords.length <= 1) return;
    await saveKeywords(keywords.filter((item) => item !== keyword));
  }

  function downloadCurrentCsv() {
    const cityName = data?.city?.name || selectedCity;
    const exportRows = (data?.rows || []).map((row) => {
      const live = row.latestSerper;
      const gsc28 = row.gsc?.current28 || {};
      const gsc90 = row.gsc?.current90 || {};
      return {
        ville: cityName,
        mot_cle: row.keyword,
        requete: row.query,
        live_position: live?.position ?? "",
        live_page: live?.url || "",
        live_scan: live?.checkedAt || "",
        gsc_28j_position: gsc28.position ?? "",
        gsc_28j_impressions: gsc28.impressions || 0,
        gsc_90j_position: gsc90.position ?? "",
        gsc_90j_impressions: gsc90.impressions || 0,
        page_attendue: (row.expectedPaths || []).join(" | "),
        statut: row.status?.label || "",
        action: row.status?.action || "",
      };
    });
    const date = new Date().toISOString().slice(0, 10);
    exportCsv(`seo-suivi-${selectedCity}-${date}.csv`, exportRows);
  }

  async function inspectUrl(url) {
    if (!url) return;
    setInspectionState((prev) => ({ ...prev, [url]: { loading: true, error: "", data: null } }));
    try {
      const res = await fetch("/api/admin/seo/url-inspection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const body = await res.json();
      if (!res.ok || body.error) throw new Error(body.error || "Erreur inspection URL");
      setInspectionState((prev) => ({ ...prev, [url]: { loading: false, error: "", data: body } }));
    } catch (err) {
      setInspectionState((prev) => ({
        ...prev,
        [url]: { loading: false, error: err.message || "Erreur inspection URL", data: null },
      }));
    }
  }

  return (
    <div className="space-y-5">
      <div className="admin-card rounded-xl border p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="admin-text text-lg font-extrabold">Centrale de suivi SEO</h2>
            <p className="admin-text-muted mt-1 max-w-3xl text-sm">
              Une ville, tous les mots-cles vises, la position live Google, la lecture GSC et la page a pousser.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(loading || scanning || savingKeywords) && <i className="fas fa-spinner fa-spin admin-text-muted"></i>}
            <button
              onClick={() => fetchTracker()}
              disabled={loading || scanning}
              className="rounded-lg border px-3 py-2 text-sm font-bold admin-border admin-text hover:bg-white/5 disabled:opacity-40"
            >
              <i className="fas fa-rotate mr-2"></i>Rafraichir
            </button>
            <button
              onClick={scanCity}
              disabled={scanning || loading}
              className="rounded-lg bg-cyan-500/20 px-4 py-2 text-sm font-extrabold text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-40"
            >
              <i className={`fas fa-satellite-dish mr-2 ${scanning ? "fa-spin" : ""}`}></i>
              {scanning ? "Scan live..." : "Scanner cette ville"}
            </button>
            <button
              onClick={downloadCurrentCsv}
              disabled={!data?.rows?.length}
              className="rounded-lg border px-3 py-2 text-sm font-bold admin-border admin-text hover:bg-white/5 disabled:opacity-40"
            >
              <i className="fas fa-file-csv mr-2"></i>CSV
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_auto_auto_auto]">
          <select
            value={selectedCity}
            onChange={(event) => setSelectedCity(event.target.value)}
            className="admin-input rounded-lg border px-3 py-2 text-sm"
          >
            {cityOptions.length === 0 && <option value={selectedCity}>{selectedCity}</option>}
            {cityOptions.map((city) => (
              <option key={city.slug} value={city.slug}>{city.name}</option>
            ))}
          </select>

          <SegmentedControl label="Appareil" value={device} options={DEVICES} onChange={setDevice} />
          <SegmentedControl label="Marque" value={branded} options={BRANDED} onChange={setBranded} />
          <SegmentedControl label="Pays" value={country} options={COUNTRIES} onChange={setCountry} />
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-orange-400/30 bg-orange-500/10 px-3 py-2 text-sm text-orange-200">
            <i className="fas fa-triangle-exclamation mr-2"></i>{error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <SummaryTile label="Mots-cles" value={summary.total ?? 0} icon="fa-list-check" />
        <SummaryTile label="Top 3 live" value={summary.top3 ?? 0} tone="text-emerald-300" icon="fa-trophy" />
        <SummaryTile label="Top 10 live" value={summary.top10 ?? 0} tone="text-sky-300" icon="fa-ranking-star" />
        <SummaryTile label="A travailler" value={summary.needsWork ?? 0} tone="text-amber-300" icon="fa-screwdriver-wrench" />
        <SummaryTile label="Mauvaise page" value={summary.pageIssues ?? 0} tone="text-violet-300" icon="fa-route" />
        <SummaryTile label="Dernier scan" value={lastScan} icon="fa-clock" />
      </div>

      <div className="admin-card rounded-xl border p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="admin-text text-sm font-bold uppercase tracking-wider">Mots-cles suivis</p>
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  statusFilter === filter.value
                    ? "bg-cyan-500/20 text-cyan-200"
                    : "bg-white/5 admin-text-muted hover:bg-white/10"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <span key={keyword} className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold admin-text">
              {keyword}
              {keywords.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  disabled={savingKeywords}
                  className="admin-text-muted hover:text-white disabled:opacity-40"
                  title="Retirer ce mot-cle"
                >
                  <i className="fas fa-xmark"></i>
                </button>
              )}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(event) => setNewKeyword(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") addKeyword(); }}
            placeholder="Ajouter un mot-cle cible"
            className="admin-input min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"
          />
          <button
            onClick={addKeyword}
            disabled={!newKeyword.trim() || savingKeywords}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-bold admin-text hover:bg-white/15 disabled:opacity-40"
          >
            <i className="fas fa-plus mr-2"></i>Ajouter
          </button>
        </div>
      </div>

      {(!data && loading) || (!data?.rows?.length && !loading) ? (
        <EmptyReading loading={loading} />
      ) : (
        <div className="admin-card overflow-hidden rounded-xl border">
          {rows.length === 0 && (
            <div className="border-b px-4 py-5 text-sm admin-text-muted" style={{ borderColor: "var(--admin-border)" }}>
              Aucune ligne dans ce filtre. Change le filtre ou lance un scan live pour cette ville.
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: "1180px" }}>
              <thead>
                <tr className="border-b admin-text-muted" style={{ borderColor: "var(--admin-border)" }}>
                  <th className="px-3 py-3 text-left font-bold uppercase tracking-wider">Mot-cle</th>
                  <th className="px-3 py-3 text-center font-bold uppercase tracking-wider">Live Google</th>
                  <th className="px-3 py-3 text-center font-bold uppercase tracking-wider">GSC 28j</th>
                  <th className="px-3 py-3 text-center font-bold uppercase tracking-wider">GSC 90j</th>
                  <th className="px-3 py-3 text-left font-bold uppercase tracking-wider">Page qui sort</th>
                  <th className="px-3 py-3 text-left font-bold uppercase tracking-wider">Page a pousser</th>
                  <th className="px-3 py-3 text-center font-bold uppercase tracking-wider">Lecture</th>
                  <th className="px-3 py-3 text-left font-bold uppercase tracking-wider">Prochaine action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const live = row.latestSerper;
                  const gsc28 = row.gsc?.current28;
                  const gsc90 = row.gsc?.current90;
                  const visibleUrl = live?.url || gsc28?.bestPage || gsc28?.page || "";
                  const expectedPath = row.expectedPaths?.[0] || "";
                  const isOpen = openRow === row.query;
                  const livePosition = live?.position ?? null;

                  return (
                    <Fragment key={row.query}>
                      <tr
                        onClick={() => setOpenRow(isOpen ? "" : row.query)}
                        className={`cursor-pointer border-b transition-colors hover:bg-white/5 ${isOpen ? "bg-white/5" : ""}`}
                        style={{ borderColor: "var(--admin-border)" }}
                      >
                        <td className="px-3 py-3">
                          <div className="admin-text flex items-center gap-2 font-bold">
                            <i className={`fas fa-chevron-right text-[10px] admin-text-muted transition-transform ${isOpen ? "rotate-90" : ""}`}></i>
                            <span>{row.keyword}</span>
                          </div>
                          <div className="admin-text-muted mt-1 truncate font-mono text-[10px]" title={row.query}>{row.query}</div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <PositionBadge position={livePosition} />
                          <div className="admin-text-muted mt-1 text-[10px]">{formatDate(live?.checkedAt)}</div>
                          <DeltaBadge delta={live?.delta ?? null} />
                        </td>
                        <td className="px-3 py-3"><MetricStack metric={gsc28} /></td>
                        <td className="px-3 py-3"><MetricStack metric={gsc90} /></td>
                        <td className="px-3 py-3">
                          {visibleUrl ? (
                            <a
                              href={visibleUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(event) => event.stopPropagation()}
                              className="block max-w-[230px] truncate text-sky-300 hover:text-sky-200"
                              title={visibleUrl}
                            >
                              {shortUrl(visibleUrl)}
                            </a>
                          ) : (
                            <span className="admin-text-muted">Aucune</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {expectedPath ? (
                            <a
                              href={publicUrl(expectedPath)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(event) => event.stopPropagation()}
                              className="block max-w-[230px] truncate admin-text hover:text-cyan-200"
                              title={expectedPath}
                            >
                              {expectedPath}
                            </a>
                          ) : (
                            <span className="admin-text-muted">A definir</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-extrabold ${statusClass(row.status?.level)}`}>
                            {row.status?.label || "Aucune lecture"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="admin-text-muted max-w-[230px] truncate" title={row.status?.action || ""}>
                            {row.status?.action || "Ouvrir le dossier."}
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-b bg-black/10" style={{ borderColor: "var(--admin-border)" }}>
                          <td colSpan={8}>
                            <InvestigationDetails
                              row={row}
                              inspectionState={inspectionState}
                              onInspect={inspectUrl}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data?.periods?.current28 && (
        <p className="admin-text-muted text-xs">
          GSC 28j: {data.periods.current28.startDate} -&gt; {data.periods.current28.endDate}. Le scan live cherche Vosthermos dans le top 100 Google Canada.
        </p>
      )}
    </div>
  );
}
