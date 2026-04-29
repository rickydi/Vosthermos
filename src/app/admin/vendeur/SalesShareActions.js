"use client";

import { useState } from "react";

export default function SalesShareActions({ shareUrl }) {
  const [message, setMessage] = useState("");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setMessage("Lien copié");
    } catch {
      setMessage("Impossible de copier automatiquement");
    }
  }

  async function sharePdf() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pitch Vosthermos - Portail gestionnaires",
          text: "PDF de présentation Vosthermos pour les gestionnaires de copropriétés.",
          url: shareUrl,
        });
        setMessage("Partage ouvert");
        return;
      } catch {
        // If the user closes the native share sheet, fall back to copying.
      }
    }

    await copyLink();
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg admin-card border admin-border admin-text font-bold text-sm admin-hover"
      >
        <i className="fas fa-copy text-[var(--color-red)]"></i>
        Copier le lien
      </button>
      <button
        type="button"
        onClick={sharePdf}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-red)] text-white font-bold text-sm hover:opacity-90"
      >
        <i className="fas fa-share-alt"></i>
        Partager
      </button>
      {message && (
        <span className="inline-flex items-center text-sm admin-text-muted px-1">
          {message}
        </span>
      )}
    </div>
  );
}
