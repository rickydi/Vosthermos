import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";
import prisma from "@/lib/prisma";
import { sendSms } from "@/lib/twilio";

const FALLBACKS_KEY = "internal_notification_fallbacks";
const FALLBACK_DELAY_MS = 10 * 60 * 1000;

const RECIPIENTS = {
  jason: { label: "Jason", phone: "+15148258411" },
  caren: { label: "Caren", phone: "+14502750200" },
};

let processingPromise = null;

function cleanMessage(value) {
  const message = String(value || "").trim();
  if (message.length <= 1450) return message;
  return `${message.slice(0, 1420)}\n\n[Message coupe - ouvrir l'admin pour voir le reste]`;
}

function normalizeQueue(value) {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id && item?.recipient && item?.message && item?.dueAt) : [];
  } catch {
    return [];
  }
}

async function readQueue() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: FALLBACKS_KEY },
    select: { value: true },
  });
  return normalizeQueue(setting?.value);
}

async function saveQueue(queue) {
  await prisma.siteSetting.upsert({
    where: { key: FALLBACKS_KEY },
    create: { key: FALLBACKS_KEY, value: JSON.stringify(queue) },
    update: { value: JSON.stringify(queue) },
  });
}

function sameFallback(item, body, recipientKey) {
  return (
    item.status === "pending" &&
    item.recipient === recipientKey &&
    item.context === (body.context || null) &&
    item.entityType === (body.entityType || null) &&
    String(item.entityId || "") === String(body.entityId || "")
  );
}

async function sendToRecipient(req, session, { recipientKey, recipient, message, body, fallback = false }) {
  const smsBody = fallback
    ? `SMS de secours - WhatsApp non confirme apres 10 min\n\n${message}`
    : message;
  const sid = await sendSms(recipient.phone, smsBody);
  if (!sid) return null;

  await logAdminActivity(req, session, {
    action: "send",
    entityType: body.entityType || "internal_notification",
    entityId: body.entityId ? String(body.entityId) : recipientKey,
    label: fallback
      ? `SMS secours envoye a ${recipient.label}`
      : `Notification interne envoyee a ${recipient.label}`,
    metadata: {
      recipient: recipient.label,
      context: body.context || null,
      fallback,
      preview: smsBody.slice(0, 180),
    },
  });

  return sid;
}

async function scheduleFallback(body) {
  const recipientKey = String(body.recipient || "").toLowerCase();
  const recipient = RECIPIENTS[recipientKey];
  const message = cleanMessage(body.message);

  if (!recipient) return { error: "Destinataire invalide", status: 400 };
  if (!message) return { error: "Message requis", status: 400 };

  const now = new Date();
  const dueAt = new Date(now.getTime() + FALLBACK_DELAY_MS).toISOString();
  const queue = await readQueue();
  const existingIndex = queue.findIndex((item) => sameFallback(item, body, recipientKey));
  const item = {
    id: existingIndex >= 0 ? queue[existingIndex].id : crypto.randomUUID(),
    status: "pending",
    recipient: recipientKey,
    recipientLabel: recipient.label,
    message,
    context: body.context || null,
    entityType: body.entityType || null,
    entityId: body.entityId ? String(body.entityId) : null,
    createdAt: existingIndex >= 0 ? queue[existingIndex].createdAt : now.toISOString(),
    dueAt,
  };

  if (existingIndex >= 0) queue[existingIndex] = item;
  else queue.push(item);
  await saveQueue(queue);

  return { ok: true, id: item.id, recipient: recipient.label, dueAt: item.dueAt };
}

async function cancelFallback(req, session, body) {
  const id = String(body.id || "");
  if (!id) return { error: "ID requis", status: 400 };

  const queue = await readQueue();
  const item = queue.find((entry) => entry.id === id);
  await saveQueue(queue.filter((entry) => entry.id !== id));

  if (item) {
    await logAdminActivity(req, session, {
      action: "cancel",
      entityType: item.entityType || "internal_notification",
      entityId: item.entityId || item.recipient,
      label: `SMS secours annule pour ${item.recipientLabel || item.recipient}`,
      metadata: {
        recipient: item.recipientLabel || item.recipient,
        context: item.context || null,
      },
    });
  }

  return { ok: true };
}

async function processDueInternal(req, session) {
  const now = Date.now();
  const queue = await readQueue();
  const due = queue.filter((item) => item.status === "pending" && new Date(item.dueAt).getTime() <= now);
  if (!due.length) return { ok: true, sent: 0 };

  const dueIds = new Set(due.map((item) => item.id));
  await saveQueue(queue.map((item) => (
    dueIds.has(item.id) ? { ...item, status: "processing", processingAt: new Date().toISOString() } : item
  )));

  let sent = 0;
  const failed = [];

  for (const item of due) {
    const recipient = RECIPIENTS[item.recipient];
    if (!recipient) continue;
    const sid = await sendToRecipient(req, session, {
      recipientKey: item.recipient,
      recipient,
      message: item.message,
      body: item,
      fallback: true,
    });
    if (sid) sent += 1;
    else failed.push({ ...item, status: "pending", dueAt: new Date(Date.now() + 2 * 60 * 1000).toISOString() });
  }

  const latest = await readQueue();
  await saveQueue([
    ...latest.filter((item) => !dueIds.has(item.id)),
    ...failed,
  ]);

  return { ok: true, sent, failed: failed.length };
}

async function processDue(req, session) {
  if (!processingPromise) {
    processingPromise = processDueInternal(req, session).finally(() => {
      processingPromise = null;
    });
  }
  return processingPromise;
}

export async function POST(req) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const action = body.action || "send-now";

  if (action === "schedule-fallback") {
    const result = await scheduleFallback(body);
    return NextResponse.json(result, { status: result.status || 200 });
  }

  if (action === "cancel-fallback") {
    const result = await cancelFallback(req, session, body);
    return NextResponse.json(result, { status: result.status || 200 });
  }

  if (action === "process-due") {
    const result = await processDue(req, session);
    return NextResponse.json(result, { status: result.status || 200 });
  }

  const recipientKey = String(body.recipient || "").toLowerCase();
  const recipient = RECIPIENTS[recipientKey];
  const message = cleanMessage(body.message);

  if (!recipient) return NextResponse.json({ error: "Destinataire invalide" }, { status: 400 });
  if (!message) return NextResponse.json({ error: "Message requis" }, { status: 400 });

  const sid = await sendToRecipient(req, session, { recipientKey, recipient, message, body });
  if (!sid) {
    return NextResponse.json({ error: "SMS non envoye. Verifier Twilio." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, recipient: recipient.label });
}
