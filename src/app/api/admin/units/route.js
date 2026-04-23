import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json().catch(() => ({}));
  const { clientId, buildingId, code, description, notes } = body;
  if (!clientId || !code) return NextResponse.json({ error: "clientId et code requis" }, { status: 400 });

  const existing = await prisma.clientUnit.findFirst({
    where: { clientId: Number(clientId), code: code.trim() },
  });
  if (existing) return NextResponse.json({ error: "Une unité avec ce code existe déjà" }, { status: 400 });

  const unit = await prisma.clientUnit.create({
    data: {
      clientId: Number(clientId),
      buildingId: buildingId ? Number(buildingId) : null,
      code: code.trim(),
      description: description?.trim() || null,
      notes: notes?.trim() || null,
    },
  });
  return NextResponse.json({ ok: true, unit });
}
