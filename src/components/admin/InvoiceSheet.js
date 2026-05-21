"use client";

import { getWorkOrderDocumentMeta } from "@/lib/work-order-document";
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
} from "@/lib/vosthermos-document";

const ACCENT = "#2c3e50";
const ACCENT_LIGHT = "#ecf0f1";
const LIGHT_GRAY = "#f8f9fa";
const MID_GRAY = "#bdc3c7";
const TEXT_DARK = "#2c3e50";
const TEXT_MED = "#555555";

function paginateRows(rows) {
  if (rows.length <= 9) return [{ rows, isFirst: true, isLast: true, index: 0 }];
  const pages = [];
  const queue = [...rows];
  pages.push({ rows: queue.splice(0, 8), isFirst: true, isLast: false, index: 0 });
  while (queue.length > 10) {
    pages.push({ rows: queue.splice(0, 12), isFirst: false, isLast: false, index: pages.length });
  }
  pages.push({ rows: queue, isFirst: false, isLast: true, index: pages.length });
  return pages;
}

export default function InvoiceSheet({ wo, company }) {
  const documentMeta = getWorkOrderDocumentMeta(wo.statut);
  const rows = documentRows(wo);
  const pages = paginateRows(rows);
  const co = resolveDocumentCompany(company || {});
  const documentNumber = resolveDocumentNumber(wo);

  return (
    <div className="bg-neutral-200 py-6 print:bg-white print:py-0">
      <style jsx global>{`
        @media print {
          @page { size: 8.5in 11in; margin: 0; }
          script, style, link, meta, noscript,
          aside, .admin-sidebar, .admin-header, .print-hide {
            display: none !important;
          }
          body *:not(.invoice-page):not(.invoice-page *) {
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            min-height: 0 !important;
            max-width: none !important;
            overflow: visible !important;
          }
          html:has(.invoice-page),
          body:has(.invoice-page),
          body > *:has(.invoice-page),
          body > * > *:has(.invoice-page),
          body > * > * > *:has(.invoice-page),
          body > * > * > * > *:has(.invoice-page),
          main:has(.invoice-page),
          .invoice-stack {
            display: block !important;
          }
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .invoice-page {
            display: flex !important;
            flex-direction: column !important;
            width: 8.5in !important;
            height: 11in !important;
            max-width: 8.5in !important;
            overflow: hidden !important;
            margin: 0 !important;
            box-shadow: none !important;
            page-break-after: always;
            break-after: page;
          }
          .invoice-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
        }
      `}</style>

      <div className="invoice-stack flex flex-col items-center gap-6 print:block print:gap-0">
        {pages.map((page) => (
          <Sheet
            key={page.index}
            page={page}
            totalPages={pages.length}
            wo={wo}
            co={co}
            meta={documentMeta}
            documentNumber={documentNumber}
          />
        ))}
      </div>
    </div>
  );
}

