"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const total = 3;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  function goTo(i) {
    setCurrent(i);
  }

  const slideClass = (i) =>
    `absolute inset-0 transition-opacity duration-1000 ease-in-out ${
      i === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
    }`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: "6/5" }}>
      {/* Slide 0 — Technicien */}
      <div className={slideClass(0)}>
        <Image
          src="/images/hero-technicien.jpg"
          alt="Technicien Vosthermos installant une vitre thermos"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Slide 1 — Boutique en ligne */}
      <div className={slideClass(1)}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#162a45]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative h-full flex flex-col items-center justify-center px-8 text-center">
          <div className="flex gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.08] border border-white/[0.08] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e30718" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/[0.08] border border-white/[0.08] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e30718" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/[0.08] border border-white/[0.08] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e30718" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </div>
          <span className="text-[var(--color-red)] text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Boutique en ligne
          </span>
          <p className="text-white text-2xl font-extrabold leading-tight mb-2">
            740+ pieces en inventaire
          </p>
          <p className="text-white/50 text-sm mb-6 max-w-[280px]">
            Trouvez la piece exacte pour votre porte ou fenetre. Paiement securise et livraison rapide.
          </p>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-[var(--color-red)] hover:bg-[var(--color-red-dark)] text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all hover:scale-105 shadow-lg shadow-red-900/30"
          >
            Voir la boutique
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Slide 2 — Garantie */}
      <div className={slideClass(2)}>
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-teal-dark)] via-[var(--color-teal)] to-[var(--color-teal-dark)]" />
        <div className="relative h-full flex flex-col items-center justify-center px-8 text-center">
          <div className="relative mb-4">
            <span className="text-7xl font-black text-white/[0.06] absolute -top-6 left-1/2 -translate-x-1/2 select-none">10</span>
            <div className="relative w-20 h-20 rounded-full bg-[var(--color-red)] flex items-center justify-center shadow-xl shadow-red-900/40">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
          </div>
          <span className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-2">
            Tranquillite d&apos;esprit
          </span>
          <p className="text-white text-2xl font-extrabold leading-tight mb-2">
            service garanti
          </p>
          <p className="text-white/50 text-sm mb-5 max-w-[280px]">
            Tous nos remplacements de vitres thermos sont garantis. Service professionnel et fiable.
          </p>
          <div className="flex gap-6">
            <div className="text-center">
              <strong className="block text-xl font-extrabold text-white">15+</strong>
              <span className="text-[10px] text-white/40 uppercase tracking-wider">ans</span>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <strong className="block text-xl font-extrabold text-white">100km</strong>
              <span className="text-[10px] text-white/40 uppercase tracking-wider">rayon</span>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <strong className="block text-xl font-extrabold text-white">5&#9733;</strong>
              <span className="text-[10px] text-white/40 uppercase tracking-wider">avis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === current ? "bg-white w-8" : "bg-white/30 w-1.5 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
