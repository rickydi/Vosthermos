import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signToken, verifyPendingToken, COOKIE_NAME } from "@/lib/admin-auth";
import { verifyLoginCode } from "@/lib/admin-2fa";
import { logAdminActivity } from "@/lib/admin-activity";

// Etape 2 du login admin: validation du code 2FA recu par email.
// Le pendingToken (emis a l'etape mot de passe) prouve qu'on a deja franchi
// l'etape 1. C'est ici seulement qu'on ouvre la vraie session.
export async function POST(request) {
  try {
    const { pendingToken, code } = await request.json();

    const pending = verifyPendingToken(pendingToken);
    if (!pending) {
      return NextResponse.json({ error: "Session expiree. Reconnecte-toi." }, { status: 401 });
    }

    const normalizedCode = String(code || "").trim();
    if (!/^\d{5}$/.test(normalizedCode)) {
      return NextResponse.json({ error: "Code invalide." }, { status: 400 });
    }

    const result = await verifyLoginCode(pending.id, normalizedCode);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({ where: { id: pending.id } });
    if (!user) {
      return NextResponse.json({ error: "Compte introuvable." }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email });
    await logAdminActivity(request, { id: user.id, email: user.email }, {
      action: "login",
      entityType: "auth",
      entityId: user.id,
      label: "Connexion admin (2FA validee)",
      metadata: {},
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return response;
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
