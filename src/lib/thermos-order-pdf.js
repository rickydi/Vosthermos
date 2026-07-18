import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BRAND = "#002530";
const ACCENT = "#e30718";
const TEXT = "#172033";
const MUTED = "#667085";
const BORDER = "#d7dee7";
const LIGHT = "#f5f7fa";

function clean(value, fallback = "-") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function formatDate(value) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "-";
  return new Intl.DateTimeFormat("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Toronto",
  }).format(date);
}

export function formatSixteenths(value) {
  const total = Math.max(0, Number.parseInt(value, 10) || 0);
  const whole = Math.floor(total / 16);
  let numerator = total % 16;
  if (!numerator) return `${whole} po`;
  let denominator = 16;
  while (numerator % 2 === 0 && denominator > 2) {
    numerator /= 2;
    denominator /= 2;
  }
  return `${whole ? `${whole} ` : ""}${numerator}/${denominator} po`;
}

function normalizedChoice(value) {
  return String(value ?? "").trim().toLowerCase();
}

function formatGlassType(value) {
  const glassType = normalizedChoice(value);
  if (!glassType) return "Vitrage non précisé";
  if (glassType === "unknown") return "Vitrage inconnu";
  if (["simple", "double", "triple"].includes(glassType)) return `Vitrage ${glassType}`;
  return `Vitrage ${clean(value)}`;
}

function formatSpacerColor(value) {
  const spacerColor = normalizedChoice(value);
  if (!spacerColor) return "Intercalaire non précisé";
  if (spacerColor === "unknown") return "Intercalaire inconnu";
  return `Intercalaire ${clean(value)}`;
}

function formatAccess(value) {
  const access = normalizedChoice(value);
  const labels = {
    without_ladder: "Accès sans échelle",
    with_ladder: "Accès avec échelle",
    easy: "Accès facile",
    medium: "Accès moyen",
    hard: "Accès difficile",
    unknown: "Accès inconnu",
  };
  return labels[access] || null;
}

function formatOptions(item) {
  const options = item?.options && typeof item.options === "object" ? item.options : {};
  const labels = [formatGlassType(options.glassType), formatSpacerColor(options.spacerColor)];
  const known = [
    ["lowE", "Low-E"],
    ["argon", "Argon"],
    ["tempered", "Trempé"],
    ["laminated", "Laminé"],
    ["tinted", "Teinté"],
  ];
  for (const [key, label] of known) {
    if (options[key] === true) labels.push(label);
  }
  const access = formatAccess(options.access);
  if (access) labels.push(access);
  if (options.coating) labels.push(clean(options.coating));
  return labels.length ? labels.join(", ") : "Standard";
}

function formatGrille(item) {
  const grille = item?.grille && typeof item.grille === "object" ? item.grille : null;
  if (!grille) return "Aucune";
  const vertical = Array.isArray(grille.vertical) ? grille.vertical.length : Number(grille.vertical || 0);
  const horizontal = Array.isArray(grille.horizontal) ? grille.horizontal.length : Number(grille.horizontal || 0);
  const parts = [];
  if (vertical || horizontal) parts.push(`${vertical || 0}V × ${horizontal || 0}H`);
  if (grille.color) parts.push(clean(grille.color));
  if (grille.profile) parts.push(clean(grille.profile));
  return parts.length ? parts.join(" · ") : grille.enabled ? "Décorative" : "Aucune";
}

function drawLogo(doc, x, y) {
  const candidates = [
    path.join(process.cwd(), "public", "images", "Vos-Thermos-Logo.png"),
    path.join(process.cwd(), "public", "images", "Vos-Thermos-Logo-petit.png"),
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        doc.image(candidate, x, y, { fit: [142, 55] });
        return;
      }
    } catch {}
  }
  doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(21).text("VOSTHERMOS", x, y + 12);
}

function drawHeader(doc, order, company, pageNumber = 1) {
  doc.rect(0, 0, PAGE_WIDTH, 8).fill(ACCENT);
  drawLogo(doc, MARGIN, 27);
  doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(22)
    .text("COMMANDE DE THERMOS", 245, 33, { width: PAGE_WIDTH - 245 - MARGIN, align: "right" });
  doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(12)
    .text(clean(order.number), 245, 62, { width: PAGE_WIDTH - 245 - MARGIN, align: "right" });
  doc.fillColor(MUTED).font("Helvetica").fontSize(8.5)
    .text(`${clean(company.legalName || company.name, "Vosthermos")} · page ${pageNumber}`, 245, 80, {
      width: PAGE_WIDTH - 245 - MARGIN,
      align: "right",
    });
  doc.moveTo(MARGIN, 104).lineTo(PAGE_WIDTH - MARGIN, 104).strokeColor(BORDER).lineWidth(0.8).stroke();
  return 119;
}

