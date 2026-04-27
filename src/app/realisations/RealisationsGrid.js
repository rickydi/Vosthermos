"use client";

import Image from "next/image";
import { useState } from "react";

const categoryIcons = {
  "Vitre Thermos": "fas fa-snowflake",
  "Quincaillerie": "fas fa-cogs",
  "Portes": "fas fa-door-open",
  "Moustiquaires": "fas fa-border-all",
  "Calfeutrage": "fas fa-fill-drip",
};

export default function RealisationsGrid({ projects, categories }) {
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filtered =
    activeCategory === "Tous"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Category filter */}
      <div className="flex flex-wrap gap-3 mb-10 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeCategory === cat
                ? "bg-[var(--color-red)] text-white shadow-lg"
                : "bg-white text-[var(--color-muted)] border border-[var(--color-border)] hover:border-[var(--color-red)]/40 hover:text-[var(--color-red)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-[var(--color-border)] group"
          >
            {/* Before/After visual */}
            <div className="relative aspect-[4/3] overflow-hidden">
              {project.cardImage ? (
                <Image
                  src={project.cardImage}
                  alt={project.imageAlt || project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : project.comparisonImage ? (
                <>
                  <Image
                    src={project.comparisonImage}
                    alt={project.imageAlt || project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 top-3 flex justify-between px-3">
                    <span className="bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                      Avant
                    </span>
                    <span className="bg-[var(--color-red)] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                      Apres
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 h-full">
                    <div className="relative bg-gradient-to-br from-gray-300 to-gray-400 flex flex-col items-center justify-center">
                      <i className={`${categoryIcons[project.category] || "fas fa-window-restore"} text-3xl text-white/30 mb-2`}></i>
                      <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Avant</span>
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                        Avant
                      </div>
                    </div>
                    <div className="relative bg-gradient-to-br from-[var(--color-teal)] to-[var(--color-teal-dark)] flex flex-col items-center justify-center">
                      <i className={`${categoryIcons[project.category] || "fas fa-window-restore"} text-3xl text-white/40 mb-2`}></i>
                      <i className="fas fa-check-circle text-white/60 text-lg"></i>
                      <div className="absolute bottom-2 right-2 bg-[var(--color-red)] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                        Apres
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center z-10">
                    <i className="fas fa-arrows-alt-h text-gray-400 text-xs"></i>
                  </div>
                </>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block bg-[var(--color-teal)]/10 text-[var(--color-teal)] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {project.category}
                </span>
                <span className="text-[var(--color-muted)] text-xs flex items-center gap-1">
                  <i className="fas fa-map-marker-alt text-[var(--color-red)] text-[10px]"></i>
                  {project.city}
                </span>
              </div>
              <h3 className="font-bold text-sm leading-tight mb-2">
                {project.title}
              </h3>
              <p className="text-[var(--color-muted)] text-xs leading-relaxed">
                {project.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <i className="fas fa-search text-4xl text-[var(--color-border)] mb-4"></i>
          <p className="text-[var(--color-muted)]">
            Aucune realisation dans cette categorie pour le moment.
          </p>
        </div>
      )}
    </>
  );
}
