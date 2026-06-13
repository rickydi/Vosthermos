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
