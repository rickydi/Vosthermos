import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(_req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id) },
    include: {
      workOrders: {
        include: { technician: { select: { name: true } } },
        orderBy: { date: "desc" },
        take: 20,
      },
    },
  });

  if (!client) return NextResponse.json({ error: "Non trouve" }, { status: 404 });

  return NextResponse.json({
    ...client,
    workOrders: client.workOrders.map((wo) => ({
      ...wo,
      total: Number(wo.total),
      subtotal: Number(wo.subtotal),
    })),
  });
}

export async function PUT(req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const body = await req.json();
  const client = await prisma.client.update({
    where: { id: parseInt(id) },
    data: {
      name: body.name,
      company: body.company || null,
      address: body.address || null,
      city: body.city || null,
      province: body.province || "QC",
      postalCode: body.postalCode || null,
      phone: body.phone || null,
      email: body.email || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(client);
}

export async function DELETE(_req, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const clientId = parseInt(id);

  const workOrdersCount = await prisma.workOrder.count({ where: { clientId } });
  if (workOrdersCount > 0) {
    return NextResponse.json(
      { error: `Impossible de supprimer: ${workOrdersCount} bon(s) de travail lie(s) a ce client.` },
      { status: 409 }
    );
  }

  try {
    await prisma.client.delete({ where: { id: clientId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Erreur de suppression" }, { status: 500 });
  }
}
