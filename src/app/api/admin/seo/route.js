import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { CITIES } from "@/lib/cities";

function parsePopulation(str) {
  if (!str) return 0;
  const s = String(str).replace(/\s/g, "").toLowerCase();
  const match = s.match(/(\d+(?:[.,]\d+)?)([mk])?/);
  if (!match) return 0;
  const num = parseFloat(match[1].replace(",", "."));
  const unit = match[2];
  if (unit === "m") return Math.round(num * 1_000_000);
  if (unit === "k") return Math.round(num * 1_000);
  return Math.round(num);
}

export async function GET(request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const cityFilter = searchParams.get("city");
    const days = parseInt(searchParams.get("days") || "30");

    const since = new Date();
    since.setDate(since.getDate() - days);

    const keywordFilter = searchParams.get("keyword");
    const where = { checkedAt: { gte: since } };
    if (cityFilter) where.city = cityFilter;
    if (keywordFilter) where.keyword = { contains: keywordFilter };

    const rankings = await prisma.seoRanking.findMany({
      where,
      orderBy: { checkedAt: "desc" },
    });

    // Build population map from CITIES
    const populationMap = {};
    for (const c of CITIES) {
      populationMap[c.slug] = parsePopulation(c.population);
    }

    // Group by city
    const cityMap = {};
    for (const r of rankings) {
      if (!cityMap[r.city]) {
        cityMap[r.city] = {
          slug: r.city,
          name: r.cityName,
          population: populationMap[r.city] || 0,
          keyword: r.keyword,
          url: r.url,
          latestPosition: null,
          latestAi: false,
          history: [],
        };
      }
      cityMap[r.city].history.push({
        position: r.position,
        aiMention: r.aiMention,
        checkedAt: r.checkedAt,
      });
    }

    // Use best position from last 24h (Google results fluctuate between scans)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    for (const city of Object.values(cityMap)) {
      if (city.history.length > 0) {
        // Get entries from last 24h that have a position
        const recent = city.history.filter(
          (h) => h.position !== null && new Date(h.checkedAt) >= oneDayAgo
        );
        if (recent.length > 0) {
          // Best (lowest) position in last 24h
          city.latestPosition = Math.min(...recent.map((h) => h.position));
        } else {
          // Fallback: latest non-null position
          const withPos = city.history.find((h) => h.position !== null);
          city.latestPosition = withPos ? withPos.position : null;
        }
        city.latestAi = city.history.some((h) => h.aiMention);
        const withUrl = city.history.find((h) => h.url);
        if (withUrl) city.url = withUrl.url;
      }
    }

    return NextResponse.json({ cities: Object.values(cityMap) });
  } catch (err) {
    if (err.message === "Unauthorized")
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    console.error("SEO API error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
