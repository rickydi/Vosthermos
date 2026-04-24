import { COMPANY_INFO } from "@/lib/company-info";
export const metadata = {
  robots: "index, follow",
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
  telephone: COMPANY_INFO.phoneTel,
  email: COMPANY_INFO.email,
  image: COMPANY_INFO.logo,
  logo: COMPANY_INFO.logo,
  address: {
    "@type": "PostalAddress",
    streetAddress: COMPANY_INFO.address,
    addressLocality: COMPANY_INFO.city,
    addressRegion: COMPANY_INFO.province,
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
