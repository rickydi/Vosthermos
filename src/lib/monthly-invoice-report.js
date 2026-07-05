import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { getCompany } from "@/lib/company";
import { INVOICE_STATUSES } from "@/lib/work-order-document";
import {
  documentPaymentSummary,
  formatMoneyCad,
  getDocumentDate,
  getDocumentTargetDate,
  getProjectAddress,
  resolveDocumentNumber,
} from "@/lib/vosthermos-document";

const TZ = "America/Toronto";
const MONTHS_FR = [
  "janvier",
  "fevrier",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "aout",
  "septembre",
  "octobre",
  "novembre",
  "decembre",
];

const REPORT_ACCENT = "#0f766e";
const REPORT_DARK = "#172033";
const REPORT_MUTED = "#667085";
const REPORT_LINE = "#d7dde5";
const REPORT_LIGHT = "#f4f7f9";

function validDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function torontoDateParts(dateLike) {
  const date = validDate(dateLike) || new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return {
    year: parts.find((p) => p.type === "year")?.value || "0000",
    month: parts.find((p) => p.type === "month")?.value || "00",
    day: parts.find((p) => p.type === "day")?.value || "00",
  };
}

export function torontoYearMonth(dateLike) {
  const parts = torontoDateParts(dateLike);
  return `${parts.year}-${parts.month}`;
}

export function monthLabelFr(yearMonth) {
  const [year, month] = String(yearMonth || "").split("-");
  const index = Math.max(0, Math.min(11, Number(month) - 1));
  return `${MONTHS_FR[index]} ${year || ""}`.trim();
}

export function currentYearMonth() {
  return torontoYearMonth(new Date());
}

