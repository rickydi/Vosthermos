"use client";

import { useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

export default function useFormTracking(formType) {
  const pathname = usePathname();
  const startedRef = useRef(false);
  const lastFieldRef = useRef(null);
  const fieldsCompletedRef = useRef([]);
  const fieldValuesRef = useRef({});
  const submittedRef = useRef(false);
  const interactionsRef = useRef([]);
  const startTimeRef = useRef(null);
  const sentRef = useRef(false);

  function send(action, extra = {}) {
    if ((action === "abandon" || action === "submit") && sentRef.current) return;
    if (action === "abandon" || action === "submit") sentRef.current = true;
    const visitorId = typeof window !== "undefined" ? localStorage.getItem("vosthermos-vid") : null;
    const payload = {
      visitorId,
      formType,
      action,
      page: pathname,
      fieldName: lastFieldRef.current,
      fieldsCompleted: fieldsCompletedRef.current,
      fieldValues: fieldValuesRef.current,
      interactions: interactionsRef.current,
      ...extra,
    };

    if (action === "abandon" && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/form", blob);
    } else {
      fetch("/api/analytics/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }
  }

  function getMs() {
    if (!startTimeRef.current) startTimeRef.current = Date.now();
    return Date.now() - startTimeRef.current;
  }

  const trackFieldFocus = useCallback((fieldName) => {
    if (!startedRef.current) {
      startedRef.current = true;
      startTimeRef.current = Date.now();
      interactionsRef.current = [];
      send("start", { fieldName });
    }
    interactionsRef.current.push({ t: getMs(), a: "f", field: fieldName });
    lastFieldRef.current = fieldName;
  }, [formType, pathname]);

  const trackFieldValue = useCallback((fieldName, value) => {
    lastFieldRef.current = fieldName;
    if (!fieldsCompletedRef.current.includes(fieldName)) {
      fieldsCompletedRef.current.push(fieldName);
    }
    fieldValuesRef.current = { ...fieldValuesRef.current, [fieldName]: value };
    interactionsRef.current.push({ t: getMs(), a: "v", field: fieldName, val: value });
  }, []);

  const trackSubmit = useCallback(() => {
    submittedRef.current = true;
    send("submit");
  }, [formType, pathname]);

  useEffect(() => {
    function handleAbandon() {
      if (startedRef.current && !submittedRef.current) {
        send("abandon");
      }
    }

    window.addEventListener("beforeunload", handleAbandon);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handleAbandon();
    });

    return () => {
      window.removeEventListener("beforeunload", handleAbandon);
    };
  }, [formType, pathname]);

  useEffect(() => {
    startedRef.current = false;
    lastFieldRef.current = null;
    fieldsCompletedRef.current = [];
    fieldValuesRef.current = {};
    submittedRef.current = false;
    interactionsRef.current = [];
    startTimeRef.current = null;
    sentRef.current = false;
  }, [pathname]);

  return { trackFieldFocus, trackFieldValue, trackSubmit };
}
