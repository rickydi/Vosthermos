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

    const events = await prisma.analyticsFormEvent.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
    });

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

    // Build session timelines grouped by visitorId
    const timelineMap = {};
    for (const e of events) {
      if (!e.visitorId) continue;
      const key = `${e.visitorId}_${e.formType}`;
      if (!timelineMap[key]) {
        timelineMap[key] = { visitorId: e.visitorId, formType: e.formType, events: [] };
      }
      timelineMap[key].events.push({
        action: e.action,
        fieldName: e.fieldName,
        fieldValues: e.fieldValues,
        fieldsCompleted: e.fieldsCompleted,
        createdAt: e.createdAt,
      });
    }
    // Sort events within each session and keep recent 20 sessions
    const timelines = Object.values(timelineMap)
      .map((t) => {
        t.events.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        t.startedAt = t.events[0]?.createdAt;
        t.outcome = t.events.some((e) => e.action === "submit") ? "submit" : t.events.some((e) => e.action === "abandon") ? "abandon" : "in_progress";
        return t;
      })
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
      .slice(0, 20);

    return NextResponse.json({
      soumission: statsForForm("soumission"),
      contact: statsForForm("contact"),
      timelines,
    });
  } catch (err) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
