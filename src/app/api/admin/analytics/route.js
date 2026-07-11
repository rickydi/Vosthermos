import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { analyticsDailyKeys, analyticsDateRange, toMontrealDate } from "@/lib/analytics-date-range";

function isOutsideCanadaSession(session) {
  const country = String(session.country || "").trim().toLowerCase();
  return Boolean(country && country !== "canada");
}

// Clic Google Ads = gclid présent (auto-tagging) ou utm cpc/ppc sur google.
function isPaidGoogle(session) {
  if (session.gclid) return true;
  const med = String(session.utmMedium || "").toLowerCase();
  const src = String(session.utmSource || "").toLowerCase();
  return (med === "cpc" || med === "ppc" || med === "paid" || med === "paidsearch") && src.includes("google");
}

function campaignDisplayName(value, campaignId) {
  const raw = String(value || "").trim();
  if (!raw) return campaignId ? `Campagne ${campaignId}` : "Campagne non identifiée";
  const knownNames = {
    "reparation-montreal": "Réparation - Montréal",
    "marque-vosthermos": "Marque - VosThermos",
    "moustiquaires-local": "Moustiquaires - Local",
    "porte-patio-piscine": "Porte-patio conforme piscine",
  };
  if (knownNames[raw.toLowerCase()]) return knownNames[raw.toLowerCase()];
  if (/^[a-z0-9_-]+$/i.test(raw)) {
    return raw
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  return raw;
}

function buildGoogleAdsAttribution(paidSessions, formSubmits) {
  const campaignMap = new Map();
  const sessionCampaignKeys = new Map();
  const paidByVisitor = new Map();
  const leadSessionIds = new Set();
  const attributedLeadVisitors = new Set();

  for (const session of paidSessions) {
    const campaignId = session.googleAdsCampaignId || null;
    const rawCampaign = session.utmCampaign || null;
    const key = campaignId
      ? `id:${campaignId}`
      : rawCampaign
        ? `name:${rawCampaign}`
        : "unknown";
    const duration = session.endedAt
      ? Math.max(0, Math.round((new Date(session.endedAt) - new Date(session.startedAt)) / 1000))
      : 0;
    const keyword = session.googleAdsKeyword || session.utmTerm || null;

    if (!campaignMap.has(key)) {
      campaignMap.set(key, {
        key,
        name: campaignDisplayName(rawCampaign, campaignId),
        campaignId,
        visitors: new Set(),
        sessions: 0,
        pageViews: 0,
        durationTotal: 0,
        durationCount: 0,
        leadVisitors: new Set(),
        submissions: 0,
        keywords: new Map(),
        adGroupIds: new Set(),
        lastSeenAt: session.startedAt,
      });
    }

    const campaign = campaignMap.get(key);
    campaign.visitors.add(session.visitorId);
    campaign.sessions += 1;
    campaign.pageViews += session.pageViews.length;
    if (duration > 0) {
      campaign.durationTotal += duration;
      campaign.durationCount += 1;
    }
    if (keyword) campaign.keywords.set(keyword, (campaign.keywords.get(keyword) || 0) + 1);
    if (session.googleAdsAdGroupId) campaign.adGroupIds.add(session.googleAdsAdGroupId);
    if (new Date(session.startedAt) > new Date(campaign.lastSeenAt)) campaign.lastSeenAt = session.startedAt;

    sessionCampaignKeys.set(session.id, key);
    if (!paidByVisitor.has(session.visitorId)) paidByVisitor.set(session.visitorId, []);
    paidByVisitor.get(session.visitorId).push(session);
  }

  for (const sessions of paidByVisitor.values()) {
    sessions.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  }

  for (const submit of formSubmits) {
    if (!submit.visitorId) continue;
    const touches = paidByVisitor.get(submit.visitorId) || [];
    const submittedAt = new Date(submit.createdAt);
    const touch = touches.find((session) => new Date(session.startedAt) <= submittedAt);
    if (!touch) continue;

    const key = sessionCampaignKeys.get(touch.id);
    const campaign = campaignMap.get(key);
    if (!campaign) continue;
    campaign.leadVisitors.add(submit.visitorId);
    campaign.submissions += 1;
    attributedLeadVisitors.add(submit.visitorId);
    leadSessionIds.add(touch.id);
  }

  const campaigns = Array.from(campaignMap.values())
    .map((campaign) => {
      const visitors = campaign.visitors.size;
      const leads = campaign.leadVisitors.size;
      const topKeyword = Array.from(campaign.keywords.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
      return {
        key: campaign.key,
        name: campaign.name,
        campaignId: campaign.campaignId,
        visitors,
        sessions: campaign.sessions,
        pageViews: campaign.pageViews,
        leads,
        submissions: campaign.submissions,
        conversionRate: visitors ? Math.round((leads / visitors) * 1000) / 10 : 0,
        avgDuration: campaign.durationCount
          ? Math.round(campaign.durationTotal / campaign.durationCount)
          : 0,
        topKeyword,
        adGroups: campaign.adGroupIds.size,
        lastSeenAt: campaign.lastSeenAt,
      };
    })
    .sort((a, b) => b.leads - a.leads || b.visitors - a.visitors || b.sessions - a.sessions);

  const detailedSessions = paidSessions.filter((session) => (
    session.googleAdsCampaignId || session.utmCampaign
  )).length;
  const recentClicks = [...paidSessions]
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
    .slice(0, 12)
    .map((session) => ({
      visitorId: session.visitorId,
      startedAt: session.startedAt,
      campaignName: campaignDisplayName(session.utmCampaign, session.googleAdsCampaignId),
      campaignId: session.googleAdsCampaignId || null,
      adGroupId: session.googleAdsAdGroupId || null,
      keyword: session.googleAdsKeyword || session.utmTerm || null,
      matchType: session.googleAdsMatchType || null,
      adsDevice: session.googleAdsDevice || null,
      network: session.googleAdsNetwork || null,
      city: session.city || null,
      region: session.region || null,
      pages: session.pageViews.length,
      duration: session.endedAt
        ? Math.max(0, Math.round((new Date(session.endedAt) - new Date(session.startedAt)) / 1000))
        : 0,
      landingPage: session.pageViews[0]?.page || null,
      lead: leadSessionIds.has(session.id),
      clickIdCaptured: Boolean(session.gclid),
    }));

  const uniquePaidVisitors = new Set(paidSessions.map((session) => session.visitorId)).size;
  return {
    visitors: uniquePaidVisitors,
    sessions: paidSessions.length,
    leads: attributedLeadVisitors.size,
    conversionRate: uniquePaidVisitors
      ? Math.round((attributedLeadVisitors.size / uniquePaidVisitors) * 1000) / 10
      : 0,
    detailedSessions,
    coverage: paidSessions.length ? Math.round((detailedSessions / paidSessions.length) * 100) : 0,
    campaigns,
    recentClicks,
  };
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
    const formCreatedAt = { gte: range.since };
    if (range.until) formCreatedAt.lt = range.until;
    const [allSessions, formSubmits] = await Promise.all([
      prisma.analyticsSession.findMany({
        where: { startedAt },
        include: { pageViews: { orderBy: { enteredAt: "asc" } } },
      }),
      prisma.analyticsFormEvent.findMany({
        where: { createdAt: formCreatedAt, action: "submit" },
        select: { visitorId: true, createdAt: true, formType: true, page: true },
      }),
    ]);
    const outsideCanadaSessions = allSessions.filter(isOutsideCanadaSession);
    const sessions = allSessions.filter((s) => !isOutsideCanadaSession(s));

    const uniqueVisitors = new Set(sessions.map(s => s.visitorId)).size;
    const totalPageViews = sessions.reduce((sum, s) => sum + s.pageViews.length, 0);

    // Visiteurs Google Ads (payant) — uniques + sessions
    const paidSessions = sessions.filter(isPaidGoogle);
    const paidVisitors = new Set(paidSessions.map((s) => s.visitorId)).size;
    const googleAds = buildGoogleAdsAttribution(paidSessions, formSubmits);

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
      if (!dailyMap[day]) dailyMap[day] = { visitors: new Set(), pageViews: 0, paid: new Set() };
      dailyMap[day].visitors.add(s.visitorId);
      dailyMap[day].pageViews += s.pageViews.length;
      if (isPaidGoogle(s)) dailyMap[day].paid.add(s.visitorId);
    }
    const daily = analyticsDailyKeys(range).map((key) => ({
      date: key,
      visitors: dailyMap[key]?.visitors.size || 0,
      pageViews: dailyMap[key]?.pageViews || 0,
      paid: dailyMap[key]?.paid.size || 0,
    }));

    // Série HORAIRE quand la période couvre une seule journée (vue « Aujourd'hui »
    // ou date précise) — avant, cette vue n'avait aucun graphique.
    let hourly = null;
    if (range.date || range.days === 0) {
      const hourFmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Montreal",
        hour12: false,
        hour: "2-digit",
      });
      const hourlyMap = {};
      for (const s of sessions) {
        const h = parseInt(hourFmt.format(new Date(s.startedAt)), 10) % 24;
        if (!hourlyMap[h]) hourlyMap[h] = { visitors: new Set(), pageViews: 0, paid: new Set() };
        hourlyMap[h].visitors.add(s.visitorId);
        hourlyMap[h].pageViews += s.pageViews.length;
        if (isPaidGoogle(s)) hourlyMap[h].paid.add(s.visitorId);
      }
      hourly = Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        visitors: hourlyMap[h]?.visitors.size || 0,
        pageViews: hourlyMap[h]?.pageViews || 0,
        paid: hourlyMap[h]?.paid.size || 0,
      }));
    }

    // Période PRÉCÉDENTE de même longueur — pour afficher les deltas (↑ +12 %)
    // sur les KPI. « Aujourd'hui » se compare à hier à la même heure.
    let prev = null;
    try {
      let prevSince;
      let prevUntil;
      let prevLabel;
      if (range.days === 0) {
        prevSince = new Date(range.since.getTime() - 86400000);
        prevUntil = new Date((range.until || new Date()).getTime() - 86400000);
        prevLabel = "hier, même heure";
      } else if (range.date) {
        prevSince = new Date(range.since.getTime() - 86400000);
        prevUntil = range.since;
        prevLabel = "le jour précédent";
      } else {
        prevSince = new Date(range.since.getTime() - range.days * 86400000);
        prevUntil = range.since;
        prevLabel = `les ${range.days} j précédents`;
      }
      const prevSessions = await prisma.analyticsSession.findMany({
        where: { startedAt: { gte: prevSince, lt: prevUntil } },
        select: {
          visitorId: true,
          startedAt: true,
          endedAt: true,
          country: true,
          gclid: true,
          utmSource: true,
          utmMedium: true,
          _count: { select: { pageViews: true } },
        },
      });
      const prevKept = prevSessions.filter((s) => !isOutsideCanadaSession(s));
      const prevWithEnd = prevKept.filter((s) => s.endedAt);
      prev = {
        label: prevLabel,
        uniqueVisitors: new Set(prevKept.map((s) => s.visitorId)).size,
        totalPageViews: prevKept.reduce((sum, s) => sum + s._count.pageViews, 0),
        totalSessions: prevKept.length,
        paidVisitors: new Set(prevKept.filter(isPaidGoogle).map((s) => s.visitorId)).size,
        avgDuration: prevWithEnd.length
          ? Math.round(prevWithEnd.reduce((sum, s) => sum + (new Date(s.endedAt) - new Date(s.startedAt)) / 1000, 0) / prevWithEnd.length)
          : 0,
      };
    } catch {
      prev = null;
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
    const allVisitors = buildVisitorList(sessions);
    const recentVisitors = showAllVisitors ? allVisitors : allVisitors.slice(0, 20);
    const outsideCanadaVisitors = buildVisitorList(outsideCanadaSessions);

    return NextResponse.json({
      uniqueVisitors,
      totalPageViews,
      avgDuration,
      paidVisitors,
      paidSessions: paidSessions.length,
      googleAds,
      topPages,
      daily,
      hourly,
      prev,
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
