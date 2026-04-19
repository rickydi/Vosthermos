"use client";

// Design A3 — Receipt Premium, validated via print emulation.
// Takes a real WorkOrder (from /api/admin/work-orders/[id]) and renders
// a WYSIWYG 8.5x11 invoice sheet that prints identical to screen.

const COMPANY_DEFAULTS = {
  legal: "9999-9999 Quebec inc.",
  address: "330 Ch. St-Francois-Xavier, Local 104",
  city: "Saint-Francois-Xavier-de-Brompton",
  postalCode: "J5B 1C9",
  phone: "514-825-8411",
  email: "info@vosthermos.com",
  web: "vosthermos.com",
  tps: "XXXXX XXXX RT0001",
  tvq: "XXXXXXXXXX TQ0001",
};

function fmt(n) { return `${Number(n || 0).toFixed(2)} $`; }
function fmtDate(d) {
  return new Date(d).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" });
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

// Capacities for pagination (tuned for 8.5x11 with 0.5in padding)
const FIRST_CAPACITY = 5;
const MIDDLE_CAPACITY = 7;
const LAST_CAPACITY = 6;
const SMALL_INVOICE_THRESHOLD = 8;

function paginate(units) {
  if (units.length <= SMALL_INVOICE_THRESHOLD) {
    return [{ units, isFirst: true, isLast: true, index: 0 }];
  }
  const pages = [];
  const queue = [...units];
  pages.push({ units: queue.splice(0, FIRST_CAPACITY), isFirst: true, isLast: false });
  while (queue.length > LAST_CAPACITY) {
    const n = Math.min(MIDDLE_CAPACITY, queue.length - LAST_CAPACITY);
    if (n <= 0) break;
    pages.push({ units: queue.splice(0, n), isFirst: false, isLast: false });
  }
  pages.push({ units: queue, isFirst: false, isLast: true });
  pages.forEach((p, i) => (p.index = i));
  return pages;
}

// Normalize WorkOrder into units (sections for B2B, single virtual "unit"
// with all items for particulier)
function normalizeUnits(wo) {
  const sections = Array.isArray(wo.sections) ? wo.sections : [];
  const flatItems = Array.isArray(wo.items) ? wo.items : [];

  if (sections.length > 0) {
    return sections.map((s) => ({
      unitCode: s.unitCode,
      items: (s.items || []).map((it) => ({
        description: it.description,
        qty: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
      })),
    }));
  }
  // Particulier: single virtual "unit" with all flat items
  if (flatItems.length === 0) return [];
  return [{
    unitCode: null, // no code = particulier rendering
    items: flatItems.map((it) => ({
      description: it.description,
      qty: Number(it.quantity),
      unitPrice: Number(it.unitPrice),
    })),
  }];
}

export default function InvoiceSheet({ wo, company }) {
  const co = { ...COMPANY_DEFAULTS, ...(company || {}) };
  const units = normalizeUnits(wo);
  const pages = paginate(units);

  const arrival = fmtHM(wo.arrivalAt);
  const departure = fmtHM(wo.departureAt);
  const duration = fmtDuration(wo.durationMinutes);
  const laborHours = (() => {
    const rate = 85; // fallback; totalLabor is authoritative
    const tl = Number(wo.totalLabor) || 0;
    return rate > 0 ? Math.round((tl / rate) * 100) / 100 : 0;
  })();

  return (
    <div className="bg-neutral-200 py-6 print:py-0 print:bg-white">
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

      <div className="invoice-stack flex flex-col items-center gap-6 print:gap-0">
        {pages.map((page) => (
          <Sheet key={page.index} page={page} totalPages={pages.length} wo={wo} co={co}
            meta={{ arrival, departure, duration, laborHours }} />
        ))}
      </div>
    </div>
  );
}

function Sheet({ page, totalPages, wo, co, meta }) {
  return (
    <div className="invoice-page bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] relative"
      style={{ width: "8.5in", height: "11in", maxWidth: "100%", boxSizing: "border-box",
        overflow: "hidden", fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex", flexDirection: "column" }}>
      <div style={{ height: "3px", background: "#b91c1c", flexShrink: 0 }}></div>
      <div style={{ height: "1px", background: "rgba(185, 28, 28, 0.3)", flexShrink: 0 }}></div>

      <div style={{ padding: "0.5in", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        {page.isFirst ? <FullHeader wo={wo} co={co} meta={meta} /> : <CompactHeader wo={wo} pageNum={page.index + 1} totalPages={totalPages} />}

        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px", flex: 1, minHeight: 0 }}>
          {page.units.map((u, i) => <UnitCard key={i} unit={u} />)}
        </div>

        {page.isLast && <Totals wo={wo} meta={meta} />}
      </div>

      {page.isLast && <Footer co={co} />}

      <div style={{
        flexShrink: 0, padding: "6px 0.5in", borderTop: "1px solid #f3f4f6",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: "9px", color: "#9ca3af",
      }}>
        <span>{wo.number}{wo.client?.name ? ` · ${wo.client.name}` : ""}</span>
        <span style={{ fontFamily: "monospace" }}>Page {page.index + 1} / {totalPages}</span>
      </div>
    </div>
  );
}

function FullHeader({ wo, co, meta }) {
  const intervAddr = wo.interventionAddress || wo.client?.address;
  const intervCity = wo.interventionCity || wo.client?.city;
  const intervPostal = wo.interventionPostalCode || wo.client?.postalCode;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "24px", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/Vos-Thermos-Logo.png" alt="Vosthermos" style={{ height: "80px", width: "auto", flexShrink: 0 }} />
          <p style={{ fontSize: "10.5px", lineHeight: 1.45, color: "#6b7280" }}>
            {co.legal}<br />{co.address}<br />{co.city}, QC {co.postalCode}<br />
            {co.phone} · {co.email}<br />{co.web}
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
          <p style={{ fontWeight: 700, fontSize: "16px", color: "#111827", lineHeight: 1.2 }}>{wo.client?.name || "—"}</p>
          {wo.client?.company && <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{wo.client.company}</p>}
          {intervAddr && (
            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px", lineHeight: 1.4 }}>
              {intervAddr}<br />
              {[intervCity, intervPostal && `QC ${intervPostal}`].filter(Boolean).join(", ")}
            </p>
          )}
          <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px", lineHeight: 1.4 }}>
            {wo.client?.phone}<br />
            {wo.client?.email}
          </p>
        </div>
        <div>
          <p style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: "#9ca3af", marginBottom: "8px" }}>Détails</p>
          <div style={{ fontSize: "12px" }}>
            {wo.technician?.name && <Row label="Technicien" value={wo.technician.name} />}
            <Row label="Date" value={fmtDate(wo.date)} />
            {(meta.arrival || meta.departure) && <Row label="Horaire" value={`${meta.arrival || "—"} – ${meta.departure || "—"}`} />}
            {meta.duration && <Row label="Durée" value={meta.duration} />}
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

function Row({ label, value }) {
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
          <p style={{ fontWeight: 700, color: "#111827", fontSize: "13px" }}>{wo.client?.name}</p>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontSize: "18px", fontWeight: 900, color: "#111827" }}>{wo.number}</p>
        <p style={{ fontSize: "10px", color: "#6b7280" }}>{fmtDate(wo.date)}</p>
      </div>
    </div>
  );
}

function UnitCard({ unit }) {
  const subtot = unit.items.reduce((s, it) => s + Number(it.qty) * Number(it.unitPrice), 0);
  const hasCode = !!unit.unitCode;
  return (
    <div style={{ border: "2px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
      {hasCode && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 16px", borderBottom: "1px solid #e5e7eb", backgroundColor: "white" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ display: "inline-block", padding: "2px 8px", border: "2px solid #b91c1c", color: "#b91c1c", fontSize: "11px", fontWeight: 900, letterSpacing: "0.08em", borderRadius: "4px", fontFamily: "monospace", background: "white" }}>{unit.unitCode}</span>
            <span style={{ fontSize: "11px", color: "#6b7280" }}>Unité · {unit.items.length} item{unit.items.length > 1 ? "s" : ""}</span>
          </div>
          <span style={{ fontWeight: 700, color: "#111827", fontSize: "12px" }}>{fmt(subtot)}</span>
        </div>
      )}
      <table style={{ width: "100%", fontSize: "11.5px", borderCollapse: "collapse" }}>
        <tbody>
          {unit.items.map((it, j) => {
            const isDiscount = Number(it.unitPrice) < 0;
            const color = isDiscount ? "#059669" : "#1f2937";
            return (
              <tr key={j} style={{ borderBottom: j < unit.items.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <td style={{ padding: "6px 16px", color }}>{it.description}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", color: "#6b7280", width: "40px" }}>{it.qty}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", color: "#6b7280", width: "80px" }}>{fmt(it.unitPrice)}</td>
                <td style={{ padding: "6px 16px", textAlign: "right", fontWeight: 600, color, width: "96px" }}>{fmt(it.qty * it.unitPrice)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Totals({ wo, meta }) {
  return (
    <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
      <div style={{ width: "290px", border: "2px dashed #d1d5db", borderRadius: "8px", padding: "12px", background: "rgba(249, 250, 251, 0.4)" }}>
        <div style={{ paddingBottom: "8px", borderBottom: "1px dashed #d1d5db" }}>
          <TotalRow label="Pièces & services" value={fmt(wo.totalPieces)} />
          <TotalRow label={`Main d'œuvre (${meta.laborHours}h)`} value={fmt(wo.totalLabor)} />
          <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px dotted #d1d5db" }}>
            <TotalRow label="Sous-total" value={fmt(wo.subtotal)} strong />
          </div>
          <TotalRow label="TPS (5%)" value={fmt(wo.tps)} small />
          <TotalRow label="TVQ (9.975%)" value={fmt(wo.tvq)} small />
        </div>
        <div style={{ paddingTop: "8px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: "#b91c1c" }}>Montant à payer</p>
            <p style={{ fontSize: "9px", color: "#9ca3af", marginTop: "2px" }}>Net 30 jours</p>
          </div>
          <span style={{ fontSize: "18px", fontWeight: 900, color: "#b91c1c", letterSpacing: "-0.02em" }}>{fmt(wo.total)}</span>
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

function Footer({ co }) {
  return (
    <div style={{ flexShrink: 0, padding: "12px 0.5in", borderTop: "1px solid #e5e7eb", background: "#f9fafb", fontSize: "10px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <p style={{ fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "9px", marginBottom: "4px" }}>Conditions</p>
          <p style={{ color: "#6b7280", lineHeight: 1.4 }}>Net 30 jours · Intérêt 1,5%/mois sur solde en retard · Chèque, virement Interac ou comptant.</p>
        </div>
        <div>
          <p style={{ fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "9px", marginBottom: "4px" }}>Taxes</p>
          <p style={{ color: "#6b7280", lineHeight: 1.4 }}>TPS: {co.tps}<br />TVQ: {co.tvq}</p>
        </div>
      </div>
    </div>
  );
}
