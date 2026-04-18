import { COMPANY_INFO } from "@/lib/company-info";
export const metadata = {
  title: "Vosthermos | Door and Window Repair | Montreal, South Shore",
  description:
    `Door and window repair experts for over 15 years. Sealed glass unit replacement with professional guaranteed service, hardware, wooden doors, screen doors. Fast service Montreal, South Shore and 100km radius. Free quote ${COMPANY_INFO.phone}. Online parts store.`,
  keywords:
    "door window repair, sealed glass unit, thermos glass replacement, hardware replacement, custom screen door, patio door, wooden door, window caulking, defogging, weatherstripping, door insert, door window parts shop, door window hardware online, Saint-Francois-Xavier, Montreal, South Shore, Laval, Longueuil, Brossard, Granby, Saint-Hyacinthe, Terrebonne, Repentigny",
  authors: [{ name: "Vosthermos" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://www.vosthermos.com/en/",
    languages: {
      fr: "https://www.vosthermos.com/",
      en: "https://www.vosthermos.com/en/",
    },
  },
  openGraph: {
    type: "website",
    url: "https://www.vosthermos.com/en/",
    title: "Vosthermos | Door and Window Repair | Montreal, South Shore",
    description:
      "Door and window repair experts for over 15 years. Online parts store. Free quote.",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vosthermos | Door and Window Repair",
    description:
      `Door and window repair experts for over 15 years. Free quote ${COMPANY_INFO.phone}.`,
    images: ["https://www.vosthermos.com/images/Vos-Thermos-Logo.png"],
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
    "Door and window repair experts for over 15 years. Sealed glass unit replacement with professional guaranteed service, hardware, wooden doors and custom screen doors. Online store with 740+ parts.",
  url: "https://www.vosthermos.com/en",
  telephone: "+15148258411",
  email: COMPANY_INFO.email,
  image: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png",
  logo: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "330 Ch. St-Francois-Xavier, Suite 101",
    addressLocality: "Saint-Francois-Xavier",
    addressRegion: "QC",
    postalCode: COMPANY_INFO.postalCode,
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
    {
      "@type": "GeoCircle",
      geoMidpoint: { "@type": "GeoCoordinates", latitude: 45.371, longitude: -73.457 },
      geoRadius: "100000",
    },
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
  ],
};

export default function EnLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
