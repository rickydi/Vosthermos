import { COMPANY_INFO } from "@/lib/company-info";
export const metadata = {
  robots: "index, follow",
  other: {
    "geo.region": "CA-QC",
    "geo.placename": COMPANY_INFO.city,
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
  geo: { "@type": "GeoCoordinates", latitude: 45.3669, longitude: -73.5492 },
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
      geoMidpoint: { "@type": "GeoCoordinates", latitude: 45.3669, longitude: -73.5492 },
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
  identifier: COMPANY_INFO.rbqNumber
    ? { "@type": "PropertyValue", name: "RBQ licence", value: COMPANY_INFO.rbqNumber }
    : undefined,
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
