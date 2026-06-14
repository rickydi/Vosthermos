import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { google } from "googleapis";
import path from "path";
import fs from "fs";
import { withCache } from "@/lib/gsc-cache";

export const dynamic = "force-dynamic";

// Demande par mots-clés = Google Trends (intérêt de recherche réel, Québec,
// indice 0-100). Google bloque les serveurs (429), donc les données sont
// tirées via le navigateur de l'admin puis STOCKÉES en base (clé site_settings
// `keyword_demand_trends`). Cette route lit ce qui est stocké.
//
// EN PLUS, on calcule « ta ligne » = la VISIBILITÉ du site sur ces sujets
// (impressions Google Search Console, hors marque) — récupérable côté serveur
// (seul Trends est bloqué, pas l'API Search Console). Alignée EXACTEMENT sur la
// grille de dates des mots-clés pour comparer la saison.
const STORE_KEY = "keyword_demand_trends";
// Volumes de recherche RÉELS (moyenne mensuelle, Google Keyword Planner, région
// Montréal/QC) par clé de mot-clé : { "fenetre": 5000, "porte": 8000, ... }.
// Tirés via le navigateur (compte Google Ads) et stockés séparément des données
// Trends pour ne pas être écrasés à chaque rafraîchissement de la saisonnalité.
const VOLUME_KEY = "keyword_planner_volumes";
const SITE_URL = "https://www.vosthermos.com/";
const GSC_LAG_DAYS = 3;
const SERVICE_REGEX = "(?i)(fen.tre|porte|thermos|vitre|calfeut|moustiquaire|coupe.?froid)";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function isoDate(d) { return d.toISOString().split("T")[0]; }

async function gscClient() {
  const configPath = path.join(process.cwd(), "config", "google-service-account.json");
  if (!fs.existsSync(configPath)) throw new Error("google-service-account.json introuvable");
  const auth = new google.auth.GoogleAuth({
    keyFile: configPath,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  return google.searchconsole({ version: "v1", auth });
}

// CLICS GSC quotidiens (hors marque) sur les requêtes du métier, ~16 mois.
// On utilise les CLICS (vraies visites depuis Google) et PAS les impressions :
// les impressions = apparitions dans les résultats (même sans clic, sur des
// milliers de longue traîne) et dépassaient le volume des têtes de mots-clés,
// donnant l'illusion d'« être au-dessus de la demande ». Les clics, eux, sont
// la part réellement captée → toujours sous la demande, comme attendu.
async function fetchSelfDaily() {
  const sc = await gscClient();
  const end = new Date(); end.setDate(end.getDate() - GSC_LAG_DAYS);
  const start = new Date(end); start.setDate(start.getDate() - 489);
  const res = await sc.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: isoDate(start), endDate: isoDate(end),
      dimensions: ["date"],
      dimensionFilterGroups: [
        { filters: [{ dimension: "query", operator: "includingRegex", expression: SERVICE_REGEX }] },
        { filters: [{ dimension: "query", operator: "notContains", expression: "vosthermos" }] },
      ],
      rowLimit: 600, type: "web",
    },
  });
  const map = {};
  for (const r of res.data.rows || []) map[r.keys[0]] = Math.round(r.clicks || 0);
  return map; // { "YYYY-MM-DD": clics }
}

