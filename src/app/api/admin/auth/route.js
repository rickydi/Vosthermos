import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, COOKIE_NAME, getAdminSession } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_LOGINS = 8;

function clientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return req.headers.get("x-real-ip") || null;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function countRecentFailures(request, email) {
  const since = new Date(Date.now() - LOGIN_WINDOW_MS);
  const or = [{ adminEmail: email }];
  const ip = clientIp(request);
  if (ip) or.push({ ipAddress: ip });

  return prisma.adminActivityLog.count({
    where: {
      action: "login_failed",
      entityType: "auth",
      createdAt: { gte: since },
      OR: or,
    },
  });
}

async function logFailedLogin(request, email, reason) {
  await logAdminActivity(request, { email }, {
    action: "login_failed",
    entityType: "auth",
    entityId: email,
    label: "Tentative de connexion admin echouee",
    metadata: { email, reason },
  });
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return NextResponse.json({ error: "Email ou mot de passe invalide" }, { status: 401 });
    }

    const recentFailures = await countRecentFailures(request, normalizedEmail);
    if (recentFailures >= MAX_FAILED_LOGINS) {
      return NextResponse.json(
        { error: "Trop de tentatives. Reessaie dans quelques minutes." },
        { status: 429 }
      );
    }

    const user = await prisma.adminUser.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });
    if (!user) {
      await logFailedLogin(request, normalizedEmail, "unknown_email");
      return NextResponse.json({ error: "Email ou mot de passe invalide" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await logFailedLogin(request, normalizedEmail, "bad_password");
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
