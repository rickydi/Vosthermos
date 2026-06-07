import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { getWorkOrderDocumentMeta } from "./work-order-document.js";
import {
  documentConditions,
  documentPaymentSummary,
  documentRows,
  formatDateFr,
  formatMoneyCad,
  formatQuantity,
  getClientCityLine,
  getDocumentDate,
  getDocumentTargetDate,
  getPaymentTermsDays,
  getProjectAddress,
  getProjectType,
  resolveDocumentCompany,
  resolveDocumentNumber,
  stripHtmlTags,
} from "./vosthermos-document.js";

const ACCENT = "#2c3e50";
const ACCENT_LIGHT = "#ecf0f1";
const LIGHT_GRAY = "#f8f9fa";
const MID_GRAY = "#bdc3c7";
const TEXT_DARK = "#2c3e50";
const TEXT_MED = "#555555";
const WHITE = "#ffffff";
const PAID_GREEN = "#0f7a53";
const PAID_BAR_H = 34;
const PAID_BAR_FONT_SIZE = 22;

const PAGE_W = 612;
const PAGE_H = 792;
const LEFT_M = 0.65 * 72;
const RIGHT_M = 0.65 * 72;
const TOP_M = 0.5 * 72;
const CONTENT_W = PAGE_W - LEFT_M - RIGHT_M;
const COMPANY_FOOTER_H = 24;
const MIN_TOTALS_FOOTER_H = 96;
const FOOTER_GAP = 8;
const LINE_GAP = 1; // interligne resserre (avant 1.5) pour densifier le PDF

const BODY_FONT_SIZE = 12;
const INFO_TITLE_SIZE = 10;
const INFO_NAME_SIZE = 10.5;
const INFO_BODY_SIZE = 10;
const INFO_PAD_X = 12;
const INFO_PAD_Y = 11;
const COL_NUM = 34;
const COL_UNIT = 68;
const COL_QTY = 48;
const COL_AMT = 98;
const COL_DESC = CONTENT_W - COL_NUM - COL_UNIT - COL_QTY - COL_AMT;

function invoicePaymentSummary(wo, meta) {
  if (meta.type !== "invoice") {
    return { payments: [], paidTotal: 0, balanceDue: Number(wo.total || 0), isPaid: false, hasPayments: false };
  }
  return documentPaymentSummary(wo);
}

function displayedPaymentRows(wo, meta) {
  const payments = invoicePaymentSummary(wo, meta).payments;
  return payments.length > 4 ? payments.slice(-4) : payments;
}

function totalsFooterHeight(wo, meta) {
  const summary = invoicePaymentSummary(wo, meta);
  if (!summary.hasPayments) return MIN_TOTALS_FOOTER_H;
  const visibleRows = displayedPaymentRows(wo, meta).length;
  const overflowRow = summary.payments.length > visibleRows ? 1 : 0;
  return Math.max(MIN_TOTALS_FOOTER_H, 118 + (visibleRows + overflowRow) * 16);
}

function contentBottom(wo, meta) {
  return PAGE_H - 3 - COMPANY_FOOTER_H - totalsFooterHeight(wo, meta) - FOOTER_GAP;
}

function isPaidInvoice(wo, meta) {
  return meta.type === "invoice" && invoicePaymentSummary(wo, meta).isPaid;
}

function textHeight(doc, text, width, size = 9, font = "Helvetica") {
  doc.font(font).fontSize(size);
  return doc.heightOfString(String(text || ""), { width, lineGap: LINE_GAP });
}

function drawPageBars(doc, paid = false) {
  doc.save();
  const topBarH = paid ? PAID_BAR_H : 8;
  doc.rect(0, 0, PAGE_W, topBarH).fill(paid ? PAID_GREEN : ACCENT);
  if (paid) {
    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(PAID_BAR_FONT_SIZE)
      .text("PAYE", 0, PAID_BAR_H / 2, { width: PAGE_W, align: "center", baseline: "middle" });
  }
  doc.rect(0, PAGE_H - 3, PAGE_W, 3).fill(ACCENT);
  doc.restore();
}

