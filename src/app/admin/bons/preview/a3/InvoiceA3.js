"use client";

import Link from "next/link";
import { COMPANY, fmt, fmtDate, computeTotals } from "../_sample";

// ─── Pagination ──────────────────────────────────────────────────
// Conservative capacities tuned for 8.5x11 with 0.5in internal padding.
// Content zone = 7.5in wide x 10in tall.
const FIRST_CAPACITY = 5; // first page: big header + client + details + N sections
const MIDDLE_CAPACITY = 7; // compact header of continuation + N sections
const LAST_CAPACITY = 6; // small header + N sections + totals + footer
const SMALL_INVOICE_THRESHOLD = 8; // if <=8 sections, everything fits on 1 page

function paginate(sections) {
  if (sections.length <= SMALL_INVOICE_THRESHOLD) {
    return [{ sections, isFirst: true, isLast: true, index: 0 }];
  }

  const pages = [];
  const queue = [...sections];

  pages.push({ sections: queue.splice(0, FIRST_CAPACITY), isFirst: true, isLast: false });

  while (queue.length > LAST_CAPACITY) {
    const n = Math.min(MIDDLE_CAPACITY, queue.length - LAST_CAPACITY);
    if (n <= 0) break;
    pages.push({ sections: queue.splice(0, n), isFirst: false, isLast: false });
  }

  pages.push({ sections: queue, isFirst: false, isLast: true });
  pages.forEach((p, i) => (p.index = i));
  return pages;
}

