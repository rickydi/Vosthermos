import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { sessionId, page } = await request.json();
    const pv = await prisma.analyticsPageView.create({
      data: { sessionId, page },
    });
    return NextResponse.json({ id: pv.id });
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
