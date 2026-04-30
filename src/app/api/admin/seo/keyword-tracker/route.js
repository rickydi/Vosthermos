import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { google } from "googleapis";
import { CITIES } from "@/lib/cities";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.vosthermos.com/";
const BRAND_TERM = "vosthermos";
const GSC_DATA_LAG_DAYS = 2;
const ROW_LIMIT = 25000;
const MAX_ROWS = 100000;
const SERPER_MAX_PAGES = 10;
const DEFAULT_KEYWORDS = [
  "remplacement vitre thermos",
  "reparation de portes et fenetres",
  "calfeutrage",
  "vitre thermos embuee",
  "remplacement thermos",
  "reparation fenetre",
  "remplacement quincaillerie fenetre",
  "reparation porte patio",
];

async function getSearchConsoleClient() {
  const configPath = path.join(process.cwd(), "config", "google-service-account.json");
  if (!fs.existsSync(configPath)) throw new Error("Fichier config/google-service-account.json introuvable");
  const auth = new google.auth.GoogleAuth({
    keyFile: configPath,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  return google.searchconsole({ version: "v1", auth });
}

async function getSerperKey() {
  let apiKey = process.env.SERPER_API_KEY;
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT value FROM site_settings WHERE key = 'api_key_serper'`,
    );
    if (rows[0]?.value) apiKey = rows[0].value;
  } catch {}
  return apiKey;
}

async function getSeoKeywords() {
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT value FROM site_settings WHERE key = 'seo_keywords'`,
    );
    const parsed = JSON.parse(rows[0]?.value || "[]");
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((kw) => String(kw).trim()).filter(Boolean);
    }
  } catch {}
  return DEFAULT_KEYWORDS;
}

function isoDate(d) {
  return d.toISOString().split("T")[0];
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function normalizeForMatch(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\u2019]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compactForMatch(value) {
  return normalizeForMatch(value).replace(/\s+/g, "");
}

function cityMatchTerms(city) {
  return [
    normalizeForMatch(city.name),
    normalizeForMatch(city.slug.replace(/-/g, " ")),
    compactForMatch(city.name),
    compactForMatch(city.slug),
  ].filter((term, index, terms) => term.length >= 3 && terms.indexOf(term) === index);
}

function queryCityScore(query, city) {
  const normalizedQuery = normalizeForMatch(query);
  const compactQuery = compactForMatch(query);
  const queryTokens = normalizedQuery.split(/\s+/);
  let score = 0;

  for (const term of city.terms || cityMatchTerms(city)) {
    const matches = term.includes(" ")
      ? normalizedQuery.includes(term)
      : queryTokens.includes(term) || (term.length >= 8 && compactQuery.includes(term));
    if (matches) score = Math.max(score, term.length);
  }

  return score;
}

function cityQueryExpressions(city) {
  return [
    city.name,
    city.name.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
    city.slug.replace(/-/g, " "),
    city.slug,
  ]
    .map((value) => String(value || "").trim())
    .filter((value, index, values) => value.length >= 3 && values.indexOf(value) === index);
}

function makeWindow(endDate, days) {
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - (days - 1));
  return { startDate, endDate };
}

function previousWindow(window, days) {
  const endDate = new Date(window.startDate);
  endDate.setDate(endDate.getDate() - 1);
  return makeWindow(endDate, days);
}

function buildGscFilters({ device, branded, country }) {
  const groups = [];
  if (device && device !== "ALL") {
    groups.push({ filters: [{ dimension: "device", operator: "equals", expression: device }] });
  }
  if (country && country !== "ALL") {
    groups.push({ filters: [{ dimension: "country", operator: "equals", expression: country }] });
  }
  if (branded === "exclude") {
    groups.push({ filters: [{ dimension: "query", operator: "notContains", expression: BRAND_TERM }] });
  } else if (branded === "only") {
    groups.push({ filters: [{ dimension: "query", operator: "contains", expression: BRAND_TERM }] });
  }
  return groups;
}

function rowKey(row) {
  return `${row.keys?.[0] || ""}||${row.keys?.[1] || ""}`;
}

