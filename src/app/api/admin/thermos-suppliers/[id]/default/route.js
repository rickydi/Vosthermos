import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";

export async function POST(request, { params }) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Fournisseur invalide" }, { status: 400 });
  }
  const existing = await prisma.thermosSupplier.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Fournisseur introuvable" }, { status: 404 });
  if (!existing.isActive) return NextResponse.json({ error: "Activez ce fournisseur avant de le définir par défaut" }, { status: 409 });

  const supplier = await prisma.$transaction(async (tx) => {
    await tx.thermosSupplier.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    return tx.thermosSupplier.update({
      where: { id },
      data: { isDefault: true },
      include: { _count: { select: { orders: true } } },
    });
  });
  await logAdminActivity(request, session, {
    action: "set_default",
    entityType: "thermos_supplier",
    entityId: supplier.id,
    label: supplier.name,
  });
  return NextResponse.json({ supplier: { ...supplier, orderCount: supplier._count.orders } });
}
