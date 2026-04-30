import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { google } from "googleapis";
import { CITIES } from "@/lib/cities";
import path from "path";
import fs from "fs";
import { withCache } from "@/lib/gsc-cache";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.vosthermos.com/";
const BRAND_TERM = "vosthermos";
const GSC_DATA_LAG_DAYS = 2;
const ROW_LIMIT = 25000;
const MAX_ROWS = 100000;

async function getSearchConsoleClient() {
  const configPath = path.join(process.cwd(), "config", "google-service-account.json");
  if (!fs.existsSync(configPath)) throw new Error("Fichier config/google-service-account.json introuvable");
  const auth = new google.auth.GoogleAuth({
    keyFile: configPath,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  return google.searchconsole({ version: "v1", auth });
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

function buildFilters({ keyword, device, branded, country }) {
  const groups = [];

  if (keyword) {
    groups.push({ filters: [{ dimension: "query", operator: "contains", expression: keyword }] });
  }
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

function rowKey(row) {
  return `${row.keys?.[0] || ""}||${row.keys?.[1] || ""}`;
}

async function fetchRowsForCity(searchconsole, { startDate, endDate, filters, city }) {
  const rowIndex = new Map();

  for (const expression of cityQueryExpressions(city)) {
    const scopedFilters = [
      ...filters,
      { filters: [{ dimension: "query", operator: "contains", expression }] },
    ];
    const rows = await fetchRows(searchconsole, { startDate, endDate, filters: scopedFilters });

    for (const row of rows) {
      rowIndex.set(rowKey(row), row);
    }
  }

  return [...rowIndex.values()];
}

function createBucket(label) {
  return {
    label,
    clicks: 0,
    impressions: 0,
    positionWeightedSum: 0,
    pages: new Map(),
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
    const existing = bucket.pages.get(page) || {
      page,
      impressions: 0,
      clicks: 0,
      positionWeightedSum: 0,
      query,
    };
    existing.impressions += impressions;
    existing.clicks += clicks;
    existing.positionWeightedSum += (row.position || 0) * impressions;
    bucket.pages.set(page, existing);
  }
}

function finalizeBucket(bucket) {
  if (!bucket || bucket.impressions <= 0) {
    return { clicks: 0, impressions: 0, ctr: 0, position: null, page: null };
  }

  const pageMetrics = [...bucket.pages.values()]
    .filter((page) => page.impressions > 0)
    .map((page) => ({
      page: page.page,
      clicks: page.clicks,
      impressions: page.impressions,
      ctr: round1((page.clicks / page.impressions) * 100),
      position: round1(page.positionWeightedSum / page.impressions),
    }));

  const topPage = [...pageMetrics]
    .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks)[0] || null;
  const bestPage = [...pageMetrics]
    .filter((page) => page.impressions >= 10)
    .sort((a, b) => a.position - b.position || b.impressions - a.impressions)[0] ||
    [...pageMetrics].sort((a, b) => a.position - b.position || b.impressions - a.impressions)[0] ||
    null;

  return {
    clicks: bucket.clicks,
    impressions: bucket.impressions,
    ctr: round1((bucket.clicks / bucket.impressions) * 100),
    position: round1(bucket.positionWeightedSum / bucket.impressions),
    page: topPage?.page || null,
    bestPage: bestPage?.page || topPage?.page || null,
    bestPageClicks: bestPage?.clicks || 0,
    bestPageImpressions: bestPage?.impressions || 0,
    bestPageCtr: bestPage?.ctr || 0,
    bestPagePosition: bestPage?.position ?? null,
  };
}

function displayBestPageMetric(metric) {
  if (!metric || metric.impressions <= 0) return metric;
  if (metric.bestPagePosition == null) return metric;

  return {
    ...metric,
    sitePosition: metric.position,
    siteClicks: metric.clicks,
    siteImpressions: metric.impressions,
    siteCtr: metric.ctr,
    position: metric.bestPagePosition,
    page: metric.bestPage,
    clicks: metric.bestPageClicks,
    impressions: metric.bestPageImpressions,
    ctr: metric.bestPageCtr,
  };
}

function aggregateRows(rows, city) {
  const queryBuckets = new Map();
  const allBucket = createBucket(`Toutes les requetes avec ${city.name}`);
  let matchedRows = 0;

  for (const row of rows) {
    const query = row.keys?.[0] || "";
    if (!query || queryCityScore(query, city) <= 0) continue;

    matchedRows += 1;
    addRow(allBucket, row);

    const key = normalizeForMatch(query);
    if (!queryBuckets.has(key)) {
      queryBuckets.set(key, createBucket(query));
    }
    addRow(queryBuckets.get(key), row);
  }

  return { allBucket, queryBuckets, matchedRows };
}

function metricFor(periodAgg, key) {
  if (key === "_all") return finalizeBucket(periodAgg.allBucket);
  return finalizeBucket(periodAgg.queryBuckets.get(key));
}

function deltaPosition(current, previous) {
  if (current?.position == null || previous?.position == null) return null;
  return round1(previous.position - current.position);
}

export async function GET(request) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get("city") || "delson";
  const keyword = searchParams.get("keyword") || "";
  const device = (searchParams.get("device") || "ALL").toUpperCase();
  const branded = searchParams.get("branded") || "exclude";
  const country = searchParams.get("country") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

  const city = CITIES.find((c) => c.slug === citySlug) ||
    CITIES.find((c) => c.slug === "delson") ||
    CITIES[0];
  const cityWithTerms = { ...city, terms: cityMatchTerms(city) };

  const cacheParams = { city: cityWithTerms.slug, keyword, device, branded, country, limit };

  try {
    const searchconsole = await getSearchConsoleClient();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - GSC_DATA_LAG_DAYS);

    const current7 = makeWindow(endDate, 7);
    const current28 = makeWindow(endDate, 28);
    const current90 = makeWindow(endDate, 90);
    const previous28 = previousWindow(current28, 28);

    const filters = buildFilters({ keyword, device, branded, country });

    const { fromCache, data } = await withCache("tracked-city-queries", cacheParams, async () => {
      const [rows7, rows28, rows90, rowsPrev28] = await Promise.all([
        fetchRowsForCity(searchconsole, { ...current7, filters, city: cityWithTerms }),
        fetchRowsForCity(searchconsole, { ...current28, filters, city: cityWithTerms }),
        fetchRowsForCity(searchconsole, { ...current90, filters, city: cityWithTerms }),
        fetchRowsForCity(searchconsole, { ...previous28, filters, city: cityWithTerms }),
      ]);

      const aggs = {
        current7: aggregateRows(rows7, cityWithTerms),
        current28: aggregateRows(rows28, cityWithTerms),
        current90: aggregateRows(rows90, cityWithTerms),
        previous28: aggregateRows(rowsPrev28, cityWithTerms),
      };

      const queryKeys = new Set([
        ...aggs.current7.queryBuckets.keys(),
        ...aggs.current28.queryBuckets.keys(),
        ...aggs.current90.queryBuckets.keys(),
        ...aggs.previous28.queryBuckets.keys(),
      ]);

      const queries = [...queryKeys].map((key) => {
        const current = displayBestPageMetric(metricFor(aggs.current28, key));
        const previous = displayBestPageMetric(metricFor(aggs.previous28, key));
        const label = aggs.current28.queryBuckets.get(key)?.label ||
          aggs.current7.queryBuckets.get(key)?.label ||
          aggs.current90.queryBuckets.get(key)?.label ||
          aggs.previous28.queryBuckets.get(key)?.label ||
          key;

        return {
          key,
          query: label,
          current7: displayBestPageMetric(metricFor(aggs.current7, key)),
          current28: current,
          current90: displayBestPageMetric(metricFor(aggs.current90, key)),
          previous28: previous,
          delta28: deltaPosition(current, previous),
        };
      })
        .filter((row) => row.current28.impressions > 0 || row.previous28.impressions > 0)
        .sort((a, b) => (
          (b.current28.impressions || b.previous28.impressions) -
          (a.current28.impressions || a.previous28.impressions)
        ))
        .slice(0, limit);

      const summaryCurrent = metricFor(aggs.current28, "_all");
      const summaryPrevious = metricFor(aggs.previous28, "_all");

      return {
        source: "google-search-console",
        mode: "tracked-city-queries",
        city: { slug: cityWithTerms.slug, name: cityWithTerms.name },
        cities: CITIES.map((c) => ({ slug: c.slug, name: c.name })),
        periods: {
          current7: { startDate: isoDate(current7.startDate), endDate: isoDate(current7.endDate), days: 7 },
          current28: { startDate: isoDate(current28.startDate), endDate: isoDate(current28.endDate), days: 28 },
          current90: { startDate: isoDate(current90.startDate), endDate: isoDate(current90.endDate), days: 90 },
          previous28: { startDate: isoDate(previous28.startDate), endDate: isoDate(previous28.endDate), days: 28 },
        },
        filters: { keyword, device, branded, country },
        rowCounts: {
          current7: rows7.length,
          current28: rows28.length,
          current90: rows90.length,
          previous28: rowsPrev28.length,
          matchedCurrent28: aggs.current28.matchedRows,
        },
        summary: {
          key: "_all",
          query: `Toutes les requetes avec ${cityWithTerms.name}`,
          current7: metricFor(aggs.current7, "_all"),
          current28: summaryCurrent,
          current90: metricFor(aggs.current90, "_all"),
          previous28: summaryPrevious,
          delta28: deltaPosition(summaryCurrent, summaryPrevious),
        },
        queries,
      };
    });

    return NextResponse.json({ ...data, fromCache });
  } catch (err) {
    console.error("GSC tracked queries error:", err.message);
    return NextResponse.json({ error: err.message || "Erreur GSC" }, { status: 500 });
  }
}