export function previousYearMonth(from = new Date()) {
  const parts = torontoDateParts(from);
  const date = new Date(Number(parts.year), Number(parts.month) - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function invoiceReportDate(workOrder) {
  return (
    validDate(workOrder?.invoiceIssuedAt) ||
    validDate(workOrder?.date) ||
    validDate(workOrder?.createdAt) ||
    new Date()
  );
}

function dateLabel(dateLike) {
  const date = validDate(dateLike);
  if (!date) return "";
  return date.toLocaleDateString("fr-CA", { timeZone: TZ });
}

function statusLabel(status, paymentSummary = null) {
  if (status === "paid" || paymentSummary?.isPaid) return "Payee";
  if (status === "sent") return "Envoyee";
  if (status === "invoiced") return "Facturee";
  return status || "";
}

function csvSafe(value) {
  let text = String(value ?? "");
  if (/^[=+@]/.test(text) || (text.startsWith("-") && !/^-?\d+(?:[.,]\d+)?$/.test(text))) {
    text = "'" + text;
  }
  return /[",;\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function includeFullWorkOrder() {
  return {
    client: true,
    technician: { select: { name: true } },
    items: {
      orderBy: { position: "asc" },
      include: { product: { select: { sku: true, name: true } } },
    },
    sections: {
      orderBy: { position: "asc" },
      include: {
        items: {
          orderBy: { position: "asc" },
          include: { product: { select: { sku: true, name: true } } },
        },
      },
    },
    payments: { orderBy: [{ paidAt: "asc" }, { id: "asc" }] },
  };
}

function serializeMoneyWorkOrder(workOrder) {
  const serializeItem = (item) => ({
    ...item,
    quantity: Number(item.quantity || 0),
    unitPrice: Number(item.unitPrice || 0),
    totalPrice: Number(item.totalPrice || 0),
  });

  return {
    ...workOrder,
    totalPieces: Number(workOrder.totalPieces || 0),
    totalLabor: Number(workOrder.totalLabor || 0),
    laborRate: Number(workOrder.laborRate || 0),
    subtotal: Number(workOrder.subtotal || 0),
    tps: Number(workOrder.tps || 0),
    tvq: Number(workOrder.tvq || 0),
    total: Number(workOrder.total || 0),
    payments: (workOrder.payments || []).map((payment) => ({
      ...payment,
      amount: Number(payment.amount || 0),
    })),
    items: (workOrder.items || []).filter((item) => !item.sectionId).map(serializeItem),
    sections: (workOrder.sections || []).map((section) => ({
      ...section,
      items: (section.items || []).map(serializeItem),
    })),
  };
}

async function getInvoiceWorkOrders() {
  const rows = await prisma.workOrder.findMany({
    where: { statut: { in: [...INVOICE_STATUSES] } },
    include: includeFullWorkOrder(),
    orderBy: [{ invoiceIssuedAt: "asc" }, { date: "asc" }, { id: "asc" }],
  });
  return rows.map(serializeMoneyWorkOrder);
}

export async function getMonthlyInvoiceWorkOrders(yearMonth) {
  const month = yearMonth || currentYearMonth();
  const rows = await getInvoiceWorkOrders();
  return rows.filter((workOrder) => torontoYearMonth(invoiceReportDate(workOrder)) === month);
}

function serializeCreditNoteRow(creditNote) {
  return {
    ...creditNote,
    subtotal: Number(creditNote.subtotal || 0),
    tps: Number(creditNote.tps || 0),
    tvq: Number(creditNote.tvq || 0),
    total: Number(creditNote.total || 0),
    isRefund: Boolean(creditNote.refundMethod),
  };
}

// Notes de credit / remboursements emis pendant le mois (heure de Toronto).
export async function getMonthlyCreditNotes(yearMonth) {
  const month = yearMonth || currentYearMonth();
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  // Bornes larges (+/- 2 jours autour du mois civil) puis filtre exact en
  // fuseau Toronto : evite les pieges UTC/DST sans matcher tout l'historique.
  const from = new Date(Date.UTC(year, monthIndex, 1) - 2 * 86400000);
  const to = new Date(Date.UTC(year, monthIndex + 1, 1) + 2 * 86400000);
  const rows = await prisma.creditNote.findMany({
    where: { issuedAt: { gte: from, lt: to } },
    orderBy: [{ issuedAt: "asc" }, { id: "asc" }],
  });
  return rows
    .map(serializeCreditNoteRow)
    .filter((row) => torontoYearMonth(row.issuedAt) === month);
}

// Encaissements du mois par DATE DE PAIEMENT (peu importe le mois de la
// facture) : la vue qu'il faut pour concilier avec Moneris / le compte de
// banque. Remboursements du mois soustraits pour donner le net encaisse.
export async function getMonthlyCollections(yearMonth, creditNotes = null) {
  const month = yearMonth || currentYearMonth();
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const from = new Date(Date.UTC(year, monthIndex, 1) - 2 * 86400000);
  const to = new Date(Date.UTC(year, monthIndex + 1, 1) + 2 * 86400000);

  const rows = await prisma.workOrderPayment.findMany({
    where: { paidAt: { gte: from, lt: to } },
    include: { workOrder: { select: { number: true } } },
    orderBy: [{ paidAt: "asc" }, { id: "asc" }],
  });
  const payments = rows
    .map((row) => ({
      amount: Number(row.amount || 0),
      method: row.method || "Paiement",
      reference: row.reference || null,
      paidAt: row.paidAt,
      workOrderNumber: row.workOrder?.number || "",
    }))
    .filter((row) => torontoYearMonth(row.paidAt) === month);

  const notes = creditNotes || await getMonthlyCreditNotes(month);
  const refunds = notes.filter((note) => note.isRefund);

  const byMethod = {};
  let total = 0;
  for (const payment of payments) {
    total += payment.amount;
    byMethod[payment.method] = roundMoney((byMethod[payment.method] || 0) + payment.amount);
  }

  const refundByMethod = {};
  let refundTotal = 0;
  for (const refund of refunds) {
    refundTotal += refund.total;
    const method = refund.refundMethod || "Autre";
    refundByMethod[method] = roundMoney((refundByMethod[method] || 0) + refund.total);
  }

  return {
    count: payments.length,
    total: roundMoney(total),
    byMethod,
    refundCount: refunds.length,
    refundTotal: roundMoney(refundTotal),
    refundByMethod,
    netTotal: roundMoney(total - refundTotal),
  };
}

// Charge en un appel tout ce que le rapport mensuel ajoute aux factures.
export async function getMonthlyReportExtras(yearMonth) {
  const creditNotes = await getMonthlyCreditNotes(yearMonth);
  const collections = await getMonthlyCollections(yearMonth, creditNotes);
  return { creditNotes, collections };
}

export async function listInvoiceReportMonths() {
  const rows = await prisma.workOrder.findMany({
    where: { statut: { in: [...INVOICE_STATUSES] } },
    select: { invoiceIssuedAt: true, date: true, createdAt: true },
  });
  const months = new Set(rows.map((row) => torontoYearMonth(row.invoiceIssuedAt || row.date || row.createdAt)));
  return [...months].sort().reverse();
}

export function computeMonthlyInvoiceTotals(workOrders, creditNotes = []) {
  const totals = {
    count: 0,
    paidCount: 0,
    openCount: 0,
    overdueCount: 0,
    subtotal: 0,
    tps: 0,
    tvq: 0,
    total: 0,
    paidTotal: 0,
    balanceDue: 0,
    byMethod: {},
    // Avoirs purs (argent garde) vs remboursements (argent sorti du compte).
    creditCount: 0,
    creditTotal: 0,
    refundCount: 0,
    refundTotal: 0,
    refundByMethod: {},
    netTotal: 0,
  };
  const now = new Date();

  for (const workOrder of workOrders || []) {
    const summary = documentPaymentSummary(workOrder);
    const dueDate = getDocumentTargetDate(workOrder, "invoice");
    const isOverdue = !summary.isPaid && dueDate && dueDate < now;

    totals.count += 1;
    totals.subtotal += Number(workOrder.subtotal || 0);
    totals.tps += Number(workOrder.tps || 0);
    totals.tvq += Number(workOrder.tvq || 0);
    totals.total += Number(workOrder.total || 0);
    totals.paidTotal += Number(summary.paidTotal || 0);
    totals.balanceDue += Number(summary.balanceDue || 0);
    if (summary.isPaid) totals.paidCount += 1;
    else totals.openCount += 1;
    if (isOverdue) totals.overdueCount += 1;

    for (const payment of summary.payments || []) {
      const method = payment.method || workOrder.paymentMethod || "Paiement";
      totals.byMethod[method] = roundMoney((totals.byMethod[method] || 0) + Number(payment.amount || 0));
    }
  }

  for (const note of creditNotes || []) {
    const amount = Number(note.total || 0);
    if (note.isRefund || note.refundMethod) {
      totals.refundCount += 1;
      totals.refundTotal += amount;
      const method = note.refundMethod || "Autre";
      totals.refundByMethod[method] = roundMoney((totals.refundByMethod[method] || 0) + amount);
    } else {
      totals.creditCount += 1;
      totals.creditTotal += amount;
    }
  }

  return {
    ...totals,
    subtotal: roundMoney(totals.subtotal),
    tps: roundMoney(totals.tps),
    tvq: roundMoney(totals.tvq),
    total: roundMoney(totals.total),
    paidTotal: roundMoney(totals.paidTotal),
    balanceDue: roundMoney(totals.balanceDue),
    creditTotal: roundMoney(totals.creditTotal),
    refundTotal: roundMoney(totals.refundTotal),
    netTotal: roundMoney(totals.total - totals.creditTotal - totals.refundTotal),
  };
}

export function buildMonthlyInvoiceCsv(workOrders, creditNotes = []) {
  const headers = [
    "Type",
    "Date facture",
    "Numero",
    "Statut",
    "Client",
    "Courriel",
    "Adresse travaux",
    "Sous-total",
    "TPS",
    "TVQ",
    "Total",
    "Paye",
    "Solde",
    "Echeance",
    "Date paiement",
    "Mode paiement",
    "No transaction",
    "Details paiements",
  ];

  const rows = (workOrders || []).map((workOrder) => {
    const summary = documentPaymentSummary(workOrder);
    const payments = summary.payments || [];
    const lastPayment = payments[payments.length - 1] || null;
    const paymentDetails = payments
      .map((payment) => `${dateLabel(payment.paidAt)} ${payment.method || "Paiement"}${payment.reference ? ` #${payment.reference}` : ""} ${Number(payment.amount || 0).toFixed(2)}`.trim())
      .join(" | ");

    return [
      "Facture",
      dateLabel(getDocumentDate(workOrder, "invoice")),
      resolveDocumentNumber(workOrder),
      statusLabel(workOrder.statut, summary),
      workOrder.client?.name || "",
      workOrder.client?.email || "",
      getProjectAddress(workOrder, false),
      Number(workOrder.subtotal || 0).toFixed(2),
      Number(workOrder.tps || 0).toFixed(2),
      Number(workOrder.tvq || 0).toFixed(2),
      Number(workOrder.total || 0).toFixed(2),
      Number(summary.paidTotal || 0).toFixed(2),
      Number(summary.balanceDue || 0).toFixed(2),
      dateLabel(getDocumentTargetDate(workOrder, "invoice")),
      lastPayment ? dateLabel(lastPayment.paidAt) : "",
      lastPayment?.method || workOrder.paymentMethod || "",
      lastPayment?.reference || "",
      paymentDetails,
    ];
  });

  // Notes de credit et remboursements du mois : montants NEGATIFS pour que la
  // somme de la colonne Total donne le net du mois directement dans Excel.
  const creditRows = (creditNotes || []).map((note) => [
    note.isRefund || note.refundMethod ? "Remboursement" : "Note de credit",
    dateLabel(note.issuedAt),
    note.number,
    "",
    note.clientName || "",
    note.clientEmail || "",
    "",
    (-Number(note.subtotal || 0)).toFixed(2),
    (-Number(note.tps || 0)).toFixed(2),
    (-Number(note.tvq || 0)).toFixed(2),
    (-Number(note.total || 0)).toFixed(2),
    "",
    "",
    "",
    dateLabel(note.issuedAt),
    note.refundMethod || "",
    note.refundRef || "",
    [`Facture d'origine: ${note.invoiceNumber || "-"}`, note.reason || ""].filter(Boolean).join(" | "),
  ]);

  return "\uFEFF" + [headers, ...rows, ...creditRows].map((row) => row.map(csvSafe).join(";")).join("\r\n");
}

function drawLogo(doc, x, y, height = 50) {
  const candidates = [
    path.join(process.cwd(), "public", "images", "Vos-Thermos-Logo.png"),
    path.join(process.cwd(), "public", "images", "Vos-Thermos-Logo-petit.png"),
  ];

  for (const logoPath of candidates) {
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, x, y, { fit: [125, height] });
        return;
      }
    } catch {}
  }

  doc.fillColor(REPORT_DARK).font("Helvetica-Bold").fontSize(20).text("VOSTHERMOS", x, y + 8);
}

async function createPdfBuffer(render) {
  const { default: PDFDocument } = await import("pdfkit");
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 0, autoFirstPage: true, bufferPages: true });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    render(doc);
    doc.end();
  });
}

