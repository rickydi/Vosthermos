import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getManagerFromCookie } from "@/lib/manager-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const manager = await getManagerFromCookie();
  if (!manager) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const clientIds = (manager.clients || []).map((mc) => mc.clientId);
  if (clientIds.length === 0) return NextResponse.json({ clients: [] });

  const [clients, buildings, units, openings] = await Promise.all([
    prisma.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, name: true, city: true },
      orderBy: { name: "asc" },
    }),
    prisma.building.findMany({
      where: { clientId: { in: clientIds } },
      select: { id: true, clientId: true, code: true, name: true, position: true },
      orderBy: [{ clientId: "asc" }, { position: "asc" }],
    }),
    prisma.clientUnit.findMany({
      where: { clientId: { in: clientIds }, isActive: true },
      select: { id: true, clientId: true, buildingId: true, code: true, description: true },
      orderBy: [{ clientId: "asc" }, { code: "asc" }],
    }),
    prisma.unitOpening.findMany({
      where: { unit: { clientId: { in: clientIds } } },
      select: { id: true, unitId: true, type: true, location: true, status: true },
      orderBy: { position: "asc" },
    }),
  ]);

  // Build tree
  const byClient = {};
  for (const c of clients) {
    byClient[c.id] = { ...c, buildings: [], orphanUnits: [] };
  }

  const byBuilding = {};
  for (const b of buildings) {
    byBuilding[b.id] = { ...b, units: [] };
    byClient[b.clientId]?.buildings.push(byBuilding[b.id]);
  }

  const byUnit = {};
  for (const u of units) {
    byUnit[u.id] = { ...u, openings: [] };
    if (u.buildingId && byBuilding[u.buildingId]) {
      byBuilding[u.buildingId].units.push(byUnit[u.id]);
    } else {
      byClient[u.clientId]?.orphanUnits.push(byUnit[u.id]);
    }
  }

  for (const o of openings) {
    byUnit[o.unitId]?.openings.push(o);
  }

  return NextResponse.json({ clients: clients.map((c) => byClient[c.id]) });
}
