import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { formatDateOnly } from "./date-only.js";

const BRAND = "#b91c1c";
const BRAND_SOFT = "#f3c2c5";
const DARK = "#111827";
const TEXT = "#374151";
const MUTED = "#6b7280";
const LIGHT = "#9ca3af";
const BORDER = "#e5e7eb";
const SOFT_BORDER = "#f3f4f6";
const PANEL = "#f9fafb";
const GREEN = "#059669";

const PAGE_MARGIN = 36; // 0.5in
const FIRST_CAPACITY = 5;
const MIDDLE_CAPACITY = 7;
const LAST_CAPACITY = 6;
const SMALL_INVOICE_THRESHOLD = 8;

const COMPANY_DEFAULTS = {
  legal: "9999-9999 Quebec inc.",
  address: "330 Chem. Saint-Francois-Xavier, local 104",
  city: "Delson",
  postalCode: "J5B 1Y1",
  phone: "514-825-8411",
  email: "info@vosthermos.com",
  web: "vosthermos.com",
  tps: "",
  tvq: "",
  rbq: "",
};

function fmt(n) {
  return `${Number(n || 0).toFixed(2)} $`;
}

function fmtQty(value) {
  const n = Number(value || 0);
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function fmtRate(n) {
  return `${Number(n || 0).toFixed(2)} $/h`;
}

function fmtLaborHours(value) {
  const totalMinutes = Math.round(Number(value || 0) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (totalMinutes <= 0) return "0h";
  return `${hours > 0 ? `${hours}h` : ""}${minutes > 0 ? String(minutes).padStart(2, "0") : ""}`;
}

function fmtDate(d) {
  return formatDateOnly(d, {
    day: "numeric", month: "long", year: "numeric",
  });
}

function fmtHM(dt) {
  if (!dt) return null;
  const d = dt instanceof Date ? dt : new Date(dt);
  if (isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function fmtDuration(mins) {
  if (!mins || mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m > 0 ? String(m).padStart(2, "0") : ""}`;
}

function isInvoiceStatus(statut) {
  return ["invoiced", "paid", "sent"].includes(statut);
}

function getCompany(settings = {}) {
  const source = settings.company || {};
  return {
    legal: source.legal || source.legalName || settings.company_legal_name || settings.company_neq || COMPANY_DEFAULTS.legal,
    address: source.address || settings.company_address || COMPANY_DEFAULTS.address,
    city: source.city || settings.company_city || COMPANY_DEFAULTS.city,
    postalCode: source.postalCode || settings.company_postal_code || COMPANY_DEFAULTS.postalCode,
    phone: source.phone || settings.company_phone || COMPANY_DEFAULTS.phone,
    email: source.email || settings.company_email || COMPANY_DEFAULTS.email,
    web: source.web || settings.company_web || COMPANY_DEFAULTS.web,
    tps: source.tps || source.tpsNumber || settings.tps_number || COMPANY_DEFAULTS.tps,
    tvq: source.tvq || source.tvqNumber || settings.tvq_number || COMPANY_DEFAULTS.tvq,
    rbq: source.rbq || source.rbqNumber || settings.rbq_number || COMPANY_DEFAULTS.rbq,
  };
}

function normalizeItem(item) {
  const sku = item.product?.sku ? ` (${item.product.sku})` : "";
  return {
    description: `${item.description || ""}${sku}`,
    qty: Number(item.quantity || 0),
    unitPrice: Number(item.unitPrice || 0),
  };
}

function normalizeUnits(wo) {
  const sections = Array.isArray(wo.sections) ? wo.sections : [];
  const flatItems = Array.isArray(wo.items) ? wo.items : [];

  if (sections.length > 0) {
    return sections.map((section) => ({
      unitCode: section.unitCode,
      items: (section.items || []).map(normalizeItem),
    }));
  }

  if (flatItems.length === 0) return [];
  return [{
    unitCode: null,
    items: flatItems.map(normalizeItem),
  }];
}

function paginate(units) {
  if (units.length === 0 || units.length <= SMALL_INVOICE_THRESHOLD) {
    return [{ units, isFirst: true, isLast: true, index: 0 }];
  }

  const pages = [];
  const queue = [...units];
  pages.push({ units: queue.splice(0, FIRST_CAPACITY), isFirst: true, isLast: false });

  while (queue.length > LAST_CAPACITY) {
    const count = Math.min(MIDDLE_CAPACITY, queue.length - LAST_CAPACITY);
    if (count <= 0) break;
    pages.push({ units: queue.splice(0, count), isFirst: false, isLast: false });
  }

  pages.push({ units: queue, isFirst: false, isLast: true });
  pages.forEach((page, index) => {
    page.index = index;
  });
  return pages;
}

function textHeight(doc, text, width, size = 10, font = "Helvetica") {
  doc.font(font).fontSize(size);
  return doc.heightOfString(String(text || ""), { width });
}

function line(doc, x1, y, x2, color = BORDER, width = 1) {
  doc.moveTo(x1, y).lineTo(x2, y).strokeColor(color).lineWidth(width).stroke();
}

function drawLogo(doc, x, y, height = 58) {
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "Vos-Thermos-Logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, x, y, { height });
      return true;
    }
  } catch {}
  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(18).text("Vosthermos", x, y + 12);
  return false;
}

function drawFullHeader(doc, wo, company, meta, x, y, width) {
  const rightWidth = 210;
  const leftWidth = width - rightWidth - 24;
  const label = isInvoiceStatus(wo.statut) ? "Facture" : "Bon de commande";
  const recipientLabel = isInvoiceStatus(wo.statut) ? "Facturer \u00e0" : "Adress\u00e9 \u00e0";

  drawLogo(doc, x, y, 58);
  doc.fillColor(MUTED).font("Helvetica").fontSize(8.5)
    .text(
      [
        company.legal,
        company.address,
        `${company.city}, QC ${company.postalCode}`,
        `${company.phone} - ${company.email}`,
        company.web,
      ].filter(Boolean).join("\n"),
      x + 126,
      y + 4,
      { width: leftWidth - 126, lineGap: 1.5 },
    );

  const rightX = x + width - rightWidth;
  doc.fillColor(LIGHT).font("Helvetica-Bold").fontSize(8)
    .text(label.toUpperCase(), rightX, y + 2, { width: rightWidth, align: "right", characterSpacing: 2.5 });
  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(30)
    .text(wo.number || "", rightX, y + 18, { width: rightWidth, align: "right" });
  doc.fillColor(MUTED).font("Helvetica").fontSize(10)
    .text(fmtDate(wo.date), rightX, y + 55, { width: rightWidth, align: "right" });

  y += 82;
  line(doc, x, y, x + width, BORDER);
  y += 16;

  const colWidth = (width - 32) / 2;
  const clientX = x;
  const detailsX = x + colWidth + 32;
  const intervAddr = wo.interventionAddress || wo.client?.address;
  const intervCity = wo.interventionCity || wo.client?.city;
  const intervPostal = wo.interventionPostalCode || wo.client?.postalCode;

  doc.fillColor(LIGHT).font("Helvetica-Bold").fontSize(7.5)
    .text(recipientLabel.toUpperCase(), clientX, y, { width: colWidth, characterSpacing: 2 });
  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(13)
    .text(wo.client?.name || "-", clientX, y + 15, { width: colWidth });

  let clientY = y + 32;
  if (wo.client?.company) {
    doc.fillColor(MUTED).font("Helvetica").fontSize(10).text(wo.client.company, clientX, clientY, { width: colWidth });
    clientY += 13;
  }
  if (intervAddr) {
    doc.fillColor(MUTED).font("Helvetica").fontSize(10)
      .text(`${intervAddr}\n${[intervCity, intervPostal && `QC ${intervPostal}`].filter(Boolean).join(", ")}`, clientX, clientY, { width: colWidth, lineGap: 1.5 });
    clientY += 30;
  }
  doc.fillColor(MUTED).font("Helvetica").fontSize(10)
    .text([wo.client?.phone, wo.client?.email].filter(Boolean).join("\n"), clientX, clientY, { width: colWidth, lineGap: 1.5 });
  clientY += 30;

  doc.fillColor(LIGHT).font("Helvetica-Bold").fontSize(7.5)
    .text("D\u00c9TAILS", detailsX, y, { width: colWidth, characterSpacing: 2 });
  let detailsY = y + 15;
  const rows = [
    wo.technician?.name ? ["Technicien", wo.technician.name] : null,
    ["Date", fmtDate(wo.date)],
    (meta.arrival || meta.departure) ? ["Horaire", `${meta.arrival || "-"} - ${meta.departure || "-"}`] : null,
    meta.duration ? ["Dur\u00e9e", meta.duration] : null,
  ].filter(Boolean);

  for (const [rowLabel, value] of rows) {
    doc.fillColor(MUTED).font("Helvetica").fontSize(10).text(rowLabel, detailsX, detailsY, { width: 80 });
    doc.fillColor(DARK).font("Helvetica").fontSize(10).text(value, detailsX + 90, detailsY, { width: colWidth - 90, align: "right" });
    detailsY += 14;
  }

  y = Math.max(clientY, detailsY) + 4;

  if (wo.description) {
    const descX = x + 12;
    const descW = width - 24;
    const descH = textHeight(doc, wo.description, descW, 10, "Helvetica");
    doc.rect(x, y + 2, 2, descH + 6).fill(BRAND);
    doc.fillColor(TEXT).font("Helvetica-Oblique").fontSize(10)
      .text(wo.description, descX, y, { width: descW, lineGap: 2 });
    y += descH + 14;
  }

  return y;
}

function drawCompactHeader(doc, wo, pageNum, totalPages, x, y, width) {
  drawLogo(doc, x, y, 28);
  doc.fillColor(MUTED).font("Helvetica").fontSize(9)
    .text(`Suite de la facture - page ${pageNum}/${totalPages}`, x + 44, y + 2, { width: 230 });
  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(11)
    .text(wo.client?.name || "", x + 44, y + 16, { width: 230 });
  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(18)
    .text(wo.number || "", x + width - 200, y, { width: 200, align: "right" });
  doc.fillColor(MUTED).font("Helvetica").fontSize(8.5)
    .text(fmtDate(wo.date), x + width - 200, y + 24, { width: 200, align: "right" });
  y += 45;
  line(doc, x, y, x + width, BORDER);
  return y + 12;
}

function unitHeight(doc, unit, width) {
  const hasCode = Boolean(unit.unitCode);
  const descWidth = width - 206;
  const rowsHeight = unit.items.reduce((sum, item) => {
    const h = Math.max(18, textHeight(doc, item.description, descWidth, 9.5, "Helvetica") + 10);
    return sum + h;
  }, 0);
  return (hasCode ? 25 : 0) + rowsHeight + 1;
}

function drawUnitCard(doc, unit, x, y, width) {
  const height = unitHeight(doc, unit, width);
  const hasCode = Boolean(unit.unitCode);
  const total = unit.items.reduce((sum, item) => sum + Number(item.qty) * Number(item.unitPrice), 0);

  doc.roundedRect(x, y, width, height, 6).strokeColor(BORDER).lineWidth(1.2).stroke();

  let rowY = y;
  if (hasCode) {
    doc.rect(x + 1, rowY + 1, width - 2, 24).fill("#ffffff");
    doc.roundedRect(x + 16, rowY + 6, 44, 14, 3).strokeColor(BRAND).lineWidth(1).stroke();
    doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(8)
      .text(unit.unitCode, x + 18, rowY + 8, { width: 40, align: "center" });
    doc.fillColor(MUTED).font("Helvetica").fontSize(9)
      .text(`Unit\u00e9 - ${unit.items.length} item${unit.items.length > 1 ? "s" : ""}`, x + 70, rowY + 8, { width: 220 });
    doc.fillColor(DARK).font("Helvetica-Bold").fontSize(10)
      .text(fmt(total), x + width - 110, rowY + 8, { width: 94, align: "right" });
    line(doc, x, rowY + 25, x + width, BORDER, 0.8);
    rowY += 25;
  }

  const descX = x + 16;
  const qtyX = x + width - 178;
  const priceX = x + width - 132;
  const totalX = x + width - 82;
  const descWidth = qtyX - descX - 8;

  for (let index = 0; index < unit.items.length; index++) {
    const item = unit.items[index];
    const rowH = Math.max(18, textHeight(doc, item.description, descWidth, 9.5, "Helvetica") + 10);
    const color = Number(item.unitPrice) < 0 ? GREEN : TEXT;

    doc.fillColor(color).font("Helvetica").fontSize(9.5)
      .text(item.description, descX, rowY + 5, { width: descWidth });
    doc.fillColor(MUTED).font("Helvetica").fontSize(9)
      .text(fmtQty(item.qty), qtyX, rowY + 5, { width: 38, align: "right" });
    doc.fillColor(MUTED).font("Helvetica").fontSize(9)
      .text(fmt(item.unitPrice), priceX, rowY + 5, { width: 62, align: "right" });
    doc.fillColor(color).font("Helvetica-Bold").fontSize(9.5)
      .text(fmt(Number(item.qty) * Number(item.unitPrice)), totalX, rowY + 5, { width: 66, align: "right" });

    rowY += rowH;
    if (index < unit.items.length - 1) line(doc, x, rowY, x + width, SOFT_BORDER, 0.6);
  }

  return y + height;
}

function drawLaborCard(doc, wo, meta, x, y, width) {
  const detail = `${fmtLaborHours(meta.laborHours)} x ${fmtRate(meta.laborRate)}`;
  const height = 42;

  doc.roundedRect(x, y, width, height, 6).fillAndStroke(PANEL, BORDER);
  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(10)
    .text("Main d'oeuvre", x + 16, y + 10, { width: width - 140 });
  doc.fillColor(MUTED).font("Helvetica").fontSize(8.5)
    .text(detail, x + 16, y + 24, { width: width - 140 });
  doc.fillColor(DARK).font("Helvetica-Bold").fontSize(11)
    .text(fmt(wo.totalLabor), x + width - 120, y + 14, { width: 104, align: "right" });

  return y + height;
}

function drawTotalRow(doc, label, value, x, y, width, opts = {}) {
  const fontSize = opts.small ? 8.5 : 10;
  const labelColor = opts.small ? LIGHT : MUTED;
  const valueColor = opts.small ? MUTED : DARK;
  doc.fillColor(labelColor).font(opts.strong ? "Helvetica-Bold" : "Helvetica").fontSize(fontSize)
    .text(label, x, y, { width: width - 100 });
  if (opts.note) {
    doc.fillColor(LIGHT).font("Helvetica").fontSize(8)
      .text(opts.note, x, y + 11, { width: width - 110 });
  }
  doc.fillColor(valueColor).font(opts.strong ? "Helvetica-Bold" : "Helvetica").fontSize(fontSize)
    .text(value, x + width - 100, y, { width: 100, align: "right" });
}

function drawTotals(doc, wo, meta, x, y) {
  const width = 290;
  const height = 126;
  const laborDetail = Number(wo.totalLabor) > 0
    ? `${fmtLaborHours(meta.laborHours)} x ${fmtRate(meta.laborRate)}`
    : "";

  doc.save();
  doc.dash(3, { space: 3 });
  doc.roundedRect(x, y, width, height, 6).strokeColor("#d1d5db").lineWidth(1).stroke();
  doc.undash();
  doc.restore();

  let rowY = y + 12;
  drawTotalRow(doc, "Pi\u00e8ces & services", fmt(wo.totalPieces), x + 12, rowY, width - 24);
  rowY += 16;
  drawTotalRow(doc, "Main d'oeuvre", fmt(wo.totalLabor), x + 12, rowY, width - 24, { note: laborDetail });
  rowY += laborDetail ? 24 : 16;
  line(doc, x + 12, rowY, x + width - 12, "#d1d5db", 0.6);
  rowY += 7;
  drawTotalRow(doc, "Sous-total", fmt(wo.subtotal), x + 12, rowY, width - 24, { strong: true });
  rowY += 16;
  drawTotalRow(doc, "TPS (5%)", fmt(wo.tps), x + 12, rowY, width - 24, { small: true });
  rowY += 12;
  drawTotalRow(doc, "TVQ (9.975%)", fmt(wo.tvq), x + 12, rowY, width - 24, { small: true });

  line(doc, x + 12, y + 88, x + width - 12, "#d1d5db", 0.6);
  doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(7.5)
    .text("MONTANT \u00c0 PAYER", x + 12, y + 98, { width: 130, characterSpacing: 1.6 });
  doc.fillColor(LIGHT).font("Helvetica").fontSize(8)
    .text("Net 30 jours", x + 12, y + 111, { width: 130 });
  doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(16)
    .text(fmt(wo.total), x + width - 132, y + 98, { width: 120, align: "right" });

  return y + height;
}

function drawFooter(doc, company, settings, x, y, width) {
  const height = 58;
  doc.rect(0, y - 1, doc.page.width, height + 2).fill(PANEL);
  line(doc, x, y - 1, x + width, BORDER, 0.8);

  const colWidth = (width - 20) / 2;
  const conditions = settings.work_order_conditions ||
    "Int\u00e9r\u00eat 1,5%/mois sur solde en retard - Ch\u00e8que, virement Interac ou comptant.";

  doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(7.5)
    .text("CONDITIONS", x, y + 9, { width: colWidth, characterSpacing: 1 });
  doc.fillColor(MUTED).font("Helvetica").fontSize(8.2)
    .text(conditions, x, y + 22, { width: colWidth, lineGap: 1.5 });
  if (company.rbq) {
    doc.fillColor(MUTED).font("Helvetica").fontSize(8.2)
      .text(`Licence RBQ : ${company.rbq}`, x, y + 43, { width: colWidth });
  }

  const taxX = x + colWidth + 20;
  doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(7.5)
    .text("TAXES", taxX, y + 9, { width: colWidth, characterSpacing: 1 });
  doc.fillColor(MUTED).font("Helvetica").fontSize(8.2)
    .text(`TPS: ${company.tps || "-"}\nTVQ: ${company.tvq || "-"}`, taxX, y + 22, { width: colWidth, lineGap: 2 });
}

function drawPageMarker(doc, wo, page, totalPages, x, width) {
  const y = doc.page.height - 24;
  line(doc, x, y, x + width, SOFT_BORDER, 0.8);
  doc.fillColor(LIGHT).font("Helvetica").fontSize(8)
    .text(`${wo.number || ""}${wo.client?.name ? ` - ${wo.client.name}` : ""}`, x, y + 8, { width: width - 120 });
  doc.fillColor(LIGHT).font("Courier").fontSize(8)
    .text(`Page ${page.index + 1} / ${totalPages}`, x + width - 120, y + 8, { width: 120, align: "right" });
}

function drawInvoicePage(doc, page, totalPages, wo, company, settings, meta) {
  const width = doc.page.width;
  const height = doc.page.height;
  const x = PAGE_MARGIN;
  const innerWidth = width - PAGE_MARGIN * 2;
  const footerY = height - 83;

  doc.rect(0, 0, width, 3).fill(BRAND);
  doc.rect(0, 3, width, 1).fill(BRAND_SOFT);

  let y = PAGE_MARGIN;
  y = page.isFirst
    ? drawFullHeader(doc, wo, company, meta, x, y, innerWidth)
    : drawCompactHeader(doc, wo, page.index + 1, totalPages, x, y, innerWidth);

  y += 8;
  for (const unit of page.units) {
    y = drawUnitCard(doc, unit, x, y, innerWidth) + 8;
  }

  if (page.isLast && Number(wo.totalLabor) > 0) {
    y = drawLaborCard(doc, wo, meta, x, y + 2, innerWidth) + 10;
  }

  if (page.isLast) {
    const totalsX = width - PAGE_MARGIN - 290;
    drawTotals(doc, wo, meta, totalsX, y + 2);
    drawFooter(doc, company, settings, x, footerY, innerWidth);
  }

  drawPageMarker(doc, wo, page, totalPages, x, innerWidth);
}

export async function generateInvoicePdf(wo, settings = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margin: 0,
        autoFirstPage: true,
        info: {
          Title: `Facture ${wo.number}`,
          Author: "Vosthermos",
          Subject: `Facture ${wo.number}`,
        },
      });

      const buffers = [];
      doc.on("data", (buffer) => buffers.push(buffer));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const company = getCompany(settings);
      const units = normalizeUnits(wo);
      const pages = paginate(units);
      const laborRate = Number(wo.laborRate) || 85;
      const totalLabor = Number(wo.totalLabor) || 0;
      const laborHours = laborRate > 0 ? Math.round((totalLabor / laborRate) * 100) / 100 : 0;
      const meta = {
        arrival: fmtHM(wo.arrivalAt),
        departure: fmtHM(wo.departureAt),
        duration: fmtDuration(wo.durationMinutes),
        laborHours,
        laborRate,
      };

      pages.forEach((page, index) => {
        if (index > 0) doc.addPage({ size: "LETTER", margin: 0 });
        drawInvoicePage(doc, page, pages.length, wo, company, settings, meta);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