function infoBox(doc, x, y, width, title, lines) {
  const bodyLines = lines.filter(Boolean).map((line) => clean(line));
  const height = 34 + bodyLines.length * 15;
  doc.roundedRect(x, y, width, height, 7).fillAndStroke(LIGHT, BORDER);
  doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(9).text(title.toUpperCase(), x + 12, y + 10, { width: width - 24 });
  let cursor = y + 27;
  doc.fillColor(TEXT).font("Helvetica").fontSize(9);
  for (const line of bodyLines) {
    doc.text(line, x + 12, cursor, { width: width - 24, height: 13, ellipsis: true });
    cursor += 15;
  }
  return height;
}

function drawTableHeader(doc, y) {
  const columns = [
    { x: MARGIN, width: 59, label: "Code" },
    { x: MARGIN + 59, width: 147, label: "Identification" },
    { x: MARGIN + 206, width: 91, label: "Dimensions" },
    { x: MARGIN + 297, width: 65, label: "Épaisseur" },
    { x: MARGIN + 362, width: CONTENT_WIDTH - 362, label: "Options / grille" },
  ];
  doc.rect(MARGIN, y, CONTENT_WIDTH, 25).fill(BRAND);
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8.5);
  for (const column of columns) {
    doc.text(column.label, column.x + 6, y + 8, { width: column.width - 12 });
  }
  return y + 25;
}

function drawItemRow(doc, item, y, index) {
  const optionText = `${formatOptions(item)}\nGrille : ${formatGrille(item)}${item.notes ? `\nNote : ${clean(item.notes)}` : ""}`;
  const labelText = `${clean(item.label)}${item.photoUrl ? "\nPhoto au dossier" : ""}`;
  doc.font("Helvetica").fontSize(8.3);
  const rowHeight = Math.max(
    46,
    doc.heightOfString(labelText, { width: 135, lineGap: 1 }) + 16,
    doc.heightOfString(optionText, { width: CONTENT_WIDTH - 374, lineGap: 1 }) + 16,
  );
  doc.rect(MARGIN, y, CONTENT_WIDTH, rowHeight).fillAndStroke(index % 2 ? "#ffffff" : "#fbfcfd", BORDER);
  const separators = [MARGIN + 59, MARGIN + 206, MARGIN + 297, MARGIN + 362];
  for (const separator of separators) {
    doc.moveTo(separator, y).lineTo(separator, y + rowHeight).strokeColor(BORDER).lineWidth(0.5).stroke();
  }
  doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(7.4)
    .text(clean(item.internalCode), MARGIN + 5, y + 8, { width: 49, lineBreak: true });
  doc.fillColor(TEXT).font("Helvetica").fontSize(8.3)
    .text(labelText, MARGIN + 65, y + 8, { width: 135, lineGap: 1 });
  doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(9)
    .text(`${formatSixteenths(item.widthSixteenths)}\n× ${formatSixteenths(item.heightSixteenths)}`, MARGIN + 212, y + 8, {
      width: 79,
      lineGap: 3,
    });
  doc.fillColor(TEXT).font("Helvetica").fontSize(8.5)
    .text(formatSixteenths(item.thicknessSixteenths), MARGIN + 303, y + 8, { width: 53 });
  doc.fillColor(TEXT).font("Helvetica").fontSize(8)
    .text(optionText, MARGIN + 368, y + 8, { width: CONTENT_WIDTH - 374, lineGap: 1 });
  return y + rowHeight;
}

function safePhotoPath(photoUrl) {
  const url = String(photoUrl || "");
  if (!url.startsWith("/uploads/measurements/")) return null;
  const publicRoot = path.resolve(process.cwd(), "public");
  const candidate = path.resolve(publicRoot, url.replace(/^\/+/, ""));
  if (!candidate.startsWith(`${publicRoot}${path.sep}`)) return null;
  try { return fs.existsSync(candidate) ? candidate : null; } catch { return null; }
}

function geometryNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(10000, Math.max(0, number)) : fallback;
}

