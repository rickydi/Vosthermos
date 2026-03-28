"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const { itemCount, loaded } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const isHome = pathname === "/" || pathname === "/en";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return null;

  // Build the alternate language URL
  const getAlternateLangUrl = () => {
    if (isEnglish) {
      // Strip /en prefix to get French URL
      const frPath = pathname.replace(/^\/en(\/|$)/, "/");
      return frPath || "/";
    }
    // Add /en prefix for English URL
    return `/en${pathname === "/" ? "" : pathname}`;
  };

  // Prefix for internal links
  const prefix = isEnglish ? "/en" : "";

  // Navigation labels
  const labels = isEnglish
    ? {
        services: "Services",
        boutique: "Shop",
        blogue: "Blog",
        optiFenetre: "OPTI-FENETRE",
        rendezvous: "Book Now",
        realisations: "Projects",
        contact: "Contact",
        garantie: "Warranty",
        faq: "FAQ",
        secteurs: "Areas",
        panier: "Cart",
        langLabel: "FR",
        langTitle: "Version francaise",
      }
    : {
        services: "Services",
        boutique: "Boutique",
        blogue: "Blogue",
        optiFenetre: "OPTI-FENETRE",
        rendezvous: "Rendez-vous",
        realisations: "Realisations",
        contact: "Contact",
        garantie: "Garantie",
        faq: "FAQ",
        secteurs: "Secteurs",
        panier: "Panier",
        langLabel: "EN",
        langTitle: "English version",
      };

  return (
    <>
      <header
        className={`header-fixed fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-white/5 bg-[var(--color-teal-dark)] ${
          scrolled ? "shadow-lg" : ""
        }`}
        style={{ backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-[65px]">
          <Link href={prefix || "/"} className="flex-shrink-0">
            <Image
              src="/images/Vos-Thermos-Logo_Blanc.png"
              alt="Vosthermos Logo"
              width={220}
              height={60}
              className="h-12 md:h-14 w-auto brightness-110 drop-shadow-md"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-5">
            <Link href={isHome ? "#services" : `${prefix || ""}/#services`} className="text-white/80 hover:text-white text-sm font-medium transition-colors">{labels.services}</Link>
            <Link
              href={`${prefix}/boutique`}
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith("/boutique") || pathname.startsWith("/produit") || pathname.startsWith("/en/boutique") || pathname.startsWith("/en/produit")
                  ? "text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {labels.boutique}
            </Link>
            <Link
              href={`${prefix}/blogue`}
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith("/blogue") || pathname.startsWith("/en/blogue")
                  ? "text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {labels.blogue}
            </Link>
            <Link
              href={`${prefix}/opti-fenetre`}
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith("/opti-fenetre") || pathname.startsWith("/en/opti-fenetre")
                  ? "text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {labels.optiFenetre}
            </Link>
            <Link
              href={`${prefix}/rendez-vous`}
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith("/rendez-vous") || pathname.startsWith("/en/rendez-vous")
                  ? "text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {labels.rendezvous}
            </Link>
            <Link
              href={`${prefix}/realisations`}
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith("/realisations") || pathname.startsWith("/en/realisations")
                  ? "text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {labels.realisations}
            </Link>
            <Link href={isHome ? "#contact" : `${prefix || ""}/#contact`} className="text-white/80 hover:text-white text-sm font-medium transition-colors">{labels.contact}</Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* Language switcher */}
            <Link
              href={getAlternateLangUrl()}
              className="flex items-center gap-1 text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider border border-white/20 hover:border-white/40 px-2.5 py-1.5 rounded-md transition-all"
              title={labels.langTitle}
            >
              <i className="fas fa-globe text-[10px]"></i>
              {labels.langLabel}
            </Link>

            <a
              href="tel:15148258411"
              className="hidden md:flex items-center gap-2 text-white font-semibold text-sm hover:text-[var(--color-red-light)] transition-colors"
            >
              <i className="fas fa-phone text-[var(--color-red)]"></i>
              <span>514-825-8411</span>
            </a>

            <Link
              href={`${prefix}/panier`}
              className="relative flex items-center gap-1 text-white/80 hover:text-white transition-colors"
              aria-label={labels.panier}
            >
              <i className="fas fa-shopping-cart text-lg"></i>
              {loaded && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--color-red)] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              className="lg:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-[var(--color-teal-dark)] transition-transform duration-300 lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ paddingTop: "65px" }}
      >
        <nav className="flex flex-col items-center gap-5 pt-8 text-lg">
          <Link href={isHome ? "#services" : `${prefix || ""}/#services`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.services}</Link>
          <Link href={`${prefix}/boutique`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.boutique}</Link>
          <Link href={`${prefix}/blogue`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.blogue}</Link>
          <Link href={`${prefix}/opti-fenetre`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.optiFenetre}</Link>
          <Link href={`${prefix}/rendez-vous`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.rendezvous}</Link>
          <Link href={`${prefix}/garantie`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.garantie}</Link>
          <Link href={`${prefix}/realisations`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.realisations}</Link>
          <Link href={`${prefix}/faq`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.faq}</Link>
          <Link href={isHome ? "#secteurs" : `${prefix || ""}/#secteurs`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.secteurs}</Link>
          <Link href={isHome ? "#contact" : `${prefix || ""}/#contact`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.contact}</Link>
          <Link href={`${prefix}/panier`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>
            {labels.panier} {loaded && itemCount > 0 && `(${itemCount})`}
          </Link>
          {/* Mobile language switcher */}
          <Link
            href={getAlternateLangUrl()}
            className="flex items-center gap-2 text-white/60 hover:text-white font-medium mt-2 border border-white/20 px-4 py-2 rounded-lg"
            onClick={() => setMenuOpen(false)}
          >
            <i className="fas fa-globe"></i>
            {labels.langLabel === "EN" ? "English" : "Francais"}
          </Link>
          <a href="tel:15148258411" className="flex items-center gap-2 text-[var(--color-red-light)] font-bold mt-4">
            <i className="fas fa-phone"></i> 514-825-8411
          </a>
        </nav>
      </div>
    </>
  );
}
