import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { google } from "googleapis";
import { CITIES } from "@/lib/cities";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

async function getSearchConsoleClient() {
  // Try to load service account from config file
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

// GET: fetch real ranking data from Google Search Console
export async function GET(request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "28");
  const keyword = searchParams.get("keyword") || "";

  try {
    const searchconsole = await getSearchConsoleClient();

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // GSC data is delayed ~2 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const formatDate = (d) => d.toISOString().split("T")[0];

    // Query Search Console for all queries containing our keywords, grouped by query + page
    const dimensionFilterGroups = [];
    if (keyword) {
      dimensionFilterGroups.push({
        filters: [{
          dimension: "query",
          operator: "contains",
          expression: keyword,
        }],
      });
    }

    const response = await searchconsole.searchanalytics.query({
      siteUrl: "https://vosthermos.com/",
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ["query", "page"],
        dimensionFilterGroups,
        rowLimit: 5000,
        type: "web",
      },
    });

    const rows = response.data.rows || [];

    // Map city slugs to names for matching
    const cityMap = {};
    for (const city of CITIES) {
      cityMap[city.slug] = city.name;
      // Also match by city name in lowercase for query matching
      cityMap[city.name.toLowerCase()] = city.name;
    }

    // Group results by city
    const cityResults = {};
    for (const city of CITIES) {
      cityResults[city.slug] = {
        slug: city.slug,
        name: city.name,
        queries: [],
        bestPosition: null,
        totalClicks: 0,
        totalImpressions: 0,
        avgPosition: null,
        bestQuery: null,
        bestPage: null,
      };
    }

    for (const row of rows) {
      const query = row.keys[0].toLowerCase();
      const page = row.keys[1];

      // Match to a city
      for (const city of CITIES) {
        const cityNameLower = city.name.toLowerCase();
        if (query.includes(cityNameLower) || page.includes(`/${city.slug}`)) {
          const c = cityResults[city.slug];
          c.totalClicks += row.clicks;
          c.totalImpressions += row.impressions;

          c.queries.push({
            query: row.keys[0],
            page,
            clicks: row.clicks,
            impressions: row.impressions,
            position: Math.round(row.position * 10) / 10,
            ctr: Math.round(row.ctr * 1000) / 10,
          });

          if (c.bestPosition === null || row.position < c.bestPosition) {
            c.bestPosition = Math.round(row.position * 10) / 10;
            c.bestQuery = row.keys[0];
            c.bestPage = page;
          }
          break;
        }
      }
    }

    // Calculate avg position per city
    for (const city of Object.values(cityResults)) {
      if (city.queries.length > 0) {
        const totalWeightedPos = city.queries.reduce((sum, q) => sum + q.position * q.impressions, 0);
        const totalImpressions = city.queries.reduce((sum, q) => sum + q.impressions, 0);
        city.avgPosition = totalImpressions > 0 ? Math.round((totalWeightedPos / totalImpressions) * 10) / 10 : null;
      }
    }

    // Summary stats
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

    return NextResponse.json({
      source: "google-search-console",
      period: { startDate: formatDate(startDate), endDate: formatDate(endDate), days },
      summary: { inTop1, inTop3, inTop10, totalClicks, totalImpressions, avgPosition, citiesWithData: withPosition.length },
      cities: cities.sort((a, b) => (a.bestPosition ?? 999) - (b.bestPosition ?? 999)),
    });
  } catch (err) {
    console.error("GSC API error:", err.message);
    return NextResponse.json({ error: err.message || "Erreur Google Search Console" }, { status: 500 });
  }
}
