import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import {
  isOpenPaymentStatus,
  PAYMENT_TRACKED_STATUSES,
  serializePaymentWorkOrder,
  validDate,
} from "@/lib/payment-tracking";

function includesSearch(q) {
  if (!q) return undefined;
  return [
    { number: { contains: q, mode: "insensitive" } },
    { client: { name: { contains: q, mode: "insensitive" } } },
    { client: { phone: { contains: q } } },
    { client: { secondaryPhone: { contains: q } } },
    { client: { email: { contains: q, mode: "insensitive" } } },
  ];
}

function paidWithinDays(payment, days, now = new Date()) {
  const paidAt = validDate(payment.paidAt);
  if (!paidAt) return false;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return paidAt >= cutoff;
}

function buildSummary(payments, now) {
  return payments.reduce((summary, payment) => {
    const total = Number(payment.total || 0);
    const balance = Number(payment.balanceDue ?? total);
    if (payment.paymentState === "overdue") {
      summary.overdueCount += 1;
      summary.overdueTotal += balance;
      summary.openCount += 1;
      summary.openTotal += balance;
    } else if (payment.paymentState === "receivable") {
      summary.receivableCount += 1;
      summary.receivableTotal += balance;
      summary.openCount += 1;
      summary.openTotal += balance;
    } else if (payment.paymentState === "paid") {
      summary.paidCount += 1;
      summary.paidTotal += total;
      if (paidWithinDays(payment, 30, now)) {
        summary.paid30Count += 1;
        summary.paid30Total += total;
      }
    }
    return summary;
  }, {
    openCount: 0,
    openTotal: 0,
    overdueCount: 0,
    overdueTotal: 0,
    receivableCount: 0,
    receivableTotal: 0,
    paidCount: 0,
    paidTotal: 0,
    paid30Count: 0,
    paid30Total: 0,
  });
}

function filterPayments(payments, status) {
  if (status === "all") return payments;
  if (status === "paid") return payments.filter((payment) => payment.paymentState === "paid");
  if (status === "overdue") return payments.filter((payment) => payment.paymentState === "overdue");
  if (status === "receivable") return payments.filter((payment) => payment.paymentState === "receivable");
  return payments.filter((payment) => isOpenPaymentStatus(payment.statut));
}

function sortPayments(a, b) {
  if (a.paymentState === "paid" || b.paymentState === "paid") {
    return new Date(b.paidAt || b.updatedAt || 0) - new Date(a.paidAt || a.updatedAt || 0);
  }
  return new Date(a.paymentDueAt || a.date || 0) - new Date(b.paymentDueAt || b.date || 0);
}

export async function GET(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "open";
  const q = (searchParams.get("q") || "").trim();
  const limit = Math.min(500, Math.max(25, Number(searchParams.get("limit") || 250)));
  const now = new Date();

  const workOrders = await prisma.workOrder.findMany({
    where: {
      statut: { in: Array.from(PAYMENT_TRACKED_STATUSES) },
      OR: includesSearch(q),
    },
    include: {
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
      payments: { orderBy: [{ paidAt: "asc" }, { id: "asc" }] },
    },
    orderBy: [{ paymentDueAt: "asc" }, { invoiceIssuedAt: "desc" }, { date: "desc" }],
    take: limit,
  });

  const allPayments = workOrders.map((workOrder) => serializePaymentWorkOrder(workOrder, now));
  const filtered = filterPayments(allPayments, status).sort(sortPayments);

  return NextResponse.json({
    payments: filtered,
    summary: buildSummary(allPayments, now),
    status,
  });
}
