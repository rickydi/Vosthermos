"use client";

import Link from "next/link";
import { SAMPLE_WO, COMPANY, fmt, fmtDate, computeTotals } from "../_sample";

export default function OptionA2Preview() {
  const wo = SAMPLE_WO;
  const t = computeTotals(wo);

  return (
    <div className="bg-neutral-200 min-h-screen py-6 print:py-0 print:bg-white">
      <div className="max-w-5xl mx-auto px-4 mb-4 flex items-center justify-between print:hidden">
        <Link href="/admin/bons/preview" className="text-neutral-600 text-sm hover:text-neutral-900 font-medium">
          <i className="fas fa-arrow-left mr-2"></i>Retour aux options
        </Link>
        <button onClick={() => window.print()} className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium">
          <i className="fas fa-print mr-2"></i>Imprimer
        </button>
      </div>

      <div className="bg-white mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.15)] print:shadow-none"
        style={{ width: "8.5in", maxWidth: "100%", minHeight: "11in", fontFamily: "'Inter', system-ui, sans-serif" }}>

        {/* Header — no accent line, just typography hierarchy */}
        <div className="px-14 pt-12 pb-8 grid grid-cols-[1fr_auto] gap-8 items-start">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/Vos-Thermos-Logo.png" alt="Vosthermos" className="h-14 w-auto mb-3" />
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              {COMPANY.legal} · {COMPANY.address}<br/>
              {COMPANY.city}, QC {COMPANY.postalCode} · {COMPANY.phone}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">Facture</p>
            <p className="text-[36px] leading-none font-black text-neutral-900 mt-2 tracking-tight">{wo.number}</p>
            <p className="text-neutral-500 text-sm mt-2">{fmtDate(wo.date)}</p>
          </div>
        </div>

        {/* Subtle separator — single hairline */}
        <div className="border-t border-neutral-200 mx-14"></div>

        {/* Bill to + Details */}
        <div className="px-14 py-8 grid grid-cols-2 gap-10">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400 mb-3">Facturer à</p>
            <p className="font-bold text-lg text-neutral-900 leading-tight">{wo.client.name}</p>
            {wo.client.company && <p className="text-sm text-neutral-600 mt-0.5">{wo.client.company}</p>}
            <p className="text-sm text-neutral-600 mt-2">
              {wo.client.address}<br/>
              {wo.client.city}, QC {wo.client.postalCode}
            </p>
            <p className="text-sm text-neutral-600 mt-2">
              {wo.client.phone}<br/>
              {wo.client.email}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400 mb-3">Détails</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-neutral-600"><span>Technicien</span><span className="text-neutral-900 font-medium">{wo.technician}</span></div>
              <div className="flex justify-between text-neutral-600"><span>Date</span><span className="text-neutral-900 font-medium">{fmtDate(wo.date)}</span></div>
              <div className="flex justify-between text-neutral-600"><span>Horaire</span><span className="text-neutral-900 font-medium">{wo.arrival} – {wo.departure}</span></div>
              <div className="flex justify-between text-neutral-600"><span>Durée</span><span className="text-neutral-900 font-medium">{wo.duration}</span></div>
            </div>
          </div>
        </div>

        {wo.description && (
          <div className="px-14 pb-6">
            <p className="text-sm text-neutral-700 italic leading-relaxed">{wo.description}</p>
          </div>
        )}

        {/* Sections B2B — flat style, text-based code headers */}
        <div className="px-14 mb-8">
          {wo.sections.map((sec, i) => {
            const subtot = sec.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
            return (
              <div key={i} className="mb-5">
                <div className="flex items-baseline justify-between pb-2 border-b-2 border-neutral-900">
                  <div className="flex items-baseline gap-4">
                    <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400">Unité</span>
                    <span className="font-black text-lg text-neutral-900 tracking-wider font-mono">{sec.unitCode}</span>
                  </div>
                  <span className="font-bold text-neutral-900 text-sm">{fmt(subtot)}</span>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {sec.items.map((it, j) => (
                      <tr key={j} className="border-b border-neutral-100">
                        <td className="py-2 text-neutral-800">{it.description}</td>
                        <td className="py-2 text-right text-neutral-500 w-12">{it.qty}</td>
                        <td className="py-2 text-right text-neutral-500 w-24">{fmt(it.unitPrice)}</td>
                        <td className="py-2 text-right font-semibold text-neutral-900 w-28">{fmt(it.qty * it.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {/* Totals — minimalist black, no red */}
        <div className="px-14 pb-8 flex justify-end">
          <div className="w-80">
            <div className="space-y-1.5 text-sm pb-3 border-b border-neutral-300">
              <div className="flex justify-between text-neutral-600">
                <span>Pièces & services</span>
                <span className="text-neutral-900">{fmt(t.totalPieces)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Main d&apos;œuvre ({wo.laborHours}h)</span>
                <span className="text-neutral-900">{fmt(t.totalLabor)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 pt-2 border-t border-neutral-100">
                <span>Sous-total</span>
                <span className="text-neutral-900 font-medium">{fmt(t.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>TPS (5%)</span><span>{fmt(t.tps)}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>TVQ (9.975%)</span><span>{fmt(t.tvq)}</span>
              </div>
            </div>
            <div className="pt-3 flex items-baseline justify-between border-t-2 border-neutral-900">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-900">Total</span>
              <span className="text-xl font-black text-neutral-900 tracking-tight">{fmt(t.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-14 py-6 border-t border-neutral-200">
          <div className="grid grid-cols-2 gap-6 text-[11px]">
            <div>
              <p className="font-bold text-neutral-700 uppercase tracking-wider text-[9px] mb-1.5">Conditions de paiement</p>
              <p className="text-neutral-600 leading-relaxed">Net 30 jours · Intérêt 1,5%/mois sur solde en retard · Paiement par chèque, virement Interac ou comptant.</p>
            </div>
            <div>
              <p className="font-bold text-neutral-700 uppercase tracking-wider text-[9px] mb-1.5">Taxes</p>
              <p className="text-neutral-600 leading-relaxed">TPS: {COMPANY.tps}<br/>TVQ: {COMPANY.tvq}</p>
            </div>
          </div>
          <p className="text-center text-neutral-500 text-xs mt-6 pt-4 border-t border-neutral-100">
            Merci de faire affaire avec <span className="font-bold text-neutral-900">Vosthermos</span>
          </p>
        </div>
      </div>
    </div>
  );
}
