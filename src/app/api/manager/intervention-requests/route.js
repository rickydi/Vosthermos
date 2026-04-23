import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getManagerFromCookie, hasPermission, canAccessClient } from "@/lib/manager-auth";
import { generateWorkOrderNumber } from "@/lib/work-order-utils";
import { getTransporter } from "@/lib/mail";
import { COMPANY_INFO } from "@/lib/company-info";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const manager = await getManagerFromCookie();
  if (!manager) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { clientId, unitCode, description, urgency, preferredDate } = body;

  if (!clientId || !description?.trim()) {
    return NextResponse.json({ error: "Copropriété et description requis" }, { status: 400 });
  }

  const mc = canAccessClient(manager, Number(clientId));
  if (!mc || !hasPermission(mc, "request_intervention")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const client = await prisma.client.findUnique({
    where: { id: Number(clientId) },
    select: { name: true, address: true, city: true, postalCode: true, email: true },
  });

  const number = await generateWorkOrderNumber();
  const date = preferredDate ? new Date(preferredDate) : new Date();

  const urgencyLabel = urgency === "urgent" ? "🚨 URGENT" : urgency === "haute" ? "⚠ Priorité haute" : "Normale";
  const noteFromManager = [
    `Demande du gestionnaire ${manager.firstName} ${manager.lastName}`,
    `Email : ${manager.email}`,
    unitCode ? `Unité concernée : ${unitCode}` : null,
    `Priorité : ${urgencyLabel}`,
    preferredDate ? `Date souhaitée : ${new Date(preferredDate).toLocaleDateString("fr-CA")}` : null,
  ].filter(Boolean).join("\n");

  const wo = await prisma.workOrder.create({
    data: {
      number,
      clientId: Number(clientId),
      date,
      description: description.trim(),
      interventionAddress: client?.address || null,
      interventionCity: client?.city || null,
      interventionPostalCode: client?.postalCode || null,
      statut: "draft",
      notes: noteFromManager,
      visibleAuClient: true,
      ...(unitCode ? {
        sections: {
          create: [{ unitCode: unitCode, notes: `Unité visée par la demande du gestionnaire` }],
        },
      } : {}),
    },
    include: { sections: true },
  });

  // Email a l'admin (best effort)
  if (process.env.SMTP_HOST) {
    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"Vosthermos" <${process.env.SMTP_USER}>`,
        to: COMPANY_INFO.email,
        subject: `[Portail] ${urgency === "urgent" ? "URGENT - " : ""}Nouvelle demande d'intervention · ${client?.name}`,
        html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;padding:20px;color:#0f1720;">
  <h2 style="color:#002530;margin:0 0 16px">Nouvelle demande du portail gestionnaire</h2>
  <table cellpadding="6" style="border-collapse:collapse;width:100%;max-width:560px;font-size:14px;">
    <tr><td style="color:#718096;width:140px"><strong>Copropriété</strong></td><td>${client?.name || "—"}</td></tr>
    <tr><td style="color:#718096"><strong>Gestionnaire</strong></td><td>${manager.firstName} ${manager.lastName} &lt;${manager.email}&gt;</td></tr>
    ${unitCode ? `<tr><td style="color:#718096"><strong>Unité</strong></td><td>${unitCode}</td></tr>` : ""}
    <tr><td style="color:#718096"><strong>Priorité</strong></td><td>${urgencyLabel}</td></tr>
    ${preferredDate ? `<tr><td style="color:#718096"><strong>Date souhaitée</strong></td><td>${new Date(preferredDate).toLocaleDateString("fr-CA")}</td></tr>` : ""}
    <tr><td style="color:#718096" valign="top"><strong>Description</strong></td><td>${description.trim().replace(/\n/g,"<br>")}</td></tr>
    <tr><td style="color:#718096"><strong>Bon créé</strong></td><td><a href="https://www.vosthermos.com/admin/bons/${wo.id}">${number}</a> (brouillon)</td></tr>
  </table>
</body></html>`,
        text: `Nouvelle demande d'intervention\n\nCopropriété : ${client?.name}\nGestionnaire : ${manager.firstName} ${manager.lastName} (${manager.email})\n${unitCode ? `Unité : ${unitCode}\n` : ""}Priorité : ${urgencyLabel}\n${preferredDate ? `Date souhaitée : ${new Date(preferredDate).toLocaleDateString("fr-CA")}\n` : ""}\n${description}\n\nBon ${number} créé en brouillon : https://www.vosthermos.com/admin/bons/${wo.id}`,
      });
    } catch (e) {
      console.error("Email admin failed:", e.message);
    }
  }

  return NextResponse.json({ ok: true, workOrderId: wo.id, number });
}
