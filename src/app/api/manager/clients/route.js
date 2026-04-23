import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getManagerFromCookie } from "@/lib/manager-auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const manager = await getManagerFromCookie();
  if (!manager) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { name, company, address, city, province, postalCode, phone, email, notes } = body;
  if (!name || !name.trim()) return NextResponse.json({ error: "Nom de la copropriété requis" }, { status: 400 });

  // Check unique email if provided
  if (email) {
    const existing = await prisma.client.findFirst({ where: { email: email.trim() } });
    if (existing) return NextResponse.json({ error: "Un client avec cet email existe déjà" }, { status: 400 });
  }

  // Create client (type gestionnaire) + auto-link to manager with full permissions
  const result = await prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        name: name.trim(),
        type: "gestionnaire",
        company: company?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        province: province?.trim() || "QC",
        postalCode: postalCode?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    await tx.managerClient.create({
      data: {
        managerId: manager.id,
        clientId: client.id,
        permissions: [
          "view_work_orders", "view_invoices", "view_quotes",
          "request_intervention", "approve_quotes",
          "manage_units", "manage_openings",
        ],
      },
    });

    return client;
  });

  return NextResponse.json({ ok: true, client: result });
}
