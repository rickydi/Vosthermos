import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { analyticsDateRange } from "@/lib/analytics-date-range";

function isOutsideCanadaSession(session) {
  const country = String(session.country || "").trim().toLowerCase();
  return Boolean(country && country !== "canada");
}

export async function GET(request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const range = analyticsDateRange(searchParams);
    const createdAt = { gte: range.since };
    if (range.until) createdAt.lt = range.until;

    const [rawEvents, sessions] = await Promise.all([
      prisma.analyticsFormEvent.findMany({
        where: { createdAt },
        orderBy: { createdAt: "desc" },
      }),
      prisma.analyticsSession.findMany({
        where: { startedAt: createdAt },
        select: { visitorId: true, country: true },
      }),
    ]);

    const outsideCanadaVisitorIds = new Set(
      sessions
        .filter(isOutsideCanadaSession)
        .map((session) => session.visitorId)
    );

    const events = rawEvents.filter((event) => (
      !event.visitorId || !outsideCanadaVisitorIds.has(event.visitorId)
    ));

    function statsForForm(formType) {
      const formEvents = events.filter((e) => e.formType === formType);
      const starts = formEvents.filter((e) => e.action === "start").length;
      const submits = formEvents.filter((e) => e.action === "submit").length;
      const abandons = formEvents.filter((e) => e.action === "abandon").length;
      const completionRate = starts > 0 ? Math.round((submits / starts) * 100) : 0;

      // Dropoff fields — which fields were last touched before abandon
      const dropoffMap = {};
      for (const e of formEvents) {
        if (e.action === "abandon" && e.fieldName) {
          dropoffMap[e.fieldName] = (dropoffMap[e.fieldName] || 0) + 1;
        }
      }
      const dropoffFields = Object.entries(dropoffMap)
        .sort((a, b) => b[1] - a[1])
        .map(([field, count]) => ({ field, count }));

      // Recent abandons with partial data
      const recentAbandons = formEvents
        .filter((e) => e.action === "abandon" && e.fieldValues)
        .slice(0, 10)
        .map((e) => ({
          id: e.id,
          fieldName: e.fieldName,
          fieldValues: e.fieldValues,
          fieldsCompleted: e.fieldsCompleted,
          page: e.page,
          createdAt: e.createdAt,
        }));

      return { starts, submits, abandons, completionRate, dropoffFields, recentAbandons };
    }

    // Build replays from abandon/submit events that have interactions
    const replays = events
      .filter((e) => (e.action === "abandon" || e.action === "submit") && e.fieldValues?._interactions)
      .slice(0, 50)
      .map((e) => ({
        id: e.id,
        visitorId: e.visitorId,
        formType: e.formType,
        outcome: e.action,
        fieldName: e.fieldName,
        createdAt: e.createdAt,
        interactions: e.fieldValues._interactions,
      }));

    return NextResponse.json({
      soumission: statsForForm("soumission"),
      contact: statsForForm("contact"),
      replays,
    });
  } catch (err) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
