import { COMPANY_INFO } from "@/lib/company-info";

export const metadata = {
  title: "Contact Vosthermos | Free Quote for Door and Window Repair",
  description:
    `Contact Vosthermos for a free quote within 24 hours. Door, window, patio door and sealed glass repair across Montreal and the South Shore. ${COMPANY_INFO.phone}`,
  alternates: {
    canonical: "https://www.vosthermos.com/en/contact",
    languages: {
      "fr-CA": "https://www.vosthermos.com/contact",
      "en-CA": "https://www.vosthermos.com/en/contact",
      "x-default": "https://www.vosthermos.com/contact",
    },
  },
  openGraph: {
    type: "website",
    url: "https://www.vosthermos.com/en/contact",
    siteName: "Vosthermos",
    title: `Contact Vosthermos | Free Quote - ${COMPANY_INFO.phone}`,
    description:
      "Free quote within 24 hours for door, window and sealed glass repairs in Montreal and the South Shore.",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Vosthermos | Free Quote",
    description: `Door and window repair - Montreal and South Shore - ${COMPANY_INFO.phone}`,
    images: ["https://www.vosthermos.com/images/Vos-Thermos-Logo.png"],
  },
  robots: "index, follow",
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://www.vosthermos.com/en/contact#page",
  url: "https://www.vosthermos.com/en/contact",
  name: "Contact Vosthermos",
  description:
    "Vosthermos contact page for free door, window and sealed glass repair quotes.",
  mainEntity: {
    "@type": "LocalBusiness",
    "@id": "https://www.vosthermos.com/#business",
    name: "Vosthermos",
    telephone: COMPANY_INFO.phoneTel,
    email: COMPANY_INFO.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY_INFO.address,
      addressLocality: COMPANY_INFO.city,
      addressRegion: COMPANY_INFO.province,
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
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.vosthermos.com/en/" },
    { "@type": "ListItem", position: 2, name: "Contact", item: "https://www.vosthermos.com/en/contact" },
  ],
};

export default function ContactEnLayout({ children }) {
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
