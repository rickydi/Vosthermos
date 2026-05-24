import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { changedFields, logAdminActivity } from "@/lib/admin-activity";
import { createOrTouchFollowUpFromWorkOrder } from "@/lib/follow-up-utils";
import {
  buildPaymentTrackingData,
  isOpenPaymentStatus,
  parsePaymentDateInput,
  serializePaymentWorkOrder,
} from "@/lib/payment-tracking";

function cleanText(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function includePaymentRelations() {
  return {
    client: {
      select: {
        id: true,
        name: true,
        company: true,
        phone: true,
        secondaryPhone: true,
        email: true,
        city: true,
        paymentTermsDays: true,
      },
    },
    technician: { select: { id: true, name: true } },
    route: { select: { id: true, name: true, date: true, area: true } },
    followUp: { select: { id: true, title: true, status: true } },
  };
}

function openStatusFromBody(body, existing) {
  if (isOpenPaymentStatus(body.statut)) return body.statut;
  return existing.invoiceSentAt ? "sent" : "invoiced";
}

export async function PATCH(req, { params }) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { id } = await params;
  const workOrderId = Number(id);
  const body = await req.json().catch(() => ({}));

  const existing = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    include: { client: true },
  });

  if (!existing) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  let data = {};
  let activityLabel = `Paiement modifie: ${existing.number}`;

  if (body.action === "mark-paid") {
    const paidAt = parsePaymentDateInput(body.paidAt, new Date()) || new Date();
    data = {
      ...buildPaymentTrackingData({
        statut: "paid",
        existing,
        client: existing.client,
        invoiceDate: existing.invoiceIssuedAt || existing.date,
        now: paidAt,
      }),
      statut: "paid",
      paidAt,
      paymentMethod: cleanText(body.paymentMethod) ?? existing.paymentMethod ?? null,
      paymentNotes: body.paymentNotes !== undefined ? cleanText(body.paymentNotes) : existing.paymentNotes,
    };
    activityLabel = `Facture payee: ${existing.number}`;
  } else if (body.action === "mark-open") {
    const statut = openStatusFromBody(body, existing);
    data = {
      ...buildPaymentTrackingData({
        statut,
        existing,
        client: existing.client,
        invoiceDate: existing.invoiceIssuedAt || existing.date,
      }),
      statut,
      paidAt: null,
      paymentMethod: null,
    };
    activityLabel = `Facture remise a recevoir: ${existing.number}`;
  } else {
    if (body.invoiceIssuedAt !== undefined) {
      data.invoiceIssuedAt = parsePaymentDateInput(body.invoiceIssuedAt, existing.invoiceIssuedAt);
    }
    if (body.invoiceSentAt !== undefined) {
      data.invoiceSentAt = parsePaymentDateInput(body.invoiceSentAt, existing.invoiceSentAt);
    }
    if (body.paymentDueAt !== undefined) {
      data.paymentDueAt = parsePaymentDateInput(body.paymentDueAt, existing.paymentDueAt);
    }
    if (body.paidAt !== undefined) {
      data.paidAt = parsePaymentDateInput(body.paidAt, existing.paidAt);
      if (data.paidAt) data.statut = "paid";
    }
    if (body.paymentMethod !== undefined) data.paymentMethod = cleanText(body.paymentMethod);
    if (body.paymentNotes !== undefined) data.paymentNotes = cleanText(body.paymentNotes);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucune modification fournie" }, { status: 400 });
  }

  const updated = await prisma.workOrder.update({
    where: { id: workOrderId },
    data,
    include: includePaymentRelations(),
  });

  try {
    await createOrTouchFollowUpFromWorkOrder({ workOrder: updated, client: updated.client });
  } catch (err) {
    console.error("[payments] follow-up sync error:", err?.message || err);
  }

  await logAdminActivity(req, session, {
    action: "update",
    entityType: "work_order",
    entityId: updated.id,
    label: activityLabel,
    metadata: {
      number: updated.number,
      clientId: updated.clientId,
      clientName: updated.client?.name,
      changedFields: changedFields(existing, updated, [
        "statut",
        "invoiceIssuedAt",
        "invoiceSentAt",
        "paymentDueAt",
        "paidAt",
        "paymentMethod",
        "paymentNotes",
      ]),
      total: Number(updated.total),
    },
  });

  return NextResponse.json(serializePaymentWorkOrder(updated));
}
