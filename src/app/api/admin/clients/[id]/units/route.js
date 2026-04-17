import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(_req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const units = await prisma.clientUnit.findMany({
    where: { clientId: parseInt(id) },
    orderBy: [{ isActive: "desc" }, { code: "asc" }],
  });
  return NextResponse.json(units);
}

export async function POST(req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const body = await req.json();
  const code = (body.code || "").trim();
  if (!code) return NextResponse.json({ error: "Code requis" }, { status: 400 });

  try {
    const unit = await prisma.clientUnit.create({
      data: {
        clientId: parseInt(id),
        code,
        description: body.description || null,
        notes: body.notes || null,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json(unit);
  } catch (err) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Code deja existant pour ce client" }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
