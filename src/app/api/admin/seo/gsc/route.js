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

function parsePopulation(str) {
  if (!str) return 0;
  const s = String(str).replace(/\s/g, "").toLowerCase();
  const match = s.match(/(\d+(?:[.,]\d+)?)([mk])?/);
  if (!match) return 0;
  const num = parseFloat(match[1].replace(",", "."));
  const unit = match[2];
  if (unit === "m") return Math.round(num * 1_000_000);
  if (unit === "k") return Math.round(num * 1_000);
  return Math.round(num);
}

async function getSearchConsoleClient() {
  const configPath = path.join(process.cwd(), "config", "google-service-account.json");
  if (!fs.existsSync(configPath)) {
    throw new Error("Fichier config/google-service-account.json introuvable");
  }
  const auth = new google.auth.GoogleAuth({
    keyFile: configPath,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  return google.searchconsole({ version: "v1", auth });
}

// Build dimensionFilterGroups based on optional keyword + device + branded + country + city
function buildFilters({ keyword, device, branded, country, cityFilter }) {
  const groups = [];

  if (keyword) {
    groups.push({ filters: [{ dimension: "query", operator: "contains", expression: keyword }] });
  }
  if (device && device !== "ALL") {
    groups.push({ filters: [{ dimension: "device", operator: "equals", expression: device }] });
  }
  if (country) {
    groups.push({ filters: [{ dimension: "country", operator: "equals", expression: country }] });
  }
  if (branded === "exclude") {
    groups.push({ filters: [{ dimension: "query", operator: "notContains", expression: BRAND_TERM }] });
  } else if (branded === "only") {
    groups.push({ filters: [{ dimension: "query", operator: "contains", expression: BRAND_TERM }] });
  }
  if (cityFilter) {
    groups.push({ filters: [{ dimension: "page", operator: "contains", expression: `/${cityFilter}` }] });
  }
  return groups;
}

function isoDate(d) { return d.toISOString().split("T")[0]; }

function pageMatchesCity(page, citySlug) {
  try {
    const pathname = new URL(page).pathname.replace(/\/$/, "");
    const escaped = citySlug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return (
      pathname === `/reparation-portes-et-fenetres/${citySlug}` ||
      pathname === `/calfeutrage/${citySlug}` ||
      new RegExp(`^/services/[^/]+/${escaped}$`).test(pathname) ||
      new RegExp(`^/en/services/[^/]+/${escaped}$`).test(pathname)
    );
  } catch {
    return false;
  }
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

function findQueryCity(query, cities) {
  return cities
    .map((city) => ({ city, score: queryCityScore(query, city) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.city || null;
}

export async function GET(request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "28");
  const keyword = searchParams.get("keyword") || "";
  const city = searchParams.get("city") || "";
  const device = (searchParams.get("device") || "ALL").toUpperCase(); // ALL|DESKTOP|MOBILE|TABLET
  const branded = searchParams.get("branded") || "all"; // all|exclude|only
  const country = searchParams.get("country") || "";

  const cacheParams = { days, keyword, city, device, branded, country };

  try {
    const searchconsole = await getSearchConsoleClient();

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - GSC_DATA_LAG_DAYS);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (days - 1));

    // ─── Mode detail par ville ──────────────────────────────────
    if (city) {
      const scope = "city-detail";
      const { fromCache, data } = await withCache(scope, cacheParams, async () => {
        const filters = buildFilters({ keyword, device, branded, country, cityFilter: city });

        const pagesRes = await searchconsole.searchanalytics.query({
          siteUrl: SITE_URL,
          requestBody: {
            startDate: isoDate(startDate),
            endDate: isoDate(endDate),
            dimensions: ["page"],
            dimensionFilterGroups: filters,
            rowLimit: 1000,
            type: "web",
          },
        });

        const queriesRes = await searchconsole.searchanalytics.query({
          siteUrl: SITE_URL,
          requestBody: {
            startDate: isoDate(startDate),
            endDate: isoDate(endDate),
            dimensions: ["query", "page"],
            dimensionFilterGroups: filters,
            rowLimit: 5000,
            type: "web",
          },
        });

        const pages = (pagesRes.data.rows || []).map((row) => ({
          page: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions,
          position: Math.round(row.position * 10) / 10,
          ctr: Math.round(row.ctr * 1000) / 10,
        })).sort((a, b) => a.position - b.position);

        const queries = (queriesRes.data.rows || []).map((row) => ({
          query: row.keys[0],
          page: row.keys[1],
          clicks: row.clicks,
          impressions: row.impressions,
          position: Math.round(row.position * 10) / 10,
          ctr: Math.round(row.ctr * 1000) / 10,
        }));

        const totalClicks = pages.reduce((s, p) => s + p.clicks, 0);
        const totalImpressions = pages.reduce((s, p) => s + p.impressions, 0);
        const bestPosition = pages.length > 0 ? pages[0].position : null;
        const ctr = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 1000) / 10 : 0;

        return {
          source: "google-search-console",
          mode: "city-detail",
          city,
          period: { startDate: isoDate(startDate), endDate: isoDate(endDate), days },
          filters: { device, branded, country },
          totalClicks,
          totalImpressions,
          bestPosition,
          ctr,
          pages,
          queries,
        };
      });

      return NextResponse.json({ ...data, fromCache });
    }

    // ─── Mode overview (toutes les villes) ─────────────────────
    const scope = "overview";
    const { fromCache, data } = await withCache(scope, cacheParams, async () => {
      const filters = buildFilters({ keyword, device, branded, country });

      const response = await searchconsole.searchanalytics.query({
        siteUrl: SITE_URL,
        requestBody: {
          startDate: isoDate(startDate),
          endDate: isoDate(endDate),
          dimensions: ["query", "page"],
          dimensionFilterGroups: filters,
          rowLimit: 25000,
          type: "web",
        },
      });

      const rows = response.data.rows || [];
      const cityMeta = CITIES.map((city) => ({
        ...city,
        terms: cityMatchTerms(city),
      }));

      const cityResults = {};
      for (const c of cityMeta) {
        cityResults[c.slug] = {
          slug: c.slug,
          name: c.name,
          population: parsePopulation(c.population),
          bestPosition: null,
          totalClicks: 0,
          totalImpressions: 0,
          ctr: 0,
          bestPage: null,
          _positionWeightedSum: 0,
          _positionImpressions: 0,
          _pageImpressions: {},
        };
      }
      cityResults["_general"] = {
        slug: "_general", name: "General (sans ville)",
        population: 0, bestPosition: null,
        totalClicks: 0, totalImpressions: 0, ctr: 0, bestPage: null,
        _positionWeightedSum: 0, _positionImpressions: 0, _pageImpressions: {},
      };

      for (const row of rows) {
        const query = row.keys[0];
        const page = row.keys[1];
        const queryCity = findQueryCity(query, cityMeta);
        const pageCity = queryCity ? null : cityMeta.find((c) => pageMatchesCity(page, c.slug));
        const matchedCity = queryCity || pageCity;

        if (matchedCity) {
          const cr = cityResults[matchedCity.slug];
          cr.totalClicks += row.clicks;
          cr.totalImpressions += row.impressions;
          cr._positionWeightedSum += row.position * row.impressions;
          cr._positionImpressions += row.impressions;
          cr._pageImpressions[page] = (cr._pageImpressions[page] || 0) + row.impressions;
        } else {
          const g = cityResults["_general"];
          g.totalClicks += row.clicks;
          g.totalImpressions += row.impressions;
          g._positionWeightedSum += row.position * row.impressions;
          g._positionImpressions += row.impressions;
          g._pageImpressions[page] = (g._pageImpressions[page] || 0) + row.impressions;
        }
      }

      // Compute CTR and representative position per city.
      for (const c of Object.values(cityResults)) {
        c.ctr = c.totalImpressions > 0
          ? Math.round((c.totalClicks / c.totalImpressions) * 1000) / 10
          : 0;
        c.bestPosition = c._positionImpressions > 0
          ? Math.round((c._positionWeightedSum / c._positionImpressions) * 10) / 10
          : null;
        c.bestPage = Object.entries(c._pageImpressions)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
        delete c._positionWeightedSum;
        delete c._positionImpressions;
        delete c._pageImpressions;
      }

      const cities = Object.values(cityResults);
      const cityOnly = cities.filter((c) => c.slug !== "_general");
      const withPosition = cityOnly.filter((c) => c.bestPosition !== null);
      const inTop1 = withPosition.filter((c) => c.bestPosition <= 1.5).length;
      const inTop3 = withPosition.filter((c) => c.bestPosition <= 3.5).length;
      const inTop10 = withPosition.filter((c) => c.bestPosition <= 10.5).length;
      const totalClicks = cities.reduce((s, c) => s + c.totalClicks, 0);
      const totalImpressions = cities.reduce((s, c) => s + c.totalImpressions, 0);
      const avgPosition = withPosition.length > 0
        ? Math.round((withPosition.reduce((s, c) => s + c.bestPosition, 0) / withPosition.length) * 10) / 10
        : null;
      const globalCtr = totalImpressions > 0
        ? Math.round((totalClicks / totalImpressions) * 1000) / 10
        : 0;

      return {
        source: "google-search-console",
        mode: "overview",
        period: { startDate: isoDate(startDate), endDate: isoDate(endDate), days },
        filters: { device, branded, country },
        summary: {
          inTop1, inTop3, inTop10,
          totalClicks, totalImpressions,
          avgPosition, ctr: globalCtr,
          citiesWithData: withPosition.length,
        },
        cities: cities.sort((a, b) => (a.bestPosition ?? 999) - (b.bestPosition ?? 999)),
      };
    });

    return NextResponse.json({ ...data, fromCache });
  } catch (err) {
    console.error("GSC API error:", err.message);
    return NextResponse.json({ error: err.message || "Erreur Google Search Console" }, { status: 500 });
  }
}
