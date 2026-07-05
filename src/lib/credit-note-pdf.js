import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { formatDateFr, formatMoneyCad, resolveDocumentCompany } from "./vosthermos-document.js";

const ACCENT = "#2c3e50";
const LIGHT_GRAY = "#f8f9fa";
const MID_GRAY = "#bdc3c7";
const TEXT_DARK = "#2c3e50";
const TEXT_MED = "#555555";
const WHITE = "#ffffff";
const REFUND_ORANGE = "#b45309";
const CREDIT_TEAL = "#0f766e";

const PAGE_W = 612;
const LEFT_M = 47;
const RIGHT_M = 47;
const CONTENT_W = PAGE_W - LEFT_M - RIGHT_M;

function drawLogo(doc, x, y, height = 46) {
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
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(20).text("VOSTHERMOS", x, y + 8);
}

function moneyLine(doc, label, value, y, { bold = false, color = TEXT_DARK } = {}) {
  const x = LEFT_M + 18;
  const width = CONTENT_W - 36;
  doc.fillColor(bold ? TEXT_DARK : TEXT_MED).font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(10.5)
    .text(label, x, y, { width: width - 130 });
  doc.fillColor(color).font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(10.5)
    .text(formatMoneyCad(value), x + width - 130, y, { width: 130, align: "right" });
}

// Genere le PDF d'une note de credit (avoir) ou d'un recu de remboursement.
// creditNote = enregistrement CreditNote serialise (montants en Number).
export async function generateCreditNotePdf(creditNote) {
  const company = resolveDocumentCompany();
  const isRefund = Boolean(creditNote.refundMethod);
  const title = isRefund ? "RECU DE REMBOURSEMENT" : "NOTE DE CREDIT";
  const badgeColor = isRefund ? REFUND_ORANGE : CREDIT_TEAL;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 0, autoFirstPage: true });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // En-tete
    doc.rect(0, 0, PAGE_W, 96).fill(ACCENT);
    doc.rect(0, 92, PAGE_W, 4).fill(badgeColor);
    drawLogo(doc, LEFT_M, 25, 46);
    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(isRefund ? 17 : 20)
      .text(title, 220, 32, { width: PAGE_W - 220 - RIGHT_M, align: "right" });
    doc.fillColor("#cfe3e0").font("Helvetica-Bold").fontSize(11)
      .text(creditNote.number, 220, isRefund ? 56 : 60, { width: PAGE_W - 220 - RIGHT_M, align: "right" });

    let y = 126;

    // Bloc infos : client + references
    const infoH = 108;
    doc.roundedRect(LEFT_M, y, CONTENT_W, infoH, 8).fillAndStroke(LIGHT_GRAY, MID_GRAY);
    const colLeft = LEFT_M + 16;
    const colRight = LEFT_M + CONTENT_W / 2 + 8;

    doc.fillColor(badgeColor).font("Helvetica-Bold").fontSize(9).text("CLIENT", colLeft, y + 14);
    doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(11).text(creditNote.clientName || "Client", colLeft, y + 28, { width: CONTENT_W / 2 - 30 });
    if (creditNote.clientEmail) {
      doc.fillColor(TEXT_MED).font("Helvetica").fontSize(9.5).text(creditNote.clientEmail, colLeft, y + 44, { width: CONTENT_W / 2 - 30 });
    }

    doc.fillColor(badgeColor).font("Helvetica-Bold").fontSize(9).text("REFERENCES", colRight, y + 14);
    const refRows = [
      ["Date", formatDateFr(creditNote.issuedAt) || ""],
      ["Facture d'origine", creditNote.invoiceNumber || "-"],
    ];
    if (isRefund) {
      refRows.push(["Rembourse par", creditNote.refundMethod]);
      if (creditNote.refundRef) refRows.push(["N° de confirmation", creditNote.refundRef]);
    }
    let ry = y + 28;
    for (const [label, value] of refRows) {
      doc.fillColor(TEXT_MED).font("Helvetica").fontSize(9.5).text(`${label} :`, colRight, ry, { width: 110 });
      doc.fillColor(TEXT_DARK).font("Helvetica-Bold").fontSize(9.5).text(String(value), colRight + 112, ry, { width: CONTENT_W / 2 - 130 });
      ry += 16;
    }

    y += infoH + 22;

    // Raison
    if (creditNote.reason) {
      doc.fillColor(badgeColor).font("Helvetica-Bold").fontSize(10).text("RAISON", LEFT_M, y);
      y += 16;
      doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(10.5)
        .text(creditNote.reason, LEFT_M, y, { width: CONTENT_W });
      y += doc.heightOfString(creditNote.reason, { width: CONTENT_W }) + 20;
    }

    // Montants
    doc.fillColor(badgeColor).font("Helvetica-Bold").fontSize(10)
      .text(isRefund ? "DETAIL DU REMBOURSEMENT" : "DETAIL DE L'AVOIR", LEFT_M, y);
    y += 18;
    const cardH = 96;
    doc.roundedRect(LEFT_M, y, CONTENT_W, cardH, 8).fillAndStroke(LIGHT_GRAY, MID_GRAY);
    moneyLine(doc, "Sous-total", creditNote.subtotal, y + 16);
    moneyLine(doc, "TPS (5%)", creditNote.tps, y + 34);
    moneyLine(doc, "TVQ (9,975%)", creditNote.tvq, y + 52);
    y += cardH + 10;

    // Barre totale
    doc.rect(LEFT_M, y - 34, CONTENT_W, 30).fill(badgeColor);
    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(12)
      .text(isRefund ? "MONTANT REMBOURSE :" : "MONTANT CREDITE :", LEFT_M + 18, y - 26);
    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(12)
      .text(`- ${formatMoneyCad(creditNote.total)}`, LEFT_M + CONTENT_W - 168, y - 26, { width: 150, align: "right" });
    y += 18;

    // Note explicative pour la comptable
    const explanation = isRefund
      ? "L'argent a ete rendu au client. Ce recu annule le montant correspondant de la facture d'origine."
      : "Aucun argent rendu : le montant reste en credit au dossier du client et annule le montant correspondant de la facture d'origine.";
    doc.fillColor(TEXT_MED).font("Helvetica-Oblique").fontSize(9)
      .text(explanation, LEFT_M, y, { width: CONTENT_W });

    // Pied de page compagnie
    const footY = 742;
    doc.moveTo(LEFT_M, footY - 8).lineTo(PAGE_W - RIGHT_M, footY - 8).strokeColor(MID_GRAY).lineWidth(0.5).stroke();
    doc.fillColor(TEXT_MED).font("Helvetica").fontSize(8)
      .text(
        `${company.legal} - ${company.address}, ${company.city} (${company.province}) ${company.postalCode} - ${company.phone}`,
        LEFT_M, footY, { width: CONTENT_W, align: "center" }
      )
      .text(
        `TPS : ${company.tps}   TVQ : ${company.tvq}   RBQ : ${company.rbq}`,
        LEFT_M, footY + 12, { width: CONTENT_W, align: "center" }
      );

    doc.end();
  });
}

export function creditNoteFilename(creditNote) {
  const prefix = creditNote.refundMethod ? "Remboursement" : "NoteCredit";
  return `${prefix}_Vosthermos_${creditNote.number}.pdf`;
}
