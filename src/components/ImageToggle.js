"use client";

import { useState, useEffect } from "react";

export default function ImageToggle() {
  const [showImages, setShowImages] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("vosthermos-show-images");
    if (saved !== null) setShowImages(saved === "true");
  }, []);

  function toggle() {
    const next = !showImages;
    setShowImages(next);
    localStorage.setItem("vosthermos-show-images", String(next));
    document.documentElement.setAttribute("data-show-images", String(next));
  }

  useEffect(() => {
    document.documentElement.setAttribute("data-show-images", String(showImages));
  }, [showImages]);

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
      title={showImages ? "Cacher les images" : "Afficher les images"}
    >
      <div className={`relative w-9 h-5 rounded-full transition-colors ${showImages ? "bg-green-500" : "bg-white/20"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showImages ? "left-4" : "left-0.5"}`} />
      </div>
      <i className={`fas ${showImages ? "fa-image" : "fa-image"} text-sm`}></i>
      <span className="hidden sm:inline">{showImages ? "Images ON" : "Images OFF"}</span>
    </button>
  );
}
