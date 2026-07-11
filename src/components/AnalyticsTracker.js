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

// Provenance payante / campagnes, lue sur l'URL d'ARRIVÉE (le gclid de Google Ads
// n'existe que sur la 1re page : auto-tagging). Lu au démarrage de session.
const EMPTY_ENTRY_PARAMS = {
  gclid: null,
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmTerm: null,
  utmContent: null,
  googleAdsCampaignId: null,
  googleAdsAdGroupId: null,
  googleAdsKeyword: null,
  googleAdsMatchType: null,
  googleAdsCreativeId: null,
  googleAdsNetwork: null,
  googleAdsDevice: null,
};

function getEntryParams() {
  try {
    const p = new URLSearchParams(window.location.search);
    const read = (names, max = 150) => {
      for (const name of names) {
        const value = p.get(name)?.trim();
        if (value) return value.slice(0, max);
      }
      return null;
    };

    return {
      gclid: read(["gclid", "gbraid", "wbraid"], 200),
      utmSource: read(["utm_source"], 100),
      utmMedium: read(["utm_medium"], 100),
      utmCampaign: read(["utm_campaign"], 150),
      utmTerm: read(["utm_term"], 200),
      utmContent: read(["utm_content"], 150),
      googleAdsCampaignId: read(["campaignid", "campaign_id", "utm_id"], 40),
      googleAdsAdGroupId: read(["adgroupid", "ad_group_id", "utm_content"], 40),
      googleAdsKeyword: read(["keyword", "utm_term"], 200),
      googleAdsMatchType: read(["matchtype"], 20),
      googleAdsCreativeId: read(["creative", "creativeid"], 40),
      googleAdsNetwork: read(["network"], 20),
      googleAdsDevice: read(["device"], 20),
    };
  } catch {
    return EMPTY_ENTRY_PARAMS;
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef(null);
  const pageEnteredRef = useRef(null);

  // Detect tracked page (public only). Computed AFTER hooks so we don't
  // violate hook rules with a conditional return. /envoyer-photos exclu : page
  // atteinte par lien tokenisé (le token n'a pas d'affaire dans les analytics).
  const isTracked = !pathname.startsWith("/admin") && !pathname.startsWith("/terrain") && !pathname.startsWith("/envoyer-photos");

  useEffect(() => {
    if (!isTracked) return;

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
            ...getEntryParams(),
          }),
        });
        const data = await res.json();
        sessionIdRef.current = data.sessionId;
      } catch {}
    }

    if (!sessionIdRef.current) startSession();

    function handleUnload() {
      if (sessionIdRef.current) {
        navigator.sendBeacon("/api/analytics/session/end", JSON.stringify({
          sessionId: sessionIdRef.current,
        }));
      }
    }
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [isTracked]);

  useEffect(() => {
    if (!isTracked) return;

    async function recordPageView() {
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
        await new Promise((r) => setTimeout(r, 500));
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
  }, [pathname, isTracked]);

  // Chat presence
  useEffect(() => {
    const chatId = typeof window !== "undefined" ? localStorage.getItem("vosthermos-chat-id") : null;
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
