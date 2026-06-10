import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { CITIES } from "@/lib/cities";
import { google } from "googleapis";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SITE_URL = "https://www.vosthermos.com/";
const LAG_DAYS = 2; // GSC a ~2 jours de retard
const WINDOW_DAYS = 28;
const MAX_GENERAL = 60; // requêtes sans ville stockées (les plus vues)

function normalize(s) {
  // NFD décompose les accents (é -> e + diacritique), puis on retire tout le non-ASCII
  // (les diacritiques) -> regex 100% ASCII, sans ambiguïté d'encodage.
  return (s || "").toLowerCase().normalize("NFD").replace(/[^\x00-\x7f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
// Noms de villes normalisés, du plus long au plus court (match le plus spécifique d'abord).
const CITY_MATCH = CITIES
  .map((c) => ({ slug: c.slug, name: c.name, norm: normalize(c.name) }))
  .filter((c) => c.norm.length >= 4)
  .sort((a, b) => b.norm.length - a.norm.length);

function matchCity(query) {
  const q = ` ${normalize(query)} `;
  for (const c of CITY_MATCH) if (q.includes(` ${c.norm} `)) return c;
  return null;
}

async function gscClient() {
  const cfg = path.join(process.cwd(), "config", "google-service-account.json");
  if (!fs.existsSync(cfg)) throw new Error("config/google-service-account.json introuvable");
  const auth = new google.auth.GoogleAuth({ keyFile: cfg, scopes: ["https://www.googleapis.com/auth/webmasters.readonly"] });
  return google.searchconsole({ version: "v1", auth });
}

async function runSnapshot() {
  const sc = await gscClient();
  const end = new Date(); end.setDate(end.getDate() - LAG_DAYS);
  const start = new Date(end); start.setDate(start.getDate() - WINDOW_DAYS);
  const iso = (d) => d.toISOString().slice(0, 10);

  const res = await sc.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: { startDate: iso(start), endDate: iso(end), dimensions: ["query"], rowLimit: 5000, dataState: "final" },
  });
  const rows = res.data.rows || [];
  const now = new Date();
  const records = [];
  const general = [];

  for (const r of rows) {
    const query = r.keys[0];
    const position = r.position == null ? null : Math.round(r.position);
    const c = matchCity(query);
    if (c) {
      records.push({ city: c.slug, cityName: c.name, keyword: query, position, aiMention: false, url: null, source: "gsc", checkedAt: now });
    } else {
      general.push({ query, position, impressions: r.impressions || 0 });
    }
  }
  general.sort((a, b) => b.impressions - a.impressions);
  for (const g of general.slice(0, MAX_GENERAL)) {
    records.push({ city: "_general", cityName: "Recherches générales", keyword: g.query, position: g.position, aiMention: false, url: null, source: "gsc", checkedAt: now });
  }

  if (records.length) await prisma.seoRanking.createMany({ data: records });
  return { totalQueries: rows.length, cityMatched: records.length - Math.min(general.length, MAX_GENERAL), generalStored: Math.min(general.length, MAX_GENERAL), stored: records.length, period: `${iso(start)} → ${iso(end)}` };
}

export async function POST(req) {
  // Auth : admin (bouton manuel) OU secret cron (?secret= ou header x-cron-secret).
  const secret = new URL(req.url).searchParams.get("secret") || req.headers.get("x-cron-secret");
  const cronOk = process.env.SEO_SNAPSHOT_SECRET && secret === process.env.SEO_SNAPSHOT_SECRET;
  if (!cronOk) {
    try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }
  }
  try {
    const summary = await runSnapshot();
    return NextResponse.json({ ok: true, ...summary });
  } catch (e) {
    console.error("[seo-snapshot]", e?.message || e);
    return NextResponse.json({ error: e?.message || "Erreur" }, { status: 500 });
  }
}
