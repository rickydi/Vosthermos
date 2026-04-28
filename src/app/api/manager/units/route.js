import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getManagerFromCookie, hasPermission, canAccessClient } from "@/lib/manager-auth";

export const dynamic = "force-dynamic";

async function validateBuildingForClient(buildingId, clientId) {
  if (!buildingId) return null;
  const building = await prisma.building.findFirst({
    where: { id: Number(buildingId), clientId: Number(clientId) },
    select: { id: true },
  });
  return building ? building.id : false;
}

export async function POST(req) {
  const manager = await getManagerFromCookie();
  if (!manager) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { clientId, buildingId, description } = body;
  const code = body.code ? String(body.code).trim() : "";
  if (!clientId || !code) return NextResponse.json({ error: "clientId et code requis" }, { status: 400 });

  const mc = canAccessClient(manager, Number(clientId));
  if (!mc || !hasPermission(mc, "manage_units")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const existing = await prisma.clientUnit.findFirst({
    where: { clientId: Number(clientId), code },
  });
  if (existing) return NextResponse.json({ error: "Une unité avec ce code existe déjà" }, { status: 400 });

  const validBuildingId = await validateBuildingForClient(buildingId, clientId);
  if (validBuildingId === false) {
    return NextResponse.json({ error: "Bâtiment invalide pour cette copropriété" }, { status: 400 });
  }

  const unit = await prisma.clientUnit.create({
    data: {
      clientId: Number(clientId),
      buildingId: validBuildingId,
      code,
      description: description?.trim() || null,
    },
  });
  return NextResponse.json({ ok: true, unit });
}
