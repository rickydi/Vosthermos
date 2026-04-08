import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

async function getGeoFromIP(ip) {
  try {
    if (!ip || ip === "127.0.0.1" || ip === "::1") return {};
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return {};
    const data = await res.json();
    return { city: data.city || null, region: data.regionName || null, country: data.country || null };
  } catch {
    return {};
  }
}

export async function POST(request) {
  try {
    const { visitorId, device, browser, referrer } = await request.json();
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || null;
    const geo = await getGeoFromIP(ip);

    const session = await prisma.analyticsSession.create({
      data: { visitorId, device, browser, referrer, ...geo },
    });
    return NextResponse.json({ sessionId: session.id });
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
