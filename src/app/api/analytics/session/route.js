import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { visitorId, device, browser, referrer } = await request.json();
    const session = await prisma.analyticsSession.create({
      data: { visitorId, device, browser, referrer },
    });
    return NextResponse.json({ sessionId: session.id });
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
