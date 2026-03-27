"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images, name }) {
  const [selected, setSelected] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-[var(--color-muted)]">
        Aucune image
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-square relative bg-white rounded-xl border border-[var(--color-border)] overflow-hidden mb-4">
        <Image
          src={images[selected].url}
          alt={`${name} - Image ${selected + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-6"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelected(i)}
              className={`w-20 h-20 relative rounded-lg border-2 overflow-hidden flex-shrink-0 transition ${
                i === selected
                  ? "border-[var(--color-primary)]"
                  : "border-[var(--color-border)] hover:border-gray-400"
              }`}
            >
              <Image
                src={img.url}
                alt={`${name} - Miniature ${i + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
