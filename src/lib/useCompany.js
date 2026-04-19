"use client";

import { useEffect, useState } from "react";
import { COMPANY_INFO } from "./company-info";

// In-module cache so multiple components share one fetch per page load
let cachedPromise = null;
let cachedValue = null;

function fetchCompany() {
  if (cachedPromise) return cachedPromise;
  cachedPromise = fetch("/api/public/company", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data && !data.error) cachedValue = { ...COMPANY_INFO, ...data };
      return cachedValue;
    })
    .catch(() => null);
  return cachedPromise;
}

/**
 * Hook that returns live company NAP from the admin DB.
 * Falls back to COMPANY_INFO constants if fetch fails.
 * Re-uses one fetch per page load across all components.
 */
export function useCompany() {
  const [company, setCompany] = useState(cachedValue || COMPANY_INFO);

  useEffect(() => {
    let mounted = true;
    if (cachedValue) {
      setCompany(cachedValue);
      return;
    }
    fetchCompany().then((data) => {
      if (mounted && data) setCompany(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return company;
}