async function fetchRows(searchconsole, { startDate, endDate, filters }) {
  const rows = [];
  for (let startRow = 0; startRow < MAX_ROWS; startRow += ROW_LIMIT) {
    const response = await searchconsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: isoDate(startDate),
        endDate: isoDate(endDate),
        dimensions: ["query", "page"],
        dimensionFilterGroups: filters,
        rowLimit: ROW_LIMIT,
        startRow,
        type: "web",
      },
    });
    const batch = response.data.rows || [];
    rows.push(...batch);
    if (batch.length < ROW_LIMIT) break;
  }
  return rows;
}

async function fetchRowsForCity(searchconsole, { startDate, endDate, filters, city }) {
  const rowIndex = new Map();
  for (const expression of cityQueryExpressions(city)) {
    const scopedFilters = [
      ...filters,
      { filters: [{ dimension: "query", operator: "contains", expression }] },
    ];
    const rows = await fetchRows(searchconsole, { startDate, endDate, filters: scopedFilters });
    for (const row of rows) rowIndex.set(rowKey(row), row);
  }
  return [...rowIndex.values()];
}

function includesAny(value, words) {
  return words.some((word) => value.includes(word));
}

function keywordIntent(keyword) {
  const normalized = normalizeForMatch(keyword);
  if (normalized.includes("quincaillerie")) return "quincaillerie";
  if (normalized.includes("calfeutrage")) return "calfeutrage";
  if (normalized.includes("porte patio")) return "porte-patio";
  if (normalized.includes("thermos") && includesAny(normalized, ["embuee", "desembuage", "condensation"])) {
    return "thermos-embuee";
  }
  if (normalized.includes("thermos")) return "thermos";
  if (normalized.includes("porte") && normalized.includes("fenetre")) return "portes-fenetres";
  if (normalized.includes("fenetre")) return "reparation-fenetre";
  return "general";
}

function queryMatchesIntent(query, keyword, city) {
  if (queryCityScore(query, city) <= 0) return false;
  const normalized = normalizeForMatch(query);
  const intent = keywordIntent(keyword);

  if (intent === "quincaillerie") return normalized.includes("quincaillerie");
  if (intent === "calfeutrage") return normalized.includes("calfeutrage");
  if (intent === "porte-patio") return normalized.includes("patio");
  if (intent === "thermos-embuee") {
    return normalized.includes("thermos") &&
      includesAny(normalized, ["embuee", "embue", "desembuage", "buage", "condensation"]);
  }
  if (intent === "thermos") {
    return normalized.includes("thermos") &&
      !includesAny(normalized, ["calfeutrage", "quincaillerie", "patio"]);
  }
  if (intent === "portes-fenetres") {
    return (
      (normalized.includes("porte") && normalized.includes("fenetre")) ||
      normalized.includes("portes et fenetres") ||
      normalized.includes("doors and windows")
    );
  }
  if (intent === "reparation-fenetre") {
    return normalized.includes("fenetre") || normalized.includes("window");
  }
  return normalized.includes(normalizeForMatch(keyword));
}

function createBucket() {
  return {
    clicks: 0,
    impressions: 0,
    positionWeightedSum: 0,
    pages: new Map(),
    queries: new Map(),
  };
}

function addRow(bucket, row) {
  const query = row.keys?.[0] || "";
  const page = row.keys?.[1] || "";
  const clicks = row.clicks || 0;
  const impressions = row.impressions || 0;
  bucket.clicks += clicks;
  bucket.impressions += impressions;
  bucket.positionWeightedSum += (row.position || 0) * impressions;

  if (page) {
    const existingPage = bucket.pages.get(page) || {
      page,
      clicks: 0,
      impressions: 0,
      positionWeightedSum: 0,
    };
    existingPage.clicks += clicks;
    existingPage.impressions += impressions;
    existingPage.positionWeightedSum += (row.position || 0) * impressions;
    bucket.pages.set(page, existingPage);
  }

  if (query) {
    const key = normalizeForMatch(query);
    const existingQuery = bucket.queries.get(key) || {
      query,
      clicks: 0,
      impressions: 0,
      positionWeightedSum: 0,
    };
    existingQuery.clicks += clicks;
    existingQuery.impressions += impressions;
    existingQuery.positionWeightedSum += (row.position || 0) * impressions;
    bucket.queries.set(key, existingQuery);
  }
}

