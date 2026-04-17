"use client";

import Link from "next/link";
import { SAMPLE_WO, COMPANY, fmt, fmtDate, computeTotals } from "../_sample";

const CATEGORY_ICON = {
  thermo: "fa-square",
  installation: "fa-screwdriver-wrench",
  ajustement: "fa-sliders",
  quincaillerie: "fa-key",
  vitre: "fa-window-maximize",
  default: "fa-tag",
};

// Guess category from item description (just for visual in preview)
function guessIcon(desc) {
  const d = desc.toLowerCase();
  if (d.includes("thermo") || d.includes("verre")) return CATEGORY_ICON.thermo;
  if (d.includes("installation") || d.includes("replacement")) return CATEGORY_ICON.installation;
  if (d.includes("ajust") || d.includes("barrure") || d.includes("poignee")) return CATEGORY_ICON.ajustement;
  if (d.includes("balai") || d.includes("roulette") || d.includes("manivelle") || d.includes("lock")) return CATEGORY_ICON.quincaillerie;
  return CATEGORY_ICON.default;
}

// 3 color schemes to rotate across sections
const UNIT_COLORS = [
  { bg: "from-red-500 to-rose-600", soft: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  { bg: "from-amber-500 to-orange-600", soft: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  { bg: "from-slate-700 to-slate-900", soft: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
];

export default function OptionCPreview() {
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
      <div className="bg-white mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden print:shadow-none"
        style={{ width: "8.5in", maxWidth: "100%", minHeight: "11in", fontFamily: "'Inter', system-ui, sans-serif" }}>

        {/* Hero gradient header */}
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #991b1b 0%, #b91c1c 40%, #dc2626 100%)" }}>
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}></div>

          <div className="relative px-10 pt-10 pb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">Vosthermos</p>
                <h1 className="text-4xl font-black text-white tracking-tight mt-1">Facture</h1>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                <p className="text-white/70 text-[9px] uppercase tracking-widest font-bold">No.</p>
                <p className="text-white text-2xl font-black tracking-wider">{wo.number}</p>
              </div>
            </div>

            {/* Client preview + date in hero */}
            <div className="grid grid-cols-[1fr_auto] gap-6 items-end">
              <div>
                <p className="text-white/50 text-[9px] uppercase tracking-[0.25em] font-bold mb-1">Pour</p>
                <p className="text-white text-xl font-bold">{wo.client.name}</p>
                <p className="text-white/80 text-sm">{wo.client.city}</p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-[9px] uppercase tracking-[0.25em] font-bold mb-1">Émise le</p>
                <p className="text-white text-base font-bold">{fmtDate(wo.date)}</p>
              </div>
            </div>
          </div>

          {/* Wave/curve separator */}
          <svg className="block w-full text-white" viewBox="0 0 1200 40" preserveAspectRatio="none" style={{ height: "20px" }}>
            <path d="M0,40 C300,0 900,0 1200,40 L1200,40 L0,40 Z" fill="currentColor"/>
          </svg>
        </div>

        <div className="px-10 pt-4 pb-6">
          {/* Info cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <i className="fas fa-user text-red-600 text-sm"></i>
                </div>
                <p className="text-[9px] uppercase tracking-[0.25em] font-bold text-neutral-500">Client</p>
              </div>
              <p className="font-bold text-neutral-900">{wo.client.name}</p>
              {wo.client.company && <p className="text-xs text-neutral-600 italic">{wo.client.company}</p>}
              <p className="text-xs text-neutral-600 mt-1.5">{wo.client.address}, {wo.client.city}</p>
              <p className="text-xs text-neutral-600">{wo.client.phone} · {wo.client.email}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <i className="fas fa-clock text-amber-600 text-sm"></i>
                </div>
                <p className="text-[9px] uppercase tracking-[0.25em] font-bold text-neutral-500">Intervention</p>
              </div>
              <p className="font-bold text-neutral-900">{wo.technician}</p>
              <p className="text-xs text-neutral-600 mt-1.5">{wo.arrival} → {wo.departure} · {wo.duration}</p>
              <p className="text-xs text-neutral-600">{fmtDate(wo.date)}</p>
            </div>
          </div>

          {/* Description */}
          {wo.description && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-transparent rounded-xl px-4 py-3 border-l-4 border-red-500">
              <p className="text-sm text-neutral-700 leading-relaxed">{wo.description}</p>
            </div>
          )}

          {/* Sections B2B — coloured cards */}
          <div className="space-y-3 mb-6">
            {wo.sections.map((sec, i) => {
              const colors = UNIT_COLORS[i % UNIT_COLORS.length];
              const subtot = sec.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
              return (
                <div key={sec.unitCode} className={`rounded-2xl overflow-hidden border ${colors.border} shadow-sm`}>
                  {/* Colored header */}
                  <div className={`bg-gradient-to-r ${colors.bg} text-white px-5 py-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <i className="fas fa-building text-white"></i>
                      </div>
                      <div>
                        <p className="text-white/70 text-[9px] uppercase tracking-[0.25em] font-bold">Unité</p>
                        <p className="text-lg font-black font-mono tracking-wider">{sec.unitCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-[9px] uppercase tracking-[0.25em] font-bold">Sous-total</p>
                      <p className="text-xl font-black">{fmt(subtot)}</p>
                    </div>
                  </div>
                  {/* Items */}
                  <div className={`${colors.soft} divide-y divide-white/60`}>
                    {sec.items.map((it, j) => (
                      <div key={j} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                        <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center shadow-sm">
                          <i className={`fas ${guessIcon(it.description)} text-xs ${colors.text}`}></i>
                        </div>
                        <span className="flex-1 text-neutral-800">{it.description}</span>
                        <span className="text-neutral-500 text-xs">×{it.qty}</span>
                        <span className="text-neutral-500 text-xs w-16 text-right">{fmt(it.unitPrice)}</span>
                        <span className="font-bold text-neutral-900 w-20 text-right">{fmt(it.qty * it.unitPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Labor card */}
          <div className="bg-slate-50 rounded-xl px-5 py-3 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                <i className="fas fa-wrench text-slate-600"></i>
              </div>
              <div>
                <p className="font-bold text-neutral-900 text-sm">Main d&apos;œuvre</p>
                <p className="text-xs text-neutral-600">{wo.laborHours}h × {wo.laborRate}$/h</p>
              </div>
            </div>
            <p className="font-black text-lg text-slate-900">{fmt(t.totalLabor)}</p>
          </div>

          {/* Totals — big visual */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl text-white p-6 shadow-lg">
            <div className="grid grid-cols-[1fr_auto] gap-8 items-center">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/60">Sous-total</span><span className="font-medium">{fmt(t.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-white/60">TPS 5%</span><span>{fmt(t.tps)}</span></div>
                <div className="flex justify-between"><span className="text-white/60">TVQ 9.975%</span><span>{fmt(t.tvq)}</span></div>
              </div>
              <div className="text-right pl-8 border-l border-white/20">
                <p className="text-white/60 text-[9px] uppercase tracking-[0.3em] font-bold mb-1">Total</p>
                <p className="text-[44px] leading-none font-black tracking-tight">{fmt(t.total)}</p>
                <p className="text-white/50 text-[10px] mt-2">Net 30 jours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 px-10 py-6">
          <div className="grid grid-cols-3 gap-6 text-[11px]">
            <div>
              <p className="font-bold text-neutral-800 mb-1"><i className="fas fa-map-marker-alt text-red-500 mr-1.5"></i>Adresse</p>
              <p className="text-neutral-600 leading-relaxed">{COMPANY.address}<br/>{COMPANY.city}, QC {COMPANY.postalCode}</p>
            </div>
            <div>
              <p className="font-bold text-neutral-800 mb-1"><i className="fas fa-phone text-red-500 mr-1.5"></i>Contact</p>
              <p className="text-neutral-600 leading-relaxed">{COMPANY.phone}<br/>{COMPANY.email}<br/>{COMPANY.web}</p>
            </div>
            <div>
              <p className="font-bold text-neutral-800 mb-1"><i className="fas fa-receipt text-red-500 mr-1.5"></i>Taxes</p>
              <p className="text-neutral-600 leading-relaxed">TPS · {COMPANY.tps}<br/>TVQ · {COMPANY.tvq}</p>
            </div>
          </div>
          <p className="text-center text-neutral-500 text-xs mt-5 pt-4 border-t border-neutral-200">
            <span className="font-bold text-[#b91c1c]">VOSTHERMOS</span> — Spécialiste thermos & vitrerie · Merci de votre confiance
          </p>
        </div>
      </div>
    </div>
  );
}
