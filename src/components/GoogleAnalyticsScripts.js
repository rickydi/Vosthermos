"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const PRIVATE_PREFIXES = [
  "/admin",
  "/terrain",
  "/gestionnaire",
  "/envoyer-photos",
  "/prendre-mesures",
  "/confirmation-thermos",
];

export default function GoogleAnalyticsScripts() {
  const pathname = usePathname();
  if (PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-8NHVJ5P419"
        strategy="afterInteractive"
      />
      <Script id="ga" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-8NHVJ5P419');gtag('config','AW-18237535998');`}
      </Script>
    </>
  );
}