function addDocPage(doc, paid = false) {
  doc.addPage({ size: "LETTER", margin: 0 });
  drawPageBars(doc, paid);
}

function drawLogo(doc, x, y, height = 70) {
  const candidates = [
    path.join(process.cwd(), "public", "images", "Vos-Thermos-Logo.png"),
    path.join(process.cwd(), "public", "images", "Vos-Thermos-Logo-petit.png"),
  ];

  for (const logoPath of candidates) {
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, x, y, { fit: [135, height] });
        return;
      }
    } catch {}
  }

  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(24).text("VOSTHERMOS", x, y + 12);
  doc.fillColor(TEXT_MED).font("Helvetica-Oblique").fontSize(9).text("Reparation de fenetres", x, y + 42);
}

function drawFullHeader(doc, wo, meta, company) {
  const y = TOP_M + 6;
  drawLogo(doc, LEFT_M, y, 62);

  const rightX = LEFT_M + 165;
  const rightW = CONTENT_W - 165;
  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(23)
    .text(meta.labelUpper, rightX, y + 2, { width: rightW, align: "right" });
  doc.fillColor(TEXT_MED).font("Helvetica").fontSize(9)
    .text("Reparation et remplacement de fenetres", rightX, y + 29, { width: rightW, align: "right" });
  doc.fillColor(TEXT_MED).font("Helvetica").fontSize(7.5)
    .text(`${company.address}, ${company.city}, ${company.province} | RBQ : ${company.rbq}`, rightX, y + 44, { width: rightW, align: "right" });

  return y + 72;
}

function drawCompactHeader(doc, wo, meta, documentNumber, pageNum) {
  const y = TOP_M + 4;
  drawLogo(doc, LEFT_M, y, 38);
  doc.fillColor(TEXT_MED).font("Helvetica").fontSize(9)
    .text(`${meta.compactPrefix} - page ${pageNum}`, LEFT_M + 68, y + 2, { width: 260 });
  doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(10)
    .text(wo.client?.name || "", LEFT_M + 68, y + 18, { width: 260 });
  doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(17)
    .text(documentNumber, PAGE_W - RIGHT_M - 220, y + 1, { width: 220, align: "right" });
  doc.moveTo(LEFT_M, y + 45).lineTo(PAGE_W - RIGHT_M, y + 45).strokeColor(MID_GRAY).lineWidth(0.5).stroke();
  return y + 58;
}

