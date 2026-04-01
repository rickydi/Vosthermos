"use client";

import { useState } from "react";

export default function VideoSection({ videoId = null }) {
  const [playing, setPlaying] = useState(false);

  // If no YouTube video ID provided, show a placeholder
  const hasVideo = !!videoId;

  return (
    <section className="bg-white py-20 border-t border-[var(--color-border)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-10">
          <span className="section-tag">Notre expertise</span>
          <h2 className="text-3xl font-extrabold">
            Voyez notre equipe <span className="text-[var(--color-red)]">en action</span>
          </h2>
          <p className="text-[var(--color-muted)] mt-3 max-w-2xl mx-auto">
            Decouvrez comment nos techniciens transforment vos portes et fenetres avec precision et professionnalisme.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-xl" style={{ aspectRatio: "16/9" }}>
            {hasVideo && playing ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
                title="Vosthermos - Notre expertise"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-[var(--color-teal-dark)] to-[var(--color-teal)] flex flex-col items-center justify-center cursor-pointer group"
                onClick={() => hasVideo && setPlaying(true)}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-xl rotate-12"></div>
                  <div className="absolute bottom-20 right-20 w-16 h-16 border-2 border-white rounded-full"></div>
                  <div className="absolute top-1/3 right-1/4 w-12 h-12 border-2 border-white rounded-lg -rotate-6"></div>
                </div>

                {hasVideo ? (
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-[var(--color-red)] transition-all group-hover:scale-110">
                    <i className="fas fa-play text-white text-2xl ml-1"></i>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <i className="fas fa-video text-white text-2xl"></i>
                  </div>
                )}

                <p className="text-white font-bold mt-4 text-lg">
                  {hasVideo ? "Regarder la video" : "Video a venir"}
                </p>
                {!hasVideo && (
                  <p className="text-white/60 text-sm mt-1">
                    Notre video corporative arrive bientot!
                  </p>
                )}

                {/* Stats overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm px-6 py-4">
                  <div className="flex justify-center gap-8 text-white text-center">
                    <div>
                      <strong className="block text-xl font-extrabold">15+</strong>
                      <span className="text-xs text-white/70">Annees d&apos;experience</span>
                    </div>
                    <div>
                      <strong className="block text-xl font-extrabold">740+</strong>
                      <span className="text-xs text-white/70">Pieces en inventaire</span>
                    </div>
                    <div>
                      <strong className="block text-xl font-extrabold">15+</strong>
                      <span className="text-xs text-white/70">Service garanti</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
