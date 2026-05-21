import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { getWorkOrderDocumentMeta } from "./work-order-document.js";
import {
  documentConditions,
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

const PAGE_W = 612;
const PAGE_H = 792;
const LEFT_M = 0.65 * 72;
const RIGHT_M = 0.65 * 72;
const TOP_M = 0.5 * 72;
const BOT_M = 0.75 * 72;
const CONTENT_W = PAGE_W - LEFT_M - RIGHT_M;
const FOOTER_TOP = PAGE_H - BOT_M;

const COL_NUM = 28;
const COL_UNIT = 58;
const COL_QTY = 42;
const COL_AMT = 82;
const COL_DESC = CONTENT_W - COL_NUM - COL_UNIT - COL_QTY - COL_AMT;

function textHeight(doc, text, width, size = 9, font = "Helvetica") {
  doc.font(font).fontSize(size);
  return doc.heightOfString(String(text || ""), { width, lineGap: 1.5 });
}

function drawPageBars(doc) {
  doc.save();
  doc.rect(0, 0, PAGE_W, 8).fill(ACCENT);
  doc.rect(0, PAGE_H - 3, PAGE_W, 3).fill(ACCENT);
  doc.restore();
}

function addDocPage(doc) {
  doc.addPage({ size: "LETTER", margin: 0 });
  drawPageBars(doc);
}

function drawLogo(doc, x, y, height = 70) {
  const candidates = [
    path.join(process.cwd(), "public", "images", "Vos-Thermos-Logo.png"),
    path.join(process.cwd(), "public", "images", "Vos-Thermos-Logo-petit.png"),
  ];

  for (const logoPath of candidates) {
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, x, y, { fit: [110, height] });
        return;
      }
    } catch {}
  }

  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(24).text("VOSTHERMOS", x, y + 12);
  doc.fillColor(TEXT_MED).font("Helvetica-Oblique").fontSize(9).text("Reparation de fenetres", x, y + 42);
}

function drawFullHeader(doc, meta, company) {
  const y = TOP_M + 6;
  drawLogo(doc, LEFT_M, y, 70);

  const rightX = LEFT_M + 190;
  const rightW = CONTENT_W - 190;
  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(26)
    .text(meta.labelUpper, rightX, y + 2, { width: rightW, align: "right" });
  doc.fillColor(TEXT_MED).font("Helvetica").fontSize(10)
    .text("Reparation et remplacement de fenetres", rightX, y + 34, { width: rightW, align: "right" });
  doc.fillColor(TEXT_MED).font("Helvetica").fontSize(8)
    .text(`${company.address}, ${company.city}, ${company.province} | RBQ : ${company.rbq}`, rightX, y + 54, { width: rightW, align: "right" });

  return y + 82;
}

function drawCompactHeader(doc, wo, meta, documentNumber, pageNum) {
  const y = TOP_M + 4;
  drawLogo(doc, LEFT_M, y, 32);
  doc.fillColor(TEXT_MED).font("Helvetica").fontSize(9)
    .text(`${meta.compactPrefix} - page ${pageNum}`, LEFT_M + 54, y + 2, { width: 260 });
  doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(10)
    .text(wo.client?.name || "", LEFT_M + 54, y + 18, { width: 260 });
  doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(17)
    .text(documentNumber, PAGE_W - RIGHT_M - 220, y + 1, { width: 220, align: "right" });
  doc.moveTo(LEFT_M, y + 45).lineTo(PAGE_W - RIGHT_M, y + 45).strokeColor(MID_GRAY).lineWidth(0.5).stroke();
  return y + 58;
}

function drawInfoBox(doc, wo, meta, documentNumber, y) {
  const h = 98;
  const colW = CONTENT_W / 2;
  const date = getDocumentDate(wo);
  const targetDate = getDocumentTargetDate(wo, meta.type);

  doc.rect(LEFT_M, y, CONTENT_W, h).fillAndStroke(LIGHT_GRAY, MID_GRAY);
  doc.moveTo(LEFT_M + colW, y).lineTo(LEFT_M + colW, y + h).strokeColor(MID_GRAY).lineWidth(0.5).stroke();

  const leftX = LEFT_M + 10;
  const rightX = LEFT_M + colW + 10;
  const lineW = colW - 20;

  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(9).text("CLIENT", leftX, y + 10, { width: lineW });
  doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(9).text(wo.client?.name || "-", leftX, y + 28, { width: lineW });
  let cy = y + 42;
  const clientLines = [
    wo.client?.company,
    wo.client?.address,
    getClientCityLine(wo.client),
    wo.client?.phone ? `Tel. : ${wo.client.phone}` : null,
    wo.client?.email,
  ].filter(Boolean);
  doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(9);
  for (const line of clientLines) {
    doc.text(line, leftX, cy, { width: lineW });
    cy += 12;
  }

  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(9).text("DETAILS", rightX, y + 10, { width: lineW });
  let dy = y + 28;
  const details = [
    ["Date", formatDateFr(date)],
    targetDate ? [meta.dateTargetLabel, meta.type === "invoice" ? `${formatDateFr(targetDate)} (Net ${getPaymentTermsDays(wo)} j.)` : formatDateFr(targetDate)] : null,
    ["Type", getProjectType(wo)],
    ["Adresse des travaux", getProjectAddress(wo, false) || "-"],
    [meta.numberLabel, documentNumber],
  ].filter(Boolean);

  for (const [label, value] of details) {
    doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(8.5).text(`${label} :`, rightX, dy, { width: 96 });
    doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(8.5).text(String(value || "-"), rightX + 98, dy, { width: lineW - 98 });
    dy += label === "Adresse des travaux" ? 20 : 12;
  }

  return y + h + 16;
}

