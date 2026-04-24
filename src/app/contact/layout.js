import { COMPANY_INFO } from "@/lib/company-info";
export const metadata = {
  title: "Contact Vosthermos | Soumission gratuite portes & fenêtres — Montréal, Rive-Sud, Laval",
  description:
    `Contactez Vosthermos pour une soumission gratuite en 24h. Réparation de portes, fenêtres et vitres thermos. 15 ans d'expérience, garantie 10 ans. Montréal, Laval, Longueuil, Rive-Sud ☎ ${COMPANY_INFO.phone}`,
  alternates: { canonical: "https://www.vosthermos.com/contact" },
  openGraph: {
    type: "website",
    url: "https://www.vosthermos.com/contact",
    siteName: "Vosthermos",
    title: `Contact Vosthermos | Soumission gratuite 24h — ${COMPANY_INFO.phone}`,
    description:
      "Soumission gratuite en 24h pour réparation de vos portes, fenêtres et vitres thermos. Montréal, Laval, Rive-Sud. 15 ans d'expérience.",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
    locale: "fr_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Vosthermos | Soumission gratuite 24h",
    description: `Réparation portes & fenêtres — Montréal, Laval, Rive-Sud ☎ ${COMPANY_INFO.phone}`,
    images: ["https://www.vosthermos.com/images/Vos-Thermos-Logo.png"],
  },
  robots: "index, follow",
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://www.vosthermos.com/contact#page",
  url: "https://www.vosthermos.com/contact",
  name: "Contact Vosthermos",
  description:
    "Page de contact Vosthermos pour soumission gratuite de réparation de portes, fenêtres et vitres thermos.",
  mainEntity: {
    "@type": "LocalBusiness",
    "@id": "https://www.vosthermos.com/#business",
    name: "Vosthermos",
    telephone: "+15148258411",
    email: COMPANY_INFO.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY_INFO.address,
      addressLocality: COMPANY_INFO.city,
      addressRegion: "QC",
      postalCode: COMPANY_INFO.postalCode,
      addressCountry: "CA",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "10:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "10:00",
        closes: "13:00",
      },
    ],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.vosthermos.com/" },
    { "@type": "ListItem", position: 2, name: "Contact", item: "https://www.vosthermos.com/contact" },
  ],
};

export default function ContactLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
