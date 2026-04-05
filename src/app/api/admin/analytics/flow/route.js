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

    const sessions = await prisma.analyticsSession.findMany({
      where: { startedAt: { gte: since } },
      include: {
        pageViews: { orderBy: { enteredAt: "asc" } },
      },
    });

    const flowMap = {};
    for (const session of sessions) {
      const views = session.pageViews;
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

    return NextResponse.json({ flows });
  } catch (err) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
