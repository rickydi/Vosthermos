import "./globals.css";
import Header from "@/components/Header";
import ConditionalFooter from "@/components/ConditionalFooter";
import PromoBanner from "@/components/PromoBanner";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import ChatBubble from "@/components/ChatBubble";
import { CartProvider } from "@/components/CartContext";
import Script from "next/script";
import { getCompany } from "@/lib/company";

export async function generateMetadata() {
  const co = await getCompany();
  return {
    title: `Remplacement Thermos & Fenêtres dès 150$ • Vosthermos Montréal`,
    description:
      `Thermos embué? Porte qui bloque? Vosthermos remplace vos vitres thermos dès 150$ avec garantie 10 ans. ✓ 15 ans d'expérience ✓ Soumission gratuite 24h ✓ Rive-Sud, Montréal, Laval ☎ ${co.phone}`,
    keywords:
      "reparation portes fenetres, vitre thermos, remplacement thermos, remplacement quincaillerie, moustiquaire sur mesure, porte-patio, porte en bois, calfeutrage fenetres, desembuage, coupe-froid, insertion porte, boutique pieces portes fenetres, quincaillerie porte fenetre en ligne, Saint-Francois-Xavier, Montreal, Rive-Sud, Laval, Longueuil, Brossard, Granby, Saint-Hyacinthe, Terrebonne, Repentigny",
    authors: [{ name: "Vosthermos" }],
    robots: "index, follow",
    metadataBase: new URL("https://www.vosthermos.com"),
    // Note: canonical intentionally NOT set at root — chaque page doit définir
    // son propre canonical pour éviter qu'elles pointent toutes vers la home.
    // Les pages qui ne le font pas n'auront simplement pas de canonical (OK).
    applicationName: "Vosthermos",
    openGraph: {
      type: "website",
      siteName: "Vosthermos",
      url: "https://www.vosthermos.com/",
      title: "Remplacement Thermos & Fenêtres dès 150$ • Vosthermos",
      description:
        `Thermos embué? Vosthermos remplace vos vitres thermos dès 150$. Garantie 10 ans, soumission gratuite 24h. 15 ans d'expérience. Montréal, Rive-Sud, Laval ☎ ${co.phone}`,
      images: [{ url: co.logo }],
      locale: "fr_CA",
    },
    twitter: {
      card: "summary_large_image",
      title: "Remplacement Thermos dès 150$ • Garantie 10 ans • Vosthermos",
      description: `Vosthermos - Experts en remplacement de thermos depuis 15 ans. Soumission gratuite 24h ☎ ${co.phone}`,
      images: [co.logo],
    },
    icons: {
      icon: "/images/Vos-Thermos-Logo-petit.png",
      apple: "/images/Vos-Thermos-Logo-petit.png",
    },
    verification: {
      google: "LNVLJOda6YGvqjLQb_ZnVDd5ikvAwqv2HzXWJQDxQxA",
      other: {
        // Bing Webmaster Tools: https://www.bing.com/webmasters → Sites → Add → remplacer le token ci-dessous
        "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
        // Yandex Webmaster: https://webmaster.yandex.com → Add site → remplacer le token ci-dessous
        "yandex-verification": process.env.YANDEX_SITE_VERIFICATION || "",
      },
    },
    other: {
      "geo.region": "CA-QC",
      "geo.placename": co.city,
    },
  };
}

