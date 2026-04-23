import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getManagerFromCookie, hasPermission, canAccessClient } from "@/lib/manager-auth";

export const dynamic = "force-dynamic";

async function authorize(id, manager) {
  const unit = await prisma.clientUnit.findUnique({
    where: { id: Number(id) },
    select: { clientId: true, code: true },
  });
  if (!unit) return { error: "Unité introuvable", status: 404 };
  const mc = canAccessClient(manager, unit.clientId);
  if (!mc || !hasPermission(mc, "manage_units")) {
    return { error: "Permission refusée", status: 403 };
  }
  return { unit };
}

export async function PUT(req, { params }) {
  const manager = await getManagerFromCookie();
  if (!manager) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const { id } = await params;
  const auth = await authorize(id, manager);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const data = {};
  if (body.buildingId !== undefined) data.buildingId = body.buildingId ? Number(body.buildingId) : null;
  if (body.code !== undefined) data.code = String(body.code).trim();
  if (body.description !== undefined) data.description = body.description?.trim() || null;
  if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

  const unit = await prisma.clientUnit.update({
    where: { id: Number(id) },
    data,
  });
  return NextResponse.json({ ok: true, unit });
}

export async function DELETE(req, { params }) {
  const manager = await getManagerFromCookie();
  if (!manager) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const { id } = await params;
  const auth = await authorize(id, manager);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Soft delete pour preserver l'historique des bons de travail
  await prisma.clientUnit.update({
    where: { id: Number(id) },
    data: { isActive: false },
  });
  return NextResponse.json({ ok: true });
}
