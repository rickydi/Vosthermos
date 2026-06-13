import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { google } from "googleapis";
import path from "path";
import fs from "fs";
import { withCache } from "@/lib/gsc-cache";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.vosthermos.com/";
const GSC_DATA_LAG_DAYS = 2;
const BRAND_TERM = "vosthermos";

// Demande par mots-clés = vraies impressions Google Search Console sur les
// recherches du métier (combien de fois ces recherches ont eu lieu et ont
// affiché le site), hors marque. Le "." dans fen.tre couvre fenetre ET fenêtre.
// (?i) = insensible à la casse. C'est de la demande réelle, pas une estimation.
const THEMES = [
  { key: "fenetre", label: "Fenêtre", regex: "(?i)fen.tre" },
  { key: "porte", label: "Porte", regex: "(?i)porte" },
  { key: "thermos", label: "Thermos / vitre", regex: "(?i)(thermos|vitre)" },
  { key: "calfeutrage", label: "Calfeutrage", regex: "(?i)calfeut" },
  { key: "moustiquaire", label: "Moustiquaire", regex: "(?i)moustiquaire" },
  { key: "coupe-froid", label: "Coupe-froid", regex: "(?i)coupe.?froid" },
];
const TOTAL_REGEX = "(?i)(fen.tre|porte|thermos|vitre|calfeut|moustiquaire|coupe.?froid)";

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

// GET /api/admin/analytics/sector
// Renvoie la demande quotidienne (16 mois) — total + par thème de mot-clé.
// Le frontend agrège ensuite en jour / semaine / mois.
export async function GET(request) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  try {
    const { fromCache, data } = await withCache("keyword-demand", { v: 3 }, async () => {
      const searchconsole = await getSearchConsoleClient();

      const end = new Date();
      end.setDate(end.getDate() - GSC_DATA_LAG_DAYS);
      const start = new Date(end);
      start.setDate(start.getDate() - 489); // ~16 mois (max GSC)

      const queryFor = async (regex) => {
        const res = await searchconsole.searchanalytics.query({
          siteUrl: SITE_URL,
          requestBody: {
            startDate: isoDate(start),
            endDate: isoDate(end),
            dimensions: ["date"],
            dimensionFilterGroups: [
              { filters: [{ dimension: "query", operator: "includingRegex", expression: regex }] },
              { filters: [{ dimension: "query", operator: "notContains", expression: BRAND_TERM }] },
            ],
            rowLimit: 600,
            type: "web",
          },
        });
        const out = {};
        for (const r of res.data.rows || []) out[r.keys[0]] = Math.round(r.impressions || 0);
        return out;
      };

      // 1 requête "total" (dédupliquée par GSC) + 1 par thème (chevauchements OK
      // pour la vue par thème). Mis en cache 1h via withCache.
      const totalMap = await queryFor(TOTAL_REGEX);
      const themeMaps = {};
      for (const t of THEMES) themeMaps[t.key] = await queryFor(t.regex);

      // Liste ordonnée des dates couvertes par les données.
      const allDates = new Set(Object.keys(totalMap));
      for (const t of THEMES) for (const d of Object.keys(themeMaps[t.key])) allDates.add(d);
      const dates = [...allDates].sort();

      const total = dates.map((date) => ({ date, impressions: totalMap[date] || 0 }));
      const themes = THEMES.map((t) => ({
        key: t.key,
        label: t.label,
        daily: dates.map((date) => ({ date, impressions: themeMaps[t.key][date] || 0 })),
        sum: dates.reduce((s, date) => s + (themeMaps[t.key][date] || 0), 0),
      }));

      return {
        source: "google-search-console",
        note: "Impressions Google Search Console (recherches affichant le site), hors marque.",
        range: { start: isoDate(start), end: isoDate(end) },
        total,
        themes,
      };
    });

    return NextResponse.json({ ...data, fromCache });
  } catch (err) {
    console.error("Keyword demand error:", err.message);
    return NextResponse.json({ error: err.message || "Erreur demande mots-clés" }, { status: 500 });
  }
}
