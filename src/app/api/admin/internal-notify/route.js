import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";
import { sendSms } from "@/lib/twilio";

const RECIPIENTS = {
  jason: { label: "Jason", phone: "+15148258411" },
  caren: { label: "Caren", phone: "+14502750200" },
};

function cleanMessage(value) {
  const message = String(value || "").trim();
  if (message.length <= 1450) return message;
  return `${message.slice(0, 1420)}\n\n[Message coupe - ouvrir l'admin pour voir le reste]`;
}

export async function POST(req) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const recipientKey = String(body.recipient || "").toLowerCase();
  const recipient = RECIPIENTS[recipientKey];
  const message = cleanMessage(body.message);

  if (!recipient) return NextResponse.json({ error: "Destinataire invalide" }, { status: 400 });
  if (!message) return NextResponse.json({ error: "Message requis" }, { status: 400 });

  const sid = await sendSms(recipient.phone, message);
  if (!sid) {
    return NextResponse.json({ error: "SMS non envoye. Verifier Twilio." }, { status: 500 });
  }

  await logAdminActivity(req, session, {
    action: "send",
    entityType: body.entityType || "internal_notification",
    entityId: body.entityId ? String(body.entityId) : recipientKey,
    label: `Notification interne envoyee a ${recipient.label}`,
    metadata: {
      recipient: recipient.label,
      context: body.context || null,
      preview: message.slice(0, 180),
    },
  });

  return NextResponse.json({ ok: true, recipient: recipient.label });
}
