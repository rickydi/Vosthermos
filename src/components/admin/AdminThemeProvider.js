"use client";

import { useEffect } from "react";

export default function AdminThemeProvider({ children }) {
  useEffect(() => {
    const saved = localStorage.getItem("vosthermos-admin-theme") || "dark";
    document.documentElement.setAttribute("data-admin-theme", saved);

    return () => {
      document.documentElement.removeAttribute("data-admin-theme");
    };
  }, []);

  return children;
}