function drawSectionHeading(doc, label, y) {
  doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(11).text(label, LEFT_M, y, { width: CONTENT_W });
  return y + 18;
}

function ensureSpace(doc, y, needed, onNewPage) {
  if (y + needed <= FOOTER_TOP - 8) return y;
  addDocPage(doc);
  return onNewPage();
}

function drawDescription(doc, wo, meta, y, onNewPage) {
  y = drawSectionHeading(doc, meta.descriptionHeading, y);
  const description = wo.description || "Travaux de reparation et remplacement de fenetres selon les elements detailles ci-dessous.";
  const h = textHeight(doc, description, CONTENT_W, 9, "Helvetica");
  y = ensureSpace(doc, y, h + 12, onNewPage);
  doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(9).text(description, LEFT_M, y, { width: CONTENT_W, lineGap: 1.5 });
  return y + h + 16;
}

function drawTableHeader(doc, y) {
  doc.rect(LEFT_M, y, CONTENT_W, 22).fill(ACCENT);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(8);
  doc.text("#", LEFT_M, y + 7, { width: COL_NUM, align: "center" });
  doc.text("Description", LEFT_M + COL_NUM + 6, y + 7, { width: COL_DESC - 12 });
  doc.text("Unite", LEFT_M + COL_NUM + COL_DESC, y + 7, { width: COL_UNIT, align: "center" });
  doc.text("Qte", LEFT_M + COL_NUM + COL_DESC + COL_UNIT, y + 7, { width: COL_QTY, align: "center" });
  doc.text("Montant", LEFT_M + COL_NUM + COL_DESC + COL_UNIT + COL_QTY, y + 7, { width: COL_AMT - 6, align: "right" });
  return y + 22;
}

function drawTable(doc, wo, meta, documentNumber, y) {
  let pageNum = doc.bufferedPageRange().count;
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
      y = ensureSpace(doc, y, 22, onNewPage);
      doc.rect(LEFT_M, y, CONTENT_W, 22).fill(ACCENT_LIGHT);
      doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(9)
        .text(row.label || "TRAVAUX", LEFT_M + COL_NUM + 6, y + 6, { width: CONTENT_W - COL_NUM - 12 });
      doc.moveTo(LEFT_M, y + 22).lineTo(LEFT_M + CONTENT_W, y + 22).strokeColor(MID_GRAY).lineWidth(0.3).stroke();
      y += 22;
      continue;
    }

    const descX = LEFT_M + COL_NUM + 6;
    const descW = COL_DESC - 12;
    const descH = textHeight(doc, row.description, descW, 8, "Helvetica");
    const rowH = Math.max(28, descH + 12);
    y = ensureSpace(doc, y, rowH, onNewPage);

    doc.rect(LEFT_M, y, CONTENT_W, rowH).fill(WHITE);
    doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(8)
      .text(String(itemIndex++), LEFT_M, y + 7, { width: COL_NUM, align: "center" });
    doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(8)
      .text(row.description, descX, y + 7, { width: descW, lineGap: 1.2 });
    doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(8)
      .text(row.unit || "Unite", LEFT_M + COL_NUM + COL_DESC, y + 7, { width: COL_UNIT, align: "center" });
    doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(8)
      .text(formatQuantity(row.qty), LEFT_M + COL_NUM + COL_DESC + COL_UNIT, y + 7, { width: COL_QTY, align: "center" });
    doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(8)
      .text(formatMoneyCad(row.amount), LEFT_M + COL_NUM + COL_DESC + COL_UNIT + COL_QTY, y + 7, { width: COL_AMT - 6, align: "right" });
    doc.moveTo(LEFT_M, y + rowH).lineTo(LEFT_M + CONTENT_W, y + rowH).strokeColor(MID_GRAY).lineWidth(0.3).stroke();
    y += rowH;
  }

  return y + 8;
}

