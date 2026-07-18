import { COMPANY_INFO } from "@/lib/company-info";

const URL = "https://www.vosthermos.com/outils/cout-thermos";

export const metadata = {
  title: "Calculateur cout thermos - Estimation gratuite | Vosthermos",
  description:
    "Dessinez votre fenetre et estimez le cout de remplacement de chaque vitre thermos selon les dimensions, le vitrage et les options choisies.",
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    url: URL,
    title: "Calculateur cout thermos - Vosthermos",
    description:
      "Calculateur visuel gratuit pour estimer le remplacement de vos vitres thermos selon leur forme, leurs dimensions et leurs options.",
    images: [{ url: COMPANY_INFO.logo }],
    locale: "fr_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculateur cout thermos - Vosthermos",
    description: "Estimez gratuitement le prix de remplacement d'une vitre thermos.",
    images: [COMPANY_INFO.logo],
  },
};

export default function CoutThermosLayout({ children }) {
  return children;
}