function drawWindowBlueprint(doc, items, x, y, width, height) {
  doc.roundedRect(x, y, width, height, 5).fillAndStroke("#eef8fb", "#9fb9c2");
  const inset = 5;
  const innerX = x + inset;
  const innerY = y + inset;
  const innerW = width - inset * 2;
  const innerH = height - inset * 2;
  items.forEach((item) => {
    const geometry = item.geometry && typeof item.geometry === "object" ? item.geometry : {};
    const gx = geometryNumber(geometry.x, 0);
    const gy = geometryNumber(geometry.y, 0);
    const gw = Math.max(1, geometryNumber(geometry.width, 10000));
    const gh = Math.max(1, geometryNumber(geometry.height, 10000));
    const px = innerX + (gx / 10000) * innerW;
    const py = innerY + (gy / 10000) * innerH;
    const pw = Math.max(4, (gw / 10000) * innerW);
    const ph = Math.max(4, (gh / 10000) * innerH);
    doc.rect(px, py, pw, ph).fillAndStroke("#dff3f8", BRAND);
    const grille = item.grille && typeof item.grille === "object" ? item.grille : {};
    for (const position of Array.isArray(grille.vertical) ? grille.vertical : []) {
      const lineX = px + (geometryNumber(position, 5000) / 10000) * pw;
      doc.moveTo(lineX, py).lineTo(lineX, py + ph).strokeColor("#c78b19").lineWidth(0.8).stroke();
    }
    for (const position of Array.isArray(grille.horizontal) ? grille.horizontal : []) {
      const lineY = py + (geometryNumber(position, 5000) / 10000) * ph;
      doc.moveTo(px, lineY).lineTo(px + pw, lineY).strokeColor("#c78b19").lineWidth(0.8).stroke();
    }
    doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(7)
      .text(`T${item.thermosNumber}`, px + 3, py + 3, { width: Math.max(1, pw - 6), height: 10 });
  });
}

function drawWindowPlanCard(doc, items, y) {
  const windowNumber = items[0]?.windowNumber || 1;
  const cardHeight = 190;
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, cardHeight, 7).fillAndStroke("#ffffff", BORDER);
  doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(11)
    .text(`Fenêtre ${windowNumber} — ${items.length} thermos physique${items.length > 1 ? "s" : ""}`, MARGIN + 12, y + 10, { width: CONTENT_WIDTH - 24 });

  drawWindowBlueprint(doc, items, MARGIN + 12, y + 34, 190, 140);

  const photoPath = safePhotoPath(items.find((item) => item.photoUrl)?.photoUrl);
  const photoX = MARGIN + 214;
  const photoY = y + 34;
  const photoW = 135;
  const photoH = 100;
  doc.rect(photoX, photoY, photoW, photoH).fillAndStroke(LIGHT, BORDER);
  if (photoPath) {
    try { doc.image(photoPath, photoX + 3, photoY + 3, { fit: [photoW - 6, photoH - 6], align: "center", valign: "center" }); }
    catch { doc.fillColor(MUTED).font("Helvetica").fontSize(8).text("Photo au dossier", photoX + 8, photoY + 43, { width: photoW - 16, align: "center" }); }
  } else {
    doc.fillColor(MUTED).font("Helvetica").fontSize(8).text("Aucune photo jointe", photoX + 8, photoY + 43, { width: photoW - 16, align: "center" });
  }
  doc.fillColor(MUTED).font("Helvetica").fontSize(7).text("Vue de face", photoX, photoY + photoH + 4, { width: photoW, align: "center" });

  const listX = MARGIN + 362;
  let listY = y + 36;
  items.slice(0, 9).forEach((item) => {
    doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(7.2)
      .text(`T${item.thermosNumber} · ${formatSixteenths(item.widthSixteenths)} × ${formatSixteenths(item.heightSixteenths)}`, listX, listY, { width: CONTENT_WIDTH - 374, height: 10, ellipsis: true });
    listY += 12;
    doc.fillColor(MUTED).font("Helvetica").fontSize(6.4)
      .text(clean(item.internalCode), listX, listY, { width: CONTENT_WIDTH - 374, height: 9, ellipsis: true });
    listY += 13;
  });
  if (items.length > 9) {
    doc.fillColor(MUTED).font("Helvetica").fontSize(7).text(`+ ${items.length - 9} autres thermos`, listX, listY, { width: CONTENT_WIDTH - 374 });
  }
  return y + cardHeight;
}

function drawFooter(doc, company, page, pages) {
  const footer = [
    company.address,
    company.city,
    company.province,
    company.postalCode,
  ].filter(Boolean).join(", ");
  doc.moveTo(MARGIN, PAGE_HEIGHT - 35).lineTo(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 35).strokeColor(BORDER).lineWidth(0.5).stroke();
  doc.fillColor(MUTED).font("Helvetica").fontSize(7.5)
    .text(`${clean(company.legalName, "Vosthermos")} · ${footer} · ${clean(company.phone, "")}`, MARGIN, PAGE_HEIGHT - 27, {
      width: CONTENT_WIDTH - 70,
      ellipsis: true,
    });
  doc.text(`${page}/${pages}`, PAGE_WIDTH - MARGIN - 60, PAGE_HEIGHT - 27, { width: 60, align: "right" });
}

