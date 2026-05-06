import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { analyticsDailyKeys, analyticsDateRange, toMontrealDate } from "@/lib/analytics-date-range";

function isOutsideCanadaSession(session) {
  const country = String(session.country || "").trim().toLowerCase();
  return Boolean(country && country !== "canada");
}

function buildVisitorList(sessions) {
  const visitorMap = {};
  for (const s of sessions) {
    if (!visitorMap[s.visitorId] || new Date(s.startedAt) > new Date(visitorMap[s.visitorId].startedAt)) {
      const duration = s.endedAt ? Math.round((new Date(s.endedAt) - new Date(s.startedAt)) / 1000) : 0;
      visitorMap[s.visitorId] = {
        visitorId: s.visitorId,
        device: s.device || "Inconnu",
        browser: s.browser || "Inconnu",
        referrer: s.referrer || null,
        city: s.city || null,
        region: s.region || null,
        country: s.country || null,
        pages: s.pageViews.length,
        duration,
        startedAt: s.startedAt,
        topPages: s.pageViews.map(pv => pv.page),
      };
    }
  }

  return Object.values(visitorMap)
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
}

function buildCountryBreakdown(sessions) {
  const countryVisitors = {};
  for (const s of sessions) {
    const country = s.country || "Inconnu";
    if (!countryVisitors[country]) countryVisitors[country] = new Set();
    countryVisitors[country].add(s.visitorId);
  }

  return Object.entries(countryVisitors)
    .map(([country, visitors]) => ({ country, visitors: visitors.size }))
    .sort((a, b) => b.visitors - a.visitors);
}

export async function GET(request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const range = analyticsDateRange(searchParams);
    const showAllVisitors = searchParams.get("visitors") === "all";
    const startedAt = { gte: range.since };
    if (range.until) startedAt.lt = range.until;

    // Total visitors (unique visitorIds)
    const allSessions = await prisma.analyticsSession.findMany({
      where: { startedAt },
      include: { pageViews: true },
    });
    const outsideCanadaSessions = allSessions.filter(isOutsideCanadaSession);
    const sessions = allSessions.filter((s) => !isOutsideCanadaSession(s));

    const uniqueVisitors = new Set(sessions.map(s => s.visitorId)).size;
    const totalPageViews = sessions.reduce((sum, s) => sum + s.pageViews.length, 0);

    // Avg session duration
    const sessionsWithEnd = sessions.filter(s => s.endedAt);
    const avgDuration = sessionsWithEnd.length > 0
      ? Math.round(sessionsWithEnd.reduce((sum, s) => sum + (new Date(s.endedAt) - new Date(s.startedAt)) / 1000, 0) / sessionsWithEnd.length)
      : 0;

    // Top pages
    const pageCounts = {};
    const pageDurations = {};
    for (const s of sessions) {
      for (const pv of s.pageViews) {
        pageCounts[pv.page] = (pageCounts[pv.page] || 0) + 1;
        pageDurations[pv.page] = (pageDurations[pv.page] || 0) + pv.duration;
      }
    }
    const topPages = Object.entries(pageCounts)
      .map(([page, count]) => ({
        page,
        count,
        avgDuration: Math.round(pageDurations[page] / count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Daily visitors (use Montreal timezone for day mapping)
    const dailyMap = {};
    for (const s of sessions) {
      const day = toMontrealDate(s.startedAt);
      if (!dailyMap[day]) dailyMap[day] = { visitors: new Set(), pageViews: 0 };
      dailyMap[day].visitors.add(s.visitorId);
      dailyMap[day].pageViews += s.pageViews.length;
    }
    const daily = analyticsDailyKeys(range).map((key) => ({
      date: key,
      visitors: dailyMap[key]?.visitors.size || 0,
      pageViews: dailyMap[key]?.pageViews || 0,
    }));

    // Device breakdown (unique visitors per device)
    const deviceVisitors = {};
    for (const s of sessions) {
      const d = s.device || "Inconnu";
      if (!deviceVisitors[d]) deviceVisitors[d] = new Set();
      deviceVisitors[d].add(s.visitorId);
    }
    const devices = {};
    for (const [d, visitors] of Object.entries(deviceVisitors)) {
      devices[d] = visitors.size;
    }

    // Browser breakdown (unique visitors per browser)
    const browserVisitors = {};
    for (const s of sessions) {
      const b = s.browser || "Inconnu";
      if (!browserVisitors[b]) browserVisitors[b] = new Set();
      browserVisitors[b].add(s.visitorId);
    }
    const browsers = {};
    for (const [b, visitors] of Object.entries(browserVisitors)) {
      browsers[b] = visitors.size;
    }

    // Referrers (unique visitors per source, include direct)
    const referrerVisitors = {};
    const directVisitors = new Set();
    for (const s of sessions) {
      if (s.referrer) {
        try {
          const host = new URL(s.referrer).hostname;
          if (host.includes("vosthermos")) {
            directVisitors.add(s.visitorId);
          } else {
            if (!referrerVisitors[host]) referrerVisitors[host] = new Set();
            referrerVisitors[host].add(s.visitorId);
          }
        } catch {
          if (!referrerVisitors[s.referrer]) referrerVisitors[s.referrer] = new Set();
          referrerVisitors[s.referrer].add(s.visitorId);
        }
      } else {
        directVisitors.add(s.visitorId);
      }
    }
    const referrers = {};
    for (const [r, visitors] of Object.entries(referrerVisitors)) {
      referrers[r] = visitors.size;
    }
    const directCount = directVisitors.size;
    const topReferrers = Object.entries(referrers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([source, count]) => ({ source, count }));
    if (directCount > 0) {
      topReferrers.unshift({ source: "Direct / Aucun referrer", count: directCount });
    }

    // Recent visitors (last 20 unique)
    const allVisitors = buildVisitorList(sessions);
    const recentVisitors = showAllVisitors ? allVisitors : allVisitors.slice(0, 20);
    const outsideCanadaVisitors = buildVisitorList(outsideCanadaSessions);

    return NextResponse.json({
      uniqueVisitors,
      totalPageViews,
      avgDuration,
      topPages,
      daily,
      devices,
      browsers,
      topReferrers,
      totalSessions: sessions.length,
      recentVisitors,
      visitorListTotal: allVisitors.length,
      visitorListLimit: showAllVisitors ? null : 20,
      outsideCanada: {
        uniqueVisitors: new Set(outsideCanadaSessions.map(s => s.visitorId)).size,
        totalPageViews: outsideCanadaSessions.reduce((sum, s) => sum + s.pageViews.length, 0),
        totalSessions: outsideCanadaSessions.length,
        countries: buildCountryBreakdown(outsideCanadaSessions),
        visitors: outsideCanadaVisitors,
      },
      range: { date: range.date, days: range.days },
    });
  } catch (err) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
