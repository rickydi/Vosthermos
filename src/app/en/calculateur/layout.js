export const metadata = {
  title: "Door & Window Savings Calculator | OPTI-FENETRE | Vosthermos",
  description:
    "Estimate how much you could save by restoring your doors and windows with OPTI-FENETRE instead of replacing them completely. Free Vosthermos tool.",
  alternates: {
    canonical: "https://www.vosthermos.com/en/calculateur",
    languages: {
      fr: "https://www.vosthermos.com/calculateur",
      en: "https://www.vosthermos.com/en/calculateur",
    },
  },
  openGraph: {
    type: "website",
    url: "https://www.vosthermos.com/en/calculateur",
    title: "Door & Window Savings Calculator | Vosthermos",
    description:
      "Compare full replacement costs with the OPTI-FENETRE restoration program and estimate your savings in a few clicks.",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
    locale: "en_CA",
  },
  robots: "index, follow",
};

export default function EnCalculateurLayout({ children }) {
  return children;
}
