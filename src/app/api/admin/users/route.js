import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.adminUser.findMany({
      select: { id: true, email: true },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(users);
  } catch (err) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await requireAdmin();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Cet email existe deja" }, { status: 400 });
    }

    // Connexion par code courriel uniquement — la colonne passwordHash (non nullable)
    // recoit une valeur aleatoire inutilisable.
    const passwordHash = await bcrypt.hash(crypto.randomUUID(), 12);
    const user = await prisma.adminUser.create({
      data: { email, passwordHash },
    });

    await logAdminActivity(request, session, {
      action: "create",
      entityType: "admin_user",
      entityId: user.id,
      label: `Admin cree: ${user.email}`,
      metadata: { email: user.email },
    });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (err) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
