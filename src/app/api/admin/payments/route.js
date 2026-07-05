import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import {
  DEPOSIT_ELIGIBLE_STATUSES,
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
    { payments: { some: { reference: { contains: q, mode: "insensitive" } } } },
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
    } else if (payment.paymentState === "deposit") {
      summary.depositCount += 1;
      summary.depositTotal += Number(payment.paymentsTotal || 0);
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
    depositCount: 0,
    depositTotal: 0,
  });
}

function filterPayments(payments, status) {
  if (status === "all") return payments;
  if (status === "paid") return payments.filter((payment) => payment.paymentState === "paid");
  if (status === "overdue") return payments.filter((payment) => payment.paymentState === "overdue");
  if (status === "receivable") return payments.filter((payment) => payment.paymentState === "receivable");
  if (status === "deposit") return payments.filter((payment) => payment.paymentState === "deposit");
  return payments.filter((payment) => isOpenPaymentStatus(payment.statut));
}

function timeValue(value) {
  return validDate(value)?.getTime() || 0;
}

function firstTime(...values) {
  for (const value of values) {
    const time = timeValue(value);
    if (time) return time;
  }
  return 0;
}

function recentTime(payment) {
  if (payment.paymentState === "paid") {
    return firstTime(payment.paidAt, payment.invoiceIssuedAt, payment.date, payment.createdAt, payment.updatedAt);
  }
  return firstTime(payment.invoiceIssuedAt, payment.date, payment.createdAt, payment.updatedAt);
}

function sortPayments(a, b, sort = "due") {
  if (sort === "recent") {
    return recentTime(b) - recentTime(a);
  }
  if (a.paymentState === "paid" || b.paymentState === "paid") {
    return timeValue(b.paidAt || b.updatedAt) - timeValue(a.paidAt || a.updatedAt);
  }
  return timeValue(a.paymentDueAt || a.date) - timeValue(b.paymentDueAt || b.date);
}

export async function GET(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  // try/catch global: une erreur non geree renverrait une page HTML 500 que le
  // client ne peut pas parser (iOS Safari affichait alors un message cryptique).
  try {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "open";
  const sort = searchParams.get("sort") === "recent" ? "recent" : "due";
  const q = (searchParams.get("q") || "").trim();
  const limit = Math.min(500, Math.max(25, Number(searchParams.get("limit") || 250)));
  const now = new Date();

  // Factures suivies + documents pre-facturation avec acompte (depot demande
  // sur la soumission ou paiement deja inscrit).
  const statusWhere = {
    OR: [
      { statut: { in: Array.from(PAYMENT_TRACKED_STATUSES) } },
      {
        AND: [
          { statut: { in: Array.from(DEPOSIT_ELIGIBLE_STATUSES) } },
          { OR: [{ payments: { some: {} } }, { quoteDepositPercent: { not: null } }] },
        ],
      },
    ],
  };
  const searchWhere = includesSearch(q);
  const workOrders = await prisma.workOrder.findMany({
    where: searchWhere ? { AND: [statusWhere, { OR: searchWhere }] } : statusWhere,
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
      followUp: { select: { id: true, title: true, status: true } },
      payments: { orderBy: [{ paidAt: "asc" }, { id: "asc" }] },
      creditNotes: { orderBy: [{ issuedAt: "asc" }, { id: "asc" }] },
    },
    orderBy: sort === "recent"
      ? [{ invoiceIssuedAt: "desc" }, { date: "desc" }, { createdAt: "desc" }]
      : [{ paymentDueAt: "asc" }, { invoiceIssuedAt: "desc" }, { date: "desc" }],
    take: limit,
  });

  const allPayments = workOrders.map((workOrder) => serializePaymentWorkOrder(workOrder, now));
  const filtered = filterPayments(allPayments, status).sort((a, b) => sortPayments(a, b, sort));

  return NextResponse.json({
    payments: filtered,
    summary: buildSummary(allPayments, now),
    status,
    sort,
  });
  } catch (err) {
    console.error("GET /api/admin/payments:", err);
    return NextResponse.json({ error: "Erreur serveur pendant le chargement des paiements" }, { status: 500 });
  }
}
