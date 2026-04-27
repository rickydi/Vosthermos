import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { google } from "googleapis";
import path from "path";
import fs from "fs";
import { withCache } from "@/lib/gsc-cache";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.vosthermos.com/";
const BRAND_TERM = "vosthermos";
const GSC_DATA_LAG_DAYS = 2;

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

// GET /api/admin/seo/gsc/trends
//   ?window=7   (default — days in each window)
//   ?device=ALL|DESKTOP|MOBILE|TABLET
//   ?branded=all|exclude|only
//   ?country=can (optional; omitted = all countries)
// Returns rising and falling queries between current window and previous window.
export async function GET(request) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(request.url);
  const windowDays = parseInt(searchParams.get("window") || "7");
  const device = (searchParams.get("device") || "ALL").toUpperCase();
  const branded = searchParams.get("branded") || "all";
  const country = searchParams.get("country") || "";

  const cacheParams = { windowDays, device, branded, country };

  try {
    const searchconsole = await getSearchConsoleClient();

    const endCurrent = new Date(); endCurrent.setDate(endCurrent.getDate() - GSC_DATA_LAG_DAYS);
    const startCurrent = new Date(endCurrent); startCurrent.setDate(startCurrent.getDate() - (windowDays - 1));
    const endPrev = new Date(startCurrent); endPrev.setDate(endPrev.getDate() - 1);
    const startPrev = new Date(endPrev); startPrev.setDate(startPrev.getDate() - (windowDays - 1));

    const { fromCache, data } = await withCache("trends", cacheParams, async () => {
      const filters = [];
      if (device !== "ALL") filters.push({ filters: [{ dimension: "device", operator: "equals", expression: device }] });
      if (country) filters.push({ filters: [{ dimension: "country", operator: "equals", expression: country }] });
      if (branded === "exclude") filters.push({ filters: [{ dimension: "query", operator: "notContains", expression: BRAND_TERM }] });
      else if (branded === "only") filters.push({ filters: [{ dimension: "query", operator: "contains", expression: BRAND_TERM }] });

      const queryArgs = (start, end) => ({
        siteUrl: SITE_URL,
        requestBody: {
          startDate: isoDate(start),
          endDate: isoDate(end),
          dimensions: ["query", "page"],
          dimensionFilterGroups: filters,
          rowLimit: 25000,
          type: "web",
        },
      });

      const [currentRes, prevRes] = await Promise.all([
        searchconsole.searchanalytics.query(queryArgs(startCurrent, endCurrent)),
        searchconsole.searchanalytics.query(queryArgs(startPrev, endPrev)),
      ]);

      const index = new Map(); // key -> {current, previous}
      const key = (r) => `${r.keys[0]}||${r.keys[1]}`;

      for (const r of currentRes.data.rows || []) {
        index.set(key(r), { current: r, previous: null });
      }
      for (const r of prevRes.data.rows || []) {
        const k = key(r);
        const existing = index.get(k);
        if (existing) existing.previous = r;
        else index.set(k, { current: null, previous: r });
      }

      const entries = [];
      for (const [k, { current, previous }] of index) {
        const q = (current || previous).keys[0];
        const p = (current || previous).keys[1];
        const c = current || { clicks: 0, impressions: 0, position: null, ctr: 0 };
        const pr = previous || { clicks: 0, impressions: 0, position: null, ctr: 0 };
        entries.push({
          query: q,
          page: p,
          clicksNow: c.clicks || 0,
          clicksPrev: pr.clicks || 0,
          deltaClicks: (c.clicks || 0) - (pr.clicks || 0),
          imprNow: c.impressions || 0,
          imprPrev: pr.impressions || 0,
          deltaImpr: (c.impressions || 0) - (pr.impressions || 0),
          posNow: c.position != null ? Math.round(c.position * 10) / 10 : null,
          posPrev: pr.position != null ? Math.round(pr.position * 10) / 10 : null,
          // deltaPos: positive = improved rank (lower number)
          deltaPos: (c.position != null && pr.position != null)
            ? Math.round((pr.position - c.position) * 10) / 10
            : null,
        });
      }

      // Rising: biggest positive deltaClicks (with tie-breaker by deltaImpr)
      const rising = [...entries]
        .filter((e) => e.deltaClicks > 0 || (e.deltaClicks === 0 && e.deltaImpr > 5))
        .sort((a, b) => b.deltaClicks - a.deltaClicks || b.deltaImpr - a.deltaImpr)
        .slice(0, 15);

      // Falling: biggest negative deltaClicks
      const falling = [...entries]
        .filter((e) => e.deltaClicks < 0 || (e.deltaClicks === 0 && e.deltaImpr < -5))
        .sort((a, b) => a.deltaClicks - b.deltaClicks || a.deltaImpr - b.deltaImpr)
        .slice(0, 15);

      return {
        source: "google-search-console",
        windows: {
          current: { start: isoDate(startCurrent), end: isoDate(endCurrent) },
          previous: { start: isoDate(startPrev), end: isoDate(endPrev) },
          days: windowDays,
        },
        filters: { device, branded, country },
        totalTracked: entries.length,
        rising,
        falling,
      };
    });

    return NextResponse.json({ ...data, fromCache });
  } catch (err) {
    console.error("GSC trends error:", err.message);
    return NextResponse.json({ error: err.message || "Erreur GSC" }, { status: 500 });
  }
}