function drawInfoBox(doc, wo, company, meta, documentNumber, y) {
  const date = getDocumentDate(wo, meta.type);
  const targetDate = getDocumentTargetDate(wo, meta.type);
  const companyName = (company.legal || "Vosthermos").split(" - ")[0];
  const projectAddress = getProjectAddress(wo, false);

  const leftW = Math.round(CONTENT_W * 0.49);
  const rightW = CONTENT_W - leftW;
  const leftX = LEFT_M + INFO_PAD_X;
  const rightX = LEFT_M + leftW + INFO_PAD_X;
  const leftLineW = leftW - INFO_PAD_X * 2;
  const rightLineW = rightW - INFO_PAD_X * 2;

  const clientLines = [
    wo.client?.company,
    wo.client?.address,
    getClientCityLine(wo.client),
    wo.client?.phone ? `Tel. : ${wo.client.phone}` : null,
    wo.client?.email,
  ].filter(Boolean);
  const details = [
    ["Compagnie", companyName],
    ["Email", company.email || "info@vosthermos.com"],
    ["Date", formatDateFr(date)],
    targetDate ? [meta.dateTargetLabel, meta.type === "invoice" ? `${formatDateFr(targetDate)} (Net ${getPaymentTermsDays(wo)} j.)` : formatDateFr(targetDate)] : null,
    ["Type", getProjectType(wo)],
    [meta.numberLabel, documentNumber],
  ].filter(Boolean);
  const labelW = meta.numberLabel.length > 13 ? 104 : 92;
  const valueGap = 8;
  const valueW = rightLineW - labelW - valueGap;

  const titleH = textHeight(doc, "CLIENT", leftLineW, INFO_TITLE_SIZE, "Helvetica-Bold");
  let leftContentH = titleH + 8 + textHeight(doc, wo.client?.name || "-", leftLineW, INFO_NAME_SIZE, "Helvetica-Bold") + 6;
  for (const line of clientLines) {
    leftContentH += Math.max(12, textHeight(doc, line, leftLineW, INFO_BODY_SIZE, "Helvetica")) + 2;
  }
  if (projectAddress) {
    leftContentH += 7 + textHeight(doc, "ADRESSE DES TRAVAUX", leftLineW, INFO_TITLE_SIZE, "Helvetica-Bold") + 5;
    leftContentH += textHeight(doc, projectAddress, leftLineW, INFO_BODY_SIZE, "Helvetica") + 2;
  }

  let rightContentH = textHeight(doc, "DETAILS", rightLineW, INFO_TITLE_SIZE, "Helvetica-Bold") + 12;
  for (const [label, value] of details) {
    const labelH = textHeight(doc, `${label} :`, labelW, INFO_BODY_SIZE, "Helvetica-Bold");
    const valueH = textHeight(doc, value || "-", valueW, INFO_BODY_SIZE, "Helvetica");
    rightContentH += Math.max(13, labelH, valueH) + 4;
  }

  const h = Math.max(150, Math.ceil(Math.max(leftContentH, rightContentH) + INFO_PAD_Y * 2));

  doc.rect(LEFT_M, y, CONTENT_W, h).fillAndStroke(LIGHT_GRAY, MID_GRAY);
  doc.moveTo(LEFT_M + leftW, y).lineTo(LEFT_M + leftW, y + h).strokeColor(MID_GRAY).lineWidth(0.5).stroke();

  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(INFO_TITLE_SIZE).text("CLIENT", leftX, y + INFO_PAD_Y, { width: leftLineW });
  let cy = y + INFO_PAD_Y + titleH + 8;
  doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(INFO_NAME_SIZE).text(wo.client?.name || "-", leftX, cy, { width: leftLineW });
  cy += textHeight(doc, wo.client?.name || "-", leftLineW, INFO_NAME_SIZE, "Helvetica-Bold") + 6;
  doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(INFO_BODY_SIZE);
  for (const line of clientLines) {
    const lineH = Math.max(12, textHeight(doc, line, leftLineW, INFO_BODY_SIZE, "Helvetica"));
    doc.text(line, leftX, cy, { width: leftLineW, lineGap: LINE_GAP });
    cy += lineH + 2;
  }
  if (projectAddress) {
    cy += 7;
    doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(INFO_TITLE_SIZE)
      .text("ADRESSE DES TRAVAUX", leftX, cy, { width: leftLineW });
    cy += textHeight(doc, "ADRESSE DES TRAVAUX", leftLineW, INFO_TITLE_SIZE, "Helvetica-Bold") + 5;
    doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(INFO_BODY_SIZE)
      .text(projectAddress, leftX, cy, { width: leftLineW, lineGap: LINE_GAP });
  }

  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(INFO_TITLE_SIZE).text("DETAILS", rightX, y + INFO_PAD_Y, { width: rightLineW });
  let dy = y + INFO_PAD_Y + textHeight(doc, "DETAILS", rightLineW, INFO_TITLE_SIZE, "Helvetica-Bold") + 12;
  const valueX = rightX + labelW + valueGap;
  for (const [label, value] of details) {
    const labelH = textHeight(doc, `${label} :`, labelW, INFO_BODY_SIZE, "Helvetica-Bold");
    const valueH = textHeight(doc, value || "-", valueW, INFO_BODY_SIZE, "Helvetica");
    const rowH = Math.max(13, labelH, valueH);
    doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(INFO_BODY_SIZE).text(`${label} :`, rightX, dy, { width: labelW });
    doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(INFO_BODY_SIZE).text(String(value || "-"), valueX, dy, { width: valueW, lineGap: LINE_GAP });
    dy += rowH + 4;
  }

  return y + h + 16;
}

function drawSectionHeading(doc, label, y) {
  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(BODY_FONT_SIZE).text(label, LEFT_M, y, { width: CONTENT_W });
  return y + 20;
}

