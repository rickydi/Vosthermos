import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { createMagicToken } from "@/lib/manager-auth";
import { getTransporter } from "@/lib/mail";
import { COMPANY_INFO } from "@/lib/company-info";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vosthermos.com";

export async function GET(req, { params }) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const manager = await prisma.managerUser.findUnique({
    where: { id: Number(id) },
    include: {
      clients: { include: { client: true } },
      sessions: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!manager) return NextResponse.json({ error: "Non trouve" }, { status: 404 });

  return NextResponse.json({
    ...manager,
    createdAt: manager.createdAt.toISOString(),
    updatedAt: manager.updatedAt.toISOString(),
    lastLoginAt: manager.lastLoginAt?.toISOString() || null,
  });
}

export async function PUT(req, { params }) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { firstName, lastName, phone, isActive, clients } = body;

  const update = {};
  if (firstName !== undefined) update.firstName = firstName;
  if (lastName !== undefined) update.lastName = lastName;
  if (phone !== undefined) update.phone = phone || null;
  if (isActive !== undefined) update.isActive = Boolean(isActive);

  const manager = await prisma.managerUser.update({
    where: { id: Number(id) },
    data: update,
  });

  if (Array.isArray(clients)) {
    // Wipe + recreate manager_clients
    await prisma.managerClient.deleteMany({ where: { managerId: Number(id) } });
    if (clients.length > 0) {
      await prisma.managerClient.createMany({
        data: clients.map((c) => ({
          managerId: Number(id),
          clientId: Number(c.clientId),
          permissions: c.permissions || ["view_work_orders", "view_invoices", "request_intervention"],
        })),
      });
    }
  }

  return NextResponse.json({ ok: true, manager });
}

export async function DELETE(req, { params }) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  await prisma.managerUser.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}

// POST /api/admin/managers/[id]?action=send-link — resend magic link
export async function POST(req, { params }) {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "send-link") {
    const manager = await prisma.managerUser.findUnique({ where: { id: Number(id) } });
    if (!manager) return NextResponse.json({ error: "Non trouve" }, { status: 404 });
    if (!manager.isActive) return NextResponse.json({ error: "Compte desactive" }, { status: 400 });

    const token = await createMagicToken(manager);
    const loginUrl = `${SITE_URL}/gestionnaire/verify?token=${token}`;

    if (!process.env.SMTP_HOST) {
      return NextResponse.json({ ok: true, devLink: loginUrl });
    }

    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"Vosthermos" <${process.env.SMTP_USER}>`,
        to: manager.email,
        subject: "Acces a votre portail Vosthermos",
        html: `<p>Bonjour ${manager.firstName},</p><p>Voici votre lien d'acces au portail Vosthermos (valide 15 minutes) :</p><p><a href="${loginUrl}" style="display:inline-block; padding:12px 24px; background:#e30718; color:white; text-decoration:none; border-radius:6px; font-weight:700;">Acceder au portail</a></p><p>Vosthermos - ${COMPANY_INFO.phone}</p>`,
        text: `Bonjour ${manager.firstName}, voici votre lien d'acces (15 min): ${loginUrl}`,
      });
      return NextResponse.json({ ok: true, message: "Lien envoye par email" });
    } catch (e) {
      return NextResponse.json({ error: "Erreur envoi email: " + e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
