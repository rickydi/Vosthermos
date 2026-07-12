import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";

export const dynamic = "force-dynamic";

function clean(value, max = 300) {
  return String(value ?? "").trim().slice(0, max);
}

function validEmail(value) {
  const email = clean(value, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function leadTime(value, fallback = 21) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(365, Math.max(1, parsed));
}

function view(supplier) {
  return {
    ...supplier,
    orderCount: supplier._count?.orders ?? 0,
    createdAt: supplier.createdAt?.toISOString?.() || supplier.createdAt,
    updatedAt: supplier.updatedAt?.toISOString?.() || supplier.updatedAt,
  };
}

export async function GET() {
  try {
    await requireAdmin();
    const suppliers = await prisma.thermosSupplier.findMany({
      include: { _count: { select: { orders: true } } },
      orderBy: [{ isDefault: "desc" }, { isActive: "desc" }, { name: "asc" }],
    });
    return NextResponse.json({ suppliers: suppliers.map(view) });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message === "Unauthorized" ? "Non autorisé" : error?.message || "Erreur serveur" },
      { status: error?.message === "Unauthorized" ? 401 : 500 },
    );
  }
}

export async function POST(request) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const name = clean(body.name, 160);
    const email = validEmail(body.email);
    if (!name) return NextResponse.json({ error: "Nom du fournisseur requis" }, { status: 400 });
    if (!email) return NextResponse.json({ error: "Adresse email du fournisseur invalide" }, { status: 400 });

    const isActive = body.isActive !== false;
    if (body.isDefault === true && !isActive) {
      return NextResponse.json({ error: "Un fournisseur inactif ne peut pas être défini par défaut" }, { status: 409 });
    }
    const existingDefault = await prisma.thermosSupplier.findFirst({
      where: { isDefault: true, isActive: true },
      select: { id: true },
    });
    const makeDefault = isActive && (body.isDefault === true || !existingDefault);
    const supplier = await prisma.$transaction(async (tx) => {
      if (makeDefault) await tx.thermosSupplier.updateMany({ data: { isDefault: false } });
      return tx.thermosSupplier.create({
        data: {
          name,
          contactName: clean(body.contactName, 160) || null,
          email,
          phone: clean(body.phone, 60) || null,
          leadTimeDays: leadTime(body.leadTimeDays),
          autoFollowUpEnabled: body.autoFollowUpEnabled !== false,
          isActive,
          isDefault: makeDefault,
        },
        include: { _count: { select: { orders: true } } },
      });
    });
    await logAdminActivity(request, session, {
      action: "create",
      entityType: "thermos_supplier",
      entityId: supplier.id,
      label: supplier.name,
      metadata: { email: supplier.email, leadTimeDays: supplier.leadTimeDays, isDefault: supplier.isDefault },
    });
    return NextResponse.json({ supplier: view(supplier) }, { status: 201 });
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Un fournisseur utilise déjà cette adresse email" }, { status: 409 });
    }
    return NextResponse.json({ error: error?.message || "Erreur serveur" }, { status: 500 });
  }
}