function ensureSpace(doc, y, needed, onNewPage, bottomY, paid = false) {
  if (y + needed <= bottomY) return y;
  addDocPage(doc, paid);
  return onNewPage();
}

function drawDescription(doc, wo, meta, y, onNewPage) {
  const bottomY = contentBottom(wo, meta);
  y = drawSectionHeading(doc, meta.descriptionHeading, y);
  const description = wo.description || "Travaux de reparation et remplacement de fenetres selon les elements detailles ci-dessous.";
  const h = textHeight(doc, description, CONTENT_W, BODY_FONT_SIZE, "Helvetica");
  y = ensureSpace(doc, y, h + 12, onNewPage, bottomY, isPaidInvoice(wo, meta));
  doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(BODY_FONT_SIZE).text(description, LEFT_M, y, { width: CONTENT_W, lineGap: LINE_GAP });
  return y + h + 12;
}

function drawTableHeader(doc, y) {
  doc.rect(LEFT_M, y, CONTENT_W, 30).fill(ACCENT);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(BODY_FONT_SIZE);
  doc.text("#", LEFT_M, y + 8, { width: COL_NUM, align: "center" });
  doc.text("Description", LEFT_M + COL_NUM + 6, y + 8, { width: COL_DESC - 12 });
  doc.text("Unite", LEFT_M + COL_NUM + COL_DESC, y + 8, { width: COL_UNIT, align: "center" });
  doc.text("Qte", LEFT_M + COL_NUM + COL_DESC + COL_UNIT, y + 8, { width: COL_QTY, align: "center" });
  doc.text("Montant", LEFT_M + COL_NUM + COL_DESC + COL_UNIT + COL_QTY, y + 8, { width: COL_AMT - 6, align: "right" });
  return y + 30;
}

function drawTable(doc, wo, meta, documentNumber, y) {
  let pageNum = doc.bufferedPageRange().count;
  const bottomY = contentBottom(wo, meta);
  const onNewPage = () => {
    pageNum += 1;
    let nextY = drawCompactHeader(doc, wo, meta, documentNumber, pageNum);
    return drawTableHeader(doc, nextY + 8);
  };

  y = drawSectionHeading(doc, "DETAIL DES TRAVAUX", y);
  y = drawTableHeader(doc, y + 4);

  let itemIndex = 1;
  for (const row of documentRows(wo)) {
    if (row.type === "section") {
      y = ensureSpace(doc, y, 30, onNewPage, bottomY, isPaidInvoice(wo, meta));
      doc.rect(LEFT_M, y, CONTENT_W, 30).fill(ACCENT_LIGHT);
      doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(BODY_FONT_SIZE)
        .text(row.label || "TRAVAUX", LEFT_M + COL_NUM + 6, y + 8, { width: CONTENT_W - COL_NUM - 12 });
      doc.moveTo(LEFT_M, y + 30).lineTo(LEFT_M + CONTENT_W, y + 30).strokeColor(MID_GRAY).lineWidth(0.3).stroke();
      y += 30;
      continue;
    }

    const descX = LEFT_M + COL_NUM + 6;
    const descW = COL_DESC - 12;
    const descH = textHeight(doc, row.description, descW, BODY_FONT_SIZE, "Helvetica");
    const rowH = Math.max(32, descH + 12);
    y = ensureSpace(doc, y, rowH, onNewPage, bottomY, isPaidInvoice(wo, meta));

    doc.rect(LEFT_M, y, CONTENT_W, rowH).fill(WHITE);
    doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(BODY_FONT_SIZE)
      .text(String(itemIndex++), LEFT_M, y + 9, { width: COL_NUM, align: "center" });
    doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(BODY_FONT_SIZE)
      .text(row.description, descX, y + 9, { width: descW, lineGap: LINE_GAP });
    doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(BODY_FONT_SIZE)
      .text(row.unit || "Unite", LEFT_M + COL_NUM + COL_DESC, y + 9, { width: COL_UNIT, align: "center" });
    doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(BODY_FONT_SIZE)
      .text(formatQuantity(row.qty), LEFT_M + COL_NUM + COL_DESC + COL_UNIT, y + 9, { width: COL_QTY, align: "center" });
    doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(BODY_FONT_SIZE)
      .text(formatMoneyCad(row.amount), LEFT_M + COL_NUM + COL_DESC + COL_UNIT + COL_QTY, y + 9, { width: COL_AMT - 6, align: "right" });
    doc.moveTo(LEFT_M, y + rowH).lineTo(LEFT_M + CONTENT_W, y + rowH).strokeColor(MID_GRAY).lineWidth(0.3).stroke();
    y += rowH;
  }

  return y + 8;
}

