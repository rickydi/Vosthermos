import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createMagicToken } from "@/lib/manager-auth";
import { getTransporter } from "@/lib/mail";
import { COMPANY_INFO } from "@/lib/company-info";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.vosthermos.com";

export async function POST(req) {
  try {
    const { email } = await req.json().catch(() => ({}));
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
    }

    const normalized = String(email).trim().toLowerCase();
    const manager = await prisma.managerUser.findUnique({ where: { email: normalized } });

    // Réponse identique peu importe que le compte existe (anti-enum)
    if (!manager || !manager.isActive) {
      return NextResponse.json({ ok: true, message: "Si ce compte existe, un lien vous a été envoyé." });
    }

    const token = await createMagicToken(manager);
    const loginUrl = `${SITE_URL}/gestionnaire/verify?token=${token}`;

    if (!process.env.SMTP_HOST) {
      console.log(`[DEV] Magic link for ${normalized}: ${loginUrl}`);
      return NextResponse.json({ ok: true, message: "Lien envoyé (mode dev, voir les logs)", devLink: loginUrl });
    }

    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Vosthermos" <${process.env.SMTP_USER}>`,
      to: normalized,
      subject: "Votre lien d'accès au portail Vosthermos",
      html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { font-family: Arial, Helvetica, sans-serif; background: #f5f6f8; margin: 0; padding: 24px; color: #0f1720; }
  .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; }
  .header { background: #002530; padding: 20px 24px; color: #fff; }
  .header .logo { font-size: 20px; font-weight: 800; }
  .header .logo span { color: #e30718; }
  .header .tag { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.6); margin-top: 4px; }
  .body { padding: 28px 24px; }
  .body h1 { font-size: 22px; margin: 0 0 12px; }
  .body p { font-size: 14px; line-height: 1.6; margin: 0 0 16px; color: #4a5568; }
  .cta { display: inline-block; padding: 14px 28px; background: #e30718; color: #fff !important; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 15px; }
  .small { font-size: 12px; color: #718096; }
  .footer { padding: 16px 24px; background: #f5f6f8; font-size: 11px; color: #718096; border-top: 1px solid rgba(15,23,32,0.08); }
</style></head><body>
  <div class="container">
    <div class="header">
      <div class="logo">VOS<span>THERMOS</span></div>
      <div class="tag">Portail Gestionnaire</div>
    </div>
    <div class="body">
      <h1>Bonjour ${manager.firstName},</h1>
      <p>Cliquez sur le bouton ci-dessous pour accéder à votre portail Vosthermos et consulter vos copropriétés.</p>
      <p style="text-align:center; margin: 28px 0;">
        <a href="${loginUrl}" class="cta">Accéder au portail</a>
      </p>
      <p class="small">Ce lien est valide pendant <strong>15 minutes</strong> et ne peut être utilisé qu'une seule fois.</p>
      <p class="small">Si vous n'avez pas fait cette demande, ignorez simplement cet email.</p>
      <p class="small" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(15,23,32,0.08);">
        Lien ne fonctionne pas ? Copiez l'adresse ci-dessous dans votre navigateur :<br>
        <span style="word-break: break-all; color: #4a5568;">${loginUrl}</span>
      </p>
    </div>
    <div class="footer">
      Vosthermos · ${COMPANY_INFO.address} · ${COMPANY_INFO.phone}<br>
      Hébergé au Canada · Conformité Loi 25
    </div>
  </div>
</body></html>
      `,
      text: `Bonjour ${manager.firstName},\n\nCliquez sur ce lien pour accéder au portail Vosthermos (valide 15 min) :\n\n${loginUrl}\n\nSi vous n'avez pas demandé ce lien, ignorez cet email.\n\n— Vosthermos`,
    });

    return NextResponse.json({ ok: true, message: "Un lien d'accès vous a été envoyé." });
  } catch (err) {
    console.error("send-link error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
