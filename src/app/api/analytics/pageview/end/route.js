import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { id, duration } = await request.json();
    if (id) {
      await prisma.analyticsPageView.update({
        where: { id },
        data: { duration: Math.min(duration, 3600) },
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