function drawTotalsFooter(doc, wo, meta, y) {
  const width = 270;
  const x = LEFT_M + CONTENT_W - width;
  const summary = invoicePaymentSummary(wo, meta);
  const hasPayments = summary.hasPayments;
  const footerH = totalsFooterHeight(wo, meta);

  doc.rect(LEFT_M, y, CONTENT_W, 2).fill(ACCENT);
  let rowY = y + 11;
  const rows = [
    ["Sous-total", wo.subtotal, true],
    ["TPS (5%)", wo.tps, false],
    ["TVQ (9,975%)", wo.tvq, false],
    ...(hasPayments ? [["Total", wo.total, true]] : []),
  ];
  for (const [label, value, strong] of rows) {
    doc.fillColor(TEXT_DARK).font(strong ? "Helvetica-Bold" : "Helvetica").fontSize(BODY_FONT_SIZE)
      .text(`${label} :`, x + 12, rowY, { width: width - 120, align: "right" });
    doc.fillColor(TEXT_DARK).font(strong ? "Helvetica-Bold" : "Helvetica").fontSize(BODY_FONT_SIZE)
      .text(formatMoneyCad(value), x + width - 102, rowY, { width: 90, align: "right" });
    rowY += 18;
  }

  if (hasPayments) {
    rowY += 2;
    doc.moveTo(x + 12, rowY).lineTo(x + width - 12, rowY).strokeColor(MID_GRAY).lineWidth(0.4).stroke();
    rowY += 7;
    doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(9)
      .text("PAIEMENTS RECUS", x + 12, rowY, { width: width - 24 });
    rowY += 15;

    const paymentRows = displayedPaymentRows(wo, meta);
    const hiddenCount = summary.payments.length - paymentRows.length;
    for (const payment of paymentRows) {
      const method = payment.method ? ` - ${payment.method}` : "";
      const label = `${formatDateFr(payment.paidAt)}${method}`;
      doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(9)
        .text(label, x + 12, rowY, { width: width - 120 });
      doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(9)
        .text(formatMoneyCad(payment.amount), x + width - 102, rowY, { width: 90, align: "right" });
      rowY += 16;
    }
    if (hiddenCount > 0) {
      doc.fillColor(TEXT_MED).font("Helvetica-Oblique").fontSize(8.5)
        .text(`+ ${hiddenCount} paiement(s) precedent(s)`, x + 12, rowY, { width: width - 24 });
    }
  }

  const barY = hasPayments ? y + footerH - 30 : y + 66;
  doc.rect(LEFT_M, barY, CONTENT_W, 28).fill(hasPayments && summary.isPaid ? PAID_GREEN : ACCENT);
  const totalLabel = hasPayments
    ? (summary.isPaid ? "PAYE" : "SOLDE A PAYER")
    : meta.totalLabel;
  const totalValue = hasPayments ? summary.balanceDue : wo.total;
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(BODY_FONT_SIZE)
    .text(`${totalLabel} :`, x + 12, barY + 8, { width: width - 120, align: "right" });
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(BODY_FONT_SIZE)
    .text(formatMoneyCad(totalValue), x + width - 102, barY + 8, { width: 90, align: "right" });
}

function conditionLineHeight(doc, condition) {
  const text = stripHtmlTags(condition);
  return Math.max(16, textHeight(doc, `- ${text}`, CONTENT_W - 10, BODY_FONT_SIZE, "Helvetica")) + 4;
}

function conditionsFooterHeight(doc, meta) {
  const conditions = documentConditions(meta.type);
  if (conditions.length === 0) return 0;
  return conditions.reduce((sum, condition) => sum + conditionLineHeight(doc, condition), 26);
}

