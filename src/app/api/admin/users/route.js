import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";

export async function POST(request) {
  try {
    const session = await requireAdmin();
    const { email, password } = await request.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: "Email et mot de passe (6+ caracteres) requis" }, { status: 400 });
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Cet email existe deja" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
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