export default function InvoiceA3({ wo, backHref = "/admin/bons/preview", label = "Retour aux options" }) {
  const t = computeTotals(wo);
  const pages = paginate(wo.sections || []);

  return (
    <div className="bg-neutral-300 min-h-screen py-6 print:py-0 print:bg-white">
      <style jsx global>{`
        @media print {
          @page {
            size: 8.5in 11in;
            margin: 0;
          }
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: auto !important;
            height: auto !important;
            overflow: visible !important;
          }
          /* Hide admin chrome */
          aside, .admin-sidebar, .admin-header, header[class*="admin"] {
            display: none !important;
          }
          /* Neutralize all wrapper layouts so pages can flow naturally */
          body > *, body > * > *, body > * > * > *, main {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            min-height: 0 !important;
            width: auto !important;
            overflow: visible !important;
            box-shadow: none !important;
          }
          .print-hide { display: none !important; }
          .page-stack {
            display: block !important;
            gap: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .invoice-page {
            display: block !important;
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: always;
            break-after: page;
            /* Force exact page size */
            width: 8.5in !important;
            height: 11in !important;
            max-width: 8.5in !important;
            overflow: hidden !important;
          }
          .invoice-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 mb-4 flex items-center justify-between print-hide">
        <Link href={backHref} className="text-neutral-700 text-sm hover:text-neutral-900 font-medium">
          <i className="fas fa-arrow-left mr-2"></i>{label}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-600 font-medium">
            {pages.length} page{pages.length > 1 ? "s" : ""} · Format 8,5 × 11 po
          </span>
          <button onClick={() => window.print()} className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium">
            <i className="fas fa-print mr-2"></i>Imprimer
          </button>
        </div>
      </div>

      <div className="page-stack flex flex-col items-center gap-6 print:gap-0">
        {pages.map((page) => (
          <Page key={page.index} page={page} totalPages={pages.length} wo={wo} totals={t} />
        ))}
      </div>
    </div>
  );
}

// ─── Single physical page ────────────────────────────────────────
function Page({ page, totalPages, wo, totals }) {
  return (
    <div
      className="invoice-page bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] relative"
      style={{
        width: "8.5in",
        height: "11in",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top accent bars */}
      <div style={{ height: "3px", background: "#b91c1c", flexShrink: 0 }}></div>
      <div style={{ height: "1px", background: "rgba(185, 28, 28, 0.3)", flexShrink: 0 }}></div>

      <div style={{ padding: "0.5in", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        {page.isFirst ? (
          <FullHeader wo={wo} />
        ) : (
          <CompactHeader wo={wo} pageNum={page.index + 1} totalPages={totalPages} />
        )}

        {/* Sections */}
        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px", flex: 1, minHeight: 0 }}>
          {page.sections.map((sec, i) => (
            <SectionCard key={i} sec={sec} />
          ))}
        </div>

        {page.isLast && <Totals wo={wo} totals={totals} />}
      </div>

      {page.isLast && <Footer />}

      {/* Page number at bottom */}
      <div style={{
        flexShrink: 0,
        padding: "6px 0.5in",
        borderTop: "1px solid #f3f4f6",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "9px",
        color: "#9ca3af",
      }}>
        <span>{wo.number} · {wo.client.name}</span>
        <span style={{ fontFamily: "monospace" }}>Page {page.index + 1} / {totalPages}</span>
      </div>
    </div>
  );
}

function FullHeader({ wo }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "24px", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/Vos-Thermos-Logo.png" alt="Vosthermos" style={{ height: "80px", width: "auto", flexShrink: 0 }} />
          <p style={{ fontSize: "10.5px", lineHeight: 1.45, color: "#6b7280" }}>
            {COMPANY.legal}<br />
            {COMPANY.address}<br />
            {COMPANY.city}, QC {COMPANY.postalCode}<br />
            {COMPANY.phone} · {COMPANY.email}<br />
            {COMPANY.web}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: "#9ca3af" }}>Facture</p>
          <p style={{ fontSize: "36px", lineHeight: 1, fontWeight: 900, color: "#111827", marginTop: "6px", letterSpacing: "-0.02em" }}>{wo.number}</p>
          <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>{fmtDate(wo.date)}</p>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb", margin: "16px 0" }}></div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        <div>
          <p style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: "#9ca3af", marginBottom: "8px" }}>Facturer à</p>
          <p style={{ fontWeight: 700, fontSize: "16px", color: "#111827", lineHeight: 1.2 }}>{wo.client.name}</p>
          {wo.client.company && <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{wo.client.company}</p>}
          <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px", lineHeight: 1.4 }}>
            {wo.client.address}<br />
            {wo.client.city}, QC {wo.client.postalCode}
          </p>
          <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px", lineHeight: 1.4 }}>
            {wo.client.phone}<br />
            {wo.client.email}
          </p>
        </div>
        <div>
          <p style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: "#9ca3af", marginBottom: "8px" }}>Détails</p>
          <div style={{ fontSize: "12px" }}>
            <DetailRow label="Technicien" value={wo.technician} />
            <DetailRow label="Date" value={fmtDate(wo.date)} />
            <DetailRow label="Horaire" value={`${wo.arrival} – ${wo.departure}`} />
            <DetailRow label="Durée" value={wo.duration} />
          </div>
        </div>
      </div>

      {wo.description && (
        <div style={{ marginTop: "12px", borderLeft: "2px solid #b91c1c", paddingLeft: "12px" }}>
          <p style={{ fontSize: "12px", color: "#374151", fontStyle: "italic", lineHeight: 1.4 }}>{wo.description}</p>
        </div>
      )}
    </>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ color: "#111827", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function CompactHeader({ wo, pageNum, totalPages }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/Vos-Thermos-Logo.png" alt="Vosthermos" style={{ height: "36px", width: "auto" }} />
        <div>
          <p style={{ fontSize: "11px", color: "#6b7280" }}>Suite de la facture · page {pageNum}/{totalPages}</p>
          <p style={{ fontWeight: 700, color: "#111827", fontSize: "13px" }}>{wo.client.name}</p>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontSize: "18px", fontWeight: 900, color: "#111827" }}>{wo.number}</p>
        <p style={{ fontSize: "10px", color: "#6b7280" }}>{fmtDate(wo.date)}</p>
      </div>
    </div>
  );
}

function SectionCard({ sec }) {
  const subtot = sec.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  return (
    <div style={{ border: "2px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 16px", borderBottom: "1px solid #e5e7eb", backgroundColor: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ display: "inline-block", padding: "2px 8px", border: "2px solid #b91c1c", color: "#b91c1c", fontSize: "11px", fontWeight: 900, letterSpacing: "0.08em", borderRadius: "4px", fontFamily: "monospace", background: "white" }}>{sec.unitCode}</span>
          <span style={{ fontSize: "11px", color: "#6b7280" }}>Unité · {sec.items.length} item{sec.items.length > 1 ? "s" : ""}</span>
        </div>
        <span style={{ fontWeight: 700, color: "#111827", fontSize: "12px" }}>{fmt(subtot)}</span>
      </div>
      <table style={{ width: "100%", fontSize: "11.5px", borderCollapse: "collapse" }}>
        <tbody>
          {sec.items.map((it, j) => (
            <tr key={j} style={{ borderBottom: j < sec.items.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <td style={{ padding: "6px 16px", color: "#1f2937" }}>{it.description}</td>
              <td style={{ padding: "6px 8px", textAlign: "right", color: "#6b7280", width: "40px" }}>{it.qty}</td>
              <td style={{ padding: "6px 8px", textAlign: "right", color: "#6b7280", width: "80px" }}>{fmt(it.unitPrice)}</td>
              <td style={{ padding: "6px 16px", textAlign: "right", fontWeight: 600, color: "#111827", width: "96px" }}>{fmt(it.qty * it.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Totals({ wo, totals }) {
  return (
    <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
      <div style={{ width: "290px", border: "2px dashed #d1d5db", borderRadius: "8px", padding: "12px", background: "rgba(249, 250, 251, 0.4)" }}>
        <div style={{ paddingBottom: "8px", borderBottom: "1px dashed #d1d5db" }}>
          <TotalRow label="Pièces & services" value={fmt(totals.totalPieces)} />
          <TotalRow label={`Main d'œuvre (${wo.laborHours}h)`} value={fmt(totals.totalLabor)} />
          <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px dotted #d1d5db" }}>
            <TotalRow label="Sous-total" value={fmt(totals.subtotal)} strong />
          </div>
          <TotalRow label="TPS (5%)" value={fmt(totals.tps)} small />
          <TotalRow label="TVQ (9.975%)" value={fmt(totals.tvq)} small />
        </div>
        <div style={{ paddingTop: "8px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: "#b91c1c" }}>Montant à payer</p>
            <p style={{ fontSize: "9px", color: "#9ca3af", marginTop: "2px" }}>Net 30 jours</p>
          </div>
          <span style={{ fontSize: "18px", fontWeight: 900, color: "#b91c1c", letterSpacing: "-0.02em" }}>{fmt(totals.total)}</span>
        </div>
      </div>
    </div>
  );
}

function TotalRow({ label, value, strong, small }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
      <span style={{ color: small ? "#9ca3af" : "#6b7280", fontSize: small ? "10px" : "12px", fontWeight: strong ? 500 : 400 }}>{label}</span>
      <span style={{ color: small ? "#6b7280" : "#111827", fontSize: small ? "10px" : "12px", fontWeight: strong ? 500 : 400 }}>{value}</span>
    </div>
  );
}

function Footer() {
  return (
    <div style={{
      flexShrink: 0,
      padding: "12px 0.5in",
      borderTop: "1px solid #e5e7eb",
      background: "#f9fafb",
      fontSize: "10px",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <p style={{ fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "9px", marginBottom: "4px" }}>Conditions</p>
          <p style={{ color: "#6b7280", lineHeight: 1.4 }}>Net 30 jours · Intérêt 1,5%/mois sur solde en retard · Chèque, virement Interac ou comptant.</p>
        </div>
        <div>
          <p style={{ fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "9px", marginBottom: "4px" }}>Taxes</p>
          <p style={{ color: "#6b7280", lineHeight: 1.4 }}>TPS: {COMPANY.tps}<br />TVQ: {COMPANY.tvq}</p>
        </div>
      </div>
    </div>
  );
}