// Construit « ta ligne » alignée sur la grille de dates des mots-clés Trends.
// - weekly: somme des impressions de la semaine débutant à chaque date Trends
// - daily: impressions du jour
// Normalisé 0-100 (comme les indices Trends) pour superposer sur le même axe.
function buildSelfSeries(refWeekly, refDaily, selfMap) {
  const addDays = (s, n) => { const d = new Date(s + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return isoDate(d); };

  const weeklyRaw = refWeekly.map((p, i) => {
    const from = p.date;
    const to = refWeekly[i + 1]?.date || addDays(from, 7);
    let sum = 0;
    for (const [date, impr] of Object.entries(selfMap)) if (date >= from && date < to) sum += impr;
    return { date: from, raw: sum };
  });
  const dailyRaw = refDaily.map((p) => ({ date: p.date, raw: selfMap[p.date] || 0 }));

  const maxW = Math.max(...weeklyRaw.map((x) => x.raw), 1);
  const maxD = Math.max(...dailyRaw.map((x) => x.raw), 1);
  return {
    key: "_self",
    label: "Toi (clics Google)",
    self: true,
    weekly: weeklyRaw.map((x) => ({ date: x.date, value: Math.round((x.raw / maxW) * 100), raw: x.raw })),
    daily: dailyRaw.map((x) => ({ date: x.date, value: Math.round((x.raw / maxD) * 100), raw: x.raw })),
  };
}

export async function GET() {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  let data;
  try {
    const rows = await prisma.$queryRawUnsafe(`SELECT value FROM site_settings WHERE key = $1`, STORE_KEY);
    if (!rows[0]?.value) return NextResponse.json({ empty: true, source: "google-trends" });
    data = JSON.parse(rows[0].value);
  } catch (err) {
    console.error("Keyword demand read error:", err.message);
    return NextResponse.json({ error: err.message || "Erreur lecture demande" }, { status: 500 });
  }

  // Volumes réels (Keyword Planner) — attachés à chaque mot-clé si disponibles.
  // Permet au graphique d'afficher des « recherches/jour » réelles plutôt qu'un
  // simple indice 0-100. Best-effort : si absent, le graphique reste en indice.
  try {
    const vrows = await prisma.$queryRawUnsafe(`SELECT value FROM site_settings WHERE key = $1`, VOLUME_KEY);
    if (vrows[0]?.value) {
      const volumes = JSON.parse(vrows[0].value);
      const map = volumes && typeof volumes === "object" && volumes.volumes ? volumes.volumes : volumes;
      if (map && typeof map === "object") {
        data.keywords = (data.keywords || []).map((k) => ({
          ...k,
          volume: typeof map[k.key] === "number" ? map[k.key] : null,
        }));
        data.hasVolumes = data.keywords.some((k) => typeof k.volume === "number");
        if (volumes.updatedAt) data.volumesAt = volumes.updatedAt;
      }
    }
  } catch (err) {
    console.error("Keyword volumes read skipped:", err.message);
  }

  // « Ta ligne » (best-effort, en cache 1h) — alignée sur la grille des mots-clés.
  try {
    const ref = data.keywords?.[0];
    if (ref?.weekly?.length) {
      const { data: selfMap } = await withCache("self-visibility", { v: 2, metric: "clicks" }, fetchSelfDaily);
      data.self = buildSelfSeries(ref.weekly, ref.daily || [], selfMap);
    }
  } catch (err) {
    console.error("Self series skipped:", err.message);
    // on renvoie quand même les mots-clés sans « ta ligne »
  }

  return NextResponse.json(data);
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// Ingestion des données Google Trends tirées par le navigateur de l'admin.
// Authentifiée par jeton (DEMAND_INGEST_TOKEN), corps text/plain { token, payload }.
export async function POST(request) {
  const expected = process.env.DEMAND_INGEST_TOKEN;
  if (!expected) return NextResponse.json({ error: "Ingestion non configuree" }, { status: 503, headers: CORS });
  let body;
  try { body = JSON.parse(await request.text()); }
  catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400, headers: CORS }); }
  if (!body || body.token !== expected) return NextResponse.json({ error: "Jeton invalide" }, { status: 401, headers: CORS });
  const payload = body.payload;
  if (!payload || !Array.isArray(payload.keywords) || payload.keywords.length === 0)
    return NextResponse.json({ error: "Payload invalide" }, { status: 400, headers: CORS });
  try {
    const value = JSON.stringify({ ...payload, source: "google-trends" });
    await prisma.$executeRawUnsafe(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      STORE_KEY, value
    );
    return NextResponse.json({ ok: true, keywords: payload.keywords.length, bytes: value.length }, { headers: CORS });
  } catch (err) {
    console.error("Keyword demand write error:", err.message);
    return NextResponse.json({ error: err.message || "Erreur ecriture" }, { status: 500, headers: CORS });
  }
}
