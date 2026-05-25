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

function paginateRows(rows, meta) {
  const firstPageLimit = 4;
  const middlePageLimit = 6;
  const lastPageLimit = documentConditions(meta.type).length > 0 ? 3 : 6;
  if (rows.length <= firstPageLimit) return [{ rows, isFirst: true, isLast: true, index: 0, pageStartIndex: 0 }];
  const rawPages = [];
  const queue = [...rows];
  rawPages.push(queue.splice(0, firstPageLimit));
  while (queue.length > lastPageLimit) {
    rawPages.push(queue.splice(0, middlePageLimit));
  }
  rawPages.push(queue);

  let pageStartIndex = 0;
  return rawPages.map((pageRows, index) => {
    const page = {
      rows: pageRows,
      isFirst: index === 0,
      isLast: index === rawPages.length - 1,
      index,
      pageStartIndex,
    };
    pageStartIndex += pageRows.filter((row) => row.type === "item").length;
    return page;
  });
}

export default function InvoiceSheet({ wo, company }) {
  const documentMeta = getWorkOrderDocumentMeta(wo.statut);
  const rows = documentRows(wo);
  const pages = paginateRows(rows, documentMeta);
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
            <FullHeader meta={meta} co={co} />
            <InfoBox wo={wo} co={co} meta={meta} documentNumber={documentNumber} />
            <Description wo={wo} meta={meta} />
          </>
        ) : (
          <CompactHeader wo={wo} meta={meta} documentNumber={documentNumber} page={page.index + 1} totalPages={totalPages} />
        )}

        <WorkTable rows={page.rows} pageStartIndex={page.pageStartIndex} />
      </main>
      <DocumentFooter co={co} page={page.index + 1} wo={wo} meta={meta} isLast={page.isLast} />
      <div style={{ height: 3, background: ACCENT, flexShrink: 0 }} />
    </div>
  );
}

function FullHeader({ meta, co }) {
  return (
    <header style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 12, alignItems: "start", marginBottom: 10 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/Vos-Thermos-Logo.png" alt="Vosthermos" style={{ width: 105, height: "auto", maxHeight: 70, objectFit: "contain" }} />
      <div style={{ textAlign: "right" }}>
        <h1 style={{ margin: 0, fontSize: 23, lineHeight: "26px", fontWeight: 800, color: ACCENT }}>{meta.labelUpper}</h1>
        <p style={{ margin: "2px 0 0", fontSize: 9, color: TEXT_MED }}>Reparation et remplacement de fenetres</p>
        <p style={{ margin: "3px 0 0", fontSize: 7.5, color: TEXT_MED }}>{co.address}, {co.city}, {co.province} | RBQ : {co.rbq}</p>
      </div>
    </header>
  );
}

