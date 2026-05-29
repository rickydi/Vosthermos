import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPendingToken } from "@/lib/admin-auth";
import { generateLoginCode, storeLoginCode, canResend, getTwoFactorEmail, maskEmail } from "@/lib/admin-2fa";
import { sendAdminLoginCodeEmail } from "@/lib/mail";
import { logAdminActivity } from "@/lib/admin-activity";

function clientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return req.headers.get("x-real-ip") || null;
}

// Renvoie un nouveau code (invalide le precedent). Protege par un cooldown.
export async function POST(request) {
  try {
    const { pendingToken } = await request.json();

    const pending = verifyPendingToken(pendingToken);
    if (!pending) {
      return NextResponse.json({ error: "Session expiree. Reconnecte-toi." }, { status: 401 });
    }

    if (!(await canResend(pending.id))) {
      return NextResponse.json(
        { error: "Patiente quelques secondes avant de redemander un code." },
        { status: 429 },
      );
    }

    const user = await prisma.adminUser.findUnique({ where: { id: pending.id } });
    if (!user) {
      return NextResponse.json({ error: "Compte introuvable." }, { status: 401 });
    }

    const code = generateLoginCode();
    const twoFactorEmail = getTwoFactorEmail();
    try {
      await sendAdminLoginCodeEmail(twoFactorEmail, code);
    } catch (err) {
      console.error("[admin auth] renvoi du code 2FA echoue:", err?.message || err);
      return NextResponse.json(
        { error: "Impossible d'envoyer le code. Reessaie dans un moment." },
        { status: 502 },
      );
    }
    await storeLoginCode(pending.id, code, clientIp(request));

    await logAdminActivity(request, { id: user.id, email: user.email }, {
      action: "login_code_sent",
      entityType: "auth",
      entityId: user.id,
      label: "Code de connexion 2FA renvoye",
      metadata: {},
    });

    return NextResponse.json({ success: true, sentTo: maskEmail(twoFactorEmail) });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