function finalizeBucket(bucket) {
  if (!bucket || bucket.impressions <= 0) {
    return { position: null, clicks: 0, impressions: 0, ctr: 0, page: null, query: null };
  }

  const pages = [...bucket.pages.values()]
    .filter((page) => page.impressions > 0)
    .map((page) => ({
      page: page.page,
      clicks: page.clicks,
      impressions: page.impressions,
      ctr: round1((page.clicks / page.impressions) * 100),
      position: round1(page.positionWeightedSum / page.impressions),
    }));
  const queries = [...bucket.queries.values()]
    .filter((query) => query.impressions > 0)
    .map((query) => ({
      query: query.query,
      clicks: query.clicks,
      impressions: query.impressions,
      ctr: round1((query.clicks / query.impressions) * 100),
      position: round1(query.positionWeightedSum / query.impressions),
    }));

  const mainPage = [...pages].sort((a, b) => b.impressions - a.impressions || a.position - b.position)[0] || null;
  const bestPage = [...pages]
    .filter((page) => page.impressions >= 10)
    .sort((a, b) => a.position - b.position || b.impressions - a.impressions)[0] ||
    [...pages].sort((a, b) => a.position - b.position || b.impressions - a.impressions)[0] ||
    null;
  const mainQuery = [...queries].sort((a, b) => b.impressions - a.impressions || a.position - b.position)[0] || null;

  return {
    position: round1(bucket.positionWeightedSum / bucket.impressions),
    clicks: bucket.clicks,
    impressions: bucket.impressions,
    ctr: round1((bucket.clicks / bucket.impressions) * 100),
    page: mainPage?.page || null,
    bestPage: bestPage?.page || mainPage?.page || null,
    bestPagePosition: bestPage?.position ?? null,
    bestPageImpressions: bestPage?.impressions || 0,
    query: mainQuery?.query || null,
    queries: queries.sort((a, b) => b.impressions - a.impressions).slice(0, 3),
  };
}

function gscMetric(rows, keyword, city) {
  const bucket = createBucket();
  for (const row of rows) {
    const query = row.keys?.[0] || "";
    if (queryMatchesIntent(query, keyword, city)) addRow(bucket, row);
  }
  return finalizeBucket(bucket);
}

function expectedPaths(keyword, citySlug) {
  const intent = keywordIntent(keyword);
  if (intent === "thermos") {
    return [`/services/remplacement-vitre-thermos/${citySlug}`];
  }
  if (intent === "thermos-embuee") {
    return [`/services/desembuage/${citySlug}`, `/services/remplacement-vitre-thermos/${citySlug}`];
  }
  if (intent === "quincaillerie") {
    return [`/services/remplacement-quincaillerie/${citySlug}`];
  }
  if (intent === "calfeutrage") {
    return [`/services/calfeutrage/${citySlug}`, `/calfeutrage/${citySlug}`];
  }
  if (intent === "porte-patio") {
    return [`/services/reparation-porte-patio/${citySlug}`, `/reparation-portes-et-fenetres/${citySlug}`];
  }
  if (intent === "portes-fenetres" || intent === "reparation-fenetre") {
    return [`/reparation-portes-et-fenetres/${citySlug}`, `/services/reparation-porte-fenetre/${citySlug}`];
  }
  return [`/reparation-portes-et-fenetres/${citySlug}`];
}

function shortPage(url) {
  if (!url) return null;
  try {
    return new URL(url).pathname.replace(/\/$/, "") || "/";
  } catch {
    return String(url).replace("https://www.vosthermos.com", "").replace("https://vosthermos.com", "") || "/";
  }
}

function pageMatches(url, paths) {
  const page = shortPage(url);
  if (!page) return false;
  return paths.some((expected) => page === expected || page.startsWith(`${expected}/`));
}

function isVosthermosUrl(link) {
  try {
    const hostname = new URL(link).hostname.toLowerCase().replace(/^www\./, "");
    return hostname === "vosthermos.com";
  } catch {
    return false;
  }
}