export async function generateThermosOrderPdf(order, company = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margin: 0,
        autoFirstPage: false,
        bufferPages: true,
        info: {
          Title: `Commande de thermos ${clean(order.number)}`,
          Author: clean(company.legalName, "Vosthermos"),
          Subject: `${(order.items || []).length} thermos pour ${clean(order.clientNameSnapshot)}`,
        },
      });
      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      let pageNumber = 1;
      const addPage = () => {
        doc.addPage({ size: "LETTER", margin: 0 });
        return drawHeader(doc, order, company, pageNumber++);
      };

      let y = addPage();
      const gap = 10;
      const half = (CONTENT_WIDTH - gap) / 2;
      const supplierHeight = infoBox(doc, MARGIN, y, half, "Fournisseur", [
        order.supplierNameSnapshot,
        order.supplierContactSnapshot,
        order.supplierEmailSnapshot,
      ]);
      const clientHeight = infoBox(doc, MARGIN + half + gap, y, half, "Client / dossier", [
        order.clientNameSnapshot,
        `Commande : ${clean(order.number)}`,
        `Créée le : ${formatDate(order.createdAt)}`,
      ]);
      y += Math.max(supplierHeight, clientHeight) + 14;

      doc.fillColor(TEXT).font("Helvetica").fontSize(9)
        .text(`Délai prévu : ${Number(order.leadTimeDaysSnapshot) || 0} jours`, MARGIN, y, { width: CONTENT_WIDTH / 2 });
      doc.text(`Nombre de thermos : ${(order.items || []).length}`, MARGIN + CONTENT_WIDTH / 2, y, {
        width: CONTENT_WIDTH / 2,
        align: "right",
      });
      y += 21;
      y = drawTableHeader(doc, y);

      for (let index = 0; index < (order.items || []).length; index += 1) {
        const item = order.items[index];
        doc.font("Helvetica").fontSize(8.3);
        const optionText = `${formatOptions(item)}\nGrille : ${formatGrille(item)}${item.notes ? `\nNote : ${clean(item.notes)}` : ""}`;
        const labelText = `${clean(item.label)}${item.photoUrl ? "\nPhoto au dossier" : ""}`;
        const estimated = Math.max(
          46,
          doc.heightOfString(labelText, { width: 135, lineGap: 1 }) + 16,
          doc.heightOfString(optionText, { width: CONTENT_WIDTH - 374, lineGap: 1 }) + 16,
        );
        if (y + estimated > PAGE_HEIGHT - 48) {
          y = addPage();
          y = drawTableHeader(doc, y);
        }
        y = drawItemRow(doc, item, y, index);
      }

      if (y + 58 > PAGE_HEIGHT - 48) y = addPage();
      y += 14;
      doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 42, 6).fillAndStroke("#fff7ed", "#fed7aa");
      doc.fillColor("#9a3412").font("Helvetica-Bold").fontSize(9)
        .text("Validation fournisseur", MARGIN + 12, y + 9, { width: CONTENT_WIDTH - 24 });
      doc.fillColor(TEXT).font("Helvetica").fontSize(8.5)
        .text("Veuillez vérifier les dimensions, l'épaisseur, les options et les grilles avant la fabrication.", MARGIN + 12, y + 24, {
          width: CONTENT_WIDTH - 24,
        });

      y += 58;
      const windowGroups = new Map();
      for (const item of order.items || []) {
        const key = Number(item.windowNumber) || 1;
        if (!windowGroups.has(key)) windowGroups.set(key, []);
        windowGroups.get(key).push(item);
      }
      if (windowGroups.size) {
        if (y + 225 > PAGE_HEIGHT - 48) y = addPage();
        doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(15).text("Plans et photos des fenêtres", MARGIN, y, { width: CONTENT_WIDTH });
        doc.fillColor(MUTED).font("Helvetica").fontSize(8.5)
          .text("Contours foncés : thermos physiques séparés · lignes dorées : grilles décoratives dans le thermos.", MARGIN, y + 21, { width: CONTENT_WIDTH });
        y += 42;
        for (const items of windowGroups.values()) {
          if (y + 190 > PAGE_HEIGHT - 48) y = addPage();
          y = drawWindowPlanCard(doc, items, y) + 10;
        }
      }

      const range = doc.bufferedPageRange();
      for (let page = range.start; page < range.start + range.count; page += 1) {
        doc.switchToPage(page);
        drawFooter(doc, company, page - range.start + 1, range.count);
      }
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
