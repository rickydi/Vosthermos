"use client";

import { useState, useEffect } from "react";

const THEME_KEY = "vosthermos-admin-theme";

function applyTheme(t) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-admin-theme", t);
  }
}

export default function ThemeToggle({ iconOnly = false }) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const saved = localStorage.getItem(THEME_KEY) || "dark";
      setTheme(saved);
      applyTheme(saved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  return (
    <button
      onClick={toggle}
      className={
        iconOnly
          ? "inline-flex h-9 w-9 items-center justify-center rounded-full border admin-border admin-card admin-text-muted hover:admin-text transition-all"
          : "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm admin-text-muted hover:admin-text transition-all w-full"
      }
      title={theme === "dark" ? "Mode clair" : "Mode sombre"}
      aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
    >
      <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"} w-5 text-center`}></i>
      {!iconOnly && (theme === "dark" ? "Mode clair" : "Mode sombre")}
    </button>
  );
}
