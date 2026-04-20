export const metadata = {
  title: "Calculateur d'economies portes & fenetres | OPTI-FENETRE | Vosthermos",
  description:
    "Estimez vos economies en comparant la remise a neuf OPTI-FENETRE au remplacement complet de vos portes et fenetres. Outil gratuit Vosthermos.",
  alternates: {
    canonical: "https://www.vosthermos.com/calculateur",
    languages: {
      fr: "https://www.vosthermos.com/calculateur",
      en: "https://www.vosthermos.com/en/calculateur",
    },
  },
  openGraph: {
    type: "website",
    url: "https://www.vosthermos.com/calculateur",
    title: "Calculateur d'economies portes & fenetres | Vosthermos",
    description:
      "Comparez vos couts de remplacement complet avec le programme OPTI-FENETRE et estimez vos economies en quelques clics.",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
    locale: "fr_CA",
  },
  robots: "index, follow",
};

export default function CalculateurLayout({ children }) {
  return children;
}
