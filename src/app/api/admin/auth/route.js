import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, COOKIE_NAME, getAdminSession } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Email ou mot de passe invalide" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Email ou mot de passe invalide" }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email });
    await logAdminActivity(request, { id: user.id, email: user.email }, {
      action: "login",
      entityType: "auth",
      entityId: user.id,
      label: "Connexion admin",
      metadata: { email: user.email },
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

export async function DELETE(request) {
  const session = await getAdminSession();
  if (session) {
    await logAdminActivity(request, session, {
      action: "logout",
      entityType: "auth",
      entityId: session.id,
      label: "Deconnexion admin",
      metadata: { email: session.email },
    });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return response;
}
