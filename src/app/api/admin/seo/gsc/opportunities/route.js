import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { google } from "googleapis";
import path from "path";
import fs from "fs";
import { withCache } from "@/lib/gsc-cache";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.vosthermos.com/";
const BRAND_TERM = "vosthermos";

async function getSearchConsoleClient() {
  const configPath = path.join(process.cwd(), "config", "google-service-account.json");
  if (!fs.existsSync(configPath)) throw new Error("Fichier config/google-service-account.json introuvable");
  const auth = new google.auth.GoogleAuth({
    keyFile: configPath,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  return google.searchconsole({ version: "v1", auth });
}

function isoDate(d) { return d.toISOString().split("T")[0]; }

// Target CTR by position bucket (rough industry estimates)
function targetCtrForTop3() { return 0.18; } // 18% avg for top 3

// GET /api/admin/seo/gsc/opportunities
//   ?days=28 (default)
//   ?minImpr=50
//   ?maxPos=20 (default — above this = too far for quick win)
//   ?minPos=4  (default — below this = already top 3)
//   ?device=ALL|DESKTOP|MOBILE|TABLET
//   ?branded=all|exclude|only
//   ?country=can
export async function GET(request) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "28");
  const minImpr = parseInt(searchParams.get("minImpr") || "50");
  const maxPos = parseFloat(searchParams.get("maxPos") || "20");
  const minPos = parseFloat(searchParams.get("minPos") || "4");
  const device = (searchParams.get("device") || "ALL").toUpperCase();
  const branded = searchParams.get("branded") || "exclude"; // default exclude = focus acquisition
  const country = searchParams.get("country") || "can";

  const cacheParams = { days, minImpr, maxPos, minPos, device, branded, country };

  try {
    const searchconsole = await getSearchConsoleClient();
    const endDate = new Date(); endDate.setDate(endDate.getDate() - 1);
    const startDate = new Date(); startDate.setDate(startDate.getDate() - days);

    const { fromCache, data } = await withCache("opportunities", cacheParams, async () => {
      const filters = [];
      if (device !== "ALL") filters.push({ filters: [{ dimension: "device", operator: "equals", expression: device }] });
      if (country) filters.push({ filters: [{ dimension: "country", operator: "equals", expression: country }] });
      if (branded === "exclude") filters.push({ filters: [{ dimension: "query", operator: "notContains", expression: BRAND_TERM }] });
      else if (branded === "only") filters.push({ filters: [{ dimension: "query", operator: "contains", expression: BRAND_TERM }] });

      const res = await searchconsole.searchanalytics.query({
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

      const rows = res.data.rows || [];
      const opportunities = [];

      for (const r of rows) {
        if (r.impressions < minImpr) continue;
        if (r.position < minPos || r.position > maxPos) continue;

        const currentCtr = r.ctr;
        const target = targetCtrForTop3();
        const potentialClicks = Math.max(0, Math.round(r.impressions * (target - currentCtr)));
        const gainRatio = r.clicks > 0 ? potentialClicks / r.clicks : potentialClicks;

        opportunities.push({
          query: r.keys[0],
          page: r.keys[1],
          position: Math.round(r.position * 10) / 10,
          impressions: r.impressions,
          clicks: r.clicks,
          ctr: Math.round(r.ctr * 1000) / 10,
          potentialClicks,
          gainRatio: Math.round(gainRatio * 10) / 10,
        });
      }

      opportunities.sort((a, b) => b.potentialClicks - a.potentialClicks);

      return {
        source: "google-search-console",
        period: { startDate: isoDate(startDate), endDate: isoDate(endDate), days },
        filters: { device, branded, country, minImpr, minPos, maxPos },
        total: opportunities.length,
        opportunities: opportunities.slice(0, 30),
      };
    });

    return NextResponse.json({ ...data, fromCache });
  } catch (err) {
    console.error("GSC opportunities error:", err.message);
    return NextResponse.json({ error: err.message || "Erreur GSC" }, { status: 500 });
  }
}