async function checkRankingSerper(apiKey, cityName, keywordBase) {
  if (!apiKey) return { position: null, aiMention: false, url: null, checkedTop: SERPER_MAX_PAGES * 10 };

  const query = `${keywordBase} ${cityName}`;
  let aiMention = false;

  for (let page = 1; page <= SERPER_MAX_PAGES; page++) {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, gl: "ca", hl: "fr", page }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { position: null, aiMention, url: null, error: `HTTP ${res.status}: ${body.slice(0, 120)}` };
    }

    const data = await res.json();
    if (page === 1) {
      for (const key of ["answerBox", "knowledgeGraph", "aiOverview"]) {
        if (data[key] && JSON.stringify(data[key]).toLowerCase().includes("vosthermos")) {
          aiMention = true;
          break;
        }
      }
    }

    for (const organic of data.organic || []) {
      if (isVosthermosUrl(organic.link || "")) {
        const pagePos = organic.position || 0;
        return {
          position: (page - 1) * 10 + pagePos,
          aiMention,
          url: organic.link || null,
          title: organic.title || "",
          checkedTop: SERPER_MAX_PAGES * 10,
        };
      }
    }
  }

  return { position: null, aiMention, url: null, checkedTop: SERPER_MAX_PAGES * 10 };
}

async function latestSerperByKeyword(city, keywords) {
  const exactKeywords = keywords.map((keyword) => `${keyword} ${city.name}`);
  const since = new Date();
  since.setDate(since.getDate() - 180);

  const rows = await prisma.seoRanking.findMany({
    where: {
      city: city.slug,
      keyword: { in: exactKeywords },
      checkedAt: { gte: since },
    },
    orderBy: { checkedAt: "desc" },
  });

  const grouped = {};
  for (const keyword of exactKeywords) grouped[keyword] = [];
  for (const row of rows) {
    if (!grouped[row.keyword]) grouped[row.keyword] = [];
    grouped[row.keyword].push(row);
  }
  return grouped;
}

function deltaFromHistory(history) {
  if (!history || history.length < 2) return null;
  const current = history[0]?.position;
  const previous = history[1]?.position;
  if (current == null || previous == null) return null;
  return previous - current;
}

function rowStatus({ latestSerper, currentGsc, expected }) {
  const hasLiveScan = Boolean(latestSerper);
  const serperPosition = latestSerper?.position ?? null;
  const gscPosition = currentGsc?.bestPagePosition ?? currentGsc?.position ?? null;
  const page = latestSerper?.url || currentGsc?.bestPage || currentGsc?.page || null;
  const correctPage = page ? pageMatches(page, expected) : false;
  const effectivePosition = serperPosition ?? gscPosition;

  if (effectivePosition == null) {
    if (hasLiveScan) {
      return {
        level: "not-found",
        label: "Non trouve top 100",
        action: "Vosthermos absent du top 100 live et aucune lecture GSC utile",
      };
    }
    return {
      level: "unscanned",
      label: "Pas encore scanne",
      action: "Cliquer Scanner cette ville ou attendre des impressions GSC",
    };
  }
  if (!correctPage) {
    return { level: "page", label: "Page a clarifier", action: "Renforcer la page attendue et les liens internes" };
  }
  if (effectivePosition <= 3) {
    return { level: "strong", label: "Fort", action: "Surveiller et garder la page active" };
  }
  if (effectivePosition <= 10) {
    return { level: "ok", label: "Correct", action: "Pousser pour top 3" };
  }
  return { level: "weak", label: "A pousser", action: "Travailler contenu, liens et intention de page" };
}

