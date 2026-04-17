"use client";

import Link from "next/link";
import { SAMPLE_WO, COMPANY, fmt, fmtDate, computeTotals } from "../_sample";

export default function OptionBPreview() {
  const wo = SAMPLE_WO;
  const t = computeTotals(wo);

  return (
    <div className="bg-neutral-200 min-h-screen py-6 print:py-0 print:bg-white">
      <div className="max-w-5xl mx-auto px-4 mb-4 flex items-center justify-between print:hidden">
        <Link href="/admin/bons/preview" className="text-neutral-600 text-sm hover:text-neutral-900 font-medium">
          <i className="fas fa-arrow-left mr-2"></i>3 options
        </Link>
        <button onClick={() => window.print()} className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium">
          <i className="fas fa-print mr-2"></i>Imprimer
        </button>
      </div>

      {/* Invoice sheet */}
      <div className="bg-white mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.15)] print:shadow-none relative"
        style={{ width: "8.5in", maxWidth: "100%", minHeight: "11in", fontFamily: "'Georgia', 'Times New Roman', serif" }}>

        {/* Red vertical band with invoice number */}
        <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-b from-[#991b1b] to-[#7f1d1d] text-white flex flex-col items-center justify-between py-10 print:shadow-none">
          <div className="writing-mode-vertical text-xs font-bold uppercase tracking-[0.4em] [writing-mode:vertical-rl] rotate-180 opacity-80">
            Facture
          </div>
          <div className="[writing-mode:vertical-rl] rotate-180 font-black text-2xl tracking-wider">
            {wo.number}
          </div>
          <div className="[writing-mode:vertical-rl] rotate-180 text-[10px] opacity-80">
            {fmtDate(wo.date)}
          </div>
        </div>

        {/* Content shifted right to clear the vertical band */}
        <div className="pl-24 pr-10 py-10">
          {/* Header — company name + NAP */}
          <div className="border-b-2 border-neutral-900 pb-5 mb-8 grid grid-cols-2 gap-6">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 tracking-tight leading-none">Vosthermos</h1>
              <p className="text-xs text-neutral-500 italic mt-1">{COMPANY.legal}</p>
              <div className="mt-3 text-[11px] text-neutral-700 space-y-0.5">
                <p>{COMPANY.address}</p>
                <p>{COMPANY.city}, QC {COMPANY.postalCode}</p>
                <p>Tél · {COMPANY.phone}</p>
                <p>{COMPANY.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">No. Taxes</p>
              <p className="text-xs text-neutral-700 mt-1">TPS · {COMPANY.tps}</p>
              <p className="text-xs text-neutral-700">TVQ · {COMPANY.tvq}</p>
              <div className="mt-4 pt-3 border-t border-neutral-300">
                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Émise le</p>
                <p className="text-base font-bold text-neutral-900 mt-1">{fmtDate(wo.date)}</p>
              </div>
            </div>
          </div>

          {/* Bill to — classic framed box */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="border border-neutral-300 rounded-sm">
              <div className="bg-neutral-900 text-white text-[10px] uppercase tracking-[0.3em] font-bold px-4 py-1.5">
                Facturer à
              </div>
              <div className="p-4">
                <p className="font-bold text-base text-neutral-900">{wo.client.name}</p>
                {wo.client.company && <p className="text-sm text-neutral-700 italic">{wo.client.company}</p>}
                <p className="text-sm text-neutral-700 mt-2">{wo.client.address}</p>
                <p className="text-sm text-neutral-700">{wo.client.city}, QC {wo.client.postalCode}</p>
                <p className="text-sm text-neutral-700 mt-2">Tél · {wo.client.phone}</p>
                <p className="text-sm text-neutral-700">{wo.client.email}</p>
              </div>
            </div>
            <div className="border border-neutral-300 rounded-sm">
              <div className="bg-neutral-900 text-white text-[10px] uppercase tracking-[0.3em] font-bold px-4 py-1.5">
                Service
              </div>
              <div className="p-4 text-sm space-y-1.5">
                <div className="flex justify-between"><span className="text-neutral-500">Technicien</span><span className="font-medium text-neutral-900">{wo.technician}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Horaire</span><span className="font-medium text-neutral-900">{wo.arrival} – {wo.departure}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Durée</span><span className="font-medium text-neutral-900">{wo.duration}</span></div>
                <div className="flex justify-between pt-2 mt-2 border-t border-neutral-200"><span className="text-neutral-500">Conditions</span><span className="font-medium text-neutral-900">Net 30 jours</span></div>
              </div>
            </div>
          </div>

          {/* Description */}
          {wo.description && (
            <div className="mb-6 text-sm italic text-neutral-700 text-center border-y border-neutral-200 py-3">
              “{wo.description}”
            </div>
          )}

          {/* Items table — classic black/white */}
          <table className="w-full text-sm mb-6 border-collapse">
            <thead>
              <tr className="bg-neutral-900 text-white">
                <th className="text-left px-3 py-2 text-[10px] uppercase tracking-[0.2em] font-bold">Description</th>
                <th className="text-right px-3 py-2 text-[10px] uppercase tracking-[0.2em] font-bold w-16">Qté</th>
                <th className="text-right px-3 py-2 text-[10px] uppercase tracking-[0.2em] font-bold w-24">Prix unit.</th>
                <th className="text-right px-3 py-2 text-[10px] uppercase tracking-[0.2em] font-bold w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {wo.sections.map((sec) => {
                const subtot = sec.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
                return [
                  <tr key={`h-${sec.unitCode}`} className="border-b-2 border-neutral-900 bg-neutral-100">
                    <td colSpan={3} className="px-3 py-2 font-bold text-neutral-900 text-xs uppercase tracking-wider">
                      <i className="fas fa-building mr-2 opacity-60"></i>Unité {sec.unitCode}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-neutral-900 text-xs">{fmt(subtot)}</td>
                  </tr>,
                  ...sec.items.map((it, j) => (
                    <tr key={`${sec.unitCode}-${j}`} className="border-b border-neutral-200">
                      <td className="px-3 py-2 text-neutral-900">{it.description}</td>
                      <td className="px-3 py-2 text-right text-neutral-700">{it.qty}</td>
                      <td className="px-3 py-2 text-right text-neutral-700">{fmt(it.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-medium text-neutral-900">{fmt(it.qty * it.unitPrice)}</td>
                    </tr>
                  )),
                ];
              })}
            </tbody>
          </table>

          {/* Totals — framed receipt */}
          <div className="flex justify-end mb-8">
            <div className="w-80 border-2 border-neutral-900">
              <div className="px-4 py-2 bg-neutral-900 text-white text-[10px] uppercase tracking-[0.3em] font-bold">
                Sommaire
              </div>
              <div className="p-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-neutral-600">Pièces & services</span><span className="text-neutral-900 font-medium">{fmt(t.totalPieces)}</span></div>
                <div className="flex justify-between"><span className="text-neutral-600">Main d&apos;œuvre</span><span className="text-neutral-900 font-medium">{fmt(t.totalLabor)}</span></div>
                <div className="flex justify-between pt-2 border-t border-neutral-300"><span className="text-neutral-600 font-medium">Sous-total</span><span className="text-neutral-900 font-medium">{fmt(t.subtotal)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-neutral-500">TPS (5%)</span><span className="text-neutral-700">{fmt(t.tps)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-neutral-500">TVQ (9.975%)</span><span className="text-neutral-700">{fmt(t.tvq)}</span></div>
              </div>
              <div className="px-4 py-3 bg-[#991b1b] text-white flex justify-between items-baseline">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-80">Total</span>
                <span className="text-xl font-bold">{fmt(t.total)}</span>
              </div>
            </div>
          </div>

          {/* Signature zone */}
          <div className="grid grid-cols-2 gap-10 mb-10 mt-14">
            <div>
              <div className="border-b border-neutral-400 h-10"></div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 mt-1">Signature du client</p>
            </div>
            <div>
              <div className="border-b border-neutral-400 h-10"></div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 mt-1">Date</p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-neutral-900 pt-4 text-[10px] text-neutral-600 leading-relaxed">
            <p className="italic text-center mb-2">
              Net 30 jours. Intérêt de 1,5% par mois (18% annuel) sur tout solde impayé après 30 jours.
            </p>
            <p className="text-center font-bold text-neutral-900 mt-3">
              {COMPANY.web} · {COMPANY.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
