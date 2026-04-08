import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");
    const since = new Date();
    if (days === 0) {
      since.setHours(0, 0, 0, 0);
    } else {
      since.setDate(since.getDate() - days);
    }

    // Total visitors (unique visitorIds)
    const sessions = await prisma.analyticsSession.findMany({
      where: { startedAt: { gte: since } },
      include: { pageViews: true },
    });

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
    function toMontrealDate(d) {
      return new Date(d).toLocaleDateString("en-CA", { timeZone: "America/Montreal" });
    }
    const dailyMap = {};
    for (const s of sessions) {
      const day = toMontrealDate(s.startedAt);
      if (!dailyMap[day]) dailyMap[day] = { visitors: new Set(), pageViews: 0 };
      dailyMap[day].visitors.add(s.visitorId);
      dailyMap[day].pageViews += s.pageViews.length;
    }
    const daily = [];
    const loopDays = days === 0 ? 1 : days;
    for (let i = loopDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toMontrealDate(d);
      daily.push({
        date: key,
        visitors: dailyMap[key]?.visitors.size || 0,
        pageViews: dailyMap[key]?.pageViews || 0,
      });
    }

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
          pages: s.pageViews.length,
          duration,
          startedAt: s.startedAt,
          topPages: s.pageViews.map(pv => pv.page),
        };
      }
    }
    const recentVisitors = Object.values(visitorMap)
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
      .slice(0, 20);

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
    });
  } catch (err) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
