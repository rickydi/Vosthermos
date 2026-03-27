"use client";

import { useState } from "react";
import Image from "next/image";

const items = [
  { src: "/images/quincaillerie/reparation-1.jpg", alt: "Remplacement quincaillerie", cat: "quincaillerie" },
  { src: "/images/quincaillerie/entretien-1.jpg", alt: "Entretien quincaillerie", cat: "quincaillerie" },
  { src: "/images/quincaillerie/detail-1.jpg", alt: "Detail quincaillerie", cat: "quincaillerie" },
  { src: "/images/vitre-thermos/reparation-1.jpg", alt: "Remplacement vitre thermos", cat: "thermos" },
  { src: "/images/vitre-thermos/entretien-1.jpg", alt: "Entretien vitre thermos", cat: "thermos" },
  { src: "/images/vitre-thermos/detail-1.jpg", alt: "Detail vitre thermos", cat: "thermos" },
  { src: "/images/portes-bois/reparation-1.jpg", alt: "Reparation porte en bois", cat: "portes" },
  { src: "/images/portes-bois/entretien-1.jpg", alt: "Entretien porte bois", cat: "portes" },
  { src: "/images/portes-bois/detail-1.jpg", alt: "Detail portes", cat: "portes" },
  { src: "/images/moustiquaires/reparation-1.jpg", alt: "Reparation moustiquaire", cat: "moustiquaires" },
  { src: "/images/moustiquaires/entretien-1.jpg", alt: "Entretien moustiquaire", cat: "moustiquaires" },
  { src: "/images/moustiquaires/detail-1.jpg", alt: "Detail moustiquaire", cat: "moustiquaires" },
];

const tabs = [
  { key: "all", label: "Tous" },
  { key: "quincaillerie", label: "Quincaillerie" },
  { key: "thermos", label: "Vitre Thermos" },
  { key: "portes", label: "Portes" },
  { key: "moustiquaires", label: "Moustiquaires" },
];

export default function Gallery() {
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState(null);

  const filtered = filter === "all" ? items : items.filter((i) => i.cat === filter);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              filter === tab.key
                ? "bg-[var(--color-red)] text-white shadow-lg"
                : "bg-white text-[var(--color-foreground)] border border-[var(--color-border)] hover:border-[var(--color-red)] hover:text-[var(--color-red)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item, i) => (
          <button
            key={item.src}
            onClick={() => setLightbox(i)}
            className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <i className="fas fa-search-plus text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-[var(--color-red)]"
            onClick={() => setLightbox(null)}
          >
            <i className="fas fa-times"></i>
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl hover:text-[var(--color-red)]"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((lightbox - 1 + filtered.length) % filtered.length);
            }}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="relative max-w-4xl max-h-[80vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={filtered[lightbox].src}
              alt={filtered[lightbox].alt}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl hover:text-[var(--color-red)]"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((lightbox + 1) % filtered.length);
            }}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightbox + 1} / {filtered.length}
          </div>
        </div>
      )}
    </>
  );
}