function fitText(value, max = 34) {
  const text = String(value || "");
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function drawMoneyLine(doc, label, value, x, y, width, bold = false) {
  doc.fillColor(bold ? REPORT_DARK : REPORT_MUTED).font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(10)
    .text(label, x, y, { width: width - 120 });
  doc.fillColor(REPORT_DARK).font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(10)
    .text(formatMoneyCad(value), x + width - 120, y, { width: 120, align: "right" });
}

function addFooter(doc, company) {
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i += 1) {
    doc.switchToPage(i);
    doc.fillColor(REPORT_MUTED).font("Helvetica").fontSize(8)
      .text(`${company.legalName || "Vosthermos"} - Rapport genere le ${dateLabel(new Date())}`, 46, 762, { width: 520 });
  }
}

export async function renderMonthlyInvoiceReportPdf(yearMonth, workOrders, extras = null) {
  const { creditNotes, collections } = extras || await getMonthlyReportExtras(yearMonth);
  const totals = computeMonthlyInvoiceTotals(workOrders, creditNotes);
  const company = await getCompany();
  const label = monthLabelFr(yearMonth);
  const hasCredits = totals.creditCount > 0 || totals.refundCount > 0;

  return createPdfBuffer((doc) => {
    const left = 46;
    const right = 566;
    const width = right - left;
    let y = 42;

    const ensureSpace = (needed) => {
      if (y + needed > 748) {
        doc.addPage({ size: "LETTER", margin: 0 });
        y = 46;
      }
    };

    doc.rect(0, 0, 612, 94).fill(REPORT_DARK);
    doc.rect(0, 90, 612, 4).fill(REPORT_ACCENT);
    drawLogo(doc, left, 24, 46);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(21)
      .text("RAPPORT MENSUEL", 260, 30, { width: 306, align: "right" });
    doc.fillColor("#b7f4ea").font("Helvetica-Bold").fontSize(12)
      .text(label.toUpperCase(), 260, 57, { width: 306, align: "right" });
    y = 124;

    doc.fillColor(REPORT_ACCENT).font("Helvetica-Bold").fontSize(11)
      .text("RESUME COMPTABLE", left, y);
    y += 20;

    const summaryLines = [
      [`Factures (${totals.count})`, totals.total, { bold: true }],
      ["Sous-total", totals.subtotal, {}],
      ["TPS", totals.tps, {}],
      ["TVQ", totals.tvq, {}],
    ];
    if (totals.creditCount > 0) {
      summaryLines.push([`Notes de credit - avoirs (${totals.creditCount})`, -totals.creditTotal, {}]);
    }
    if (totals.refundCount > 0) {
      summaryLines.push([`Remboursements (${totals.refundCount})`, -totals.refundTotal, {}]);
    }
    if (hasCredits) {
      summaryLines.push(["NET (factures - avoirs - remboursements)", totals.netTotal, { bold: true }]);
    }
    summaryLines.push(["Solde a recevoir", totals.balanceDue, { bold: true }]);

    const cardH = 18 + summaryLines.length * 18 + 6;
    doc.roundedRect(left, y, width, cardH, 8).fillAndStroke(REPORT_LIGHT, REPORT_LINE);
    summaryLines.forEach(([lineLabel, value, opts], index) => {
      drawMoneyLine(doc, lineLabel, value, left + 18, y + 16 + index * 18, width - 36, Boolean(opts.bold));
    });
    y += cardH + 28;

    doc.fillColor(REPORT_ACCENT).font("Helvetica-Bold").fontSize(11)
      .text("ETAT DES PAIEMENTS", left, y);
    y += 18;
    const stats = [
      ["Payees", totals.paidCount],
      ["Ouvertes", totals.openCount],
      ["En retard", totals.overdueCount],
      ["Encaisse", formatMoneyCad(totals.paidTotal)],
    ];
    const statW = (width - 24) / 4;
    stats.forEach(([name, value], index) => {
      const x = left + index * (statW + 8);
      doc.roundedRect(x, y, statW, 58, 7).fillAndStroke("#ffffff", REPORT_LINE);
      doc.fillColor(REPORT_MUTED).font("Helvetica-Bold").fontSize(8)
        .text(name.toUpperCase(), x + 10, y + 12, { width: statW - 20 });
      doc.fillColor(REPORT_DARK).font("Helvetica-Bold").fontSize(14)
        .text(String(value), x + 10, y + 30, { width: statW - 20 });
    });
    y += 88;

    const methods = Object.keys(totals.byMethod);
    if (methods.length) {
      ensureSpace(30 + methods.length * 16);
      doc.fillColor(REPORT_ACCENT).font("Helvetica-Bold").fontSize(11)
        .text("PAR MODE (paiements des factures du mois)", left, y);
      y += 18;
      methods.forEach((method) => {
        drawMoneyLine(doc, method, totals.byMethod[method], left + 4, y, width - 8);
        y += 16;
      });
      y += 12;
    }

    // Conciliation banque/Moneris : tout ce qui est ENTRE dans le mois (par
    // date de paiement, peu importe le mois de facturation) moins ce qui est
    // SORTI en remboursements.
    if (collections && (collections.count > 0 || collections.refundCount > 0)) {
      const collectionMethods = Object.keys(collections.byMethod);
      const refundMethods = Object.keys(collections.refundByMethod);
      ensureSpace(48 + (collectionMethods.length + refundMethods.length + 3) * 16);
      doc.fillColor(REPORT_ACCENT).font("Helvetica-Bold").fontSize(11)
        .text("ENCAISSEMENTS DU MOIS (par date de paiement)", left, y);
      y += 18;
      drawMoneyLine(doc, `Encaisse (${collections.count} paiement${collections.count > 1 ? "s" : ""})`, collections.total, left + 4, y, width - 8, true);
      y += 16;
      collectionMethods.forEach((method) => {
        drawMoneyLine(doc, `   ${method}`, collections.byMethod[method], left + 4, y, width - 8);
        y += 16;
      });
      if (collections.refundCount > 0) {
        drawMoneyLine(doc, `Rembourse (${collections.refundCount})`, -collections.refundTotal, left + 4, y, width - 8, true);
        y += 16;
        refundMethods.forEach((method) => {
          drawMoneyLine(doc, `   ${method}`, -collections.refundByMethod[method], left + 4, y, width - 8);
          y += 16;
        });
        drawMoneyLine(doc, "Net encaisse", collections.netTotal, left + 4, y, width - 8, true);
        y += 16;
      }
      y += 12;
    }

    ensureSpace(60);
    doc.fillColor(REPORT_ACCENT).font("Helvetica-Bold").fontSize(11)
      .text("DETAIL DES FACTURES", left, y);
    y += 18;

    const drawHeader = () => {
      doc.rect(left, y, width, 22).fill(REPORT_DARK);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8)
        .text("DATE", left + 6, y + 7, { width: 52 })
        .text("NUMERO", left + 64, y + 7, { width: 102 })
        .text("CLIENT", left + 174, y + 7, { width: 190 })
        .text("STATUT", left + 368, y + 7, { width: 70 })
        .text("TOTAL", left + 438, y + 7, { width: width - 444, align: "right" });
      y += 26;
    };
    drawHeader();

    for (const workOrder of workOrders || []) {
      if (y > 724) {
        doc.addPage({ size: "LETTER", margin: 0 });
        y = 46;
        drawHeader();
      }
      const summary = documentPaymentSummary(workOrder);
      doc.fillColor(REPORT_MUTED).font("Helvetica").fontSize(8.5)
        .text(dateLabel(getDocumentDate(workOrder, "invoice")), left + 6, y, { width: 52 });
      doc.fillColor(REPORT_DARK).font("Helvetica").fontSize(8.5)
        .text(resolveDocumentNumber(workOrder), left + 64, y, { width: 102 });
      doc.fillColor(REPORT_DARK).font("Helvetica").fontSize(8.5)
        .text(fitText(workOrder.client?.name, 32), left + 174, y, { width: 190 });
      doc.fillColor(summary.isPaid ? REPORT_ACCENT : REPORT_MUTED).font("Helvetica-Bold").fontSize(8)
        .text(statusLabel(workOrder.statut, summary), left + 368, y, { width: 70 });
      doc.fillColor(REPORT_DARK).font("Helvetica-Bold").fontSize(8.5)
        .text(formatMoneyCad(workOrder.total), left + 438, y, { width: width - 444, align: "right" });
      y += 18;
      doc.moveTo(left, y - 6).lineTo(right, y - 6).strokeColor(REPORT_LINE).lineWidth(0.4).stroke();
    }

    // Notes de credit et remboursements du mois a la suite du detail.
    for (const note of creditNotes || []) {
      if (y > 724) {
        doc.addPage({ size: "LETTER", margin: 0 });
        y = 46;
        drawHeader();
      }
      const isRefund = note.isRefund || Boolean(note.refundMethod);
      doc.fillColor(REPORT_MUTED).font("Helvetica").fontSize(8.5)
        .text(dateLabel(note.issuedAt), left + 6, y, { width: 52 });
      doc.fillColor(REPORT_DARK).font("Helvetica").fontSize(8.5)
        .text(note.number, left + 64, y, { width: 102 });
      doc.fillColor(REPORT_DARK).font("Helvetica").fontSize(8.5)
        .text(fitText(note.clientName, 32), left + 174, y, { width: 190 });
      doc.fillColor("#b45309").font("Helvetica-Bold").fontSize(8)
        .text(isRefund ? "Rembourse" : "Avoir", left + 368, y, { width: 70 });
      doc.fillColor("#b45309").font("Helvetica-Bold").fontSize(8.5)
        .text(`- ${formatMoneyCad(note.total)}`, left + 438, y, { width: width - 444, align: "right" });
      y += 18;
      doc.moveTo(left, y - 6).lineTo(right, y - 6).strokeColor(REPORT_LINE).lineWidth(0.4).stroke();
    }

    addFooter(doc, company);
  });
}

export async function getMonthlyInvoiceReportSummary(yearMonth) {
  const month = yearMonth || currentYearMonth();
  const [workOrders, months, extras] = await Promise.all([
    getMonthlyInvoiceWorkOrders(month),
    listInvoiceReportMonths(),
    getMonthlyReportExtras(month),
  ]);
  return {
    month,
    monthLabel: monthLabelFr(month),
    months,
    totals: computeMonthlyInvoiceTotals(workOrders, extras.creditNotes),
    collections: extras.collections,
  };
}
