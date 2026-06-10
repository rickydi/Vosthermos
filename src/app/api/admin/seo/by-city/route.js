import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { CITIES } from "@/lib/cities";

export const dynamic = "force-dynamic";

// Bucket de position pour le visuel.
function bucket(pos) {
  if (pos == null) return "absent";
  if (pos <= 3) return "top3";
  if (pos <= 10) return "top10";
  if (pos <= 20) return "top20";
  return "beyond";
}

// Vue d'ensemble SEO PAR VILLE : pour chaque ville, la DERNIÈRE position connue de
// chaque mot-clé (le relevé le plus récent), + agrégats. Pas de fenêtre de 30 jours
// (les scans peuvent dater) — on prend la donnée la plus fraîche disponible par couple.
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const rows = await prisma.seoRanking.findMany({
    orderBy: { checkedAt: "desc" },
    select: { city: true, cityName: true, keyword: true, position: true, url: true, checkedAt: true },
  });

  // Dernier relevé par (ville|mot-clé) — rows déjà triés desc, on garde le 1er vu.
  const seen = new Set();
  const cityMap = new Map();
  let lastCheckedAt = null;
  const summary = { top3: 0, top10: 0, top20: 0, beyond: 0, absent: 0, total: 0 };

  for (const r of rows) {
    const k = `${r.city}|${r.keyword}`;
    if (seen.has(k)) continue;
    seen.add(k);
    if (!lastCheckedAt || r.checkedAt > lastCheckedAt) lastCheckedAt = r.checkedAt;

    if (!cityMap.has(r.city)) {
      cityMap.set(r.city, {
        slug: r.city, name: r.cityName, keywords: [],
        counts: { top3: 0, top10: 0, top20: 0, beyond: 0, absent: 0 },
        best: null, lastCheckedAt: null,
      });
    }
    const c = cityMap.get(r.city);
    c.keywords.push({ keyword: r.keyword, position: r.position, url: r.url || null });
    const b = bucket(r.position);
    c.counts[b]++;
    summary[b]++;
    summary.total++;
    if (r.position != null && (c.best == null || r.position < c.best)) c.best = r.position;
    if (!c.lastCheckedAt || r.checkedAt > c.lastCheckedAt) c.lastCheckedAt = r.checkedAt;
  }

  const cities = [...cityMap.values()].map((c) => {
    const ranked = c.keywords.filter((k) => k.position != null).map((k) => k.position);
    const avg = ranked.length ? Math.round(ranked.reduce((s, p) => s + p, 0) / ranked.length) : null;
    c.keywords.sort((a, b2) => (a.position ?? 999) - (b2.position ?? 999));
    return { ...c, avg, rankedCount: ranked.length, total: c.keywords.length };
  });

  // Tri : villes avec du classement d'abord (meilleure position), absentes ensuite.
  cities.sort((a, b2) => {
    if (a.best == null && b2.best == null) return a.name.localeCompare(b2.name);
    if (a.best == null) return 1;
    if (b2.best == null) return -1;
    return a.best - b2.best;
  });

  return NextResponse.json({
    lastCheckedAt: lastCheckedAt?.toISOString() || null,
    citiesTracked: cities.length,
    citiesTargeted: CITIES.length,
    summary,
    cities,
  });
}