function Sheet({ page, totalPages, wo, co, meta, documentNumber }) {
  return (
    <div
      className="invoice-page bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
      style={{
        width: "8.5in",
        height: "11in",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "Helvetica, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        color: TEXT_DARK,
      }}
    >
      <div style={{ height: 8, background: ACCENT, flexShrink: 0 }} />
      <main style={{ padding: "0.5in 0.65in 0", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        {page.isFirst ? (
          <>
            <FullHeader meta={meta} co={co} documentNumber={documentNumber} />
            <InfoBox wo={wo} meta={meta} documentNumber={documentNumber} />
            <Description wo={wo} meta={meta} />
          </>
        ) : (
          <CompactHeader wo={wo} meta={meta} documentNumber={documentNumber} page={page.index + 1} totalPages={totalPages} />
        )}

        <WorkTable rows={page.rows} pageStartIndex={countPreviousItems(page, wo)} />

        {page.isLast && (
          <>
            <Totals wo={wo} meta={meta} />
            {meta.type !== "invoice" && <Conditions meta={meta} />}
            {meta.type === "quote" && <SignatureBlock />}
          </>
        )}
      </main>
      <Footer co={co} page={page.index + 1} />
      <div style={{ height: 3, background: ACCENT, flexShrink: 0 }} />
    </div>
  );
}

function countPreviousItems(page, wo) {
  const allPages = paginateRows(documentRows(wo));
  let count = 0;
  for (const candidate of allPages) {
    if (candidate.index >= page.index) break;
    count += candidate.rows.filter((row) => row.type === "item").length;
  }
  return count;
}

function FullHeader({ meta, co }) {
  return (
    <header style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 16, alignItems: "start", marginBottom: 14 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/Vos-Thermos-Logo.png" alt="Vosthermos" style={{ width: 92, height: "auto", maxHeight: 70, objectFit: "contain" }} />
      <div style={{ textAlign: "right" }}>
        <h1 style={{ margin: 0, fontSize: 26, lineHeight: "30px", fontWeight: 800, color: ACCENT }}>{meta.labelUpper}</h1>
        <p style={{ margin: "3px 0 0", fontSize: 10, color: TEXT_MED }}>Reparation et remplacement de fenetres</p>
        <p style={{ margin: "5px 0 0", fontSize: 8, color: TEXT_MED }}>{co.address}, {co.city}, {co.province} | RBQ : {co.rbq}</p>
      </div>
    </header>
  );
}

function CompactHeader({ wo, meta, documentNumber, page, totalPages }) {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${MID_GRAY}`, paddingBottom: 10, marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/Vos-Thermos-Logo.png" alt="Vosthermos" style={{ width: 44, height: "auto" }} />
        <div>
          <p style={{ margin: 0, fontSize: 9, color: TEXT_MED }}>{meta.compactPrefix} - page {page}/{totalPages}</p>
          <p style={{ margin: "2px 0 0", fontSize: 10, fontWeight: 700 }}>{wo.client?.name || ""}</p>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: TEXT_DARK }}>{documentNumber}</p>
    </header>
  );
}

function InfoBox({ wo, meta, documentNumber }) {
  const date = getDocumentDate(wo);
  const targetDate = getDocumentTargetDate(wo, meta.type);
  const targetValue = targetDate
    ? meta.type === "invoice"
      ? `${formatDateFr(targetDate)} (Net ${getPaymentTermsDays(wo)} j.)`
      : formatDateFr(targetDate)
    : "";

  return (
    <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: LIGHT_GRAY, border: `1px solid ${MID_GRAY}`, marginBottom: 16 }}>
      <div style={{ padding: "8px 10px", borderRight: `1px solid ${MID_GRAY}` }}>
        <SectionKicker>CLIENT</SectionKicker>
        <p style={{ margin: "4px 0 3px", fontSize: 9, fontWeight: 700 }}>{wo.client?.name || "-"}</p>
        <p style={{ margin: 0, fontSize: 9, lineHeight: "12px" }}>
          {wo.client?.company && <>{wo.client.company}<br /></>}
          {wo.client?.address && <>{wo.client.address}<br /></>}
          {getClientCityLine(wo.client) && <>{getClientCityLine(wo.client)}<br /></>}
          {wo.client?.phone && <>Tel. : {wo.client.phone}<br /></>}
          {wo.client?.email}
        </p>
      </div>
      <div style={{ padding: "8px 10px" }}>
        <SectionKicker>DETAILS</SectionKicker>
        <DetailRow label="Date" value={formatDateFr(date)} />
        {targetValue && <DetailRow label={meta.dateTargetLabel} value={targetValue} />}
        <DetailRow label="Type" value={getProjectType(wo)} />
        <DetailRow label="Adresse des travaux" value={getProjectAddress(wo, false) || "-"} tall />
        <DetailRow label={meta.numberLabel} value={documentNumber} />
      </div>
    </section>
  );
}

function Description({ wo, meta }) {
  const text = wo.description || "Travaux de reparation et remplacement de fenetres selon les elements detailles ci-dessous.";
  return (
    <section style={{ marginBottom: 12 }}>
      <DocHeading>{meta.descriptionHeading}</DocHeading>
      <p style={{ margin: "4px 0 0", fontSize: 9, lineHeight: "12px", color: TEXT_DARK }}>{text}</p>
    </section>
  );
}

function WorkTable({ rows, pageStartIndex }) {
  let itemIndex = pageStartIndex + 1;
  return (
    <section style={{ marginTop: 2 }}>
      <DocHeading>DETAIL DES TRAVAUX</DocHeading>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 4, fontSize: 8 }}>
        <thead>
          <tr style={{ background: ACCENT, color: "white" }}>
            <th style={{ width: 28, padding: "5px 6px", textAlign: "center" }}>#</th>
            <th style={{ padding: "5px 6px", textAlign: "left" }}>Description</th>
            <th style={{ width: 58, padding: "5px 6px", textAlign: "center" }}>Unite</th>
            <th style={{ width: 42, padding: "5px 6px", textAlign: "center" }}>Qte</th>
            <th style={{ width: 82, padding: "5px 6px", textAlign: "right" }}>Montant</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            if (row.type === "section") {
              return (
                <tr key={`section-${index}`} style={{ background: ACCENT_LIGHT }}>
                  <td style={{ padding: "5px 6px", borderBottom: `1px solid ${MID_GRAY}` }} />
                  <td colSpan={4} style={{ padding: "5px 6px", borderBottom: `1px solid ${MID_GRAY}`, fontWeight: 700, color: ACCENT }}>{row.label}</td>
                </tr>
              );
            }
            return (
              <tr key={`item-${index}`} style={{ background: "white" }}>
                <td style={{ padding: "6px", textAlign: "center", borderBottom: `1px solid ${MID_GRAY}`, fontWeight: 700 }}>{itemIndex++}</td>
                <td style={{ padding: "6px", borderBottom: `1px solid ${MID_GRAY}`, lineHeight: "10.5px", whiteSpace: "pre-wrap" }}>{row.description}</td>
                <td style={{ padding: "6px", textAlign: "center", borderBottom: `1px solid ${MID_GRAY}` }}>{row.unit}</td>
                <td style={{ padding: "6px", textAlign: "center", borderBottom: `1px solid ${MID_GRAY}` }}>{formatQuantity(row.qty)}</td>
                <td style={{ padding: "6px", textAlign: "right", borderBottom: `1px solid ${MID_GRAY}`, fontWeight: 700 }}>{formatMoneyCad(row.amount)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function Totals({ wo, meta }) {
  return (
    <section style={{ marginTop: 0, borderTop: `1px solid ${MID_GRAY}` }}>
      <div style={{ width: 270, marginLeft: "auto", paddingTop: 12, paddingBottom: 8 }}>
        <MoneyLine label="Sous-total" value={wo.subtotal} strong />
        <MoneyLine label="TPS (5%)" value={wo.tps} />
        <MoneyLine label="TVQ (9,975%)" value={wo.tvq} />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 46, background: ACCENT, color: "white", padding: "11px 12px", fontSize: 11, fontWeight: 800 }}>
        <span>{meta.totalLabel} :</span>
        <span style={{ minWidth: 100, textAlign: "right" }}>{formatMoneyCad(wo.total)}</span>
      </div>
    </section>
  );
}

function Conditions({ meta }) {
  return (
    <section style={{ marginTop: 10 }}>
      <DocHeading>CONDITIONS</DocHeading>
      <div style={{ marginTop: 3 }}>
        {documentConditions(meta.type).map((condition, index) => (
          <p key={index} style={{ margin: "2px 0", paddingLeft: 12, fontSize: 8, lineHeight: "11px" }}>
            - {stripHtmlTags(condition)}
          </p>
        ))}
      </div>
    </section>
  );
}

function SignatureBlock() {
  return (
    <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, marginTop: 18, textAlign: "center", fontSize: 9, color: TEXT_MED }}>
      {["Pour Vosthermos", "Acceptation du client"].map((label) => (
        <div key={label}>
          <p style={{ margin: 0, color: ACCENT, fontSize: 10, fontWeight: 700 }}>{label}</p>
          <div style={{ height: 34 }} />
          <div style={{ width: "70%", margin: "0 auto", borderTop: `1px solid ${TEXT_MED}` }} />
          <p style={{ margin: "4px 0 22px" }}>Signature</p>
          <div style={{ width: "70%", margin: "0 auto", borderTop: `1px solid ${TEXT_MED}` }} />
          <p style={{ margin: "4px 0 0" }}>Date</p>
        </div>
      ))}
    </section>
  );
}

function Footer({ co, page }) {
  return (
    <footer style={{ flexShrink: 0, padding: "5px 0.45in 3px", fontSize: 7, color: TEXT_MED, textAlign: "center" }}>
      <p style={{ margin: 0 }}>
        Vosthermos - Reparation et remplacement de fenetres | {co.address}, {co.city}, {co.province} | RBQ : {co.rbq} | TPS : {co.tps} | TVQ : {co.tvq}
      </p>
      <p style={{ margin: "2px 0 0" }}>Page {page}</p>
    </footer>
  );
}

function SectionKicker({ children }) {
  return <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: ACCENT }}>{children}</p>;
}

function DocHeading({ children }) {
  return <h2 style={{ margin: 0, fontSize: 11, lineHeight: "16px", fontWeight: 800, color: ACCENT }}>{children}</h2>;
}

function DetailRow({ label, value, tall }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: 4, marginTop: 2, fontSize: 8.5, lineHeight: tall ? "12px" : "11px" }}>
      <span style={{ fontWeight: 700 }}>{label} :</span>
      <span>{value}</span>
    </div>
  );
}

function MoneyLine({ label, value, strong }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 10px", fontSize: 10, fontWeight: strong ? 700 : 400 }}>
      <span>{label} :</span>
      <span>{formatMoneyCad(value)}</span>
    </div>
  );
}
