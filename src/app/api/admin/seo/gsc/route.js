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
  const country = searchParams.get("country") || "can";

  const cacheParams = { days, keyword, city, device, branded, country };

  try {
    const searchconsole = await getSearchConsoleClient();

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

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
          dimensions: ["page"],
          dimensionFilterGroups: filters,
          rowLimit: 25000,
          type: "web",
        },
      });

      const rows = response.data.rows || [];

      const cityResults = {};
      for (const c of CITIES) {
        cityResults[c.slug] = {
          slug: c.slug,
          name: c.name,
          population: parsePopulation(c.population),
          bestPosition: null,
          totalClicks: 0,
          totalImpressions: 0,
          ctr: 0,
          bestPage: null,
        };
      }
      cityResults["_general"] = {
        slug: "_general", name: "General (sans ville)",
        population: 0, bestPosition: null,
        totalClicks: 0, totalImpressions: 0, ctr: 0, bestPage: null,
      };

      for (const row of rows) {
        const page = row.keys[0];
        let matched = false;
        for (const c of CITIES) {
          if (page.includes(`/${c.slug}`)) {
            const cr = cityResults[c.slug];
            cr.totalClicks += row.clicks;
            cr.totalImpressions += row.impressions;
            if (cr.bestPosition === null || row.position < cr.bestPosition) {
              cr.bestPosition = Math.round(row.position * 10) / 10;
              cr.bestPage = page;
            }
            matched = true;
            break;
          }
        }
        if (!matched) {
          const g = cityResults["_general"];
          g.totalClicks += row.clicks;
          g.totalImpressions += row.impressions;
          if (g.bestPosition === null || row.position < g.bestPosition) {
            g.bestPosition = Math.round(row.position * 10) / 10;
            g.bestPage = page;
          }
        }
      }

      // Compute CTR per city
      for (const c of Object.values(cityResults)) {
        c.ctr = c.totalImpressions > 0
          ? Math.round((c.totalClicks / c.totalImpressions) * 1000) / 10
          : 0;
      }

      const cities = Object.values(cityResults);
      const withPosition = cities.filter((c) => c.bestPosition !== null);
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
