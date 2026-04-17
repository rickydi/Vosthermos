"use client";

import Link from "next/link";
import { COMPANY, fmt, fmtDate, computeTotals } from "../_sample";

export default function InvoiceA3({ wo, backHref = "/admin/bons/preview", label = "Retour aux options" }) {
  const t = computeTotals(wo);

  return (
    <div className="bg-neutral-300 min-h-screen py-6 print:py-0 print:bg-white">
      <style jsx global>{`
        @media print {
          @page {
            size: letter;
            margin: 0.5in;
          }
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .invoice-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
            min-height: 0 !important;
          }
          .invoice-section,
          .invoice-totals,
          .invoice-footer,
          .invoice-header,
          .invoice-client {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .invoice-totals {
            page-break-before: auto;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:pt-0 { padding-top: 0 !important; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 mb-4 flex items-center justify-between print:hidden">
        <Link href={backHref} className="text-neutral-700 text-sm hover:text-neutral-900 font-medium">
          <i className="fas fa-arrow-left mr-2"></i>{label}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-600 font-medium">
            {wo.sections?.length || 0} unité{(wo.sections?.length || 0) > 1 ? "s" : ""} · Format 8,5 × 11 po
          </span>
          <button onClick={() => window.print()} className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium">
            <i className="fas fa-print mr-2"></i>Imprimer
          </button>
        </div>
      </div>

      {/* Single continuous sheet — browser paginates at print time */}
      <div
        className="invoice-sheet bg-white mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.18)] print:shadow-none"
        style={{
          width: "8.5in",
          maxWidth: "100%",
          minHeight: "11in",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* Top accent bars */}
        <div className="h-0.5 bg-[#b91c1c]"></div>
        <div className="h-[1px] bg-[#b91c1c]/30"></div>

        {/* ─── HEADER (first page only) ─────────────────────────── */}
        <div className="invoice-header px-10 pt-8 pb-6 grid grid-cols-[1fr_auto] gap-6 items-start">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/Vos-Thermos-Logo.png" alt="Vosthermos" className="h-20 w-auto shrink-0" />
            <p className="text-neutral-500 text-[10.5px] leading-snug">
              {COMPANY.legal}<br />
              {COMPANY.address}<br />
              {COMPANY.city}, QC {COMPANY.postalCode}<br />
              {COMPANY.phone} · {COMPANY.email}<br />
              {COMPANY.web}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">Facture</p>
            <p className="text-[36px] leading-none font-black text-neutral-900 mt-1.5 tracking-tight">{wo.number}</p>
            <p className="text-neutral-500 text-xs mt-2">{fmtDate(wo.date)}</p>
          </div>
        </div>

        <div className="border-t border-neutral-200 mx-10"></div>

        {/* ─── CLIENT + DETAILS ──────────────────────────────────── */}
        <div className="invoice-client px-10 py-5 grid grid-cols-2 gap-8">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400 mb-2">Facturer à</p>
            <p className="font-bold text-base text-neutral-900 leading-tight">{wo.client.name}</p>
            {wo.client.company && <p className="text-xs text-neutral-600 mt-0.5">{wo.client.company}</p>}
            <p className="text-xs text-neutral-600 mt-1.5">
              {wo.client.address}<br />
              {wo.client.city}, QC {wo.client.postalCode}
            </p>
            <p className="text-xs text-neutral-600 mt-1.5">
              {wo.client.phone}<br />
              {wo.client.email}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400 mb-2">Détails</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-neutral-600"><span>Technicien</span><span className="text-neutral-900 font-medium">{wo.technician}</span></div>
              <div className="flex justify-between text-neutral-600"><span>Date</span><span className="text-neutral-900 font-medium">{fmtDate(wo.date)}</span></div>
              <div className="flex justify-between text-neutral-600"><span>Horaire</span><span className="text-neutral-900 font-medium">{wo.arrival} – {wo.departure}</span></div>
              <div className="flex justify-between text-neutral-600"><span>Durée</span><span className="text-neutral-900 font-medium">{wo.duration}</span></div>
            </div>
          </div>
        </div>

        {wo.description && (
          <div className="invoice-client px-10 pb-3">
            <div className="border-l-2 border-[#b91c1c] pl-3 py-0.5">
              <p className="text-xs text-neutral-700 italic leading-snug">{wo.description}</p>
            </div>
          </div>
        )}

        {/* ─── SECTIONS B2B ──────────────────────────────────────── */}
        <div className="px-10 pb-4 space-y-2.5">
          {wo.sections?.map((sec, i) => {
            const subtot = sec.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
            return (
              <div key={i} className="invoice-section border-2 border-neutral-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-neutral-200">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-block px-2 py-0.5 border-2 border-[#b91c1c] text-[#b91c1c] text-[11px] font-black tracking-wider rounded font-mono bg-white">{sec.unitCode}</span>
                    <span className="text-[11px] text-neutral-500">Unité · {sec.items.length} item{sec.items.length > 1 ? "s" : ""}</span>
                  </div>
                  <span className="font-bold text-neutral-900 text-xs">{fmt(subtot)}</span>
                </div>
                <table className="w-full text-xs">
                  <tbody>
                    {sec.items.map((it, j) => (
                      <tr key={j} className="border-b border-neutral-100 last:border-b-0">
                        <td className="px-4 py-1.5 text-neutral-800">{it.description}</td>
                        <td className="px-2 py-1.5 text-right text-neutral-500 w-10">{it.qty}</td>
                        <td className="px-2 py-1.5 text-right text-neutral-500 w-20">{fmt(it.unitPrice)}</td>
                        <td className="px-4 py-1.5 text-right font-semibold text-neutral-900 w-24">{fmt(it.qty * it.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {/* ─── TOTALS ────────────────────────────────────────────── */}
        <div className="invoice-totals px-10 pb-4 flex justify-end">
          <div className="w-72 border-2 border-dashed border-neutral-300 rounded-lg p-3 bg-neutral-50/40">
            <div className="space-y-1 text-xs pb-2 border-b border-dashed border-neutral-300">
              <div className="flex justify-between text-neutral-600">
                <span>Pièces & services</span>
                <span className="text-neutral-900">{fmt(t.totalPieces)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Main d&apos;œuvre ({wo.laborHours}h)</span>
                <span className="text-neutral-900">{fmt(t.totalLabor)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 pt-1.5 border-t border-dotted border-neutral-300">
                <span>Sous-total</span>
                <span className="text-neutral-900 font-medium">{fmt(t.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-neutral-500">
                <span>TPS (5%)</span><span>{fmt(t.tps)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-neutral-500">
                <span>TVQ (9.975%)</span><span>{fmt(t.tvq)}</span>
              </div>
            </div>
            <div className="pt-2 flex items-baseline justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#b91c1c]">Montant à payer</p>
                <p className="text-[9px] text-neutral-400 mt-0.5">Net 30 jours</p>
              </div>
              <span className="text-lg font-black text-[#b91c1c] tracking-tight">{fmt(t.total)}</span>
            </div>
          </div>
        </div>

        {/* ─── FOOTER ────────────────────────────────────────────── */}
        <div className="invoice-footer px-10 py-4 border-t border-neutral-200 bg-neutral-50">
          <div className="grid grid-cols-2 gap-5 text-[10px]">
            <div>
              <p className="font-bold text-neutral-700 uppercase tracking-wider text-[9px] mb-1">Conditions de paiement</p>
              <p className="text-neutral-600 leading-snug">Net 30 jours · Intérêt 1,5%/mois sur solde en retard · Chèque, virement Interac ou comptant.</p>
            </div>
            <div>
              <p className="font-bold text-neutral-700 uppercase tracking-wider text-[9px] mb-1">Taxes</p>
              <p className="text-neutral-600 leading-snug">TPS: {COMPANY.tps}<br />TVQ: {COMPANY.tvq}</p>
            </div>
          </div>
          <p className="text-center text-neutral-500 text-[10px] mt-3 pt-2 border-t border-neutral-200">
            Merci de faire affaire avec <span className="font-bold text-neutral-900">Vosthermos</span>
          </p>
        </div>
      </div>
    </div>
  );
}
