import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getManagerFromCookie, canAccessClient, hasPermission } from "@/lib/manager-auth";

export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
  const manager = await getManagerFromCookie();
  if (!manager) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const clientId = Number(id);
  const mc = canAccessClient(manager, clientId);
  if (!mc) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  // Renommer une copro = gestion unités est la permission la plus proche
  if (!hasPermission(mc, "manage_units")) {
    return NextResponse.json({ error: "Permission requise : gérer unités" }, { status: 403 });
  }

  const body = await req.json();
  const data = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.address === "string") data.address = body.address.trim() || null;
  if (typeof body.city === "string") data.city = body.city.trim() || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Rien à mettre à jour" }, { status: 400 });
  }

  const updated = await prisma.client.update({ where: { id: clientId }, data });
  return NextResponse.json({ ok: true, client: { id: updated.id, name: updated.name, city: updated.city, address: updated.address } });
}