function drawFooterConditions(doc, meta, y) {
  const conditions = documentConditions(meta.type);
  if (conditions.length === 0) return;

  doc.moveTo(LEFT_M, y).lineTo(LEFT_M + CONTENT_W, y).strokeColor(MID_GRAY).lineWidth(0.5).stroke();
  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(BODY_FONT_SIZE).text("CONDITIONS", LEFT_M, y + 6, { width: CONTENT_W });
  let cy = y + 26;
  for (const condition of documentConditions(meta.type)) {
    const text = stripHtmlTags(condition);
    const h = conditionLineHeight(doc, condition);
    doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(BODY_FONT_SIZE)
      .text(`- ${text}`, LEFT_M + 10, cy, { width: CONTENT_W - 10, lineGap: LINE_GAP });
    cy += h;
  }
}

function drawFooter(doc, pageNum, totalPages, company, wo, meta) {
  const isLast = pageNum === totalPages;
  const footer = [
    "Vosthermos - Reparation et remplacement de fenetres",
    `${company.address}, ${company.city}, ${company.province}`,
    `RBQ : ${company.rbq}`,
    `TPS : ${company.tps}`,
    `TVQ : ${company.tvq}`,
  ].filter(Boolean).join("  |  ");

  const conditionHeight = isLast ? conditionsFooterHeight(doc, meta) : 0;
  const totalsH = totalsFooterHeight(wo, meta);
  const companyFooterY = PAGE_H - 3 - COMPANY_FOOTER_H;
  const totalsY = conditionHeight > 0
    ? companyFooterY - conditionHeight - totalsH - 4
    : companyFooterY - totalsH;

  drawTotalsFooter(doc, wo, meta, totalsY);
  if (conditionHeight > 0) {
    drawFooterConditions(doc, meta, totalsY + totalsH + 4);
  }

  doc.rect(0, PAGE_H - 3, PAGE_W, 3).fill(ACCENT);
  doc.fillColor(TEXT_MED).font("Helvetica").fontSize(6.8)
    .text(footer, 30, PAGE_H - 22, { width: PAGE_W - 60, align: "center" });
  doc.fillColor(TEXT_MED).font("Helvetica").fontSize(7)
    .text(`Page ${pageNum}`, 30, PAGE_H - 12, { width: PAGE_W - 60, align: "center" });
}

function addFooters(doc, company, wo, meta) {
  const range = doc.bufferedPageRange();
  const totalPages = range.count;
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    drawFooter(doc, i - range.start + 1, totalPages, company, wo, meta);
  }
}

export async function generateInvoicePdf(wo, settings = {}) {
  return new Promise((resolve, reject) => {
    try {
      const meta = getWorkOrderDocumentMeta(wo.statut, settings.documentType);
      const company = resolveDocumentCompany(settings);
      const documentNumber = resolveDocumentNumber(wo, settings.work_order_prefix || "VOS");
      const doc = new PDFDocument({
        size: "LETTER",
        margin: 0,
        autoFirstPage: false,
        bufferPages: true,
        info: {
          Title: `${meta.label} ${documentNumber}`,
          Author: "Vosthermos",
          Subject: `${meta.label} ${documentNumber}`,
        },
      });

      const buffers = [];
      doc.on("data", (buffer) => buffers.push(buffer));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const onNewPage = () => drawCompactHeader(doc, wo, meta, documentNumber, doc.bufferedPageRange().count);

      addDocPage(doc, isPaidInvoice(wo, meta));
      let y = drawFullHeader(doc, wo, meta, company);
      y = drawInfoBox(doc, wo, company, meta, documentNumber, y);
      y = drawDescription(doc, wo, meta, y, onNewPage);
      y = drawTable(doc, wo, meta, documentNumber, y);

      const lastPageFooterHeight = conditionsFooterHeight(doc, meta);
      if (lastPageFooterHeight > 0 && y > contentBottom(wo, meta) - lastPageFooterHeight - 4) {
        addDocPage(doc, isPaidInvoice(wo, meta));
        drawCompactHeader(doc, wo, meta, documentNumber, doc.bufferedPageRange().count);
      }

      addFooters(doc, company, wo, meta);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