function CompactHeader({ wo, meta, documentNumber, page, totalPages }) {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${MID_GRAY}`, paddingBottom: 10, marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/Vos-Thermos-Logo.png" alt="Vosthermos" style={{ width: 58, height: "auto" }} />
        <div>
          <p style={{ margin: 0, fontSize: 9, color: TEXT_MED }}>{meta.compactPrefix} - page {page}/{totalPages}</p>
          <p style={{ margin: "2px 0 0", fontSize: 10, fontWeight: 700 }}>{wo.client?.name || ""}</p>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: TEXT_DARK }}>{documentNumber}</p>
    </header>
  );
}

function InfoBox({ wo, co, meta, documentNumber }) {
  const date = getDocumentDate(wo, meta.type);
  const projectAddress = getProjectAddress(wo, false);
  const targetDate = getDocumentTargetDate(wo, meta.type);
  const targetValue = targetDate
    ? meta.type === "invoice"
      ? `${formatDateFr(targetDate)} (Net ${getPaymentTermsDays(wo)} j.)`
      : formatDateFr(targetDate)
    : "";

  return (
    <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: LIGHT_GRAY, border: `1px solid ${MID_GRAY}`, marginBottom: 16 }}>
      <div style={{ padding: "10px 12px", borderRight: `1px solid ${MID_GRAY}` }}>
        <SectionKicker>CLIENT</SectionKicker>
        <p style={{ margin: "6px 0 4px", fontSize: 12, lineHeight: "16px", fontWeight: 700 }}>{wo.client?.name || "-"}</p>
        <p style={{ margin: 0, fontSize: 12, lineHeight: "16px" }}>
          {wo.client?.company && <>{wo.client.company}<br /></>}
          {wo.client?.address && <>{wo.client.address}<br /></>}
          {getClientCityLine(wo.client) && <>{getClientCityLine(wo.client)}<br /></>}
          {wo.client?.phone && <>Tel. : {wo.client.phone}<br /></>}
          {wo.client?.email}
        </p>
        {projectAddress && (
          <div style={{ marginTop: 8 }}>
            <p style={{ margin: 0, fontSize: 12, lineHeight: "15px", fontWeight: 700, color: ACCENT }}>ADRESSE DES TRAVAUX</p>
            <p style={{ margin: "3px 0 0", fontSize: 12, lineHeight: "16px" }}>{projectAddress}</p>
          </div>
        )}
      </div>
      <div style={{ padding: "10px 12px" }}>
        <SectionKicker>DETAILS</SectionKicker>
        <DetailRow label="Compagnie" value={(co.legal || "Vosthermos").split(" - ")[0]} />
        <DetailRow label="Email" value={co.email || "info@vosthermos.com"} />
        <DetailRow label="Date" value={formatDateFr(date)} />
        {targetValue && <DetailRow label={meta.dateTargetLabel} value={targetValue} />}
        <DetailRow label="Type" value={getProjectType(wo)} />
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
      <p style={{ margin: "5px 0 0", fontSize: 12, lineHeight: "16px", color: TEXT_DARK }}>{text}</p>
    </section>
  );
}

function WorkTable({ rows, pageStartIndex }) {
  let itemIndex = pageStartIndex + 1;
  return (
    <section style={{ marginTop: 2 }}>
      <DocHeading>DETAIL DES TRAVAUX</DocHeading>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 5, fontSize: 12, tableLayout: "fixed" }}>
        <thead>
          <tr style={{ background: ACCENT, color: "white" }}>
            <th style={{ width: 34, padding: "7px 6px", textAlign: "center" }}>#</th>
            <th style={{ padding: "7px 6px", textAlign: "left" }}>Description</th>
            <th style={{ width: 68, padding: "7px 6px", textAlign: "center" }}>Unite</th>
            <th style={{ width: 48, padding: "7px 6px", textAlign: "center" }}>Qte</th>
            <th style={{ width: 96, padding: "7px 6px", textAlign: "right" }}>Montant</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            if (row.type === "section") {
              return (
                <tr key={`section-${index}`} style={{ background: ACCENT_LIGHT }}>
                  <td style={{ padding: "7px 6px", borderBottom: `1px solid ${MID_GRAY}` }} />
                  <td colSpan={4} style={{ padding: "7px 6px", borderBottom: `1px solid ${MID_GRAY}`, lineHeight: "16px", fontWeight: 700, color: ACCENT }}>{row.label}</td>
                </tr>
              );
            }
            return (
              <tr key={`item-${index}`} style={{ background: "white" }}>
                <td style={{ padding: "7px 6px", textAlign: "center", verticalAlign: "top", borderBottom: `1px solid ${MID_GRAY}`, lineHeight: "16px", fontWeight: 700 }}>{itemIndex++}</td>
                <td style={{ padding: "7px 6px", verticalAlign: "top", borderBottom: `1px solid ${MID_GRAY}`, lineHeight: "16px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{row.description}</td>
                <td style={{ padding: "7px 6px", textAlign: "center", verticalAlign: "top", borderBottom: `1px solid ${MID_GRAY}`, lineHeight: "16px" }}>{row.unit}</td>
                <td style={{ padding: "7px 6px", textAlign: "center", verticalAlign: "top", borderBottom: `1px solid ${MID_GRAY}`, lineHeight: "16px" }}>{formatQuantity(row.qty)}</td>
                <td style={{ padding: "7px 6px", textAlign: "right", verticalAlign: "top", borderBottom: `1px solid ${MID_GRAY}`, lineHeight: "16px", fontWeight: 700 }}>{formatMoneyCad(row.amount)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function TotalsFooter({ wo, meta }) {
  return (
    <section style={{ marginTop: 0 }}>
      <div style={{ height: 3, background: ACCENT }} />
      <div style={{ width: 270, marginLeft: "auto", paddingTop: 6, paddingBottom: 6 }}>
        <MoneyLine label="Sous-total" value={wo.subtotal} strong />
        <MoneyLine label="TPS (5%)" value={wo.tps} />
        <MoneyLine label="TVQ (9,975%)" value={wo.tvq} />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 46, background: ACCENT, color: "white", padding: "8px 12px", fontSize: 12, lineHeight: "16px", fontWeight: 800 }}>
        <span>{meta.totalLabel} :</span>
        <span style={{ minWidth: 100, textAlign: "right" }}>{formatMoneyCad(wo.total)}</span>
      </div>
    </section>
  );
}

function ConditionsFooter({ meta }) {
  const conditions = documentConditions(meta.type);
  if (conditions.length === 0) return null;

  return (
    <section style={{ borderTop: `1px solid ${MID_GRAY}`, paddingTop: 6, marginTop: 6, marginBottom: 6 }}>
      <p style={{ margin: 0, fontSize: 12, lineHeight: "16px", fontWeight: 800, color: ACCENT }}>CONDITIONS</p>
      <div style={{ marginTop: 4 }}>
        {conditions.map((condition, index) => (
          <p key={index} style={{ margin: "2px 0", paddingLeft: 10, fontSize: 12, lineHeight: "16px" }}>
            - {stripHtmlTags(condition)}
          </p>
        ))}
      </div>
    </section>
  );
}

function DocumentFooter({ co, page, wo, meta, isLast }) {
  const showConditions = isLast && documentConditions(meta.type).length > 0;

  return (
    <footer style={{ flexShrink: 0, padding: "0 0.45in 3px", color: TEXT_MED }}>
      <TotalsFooter wo={wo} meta={meta} />
      {showConditions && <ConditionsFooter meta={meta} />}
      <div style={{ paddingTop: 4, fontSize: 7, textAlign: "center" }}>
        <p style={{ margin: 0 }}>
          Vosthermos - Reparation et remplacement de fenetres | {co.address}, {co.city}, {co.province} | RBQ : {co.rbq} | TPS : {co.tps} | TVQ : {co.tvq}
        </p>
        <p style={{ margin: "2px 0 0" }}>Page {page}</p>
      </div>
    </footer>
  );
}

function SectionKicker({ children }) {
  return <p style={{ margin: 0, fontSize: 12, lineHeight: "15px", fontWeight: 700, color: ACCENT }}>{children}</p>;
}

function DocHeading({ children }) {
  return <h2 style={{ margin: 0, fontSize: 12, lineHeight: "18px", fontWeight: 800, color: ACCENT }}>{children}</h2>;
}

function DetailRow({ label, value, tall }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 6, marginTop: 4, fontSize: 12, lineHeight: tall ? "17px" : "16px" }}>
      <span style={{ fontWeight: 700 }}>{label} :</span>
      <span>{value}</span>
    </div>
  );
}

function MoneyLine({ label, value, strong }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 10px", fontSize: 12, lineHeight: "16px", fontWeight: strong ? 700 : 400 }}>
      <span>{label} :</span>
      <span>{formatMoneyCad(value)}</span>
    </div>
  );
}
