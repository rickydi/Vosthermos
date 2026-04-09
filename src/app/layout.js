import "./globals.css";
import { cookies } from "next/headers";
import Header from "@/components/Header";
import ConditionalFooter from "@/components/ConditionalFooter";
import PromoBanner from "@/components/PromoBanner";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import ChatBubble from "@/components/ChatBubble";
import { CartProvider } from "@/components/CartContext";
import Script from "next/script";

export const metadata = {
  title: "Remplacement Thermos & Fenêtres dès 150$ • Vosthermos Montréal",
  description:
    "Thermos embué? Porte qui bloque? Vosthermos remplace vos vitres thermos dès 150$ avec garantie 10 ans. ✓ 15 ans d'expérience ✓ Soumission gratuite 24h ✓ Rive-Sud, Montréal, Laval ☎ 514-825-8411",
  keywords:
    "reparation portes fenetres, vitre thermos, remplacement thermos, remplacement quincaillerie, moustiquaire sur mesure, porte-patio, porte en bois, calfeutrage fenetres, desembuage, coupe-froid, insertion porte, boutique pieces portes fenetres, quincaillerie porte fenetre en ligne, Saint-Francois-Xavier, Montreal, Rive-Sud, Laval, Longueuil, Brossard, Granby, Saint-Hyacinthe, Terrebonne, Repentigny",
  authors: [{ name: "Vosthermos" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://www.vosthermos.com/",
    languages: {
      fr: "https://www.vosthermos.com/",
      en: "https://www.vosthermos.com/en/",
    },
  },
  applicationName: "Vosthermos",
  openGraph: {
    type: "website",
    siteName: "Vosthermos",
    url: "https://www.vosthermos.com/",
    title: "Remplacement Thermos & Fenêtres dès 150$ • Vosthermos",
    description:
      "Thermos embué? Vosthermos remplace vos vitres thermos dès 150$. Garantie 10 ans, soumission gratuite 24h. 15 ans d'expérience. Montréal, Rive-Sud, Laval ☎ 514-825-8411",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
    locale: "fr_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remplacement Thermos dès 150$ • Garantie 10 ans • Vosthermos",
    description:
      "Vosthermos - Experts en remplacement de thermos depuis 15 ans. Soumission gratuite 24h ☎ 514-825-8411",
    images: ["https://www.vosthermos.com/images/Vos-Thermos-Logo.png"],
  },
  icons: {
    icon: "/images/Vos-Thermos-Logo-petit.png",
    apple: "/images/Vos-Thermos-Logo-petit.png",
  },
  verification: {
    google: "LNVLJOda6YGvqjLQb_ZnVDd5ikvAwqv2HzXWJQDxQxA",
  },
  other: {
    "geo.region": "CA-QC",
    "geo.placename": "Saint-Francois-Xavier",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://www.vosthermos.com/#business",
  name: "Vosthermos",
  legalName: "Vosthermos",
  description:
    "Experts en reparation de portes et fenetres depuis 15 ans. Remplacement de vitres thermos avec service garanti, quincaillerie, portes en bois et moustiquaires sur mesure. Boutique en ligne de 740+ pieces.",
  url: "https://www.vosthermos.com",
  telephone: "+15148258411",
  email: "info@vosthermos.com",
  image: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png",
  logo: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "330 Ch. St-Francois-Xavier, Local 101",
    addressLocality: "Saint-Francois-Xavier",
    addressRegion: "QC",
    postalCode: "J0H 1S0",
    addressCountry: "CA",
  },
  geo: { "@type": "GeoCoordinates", latitude: 45.371, longitude: -73.457 },
  areaServed: [
    { "@type": "City", name: "Montreal" },
    { "@type": "City", name: "Laval" },
    { "@type": "City", name: "Longueuil" },
    { "@type": "City", name: "Brossard" },
    { "@type": "City", name: "Boucherville" },
    { "@type": "City", name: "Saint-Hyacinthe" },
    { "@type": "City", name: "Granby" },
    { "@type": "City", name: "Terrebonne" },
    { "@type": "City", name: "Repentigny" },
    { "@type": "City", name: "Chambly" },
    { "@type": "City", name: "Saint-Jean-sur-Richelieu" },
    { "@type": "City", name: "Blainville" },
    { "@type": "City", name: "Chateauguay" },
    { "@type": "City", name: "Mascouche" },
    { "@type": "GeoCircle", geoMidpoint: { "@type": "GeoCoordinates", latitude: 45.371, longitude: -73.457 }, geoRadius: "100000" },
  ],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "17:00",
  },
  priceRange: "$$",
  currenciesAccepted: "CAD",
  paymentAccepted: "Cash, Credit Card, Debit Card",
  sameAs: [
    "https://www.facebook.com/profile.php?id=61562303553558",
    "https://instagram.com/vosthermos/",
    "https://www.wikidata.org/wiki/Q_PLACEHOLDER", // Replace Q_PLACEHOLDER with actual Wikidata Q-number after creating entity
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services de reparation de portes et fenetres",
    itemListElement: [
      {
        "@type": "OfferCatalog",
        name: "Remplacement de vitres thermos",
        itemListElement: [{
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Remplacement de vitre thermos", description: "Remplacement professionnel de vitres thermos embuees avec service garanti" },
        }],
      },
      {
        "@type": "OfferCatalog",
        name: "Quincaillerie de portes et fenetres",
        itemListElement: [{
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Remplacement de quincaillerie", description: "Remplacement de poignees, roulettes, mecanismes et coupe-froid" },
        }],
      },
      {
        "@type": "OfferCatalog",
        name: "Reparation de portes en bois",
        itemListElement: [{
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Reparation de portes en bois", description: "Restauration et reparation de portes et fenetres en bois" },
        }],
      },
      {
        "@type": "OfferCatalog",
        name: "Moustiquaires sur mesure",
        itemListElement: [{
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Moustiquaires sur mesure", description: "Fabrication et reparation de moustiquaires pour tous types de fenetres et portes" },
        }],
      },
    ],
  },
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Remplacement de vitre thermos" }, areaServed: { "@type": "State", name: "Quebec" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Remplacement de quincaillerie" }, areaServed: { "@type": "State", name: "Quebec" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Reparation de portes en bois" }, areaServed: { "@type": "State", name: "Quebec" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Moustiquaires sur mesure" }, areaServed: { "@type": "State", name: "Quebec" } },
    { "@type": "Offer", itemOffered: { "@type": "Product", name: "Pieces de remplacement pour portes et fenetres" }, availability: "https://schema.org/InStock", url: "https://www.vosthermos.com/boutique" },
  ],
};

const sitelinksJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Vosthermos",
  url: "https://www.vosthermos.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.vosthermos.com/boutique?search={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "fr";

  return (
    <html lang={locale} className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
        <link rel="alternate" hrefLang="fr" href="https://www.vosthermos.com/" />
        <link rel="alternate" hrefLang="en" href="https://www.vosthermos.com/en/" />
        <link rel="alternate" hrefLang="x-default" href="https://www.vosthermos.com/" />
        <link rel="alternate" type="application/rss+xml" title="Blogue Vosthermos" href="/feed.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sitelinksJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <PromoBanner />
          <Header />
          <main className="flex-1">{children}</main>
          <ConditionalFooter />
          <AnalyticsTracker />
          <ChatBubble />
        </CartProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8NHVJ5P419"
          strategy="afterInteractive"
        />
        <Script id="ga" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-8NHVJ5P419');`}
        </Script>
      </body>
    </html>
  );
}
