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
import { filterPaymentsBySearch, rankPaymentsBySearch } from "@/lib/payment-search";

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

function paymentResponse(payment) {
  return {
    id: payment.id,
    number: payment.number,
    date: payment.date,
    statut: payment.statut,
    total: payment.total,
    quoteDepositPercent: payment.quoteDepositPercent,
    invoiceIssuedAt: payment.invoiceIssuedAt,
    invoiceSentAt: payment.invoiceSentAt,
    paymentDueAt: payment.paymentDueAt,
    paidAt: payment.paidAt,
    paymentMethod: payment.paymentMethod,
    client: payment.client ? {
      id: payment.client.id,
      name: payment.client.name,
      company: payment.client.company,
      phone: payment.client.phone,
      secondaryPhone: payment.client.secondaryPhone,
      email: payment.client.email,
    } : null,
    payments: payment.payments,
    creditNotes: payment.creditNotes,
    paymentsTotal: payment.paymentsTotal,
    balanceDue: payment.balanceDue,
    hasPartialPayments: payment.hasPartialPayments,
    paymentTermsDays: payment.paymentTermsDays,
    paymentState: payment.paymentState,
    daysLate: payment.daysLate,
    daysUntilDue: payment.daysUntilDue,
  };
}

export async function GET(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  // try/catch global: une erreur non geree renverrait une page HTML 500 que le
  // client ne peut pas parser (iOS Safari affichait alors un message cryptique).
  try {
  const { searchParams } = new URL(req.url);
  const requestedStatus = searchParams.get("status") || "open";
  const sort = searchParams.get("sort") === "recent" ? "recent" : "due";
  const q = (searchParams.get("q") || "").trim().slice(0, 100);
  const status = q ? "all" : requestedStatus;
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
  const workOrders = await prisma.workOrder.findMany({
    where: statusWhere,
    select: {
      id: true,
      number: true,
      date: true,
      interventionAddress: true,
      interventionCity: true,
      interventionPostalCode: true,
      description: true,
      statut: true,
      notes: true,
      totalPieces: true,
      totalLabor: true,
      laborRate: true,
      subtotal: true,
      tps: true,
      tvq: true,
      total: true,
      quoteDepositPercent: true,
      invoiceIssuedAt: true,
      invoiceSentAt: true,
      paymentDueAt: true,
      paidAt: true,
      paymentMethod: true,
      paymentNotes: true,
      createdAt: true,
      updatedAt: true,
      client: {
        select: {
          id: true,
          name: true,
          type: true,
          company: true,
          contactName: true,
          address: true,
          province: true,
          postalCode: true,
          phone: true,
          secondaryPhone: true,
          email: true,
          city: true,
          notes: true,
          paymentTermsDays: true,
        },
      },
      technician: { select: { id: true, name: true } },
      followUp: { select: { id: true, title: true, status: true } },
      payments: {
        select: { id: true, amount: true, method: true, reference: true, note: true, paidAt: true, createdAt: true, updatedAt: true },
        orderBy: [{ paidAt: "asc" }, { id: "asc" }],
      },
      creditNotes: {
        select: { id: true, number: true, subtotal: true, tps: true, tvq: true, total: true, refundMethod: true, refundRef: true, reason: true, issuedAt: true },
        orderBy: [{ issuedAt: "asc" }, { id: "asc" }],
      },
    },
    orderBy: sort === "recent"
      ? [{ invoiceIssuedAt: "desc" }, { date: "desc" }, { createdAt: "desc" }]
      : [{ paymentDueAt: "asc" }, { invoiceIssuedAt: "desc" }, { date: "desc" }],
    // Une recherche doit pouvoir trouver un ancien paiement au-dela des 500
    // premieres lignes. On limite seulement APRES le calcul des soldes et la
    // recherche globale. Sans recherche, on conserve la limite habituelle.
    take: q ? undefined : limit,
  });

  const allPayments = workOrders.map((workOrder) => serializePaymentWorkOrder(workOrder, now));
  const searchedPayments = filterPaymentsBySearch(allPayments, q);
  const sortedPayments = filterPayments(searchedPayments, status)
    .sort((a, b) => sortPayments(a, b, sort));
  const filtered = (q ? rankPaymentsBySearch(sortedPayments, q) : sortedPayments).slice(0, limit);

  return NextResponse.json({
    payments: filtered.map(paymentResponse),
    summary: buildSummary(searchedPayments, now),
    status,
    sort,
  });
  } catch (err) {
    console.error("GET /api/admin/payments:", err);
    return NextResponse.json({ error: "Erreur serveur pendant le chargement des paiements" }, { status: 500 });
  }
}
