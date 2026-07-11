import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

function isPaidGoogle(session) {
  if (session.gclid) return true;
  const medium = String(session.utmMedium || "").toLowerCase();
  const source = String(session.utmSource || "").toLowerCase();
  return ["cpc", "ppc", "paid", "paidsearch"].includes(medium) && source.includes("google");
}

function campaignDisplayName(value, campaignId) {
  const raw = String(value || "").trim();
  const knownNames = {
    "reparation-montreal": "Réparation - Montréal",
    "marque-vosthermos": "Marque - VosThermos",
    "moustiquaires-local": "Moustiquaires - Local",
    "porte-patio-piscine": "Porte-patio conforme piscine",
  };
  if (knownNames[raw.toLowerCase()]) return knownNames[raw.toLowerCase()];
  if (raw) return raw;
  return campaignId ? `Campagne ${campaignId}` : null;
}

export async function GET(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const sessions = await prisma.analyticsSession.findMany({
      where: { visitorId: id },
      include: {
        pageViews: { orderBy: { enteredAt: "asc" } },
      },
      orderBy: { startedAt: "desc" },
    });

    if (sessions.length === 0) {
      return NextResponse.json({ error: "Visiteur non trouve" }, { status: 404 });
    }

    const totalPages = sessions.reduce((sum, s) => sum + s.pageViews.length, 0);
    const totalDuration = sessions.reduce((sum, s) => {
      if (s.endedAt) return sum + (new Date(s.endedAt) - new Date(s.startedAt)) / 1000;
      return sum;
    }, 0);
    const latestGoogleAdsSession = sessions.find(isPaidGoogle) || null;

    return NextResponse.json({
      visitorId: id,
      sessionCount: sessions.length,
      totalPages,
      totalDuration: Math.round(totalDuration),
      googleAds: latestGoogleAdsSession ? {
        campaignName: campaignDisplayName(
          latestGoogleAdsSession.utmCampaign,
          latestGoogleAdsSession.googleAdsCampaignId
        ),
        campaignId: latestGoogleAdsSession.googleAdsCampaignId || null,
        adGroupId: latestGoogleAdsSession.googleAdsAdGroupId || null,
        keyword: latestGoogleAdsSession.googleAdsKeyword || latestGoogleAdsSession.utmTerm || null,
        matchType: latestGoogleAdsSession.googleAdsMatchType || null,
        network: latestGoogleAdsSession.googleAdsNetwork || null,
        adsDevice: latestGoogleAdsSession.googleAdsDevice || null,
        clickIdCaptured: Boolean(latestGoogleAdsSession.gclid),
      } : null,
      sessions: sessions.map((s) => ({
        id: s.id,
        device: s.device,
        browser: s.browser,
        referrer: s.referrer,
        campaignName: s.utmCampaign,
        campaignId: s.googleAdsCampaignId,
        adGroupId: s.googleAdsAdGroupId,
        keyword: s.googleAdsKeyword || s.utmTerm,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        events: s.pageViews.map((pv) => ({
          id: pv.id,
          page: pv.page,
          enteredAt: pv.enteredAt,
          duration: pv.duration,
        })),
      })),
    });
  } catch (err) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
