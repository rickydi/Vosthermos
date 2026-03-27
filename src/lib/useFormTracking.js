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

  function send(action, extra = {}) {
    const visitorId = typeof window !== "undefined" ? localStorage.getItem("vosthermos-vid") : null;
    const payload = {
      visitorId,
      formType,
      action,
      page: pathname,
      fieldName: lastFieldRef.current,
      fieldsCompleted: fieldsCompletedRef.current,
      fieldValues: fieldValuesRef.current,
      ...extra,
    };

    if (action === "abandon" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/form", JSON.stringify(payload));
    } else {
      fetch("/api/analytics/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }
  }

  const trackFieldFocus = useCallback((fieldName) => {
    if (!startedRef.current) {
      startedRef.current = true;
      send("start", { fieldName });
    }
    lastFieldRef.current = fieldName;
  }, [formType, pathname]);

  const trackFieldValue = useCallback((fieldName, value) => {
    lastFieldRef.current = fieldName;
    if (!fieldsCompletedRef.current.includes(fieldName)) {
      fieldsCompletedRef.current.push(fieldName);
    }
    fieldValuesRef.current = { ...fieldValuesRef.current, [fieldName]: value };
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

  // Reset on pathname change
  useEffect(() => {
    startedRef.current = false;
    lastFieldRef.current = null;
    fieldsCompletedRef.current = [];
    fieldValuesRef.current = {};
    submittedRef.current = false;
  }, [pathname]);

  return { trackFieldFocus, trackFieldValue, trackSubmit };
}
