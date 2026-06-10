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
const EMPTY = { top3: 0, top10: 0, top20: 0, beyond: 0, absent: 0 };

// Position MOYENNE PONDÉRÉE par impressions = où tu es réellement vu, pondéré par le
// volume de recherche (une requête bidon à 1 impression ne fausse plus le portrait).
function weightedPosition(keywords) {
  let wSum = 0, iSum = 0;
  for (const k of keywords) {
    if (k.position == null) continue;
    const w = k.impressions > 0 ? k.impressions : 1;
    wSum += k.position * w;
    iSum += w;
  }
  return iSum > 0 ? Math.round((wSum / iSum) * 10) / 10 : null;
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const rows = await prisma.seoRanking.findMany({
    where: { source: "gsc" },
    orderBy: { checkedAt: "desc" },
    select: { city: true, cityName: true, keyword: true, position: true, impressions: true, checkedAt: true },
  });

  if (!rows.length) {
    return NextResponse.json({ lastCheckedAt: null, citiesTracked: 0, citiesTargeted: CITIES.length, summary: { ...EMPTY, total: 0 }, cities: [], hasData: false });
  }

  const tsList = [...new Set(rows.map((r) => r.checkedAt.getTime()))].sort((a, b) => b - a);
  const curTs = tsList[0];
  const prevTs = tsList[1] ?? null;
  const cur = rows.filter((r) => r.checkedAt.getTime() === curTs);
  const prev = prevTs ? rows.filter((r) => r.checkedAt.getTime() === prevTs) : [];

  // Position pondérée par ville à la capture précédente (pour la tendance).
  const prevByCity = {};
  for (const r of prev) {
    (prevByCity[r.city] = prevByCity[r.city] || []).push(r);
  }
  const prevWeighted = {};
  for (const [city, ks] of Object.entries(prevByCity)) prevWeighted[city] = weightedPosition(ks);

  const cityMap = new Map();
  const summaryImpr = { ...EMPTY };
  let totalImpr = 0;
  for (const r of cur) {
    if (!cityMap.has(r.city)) cityMap.set(r.city, { slug: r.city, name: r.cityName, keywords: [] });
    cityMap.get(r.city).keywords.push({ keyword: r.keyword, position: r.position, impressions: r.impressions });
    summaryImpr[bucket(r.position)] += r.impressions;
    totalImpr += r.impressions;
  }

  const cities = [...cityMap.values()].map((c) => {
    c.keywords.sort((a, b2) => b2.impressions - a.impressions); // les plus cherchées d'abord
    const withPos = c.keywords.filter((k) => k.position != null);
    const wpos = weightedPosition(c.keywords);
    const top = withPos[0] || c.keywords[0] || null; // requête principale (plus d'impressions)
    const cityImpr = c.keywords.reduce((s, k) => s + k.impressions, 0);
    const impr = { ...EMPTY };
    for (const k of c.keywords) impr[bucket(k.position)] += k.impressions;
    const pw = prevWeighted[c.slug];
    const trend = pw != null && wpos != null ? Math.round((pw - wpos) * 10) / 10 : null; // + = gagné
    return {
      slug: c.slug, name: c.name,
      weightedPos: wpos,
      topQuery: top ? { keyword: top.keyword, position: top.position, impressions: top.impressions } : null,
      impressions: cityImpr,
      keywords: c.keywords,
      impr,
      trend,
      total: c.keywords.length,
    };
  });

  cities.sort((a, b2) => {
    if (a.slug === "_general") return -1;
    if (b2.slug === "_general") return 1;
    // par volume d'impressions desc (les villes qui comptent en premier)
    return b2.impressions - a.impressions;
  });

  return NextResponse.json({
    lastCheckedAt: new Date(curTs).toISOString(),
    snapshotCount: tsList.length,
    citiesTracked: cities.filter((c) => c.slug !== "_general").length,
    citiesTargeted: CITIES.length,
    totalImpressions: totalImpr,
    summary: { ...summaryImpr, total: totalImpr }, // pondéré par impressions
    cities,
    hasData: true,
  });
}