function drawTotals(doc, wo, meta, y, onNewPage) {
  const width = 270;
  const x = LEFT_M + CONTENT_W - width;
  const height = 94;
  y = ensureSpace(doc, y, height + 10, onNewPage);

  doc.moveTo(LEFT_M, y).lineTo(LEFT_M + CONTENT_W, y).strokeColor(MID_GRAY).lineWidth(0.5).stroke();
  let rowY = y + 11;
  const rows = [
    ["Sous-total", wo.subtotal, true],
    ["TPS (5%)", wo.tps, false],
    ["TVQ (9,975%)", wo.tvq, false],
  ];
  for (const [label, value, strong] of rows) {
    doc.fillColor(TEXT_DARK).font(strong ? "Helvetica-Bold" : "Helvetica").fontSize(9)
      .text(`${label} :`, x + 12, rowY, { width: width - 120, align: "right" });
    doc.fillColor(TEXT_DARK).font(strong ? "Helvetica-Bold" : "Helvetica").fontSize(9)
      .text(formatMoneyCad(value), x + width - 102, rowY, { width: 90, align: "right" });
    rowY += 16;
  }

  const barY = y + 62;
  doc.rect(LEFT_M, barY, CONTENT_W, 34).fill(ACCENT);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(10)
    .text(`${meta.totalLabel} :`, x + 12, barY + 12, { width: width - 120, align: "right" });
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(10)
    .text(formatMoneyCad(wo.total), x + width - 102, barY + 12, { width: 90, align: "right" });

  return y + height + 18;
}

function drawConditionLine(doc, condition, y) {
  const text = stripHtmlTags(condition);
  const h = Math.max(13, textHeight(doc, `- ${text}`, CONTENT_W - 12, 8, "Helvetica"));
  doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(8)
    .text(`- ${text}`, LEFT_M + 12, y, { width: CONTENT_W - 12, lineGap: 1 });
  return y + h + 2;
}

function drawConditions(doc, meta, y, onNewPage) {
  y = ensureSpace(doc, y, 34, onNewPage);
  y = drawSectionHeading(doc, "CONDITIONS", y);
  for (const condition of documentConditions(meta.type)) {
    const text = stripHtmlTags(condition);
    const h = Math.max(13, textHeight(doc, `- ${text}`, CONTENT_W - 12, 8, "Helvetica")) + 2;
    y = ensureSpace(doc, y, h, onNewPage);
    y = drawConditionLine(doc, condition, y);
  }
  return y + 12;
}

function drawSignature(doc, y, onNewPage) {
  const height = 118;
  y = ensureSpace(doc, y, height, onNewPage);
  const colW = CONTENT_W / 2;
  const labels = ["Pour Vosthermos", "Acceptation du client"];

  for (let i = 0; i < 2; i++) {
    const x = LEFT_M + i * colW;
    doc.fillColor(ACCENT).font("Helvetica-Bold").fontSize(10)
      .text(labels[i], x, y, { width: colW, align: "center" });
    doc.moveTo(x + 44, y + 56).lineTo(x + colW - 44, y + 56).strokeColor(TEXT_MED).lineWidth(0.7).stroke();
    doc.fillColor(TEXT_MED).font("Helvetica").fontSize(9).text("Signature", x, y + 62, { width: colW, align: "center" });
    doc.moveTo(x + 44, y + 96).lineTo(x + colW - 44, y + 96).strokeColor(TEXT_MED).lineWidth(0.7).stroke();
    doc.fillColor(TEXT_MED).font("Helvetica").fontSize(9).text("Date", x, y + 102, { width: colW, align: "center" });
  }

  return y + height;
}

function drawFooter(doc, pageNum, company) {
  const footer = [
    "Vosthermos - Reparation et remplacement de fenetres",
    `${company.address}, ${company.city}, ${company.province}`,
    `RBQ : ${company.rbq}`,
    `TPS : ${company.tps}`,
    `TVQ : ${company.tvq}`,
  ].filter(Boolean).join("  |  ");

  doc.rect(0, PAGE_H - 3, PAGE_W, 3).fill(ACCENT);
  doc.fillColor(TEXT_MED).font("Helvetica").fontSize(6.8)
    .text(footer, 30, PAGE_H - 22, { width: PAGE_W - 60, align: "center" });
  doc.fillColor(TEXT_MED).font("Helvetica").fontSize(7)
    .text(`Page ${pageNum}`, 30, PAGE_H - 12, { width: PAGE_W - 60, align: "center" });
}

function addFooters(doc, company) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    drawFooter(doc, i - range.start + 1, company);
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

      addDocPage(doc);
      let y = drawFullHeader(doc, meta, company);
      y = drawInfoBox(doc, wo, meta, documentNumber, y);
      y = drawDescription(doc, wo, meta, y, onNewPage);
      y = drawTable(doc, wo, meta, documentNumber, y);
      y = drawTotals(doc, wo, meta, y, onNewPage);
      if (meta.type !== "invoice") {
        y = drawConditions(doc, meta, y, onNewPage);
      }
      if (meta.type === "quote") {
        drawSignature(doc, y, onNewPage);
      }

      addFooters(doc, company);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
