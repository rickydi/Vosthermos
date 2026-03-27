"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("vosthermos-admin-theme") || "dark";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  function applyTheme(t) {
    document.documentElement.setAttribute("data-admin-theme", t);
  }

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("vosthermos-admin-theme", next);
    applyTheme(next);
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm admin-text-muted hover:admin-text transition-all w-full"
      title={theme === "dark" ? "Mode clair" : "Mode sombre"}
    >
      <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"} w-5 text-center`}></i>
      {theme === "dark" ? "Mode clair" : "Mode sombre"}
    </button>
  );
}
