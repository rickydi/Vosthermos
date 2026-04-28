"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const FALLBACK_PHONE = "514-825-8411";
const FALLBACK_TEL = "+15148258411";

export default function Header({ company }) {
  const phone = company?.phone || FALLBACK_PHONE;
  const phoneTel = company?.phoneTel || FALLBACK_TEL;
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
    const t = setTimeout(() => setMenuOpen(false), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const isHome = pathname === "/" || pathname === "/en";
  const isAdmin = pathname.startsWith("/admin");
  const isTerrain = pathname.startsWith("/terrain");
  const isGestionnaire = pathname.startsWith("/gestionnaire");

  if (isAdmin || isTerrain || isGestionnaire) return null;

  // FR slug → EN slug pour les services (miroir inverse des redirects dans next.config.mjs)
  const SERVICE_SLUG_FR_EN = {
    "insertion-porte": "door-insert",
    "reparation-portes-bois": "wooden-door-repair",
    "remplacement-vitre-thermos": "sealed-glass-replacement",
    "remplacement-quincaillerie": "hardware-replacement",
    "moustiquaires-sur-mesure": "custom-screen-doors",
    "calfeutrage": "caulking",
    "desembuage": "defogging",
    "coupe-froid": "weatherstripping",
  };
  const SERVICE_SLUG_EN_FR = Object.fromEntries(
    Object.entries(SERVICE_SLUG_FR_EN).map(([fr, en]) => [en, fr])
  );

  // Build the alternate language URL
  const getAlternateLangUrl = () => {
    if (isEnglish) {
      // Strip /en prefix to get French URL, puis mapper slug service EN→FR
      let frPath = pathname.replace(/^\/en(\/|$)/, "/");
      const serviceMatch = frPath.match(/^\/services\/([^/]+)(.*)$/);
      if (serviceMatch) {
        const [, slug, rest] = serviceMatch;
        const frSlug = SERVICE_SLUG_EN_FR[slug] || slug;
        frPath = `/services/${frSlug}${rest}`;
      }
      return frPath || "/";
    }
    if (pathname === "/contact" || pathname === "/rendez-vous") return "/en/contact";
    if (pathname === "/portail-gestionnaire") return "/en/contact?subject=portal-demo";
    if (pathname === "/realisations" || pathname.startsWith("/realisations/")) return "/en/#gallery";
    if (pathname === "/panier" || pathname.startsWith("/checkout")) return pathname;
    // FR → EN : mapper slug service si applicable
    const serviceMatch = pathname.match(/^\/services\/([^/]+)(.*)$/);
    if (serviceMatch) {
      const [, slug, rest] = serviceMatch;
      const enSlug = SERVICE_SLUG_FR_EN[slug];
      if (!enSlug) return "/en/#services";
      return `/en/services/${enSlug}${rest}`;
    }
    // Add /en prefix for English URL (autres pages)
    return `/en${pathname === "/" ? "" : pathname}`;
  };

  // Prefix for internal links
  const prefix = isEnglish ? "/en" : "";
  const bookNowHref = isEnglish ? "/en/contact" : "/rendez-vous";
  const projectsHref = isEnglish ? (isHome ? "#gallery" : "/en/#gallery") : "/realisations";
  const contactHref = isEnglish ? "/en/contact" : "/contact";
  const portalHref = isEnglish ? "/en/contact?subject=portal-demo" : "/portail-gestionnaire";
  const areasHref = isEnglish
    ? (isHome ? "#areas" : "/en/#areas")
    : (isHome ? "#secteurs" : "/#secteurs");
  const cartHref = "/panier";

  // Navigation labels
  const labels = isEnglish
    ? {
        services: "Services",
        boutique: "Shop",
        blogue: "Blog",
        optiFenetre: "OPTI-FENETRE",
        portal: "Managers",
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
        portal: "Gestionnaires",
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
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-[80px]">
          <Link href={prefix || "/"} className="flex-shrink-0">
            <Image
              src="/images/Vos-Thermos-Logo_Blanc.png"
              alt="Vosthermos Logo"
              width={250}
              height={70}
              className="h-16 md:h-[70px] w-auto brightness-110 drop-shadow-md"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {[
              { href: isHome ? "#services" : `${prefix || ""}/#services`, label: labels.services, match: null },
              { href: `${prefix}/boutique`, label: labels.boutique, match: ["/boutique", "/produit", "/en/boutique", "/en/produit"] },
              { href: `${prefix}/blogue`, label: labels.blogue, match: ["/blogue", "/en/blogue"] },
              { href: `${prefix}/opti-fenetre`, label: labels.optiFenetre, match: ["/opti-fenetre", "/en/opti-fenetre"] },
              { href: portalHref, label: labels.portal, match: ["/portail-gestionnaire"], featured: true, icon: "fas fa-building" },
              { href: bookNowHref, label: labels.rendezvous, match: ["/rendez-vous"] },
              { href: projectsHref, label: labels.realisations, match: ["/realisations"] },
              { href: contactHref, label: labels.contact, match: ["/contact", "/en/contact"] },
            ].map((item) => {
              const isActive = item.match && item.match.some((m) => pathname.startsWith(m));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                    item.featured
                      ? "bg-[var(--color-red)] text-white shadow-sm hover:bg-[var(--color-red-dark)]"
                      : isActive
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.icon && <i className={`${item.icon} text-[11px]`}></i>}
                  {item.label}
                </Link>
              );
            })}
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
              href={`tel:${phoneTel}`}
              className="hidden md:flex items-center gap-2 text-white font-semibold text-sm hover:text-[var(--color-red-light)] transition-colors"
            >
              <i className="fas fa-phone text-[var(--color-red)]"></i>
              <span>{phone}</span>
            </a>

            <Link
              href={cartHref}
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
        style={{ paddingTop: "80px" }}
      >
        <nav className="flex flex-col items-center gap-5 pt-8 text-lg">
          <Link href={isHome ? "#services" : `${prefix || ""}/#services`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.services}</Link>
          <Link href={`${prefix}/boutique`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.boutique}</Link>
          <Link href={`${prefix}/blogue`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.blogue}</Link>
          <Link href={`${prefix}/opti-fenetre`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.optiFenetre}</Link>
          <Link href={portalHref} className="inline-flex items-center gap-2 bg-[var(--color-red)] text-white font-bold px-5 py-2.5 rounded-full" onClick={() => setMenuOpen(false)}>
            <i className="fas fa-building text-sm"></i>
            {labels.portal}
          </Link>
          <Link href={bookNowHref} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.rendezvous}</Link>
          <Link href={`${prefix}/garantie`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.garantie}</Link>
          <Link href={projectsHref} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.realisations}</Link>
          <Link href={`${prefix}/faq`} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.faq}</Link>
          <Link href={areasHref} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.secteurs}</Link>
          <Link href={contactHref} className="text-white font-medium" onClick={() => setMenuOpen(false)}>{labels.contact}</Link>
          <Link href={cartHref} className="text-white font-medium" onClick={() => setMenuOpen(false)}>
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
          <a href={`tel:${phoneTel}`} className="flex items-center gap-2 text-[var(--color-red-light)] font-bold mt-4">
            <i className="fas fa-phone"></i> {phone}
          </a>
        </nav>
      </div>
    </>
  );
}
