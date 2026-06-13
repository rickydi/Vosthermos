import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Demande par mots-clés = Google Trends (intérêt de recherche réel, Québec,
// indice 0-100). Google bloque les serveurs (429), donc les données sont
// tirées via le navigateur de l'admin puis STOCKÉES en base (clé site_settings
// `keyword_demand_trends`). Cette route ne fait que lire ce qui est stocké —
// elle n'appelle jamais Trends (ça échouerait depuis le serveur).
const STORE_KEY = "keyword_demand_trends";

// CORS : l'ingestion (POST) est appelée depuis l'onglet trends.google.com de
// l'admin (cross-origin), authentifiée par jeton — donc on autorise *.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET() {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT value FROM site_settings WHERE key = $1`,
      STORE_KEY
    );
    if (!rows[0]?.value) {
      return NextResponse.json({ empty: true, source: "google-trends" });
    }
    const data = JSON.parse(rows[0].value);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Keyword demand read error:", err.message);
    return NextResponse.json({ error: err.message || "Erreur lecture demande" }, { status: 500 });
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

// Ingestion des données Google Trends tirées par le navigateur de l'admin.
// Authentifiée par jeton (DEMAND_INGEST_TOKEN) plutôt que par cookie, car
// l'appel vient de trends.google.com (cross-origin, sans cookie admin).
// Corps = JSON { token, payload } envoyé en text/plain (évite le préflight).
export async function POST(request) {
  const expected = process.env.DEMAND_INGEST_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "Ingestion non configuree" }, { status: 503, headers: CORS });
  }
  let body;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400, headers: CORS });
  }
  if (!body || body.token !== expected) {
    return NextResponse.json({ error: "Jeton invalide" }, { status: 401, headers: CORS });
  }
  const payload = body.payload;
  if (!payload || !Array.isArray(payload.keywords) || payload.keywords.length === 0) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400, headers: CORS });
  }
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
