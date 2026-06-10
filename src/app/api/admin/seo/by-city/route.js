import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { CITIES } from "@/lib/cities";

export const dynamic = "force-dynamic";

function bucket(pos) {
  if (pos == null) return "absent";
  if (pos <= 3) return "top3";
  if (pos <= 10) return "top10";
  if (pos <= 20) return "top20";
  return "beyond";
}

// Vue d'ensemble SEO PAR VILLE, basée sur les captures Google Search Console (source=gsc).
// Compare la dernière capture à la précédente pour la tendance par ville.
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const rows = await prisma.seoRanking.findMany({
    where: { source: "gsc" },
    orderBy: { checkedAt: "desc" },
    select: { city: true, cityName: true, keyword: true, position: true, url: true, checkedAt: true },
  });

  if (!rows.length) {
    return NextResponse.json({ lastCheckedAt: null, citiesTracked: 0, citiesTargeted: CITIES.length, summary: { top3: 0, top10: 0, top20: 0, beyond: 0, absent: 0, total: 0 }, cities: [], hasData: false });
  }

  // Captures distinctes (chaque snapshot = un checkedAt commun).
  const tsList = [...new Set(rows.map((r) => r.checkedAt.getTime()))].sort((a, b) => b - a);
  const curTs = tsList[0];
  const prevTs = tsList[1] ?? null;
  const cur = rows.filter((r) => r.checkedAt.getTime() === curTs);
  const prev = prevTs ? rows.filter((r) => r.checkedAt.getTime() === prevTs) : [];

  // Meilleure position par ville à la capture précédente (pour la tendance).
  const prevBest = {};
  for (const r of prev) {
    if (r.position != null && (prevBest[r.city] == null || r.position < prevBest[r.city])) prevBest[r.city] = r.position;
  }

  const cityMap = new Map();
  const summary = { top3: 0, top10: 0, top20: 0, beyond: 0, absent: 0, total: 0 };
  for (const r of cur) {
    if (!cityMap.has(r.city)) {
      cityMap.set(r.city, { slug: r.city, name: r.cityName, keywords: [], counts: { top3: 0, top10: 0, top20: 0, beyond: 0, absent: 0 }, best: null });
    }
    const c = cityMap.get(r.city);
    c.keywords.push({ keyword: r.keyword, position: r.position, url: r.url || null });
    const b = bucket(r.position);
    c.counts[b]++;
    summary[b]++;
    summary.total++;
    if (r.position != null && (c.best == null || r.position < c.best)) c.best = r.position;
  }

  const cities = [...cityMap.values()].map((c) => {
    const ranked = c.keywords.filter((k) => k.position != null).map((k) => k.position);
    const avg = ranked.length ? Math.round(ranked.reduce((s, p) => s + p, 0) / ranked.length) : null;
    c.keywords.sort((a, b2) => (a.position ?? 999) - (b2.position ?? 999));
    const pb = prevBest[c.slug];
    const trend = pb != null && c.best != null ? pb - c.best : null; // + = gagné des positions
    return { ...c, avg, rankedCount: ranked.length, total: c.keywords.length, trend };
  });

  cities.sort((a, b2) => {
    if (a.slug === "_general") return -1; // "Recherches générales" en premier
    if (b2.slug === "_general") return 1;
    if (a.best == null && b2.best == null) return a.name.localeCompare(b2.name);
    if (a.best == null) return 1;
    if (b2.best == null) return -1;
    return a.best - b2.best;
  });

  return NextResponse.json({
    lastCheckedAt: new Date(curTs).toISOString(),
    snapshotCount: tsList.length,
    citiesTracked: cities.filter((c) => c.slug !== "_general").length,
    citiesTargeted: CITIES.length,
    summary,
    cities,
    hasData: true,
  });
}
