import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { formatDateOnly } from "./date-only";

const RED = "#b91c1c";
const DARK = "#111111";
const GRAY = "#666666";
const LIGHT_GRAY = "#9ca3af";
const BORDER = "#e5e7eb";

function fmt(n) {
  return `${Number(n || 0).toFixed(2)} $`;
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

export async function generateInvoicePdf(wo, settings = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margin: 40,
        info: {
          Title: `Facture ${wo.number}`,
          Author: "Vosthermos",
          Subject: `Facture ${wo.number}`,
        },
      });

      const buffers = [];
      doc.on("data", (b) => buffers.push(b));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const marginX = 40;
      const innerWidth = pageWidth - marginX * 2;

      // ── Header — red band, tall, logo left + invoice right ──
      const headerHeight = 140;
      doc.rect(0, 0, pageWidth, headerHeight).fill(RED);

      // Logo (tall)
      try {
        const logoPath = path.join(process.cwd(), "public", "images", "Vos-Thermos-Logo_Blanc.png");
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, marginX, 25, { height: 90 });
        }
      } catch {}

      // Invoice number (right side)
      const rightW = 160;
      const rightX = pageWidth - marginX - rightW;
      doc.fillColor("#ffffff").font("Helvetica").fontSize(9)
        .text("FACTURE", rightX, 48, { width: rightW, align: "right", characterSpacing: 2 });
      doc.font("Helvetica-Bold").fontSize(26)
        .text(wo.number, rightX, 62, { width: rightW, align: "right" });
      doc.font("Helvetica").fontSize(10)
        .text(fmtDate(wo.date), rightX, 95, { width: rightW, align: "right" });

      // Reset y after header
      doc.y = headerHeight + 20;
      doc.x = marginX;

      const bodyTop = headerHeight + 20;

      // ── Client block ──
      doc.fillColor(LIGHT_GRAY).font("Helvetica-Bold").fontSize(8)
        .text("FACTURER A", marginX, bodyTop);
      doc.fillColor(DARK).font("Helvetica-Bold").fontSize(12)
        .text(wo.client?.name || "", marginX, bodyTop + 14);

      let clientY = bodyTop + 30;
      doc.fillColor(GRAY).font("Helvetica").fontSize(10);
      if (wo.client?.company) { doc.text(wo.client.company, marginX, clientY); clientY += 13; }
      if (wo.client?.address) {
        const addr = wo.client.city ? `${wo.client.address}, ${wo.client.city}` : wo.client.address;
        doc.text(addr, marginX, clientY); clientY += 13;
      }
      if (wo.client?.postalCode) { doc.text(wo.client.postalCode, marginX, clientY); clientY += 13; }
      if (wo.client?.phone) { doc.text(wo.client.phone, marginX, clientY); clientY += 13; }
      if (wo.client?.email) { doc.text(wo.client.email, marginX, clientY); clientY += 13; }

      // Details right block
      doc.fillColor(LIGHT_GRAY).font("Helvetica-Bold").fontSize(8)
        .text("DETAILS", pageWidth - marginX - 200, bodyTop, { width: 200, align: "right" });
      let detY = bodyTop + 14;
      doc.fillColor(GRAY).font("Helvetica").fontSize(10);
      if (wo.technician?.name) {
        doc.text(`Technicien: ${wo.technician.name}`, pageWidth - marginX - 200, detY, { width: 200, align: "right" });
        detY += 13;
      }
      const fmtHM = (dt) => {
        if (!dt) return null;
        const d = dt instanceof Date ? dt : new Date(dt);
        return isNaN(d.getTime()) ? null : `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      };
      const arriveStr = fmtHM(wo.arrivalAt);
      const departStr = fmtHM(wo.departureAt);
      if (arriveStr || departStr) {
        let line = `${arriveStr || "—"} a ${departStr || "—"}`;
        if (wo.durationMinutes) {
          const h = Math.floor(wo.durationMinutes / 60);
          const m = wo.durationMinutes % 60;
          line += ` (${h}h${m ? String(m).padStart(2, "0") : ""})`;
        }
        doc.text(line, pageWidth - marginX - 200, detY, { width: 200, align: "right" });
        detY += 13;
      }
      const intervAddr = wo.interventionAddress || wo.client?.address;
      const intervCity = wo.interventionCity || wo.client?.city;
      if (wo.interventionAddress || wo.interventionCity) {
        const lieu = `${intervAddr || ""}${intervCity ? `, ${intervCity}` : ""}`.trim();
        if (lieu) {
          doc.text(`Lieu: ${lieu}`, pageWidth - marginX - 200, detY, { width: 200, align: "right" });
          detY += 13;
        }
      }

      doc.y = Math.max(clientY, detY) + 12;
      doc.x = marginX;

      // ── Description ──
      if (wo.description) {
        const descY = doc.y;
        doc.rect(marginX, descY, innerWidth, 0).fill("#f9fafb");
        const descHeight = doc.heightOfString(wo.description, { width: innerWidth - 20 }) + 30;
        doc.rect(marginX, descY, innerWidth, descHeight).fill("#f9fafb");
        doc.rect(marginX, descY, 3, descHeight).fill(RED);
        doc.fillColor(LIGHT_GRAY).font("Helvetica-Bold").fontSize(8)
          .text("DESCRIPTION DU TRAVAIL", marginX + 12, descY + 8);
        doc.fillColor(DARK).font("Helvetica").fontSize(10)
          .text(wo.description, marginX + 12, descY + 22, { width: innerWidth - 24 });
        doc.y = descY + descHeight + 15;
      }

      // ── Items table ──
      const tableTop = doc.y;
      const col = {
        desc: marginX + 5,
        qty: marginX + innerWidth - 200,
        price: marginX + innerWidth - 130,
        total: marginX + innerWidth - 60,
      };

      // Header row
      doc.fillColor(LIGHT_GRAY).font("Helvetica-Bold").fontSize(8);
      doc.text("DESCRIPTION", col.desc, tableTop);
      doc.text("QTE", col.qty, tableTop, { width: 40, align: "right" });
      doc.text("PRIX", col.price, tableTop, { width: 60, align: "right" });
      doc.text("TOTAL", col.total, tableTop, { width: 60, align: "right" });
      doc.moveTo(marginX, tableTop + 14).lineTo(pageWidth - marginX, tableTop + 14).strokeColor(DARK).lineWidth(1).stroke();

      let rowY = tableTop + 22;
      const greenDiscount = "#059669";
      const laborRate = Number(wo.laborRate) || 85;
      const laborTotal = Number(wo.totalLabor) || 0;
      const laborHours = laborRate > 0 ? Math.round((laborTotal / laborRate) * 100) / 100 : 0;
      const laborDetail = laborTotal > 0 ? `${fmtLaborHours(laborHours)} x ${fmtRate(laborRate)}` : "";

      const renderItemRow = (item) => {
        const isDiscount = item.itemType === "discount" || Number(item.unitPrice) < 0;
        const color = isDiscount ? greenDiscount : DARK;
        const qty = Number(item.quantity || 0);
        const unit = Number(item.unitPrice || 0);
        const total = Number(item.totalPrice || qty * unit);

        doc.fillColor(color).font("Helvetica").fontSize(10);
        const descText = item.description + (item.product?.sku ? ` (${item.product.sku})` : "");
        const descHeight = doc.heightOfString(descText, { width: col.qty - col.desc - 5 });
        doc.text(descText, col.desc, rowY, { width: col.qty - col.desc - 5 });
        doc.text(qty.toFixed(0), col.qty, rowY, { width: 40, align: "right" });
        doc.text(fmt(unit), col.price, rowY, { width: 60, align: "right" });
        doc.font("Helvetica-Bold").text(fmt(total), col.total, rowY, { width: 60, align: "right" });

        const lineHeight = Math.max(descHeight, 14) + 6;
        rowY += lineHeight;
        doc.moveTo(marginX, rowY - 2).lineTo(pageWidth - marginX, rowY - 2).strokeColor(BORDER).lineWidth(0.5).stroke();
      };

      // Flat items first
      for (const item of wo.items || []) renderItemRow(item);

      // Sections with unit headers
      for (const sec of wo.sections || []) {
        const secSub = (sec.items || []).reduce((sum, i) => sum + Number(i.totalPrice || 0), 0);
        // Section header
        rowY += 4;
        doc.rect(marginX, rowY - 2, innerWidth, 18).fill("#f3f4f6");
        doc.fillColor(DARK).font("Helvetica-Bold").fontSize(9)
          .text(`UNITE ${sec.unitCode}`, col.desc, rowY + 2);
        doc.fillColor(DARK).font("Helvetica-Bold").fontSize(9)
          .text(fmt(secSub), col.total, rowY + 2, { width: 60, align: "right" });
        rowY += 22;

        for (const item of sec.items || []) renderItemRow(item);
      }

      if (laborTotal > 0) {
        renderItemRow({
          description: `Main d'oeuvre (${laborDetail})`,
          quantity: 1,
          unitPrice: laborTotal,
          totalPrice: laborTotal,
          itemType: "labor",
        });
      }

      // ── Totals ──
      const totalsX = pageWidth - marginX - 220;
      let tY = rowY + 15;

      const totalsRows = [
        { label: "Pieces", value: fmt(wo.totalPieces), note: "" },
        { label: "Main d'oeuvre", value: fmt(wo.totalLabor), note: laborDetail },
      ];
      for (const row of totalsRows) {
        doc.fillColor(GRAY).font("Helvetica").fontSize(10);
        doc.text(row.label, totalsX, tY, { width: 120 });
        doc.fillColor(DARK).text(row.value, totalsX + 120, tY, { width: 100, align: "right" });
        tY += row.note ? 11 : 14;
        if (row.note) {
          doc.fillColor(LIGHT_GRAY).font("Helvetica").fontSize(8)
            .text(row.note, totalsX, tY, { width: 120 });
          tY += 12;
        }
      }

      // Subtotal with top line
      doc.moveTo(totalsX, tY).lineTo(pageWidth - marginX, tY).strokeColor(BORDER).lineWidth(0.5).stroke();
      tY += 5;
      doc.fillColor(GRAY).font("Helvetica").fontSize(10);
      doc.text("Sous-total", totalsX, tY, { width: 120 });
      doc.fillColor(DARK).text(fmt(wo.subtotal), totalsX + 120, tY, { width: 100, align: "right" });
      tY += 14;

      // TPS/TVQ
      doc.fillColor(LIGHT_GRAY).fontSize(9);
      doc.text(`TPS${settings.tps_number ? ` (${settings.tps_number})` : ""}`, totalsX, tY, { width: 120 });
      doc.fillColor(GRAY).text(fmt(wo.tps), totalsX + 120, tY, { width: 100, align: "right" });
      tY += 12;
      doc.fillColor(LIGHT_GRAY).text(`TVQ${settings.tvq_number ? ` (${settings.tvq_number})` : ""}`, totalsX, tY, { width: 120 });
      doc.fillColor(GRAY).text(fmt(wo.tvq), totalsX + 120, tY, { width: 100, align: "right" });
      tY += 14;

      // Total
      doc.moveTo(totalsX, tY).lineTo(pageWidth - marginX, tY).strokeColor(DARK).lineWidth(1.5).stroke();
      tY += 6;
      doc.fillColor(DARK).font("Helvetica-Bold").fontSize(14);
      doc.text("TOTAL", totalsX, tY, { width: 120 });
      doc.fillColor(RED).text(fmt(wo.total), totalsX + 120, tY, { width: 100, align: "right" });
      tY += 25;

      // ── Signature ──
      if (wo.signatureUrl) {
        try {
          doc.moveTo(marginX, tY).lineTo(pageWidth - marginX, tY).strokeColor(BORDER).lineWidth(0.5).stroke();
          tY += 10;
          doc.fillColor(LIGHT_GRAY).font("Helvetica-Bold").fontSize(8)
            .text("SIGNATURE DU CLIENT", marginX, tY);
          // Note: signatures are remote URLs. pdfkit can't download them synchronously here.
          // We skip embedding the signature image to avoid async complications.
          tY += 50;
        } catch {}
      }

      // ── Footer ──
      const footerY = pageHeight - 60;
      doc.moveTo(marginX, footerY).lineTo(pageWidth - marginX, footerY).strokeColor(BORDER).lineWidth(0.5).stroke();
      doc.fillColor(LIGHT_GRAY).font("Helvetica").fontSize(8)
        .text("Merci de faire affaire avec Vosthermos", marginX, footerY + 10, { width: innerWidth, align: "center" });
      doc.text("vosthermos.com", marginX, footerY + 22, { width: innerWidth, align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
