import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { google } from "googleapis";
import { CITIES } from "@/lib/cities";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

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

// GET /api/admin/seo/gsc
// ?days=28           — period
// ?keyword=thermos   — optional query filter
// ?city=delson       — optional: returns query-level detail for that city only
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

  try {
    const searchconsole = await getSearchConsoleClient();

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const formatDate = (d) => d.toISOString().split("T")[0];

    // ─── Mode detail par ville ───────────────────────────────────
    if (city) {
      const dimensionFilterGroups = [{
        filters: [{ dimension: "page", operator: "contains", expression: `/${city}` }],
      }];
      if (keyword) {
        dimensionFilterGroups.push({
          filters: [{ dimension: "query", operator: "contains", expression: keyword }],
        });
      }

      const response = await searchconsole.searchanalytics.query({
        siteUrl: "https://www.vosthermos.com/",
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
      const queries = rows.map(row => ({
        query: row.keys[0],
        page: row.keys[1],
        clicks: row.clicks,
        impressions: row.impressions,
        position: Math.round(row.position * 10) / 10,
        ctr: Math.round(row.ctr * 1000) / 10,
      }));

      const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
      const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);
      const bestPosition = rows.length > 0
        ? Math.round(Math.min(...rows.map(r => r.position)) * 10) / 10
        : null;

      return NextResponse.json({
        source: "google-search-console",
        mode: "city-detail",
        city,
        period: { startDate: formatDate(startDate), endDate: formatDate(endDate), days },
        totalClicks,
        totalImpressions,
        bestPosition,
        queries,
      });
    }

    // ─── Mode overview (toutes les villes) ───────────────────────
    // Dimension ["page"] seulement = ~200-300 lignes (1 par page URL)
    // Beaucoup plus fiable que ["query", "page"] qui explose la limite
    const dimensionFilterGroups = [];
    if (keyword) {
      dimensionFilterGroups.push({
        filters: [{ dimension: "query", operator: "contains", expression: keyword }],
      });
    }

    const response = await searchconsole.searchanalytics.query({
      siteUrl: "https://www.vosthermos.com/",
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ["page"],
        dimensionFilterGroups,
        rowLimit: 25000,
        type: "web",
      },
    });

    const rows = response.data.rows || [];

    // Initialize all cities
    const cityResults = {};
    for (const c of CITIES) {
      cityResults[c.slug] = {
        slug: c.slug,
        name: c.name,
        bestPosition: null,
        totalClicks: 0,
        totalImpressions: 0,
        bestPage: null,
      };
    }
    cityResults["_general"] = {
      slug: "_general",
      name: "General (sans ville)",
      bestPosition: null,
      totalClicks: 0,
      totalImpressions: 0,
      bestPage: null,
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
      mode: "overview",
      period: { startDate: formatDate(startDate), endDate: formatDate(endDate), days },
      summary: { inTop1, inTop3, inTop10, totalClicks, totalImpressions, avgPosition, citiesWithData: withPosition.length },
      cities: cities.sort((a, b) => (a.bestPosition ?? 999) - (b.bestPosition ?? 999)),
    });
  } catch (err) {
    console.error("GSC API error:", err.message);
    return NextResponse.json({ error: err.message || "Erreur Google Search Console" }, { status: 500 });
  }
}
