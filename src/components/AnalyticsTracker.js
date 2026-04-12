"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getVisitorId() {
  let id = localStorage.getItem("vosthermos-vid");
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("vosthermos-vid", id);
  }
  return id;
}

function getDevice() {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return "Mobile";
  if (/tablet|ipad/i.test(ua)) return "Tablette";
  return "Desktop";
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Autre";
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef(null);
  const pageEnteredRef = useRef(null);

  // Skip admin pages
  if (pathname.startsWith("/admin")) return null;

  useEffect(() => {
    // Start session
    async function startSession() {
      try {
        const res = await fetch("/api/analytics/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId: getVisitorId(),
            device: getDevice(),
            browser: getBrowser(),
            referrer: document.referrer || null,
          }),
        });
        const data = await res.json();
        sessionIdRef.current = data.sessionId;
      } catch {}
    }

    if (!sessionIdRef.current) {
      startSession();
    }

    // End session on close
    function handleUnload() {
      if (sessionIdRef.current) {
        navigator.sendBeacon("/api/analytics/session/end", JSON.stringify({
          sessionId: sessionIdRef.current,
        }));
      }
    }

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  useEffect(() => {
    // Record page view
    async function recordPageView() {
      // End previous page
      if (pageEnteredRef.current && sessionIdRef.current) {
        const duration = Math.round((Date.now() - pageEnteredRef.current.time) / 1000);
        fetch("/api/analytics/pageview/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: pageEnteredRef.current.id, duration }),
        }).catch(() => {});
      }

      pageEnteredRef.current = { time: Date.now(), id: null };

      if (!sessionIdRef.current) {
        // Wait for session to be created
        await new Promise(r => setTimeout(r, 500));
      }

      if (sessionIdRef.current) {
        try {
          const res = await fetch("/api/analytics/pageview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: sessionIdRef.current,
              page: pathname,
            }),
          });
          const data = await res.json();
          pageEnteredRef.current.id = data.id;
        } catch {}
      }
    }

    recordPageView();
  }, [pathname]);

  // Chat presence: update lastSeenAt while client is on any page
  useEffect(() => {
    const chatId = localStorage.getItem("vosthermos-chat-id");
    if (!chatId) return;
    const ping = () => {
      fetch(`/api/public/chat/${chatId}/ping`, { method: "POST" }).catch(() => {});
    };
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