async function buildTrackerData({ citySlug, device, branded, country }) {
  const keywords = await getSeoKeywords();
  const city = CITIES.find((c) => c.slug === citySlug) ||
    CITIES.find((c) => c.slug === "delson") ||
    CITIES[0];
  const cityWithTerms = { ...city, terms: cityMatchTerms(city) };
  const searchconsole = await getSearchConsoleClient();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - GSC_DATA_LAG_DAYS);
  const current7 = makeWindow(endDate, 7);
  const current28 = makeWindow(endDate, 28);
  const current90 = makeWindow(endDate, 90);
  const previous28 = previousWindow(current28, 28);
  const filters = buildGscFilters({ device, branded, country });

  const [rows7, rows28, rows90, rowsPrev28, serperHistory] = await Promise.all([
    fetchRowsForCity(searchconsole, { ...current7, filters, city: cityWithTerms }),
    fetchRowsForCity(searchconsole, { ...current28, filters, city: cityWithTerms }),
    fetchRowsForCity(searchconsole, { ...current90, filters, city: cityWithTerms }),
    fetchRowsForCity(searchconsole, { ...previous28, filters, city: cityWithTerms }),
    latestSerperByKeyword(cityWithTerms, keywords),
  ]);

  const rows = keywords.map((keyword) => {
    const exactKeyword = `${keyword} ${cityWithTerms.name}`;
    const history = serperHistory[exactKeyword] || [];
    const latestSerper = history[0] ? {
      position: history[0].position,
      aiMention: history[0].aiMention,
      url: history[0].url,
      checkedAt: history[0].checkedAt,
      delta: deltaFromHistory(history),
      history: history.slice(0, 8).map((item) => ({
        position: item.position,
        url: item.url,
        aiMention: item.aiMention,
        checkedAt: item.checkedAt,
      })),
    } : null;

    const currentGsc = gscMetric(rows28, keyword, cityWithTerms);
    const expected = expectedPaths(keyword, cityWithTerms.slug);
    const status = rowStatus({ latestSerper, currentGsc, expected });

    return {
      keyword,
      query: exactKeyword,
      intent: keywordIntent(keyword),
      expectedPaths: expected,
      latestSerper,
      gsc: {
        current7: gscMetric(rows7, keyword, cityWithTerms),
        current28: currentGsc,
        current90: gscMetric(rows90, keyword, cityWithTerms),
        previous28: gscMetric(rowsPrev28, keyword, cityWithTerms),
      },
      status,
    };
  });

  const summary = {
    total: rows.length,
    top3: rows.filter((row) => (row.latestSerper?.position ?? 999) <= 3).length,
    top10: rows.filter((row) => (row.latestSerper?.position ?? 999) <= 10).length,
    needsWork: rows.filter((row) => ["weak", "page", "missing", "unscanned", "not-found"].includes(row.status.level)).length,
    pageIssues: rows.filter((row) => row.status.level === "page").length,
  };

  return {
    source: "seo-keyword-tracker",
    city: { slug: cityWithTerms.slug, name: cityWithTerms.name },
    cities: CITIES.map((c) => ({ slug: c.slug, name: c.name })),
    keywords,
    periods: {
      current7: { startDate: isoDate(current7.startDate), endDate: isoDate(current7.endDate), days: 7 },
      current28: { startDate: isoDate(current28.startDate), endDate: isoDate(current28.endDate), days: 28 },
      current90: { startDate: isoDate(current90.startDate), endDate: isoDate(current90.endDate), days: 90 },
      previous28: { startDate: isoDate(previous28.startDate), endDate: isoDate(previous28.endDate), days: 28 },
    },
    filters: { device, branded, country },
    rowCounts: {
      gsc7: rows7.length,
      gsc28: rows28.length,
      gsc90: rows90.length,
      gscPrevious28: rowsPrev28.length,
    },
    summary,
    rows,
  };
}

export async function GET(request) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get("city") || "delson";
  const device = (searchParams.get("device") || "ALL").toUpperCase();
  const branded = searchParams.get("branded") || "exclude";
  const country = searchParams.get("country") || "";

  try {
    const data = await buildTrackerData({ citySlug, device, branded, country });
    return NextResponse.json(data);
  } catch (err) {
    console.error("SEO keyword tracker error:", err.message);
    return NextResponse.json({ error: err.message || "Erreur suivi SEO" }, { status: 500 });
  }
}

export async function POST(request) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  let body = {};
  try { body = await request.json(); } catch {}
  const citySlug = body.city || "delson";
  const city = CITIES.find((c) => c.slug === citySlug) ||
    CITIES.find((c) => c.slug === "delson") ||
    CITIES[0];
  const keywords = await getSeoKeywords();
  const apiKey = await getSerperKey();
  if (!apiKey) return NextResponse.json({ error: "SERPER_API_KEY manquant" }, { status: 500 });

  try {
    for (const keyword of keywords) {
      const result = await checkRankingSerper(apiKey, city.name, keyword);
      await prisma.seoRanking.create({
        data: {
          city: city.slug,
          cityName: city.name,
          keyword: `${keyword} ${city.name}`,
          position: result.position,
          aiMention: result.aiMention,
          url: result.url,
        },
      });
    }

    const device = (body.device || "ALL").toUpperCase();
    const branded = body.branded || "exclude";
    const country = body.country || "";
    const data = await buildTrackerData({ citySlug: city.slug, device, branded, country });
    return NextResponse.json({ scanned: true, ...data });
  } catch (err) {
    console.error("SEO keyword tracker scan error:", err.message);
    return NextResponse.json({ error: err.message || "Erreur scan SEO" }, { status: 500 });
  }
}