function buildLocalBusinessJsonLd(co) {
  return {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://www.vosthermos.com/#business",
  name: co.legalName || "Vosthermos",
  legalName: co.legalName || "Vosthermos",
  description:
    "Experts en reparation de portes et fenetres depuis 15 ans. Remplacement de vitres thermos avec service garanti, quincaillerie, portes en bois et moustiquaires sur mesure. Boutique en ligne de 740+ pieces.",
  url: co.url,
  telephone: co.phoneTel,
  email: co.email,
  image: co.logo,
  logo: co.logo,
  address: {
    "@type": "PostalAddress",
    streetAddress: co.address,
    addressLocality: co.city,
    addressRegion: co.province,
    postalCode: co.postalCode,
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
    co.facebook,
    co.instagram,
  ].filter(Boolean),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services de reparation de portes et fenetres",
    itemListElement: [
      {
        "@type": "Offer",
        priceCurrency: "CAD",
        priceSpecification: { "@type": "PriceSpecification", minPrice: 150, priceCurrency: "CAD" },
        itemOffered: { "@type": "Service", name: "Remplacement de vitre thermos", description: "Remplacement professionnel de vitres thermos (unites scellees) embuees ou fissurees, avec gaz argon et verre Low-E. Garantie 10 ans transferable." },
      },
      {
        "@type": "Offer",
        priceCurrency: "CAD",
        priceSpecification: { "@type": "PriceSpecification", minPrice: 4.99, priceCurrency: "CAD" },
        itemOffered: { "@type": "Service", name: "Remplacement de quincaillerie", description: "Remplacement de poignees, serrures, roulettes, manivelles, charnieres et mecanismes pour tous modeles de portes-patio et fenetres. 700+ pieces en inventaire." },
      },
      {
        "@type": "Offer",
        priceCurrency: "CAD",
        priceSpecification: { "@type": "PriceSpecification", minPrice: 150, priceCurrency: "CAD" },
        itemOffered: { "@type": "Service", name: "Reparation de porte-patio", description: "Reparation de portes-patio coulissantes: remplacement de roulettes, rails, vitres thermos, poignees, coupe-froid et alignement. Service a domicile." },
      },
      {
        "@type": "Offer",
        priceCurrency: "CAD",
        priceSpecification: { "@type": "PriceSpecification", minPrice: 180, priceCurrency: "CAD" },
        itemOffered: { "@type": "Service", name: "Reparation de porte-fenetre", description: "Reparation de portes-fenetres a battant: mecanismes multipoints Roto, Maco, GU, Hoppe, charnieres, vitres thermos et ajustements de cadre." },
      },
      {
        "@type": "Offer",
        priceCurrency: "CAD",
        itemOffered: { "@type": "Service", name: "Reparation et restauration de portes en bois", description: "Sablage, remplissage, vernissage, peinture et finition professionnelle de portes et fenetres en bois. Consultation gratuite." },
      },
      {
        "@type": "Offer",
        priceCurrency: "CAD",
        priceSpecification: { "@type": "PriceSpecification", minPrice: 25, priceCurrency: "CAD" },
        itemOffered: { "@type": "Service", name: "Moustiquaires sur mesure", description: "Fabrication et reparation de moustiquaires pour fenetres et portes-patio. Delai 48h. Toile anti-pollen et resistante aux animaux disponibles." },
      },
      {
        "@type": "Offer",
        priceCurrency: "CAD",
        priceSpecification: { "@type": "PriceSpecification", minPrice: 8, priceCurrency: "CAD", unitText: "LNF" },
        itemOffered: { "@type": "Service", name: "Calfeutrage de portes et fenetres", description: "Calfeutrage interieur et exterieur professionnel avec scellants certifies climat nordique. Elimination des infiltrations d'air et d'eau." },
      },
      {
        "@type": "Offer",
        priceCurrency: "CAD",
        priceSpecification: { "@type": "PriceSpecification", minPrice: 80, priceCurrency: "CAD" },
        itemOffered: { "@type": "Service", name: "Desembuage de vitres thermos", description: "Alternative economique au remplacement: desembuage professionnel des vitres thermos embuees. Economisez jusqu'a 50%." },
      },
      {
        "@type": "Offer",
        priceCurrency: "CAD",
        itemOffered: { "@type": "Service", name: "Insertion de porte", description: "Remplacement de l'insertion vitree de porte d'entree sans refaire le cadre. Installation en 1 jour. Economies 40% vs remplacement complet." },
      },
      {
        "@type": "Offer",
        priceCurrency: "CAD",
        priceSpecification: { "@type": "PriceSpecification", minPrice: 5, priceCurrency: "CAD", unitText: "LNF" },
        itemOffered: { "@type": "Service", name: "Coupe-froid de portes et fenetres", description: "Remplacement de coupe-froid uses: mousse, caoutchouc EPDM, silicone, brosse, vinyle. Fin des courants d'air et economies de chauffage." },
      },
    ],
  },
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Remplacement de vitre thermos" }, areaServed: { "@type": "State", name: "Quebec" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Remplacement de quincaillerie" }, areaServed: { "@type": "State", name: "Quebec" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Reparation de porte-patio" }, areaServed: { "@type": "State", name: "Quebec" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Reparation de porte-fenetre" }, areaServed: { "@type": "State", name: "Quebec" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Reparation et restauration de portes en bois" }, areaServed: { "@type": "State", name: "Quebec" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Moustiquaires sur mesure" }, areaServed: { "@type": "State", name: "Quebec" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Calfeutrage" }, areaServed: { "@type": "State", name: "Quebec" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Desembuage" }, areaServed: { "@type": "State", name: "Quebec" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Insertion de porte" }, areaServed: { "@type": "State", name: "Quebec" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Coupe-froid" }, areaServed: { "@type": "State", name: "Quebec" } },
    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Boutique de pieces pour portes et fenetres" }, areaServed: { "@type": "State", name: "Quebec" } },
  ],
  knowsAbout: [
    "Reparation de portes", "Reparation de fenetres", "Remplacement de vitres thermos",
    "Porte-patio", "Porte-fenetre", "Quincaillerie de porte et fenetre",
    "Calfeutrage", "Coupe-froid", "Desembuage", "Moustiquaires",
    "Portes en bois", "Restauration de portes", "Mecanismes multipoints",
    "Novatech", "Fenplast", "Lepage Millwork", "Jeld-Wen", "Kohltech",
  ],
  slogan: "Reparer au lieu de remplacer - Economies jusqu'a 70%",
  foundingDate: "2010",
  numberOfEmployees: { "@type": "QuantitativeValue", minValue: 5, maxValue: 20 },
  };
}

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
  const co = await getCompany();
  const jsonLd = buildLocalBusinessJsonLd(co);
  return (
    <html lang="fr" className="h-full antialiased scroll-smooth">
      <head>
        {/* Set lang="en" before React hydration when on /en/* — keeps the page statically cacheable */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var p=location.pathname;if(p==='/en'||p.indexOf('/en/')===0){document.documentElement.lang='en'}})();`,
          }}
        />
        <meta name="google-site-verification" content="LNVLJOda6YGvqjLQb_ZnVDd5ikvAwqv2HzXWJQDxQxA" />
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
          <Header company={co} />
          <main className="flex-1">{children}</main>
          <ConditionalFooter company={co} />
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
