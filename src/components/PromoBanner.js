"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PromoBanner() {
  const pathname = usePathname();
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/promo", { next: { revalidate: 60 } })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setPromo(data?.promo || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!promo) return null;

  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const prefix = isEnglish ? "/en" : "";
  const ctaLabel = isEnglish ? "View products" : "Voir les produits";

  return (
    <>
      {/* Spacer to push content down */}
      <div className="h-9" id="promo-spacer" />
      {/* Fixed banner */}
      <div
        className="fixed top-0 left-0 w-full z-[60] py-2 px-4 text-center text-white text-sm font-semibold"
        style={{ backgroundColor: promo.bgColor }}
      >
        <i className="fas fa-tag mr-2"></i>
        {promo.title}
        {promo.description && (
          <span className="font-normal ml-2 opacity-90 hidden sm:inline">— {promo.description}</span>
        )}
        {promo.categorySlug && (
          <a
            href={`${prefix}/boutique/${promo.categorySlug}`}
            className="ml-3 underline underline-offset-2 font-bold hover:opacity-80"
          >
            {ctaLabel}
          </a>
        )}
      </div>
      {/* CSS to offset header and pages when promo is active */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root { --promo-h: 36px; }
        .header-fixed { top: var(--promo-h, 0px) !important; }
        .pt-\\[85px\\] { padding-top: calc(85px + var(--promo-h, 0px)) !important; }
      `}} />
    </>
  );
}
