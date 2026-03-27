import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

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

    return NextResponse.json({
      visitorId: id,
      sessionCount: sessions.length,
      totalPages,
      totalDuration: Math.round(totalDuration),
      sessions: sessions.map((s) => ({
        id: s.id,
        device: s.device,
        browser: s.browser,
        referrer: s.referrer,
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
