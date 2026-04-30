import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { analyticsDateRange } from "@/lib/analytics-date-range";

export async function GET(request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const range = analyticsDateRange(searchParams);
    const startedAt = { gte: range.since };
    if (range.until) startedAt.lt = range.until;

    const sessions = await prisma.analyticsSession.findMany({
      where: { startedAt },
      include: {
        pageViews: { orderBy: { enteredAt: "asc" } },
      },
    });

    const flowMap = {};
    const entryMap = {};
    for (const session of sessions) {
      const views = session.pageViews;
      if (views.length > 0) {
        entryMap[views[0].page] = (entryMap[views[0].page] || 0) + 1;
      }
      for (let i = 0; i < views.length - 1; i++) {
        const from = views[i].page;
        const to = views[i + 1].page;
        const key = `${from}|||${to}`;
        flowMap[key] = (flowMap[key] || 0) + 1;
      }
    }

    const flows = Object.entries(flowMap)
      .map(([key, count]) => {
        const [from, to] = key.split("|||");
        return { from, to, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const entries = Object.entries(entryMap)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ flows, entries });
  } catch (err) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
