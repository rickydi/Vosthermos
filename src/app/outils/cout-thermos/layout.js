import { COMPANY_INFO } from "@/lib/company-info";

const URL = "https://www.vosthermos.com/outils/cout-thermos";

export const metadata = {
  title: "Calculateur cout thermos - Estimation gratuite | Vosthermos",
  description:
    "Estimez le cout de remplacement d'une vitre thermos selon ses dimensions. Calculateur gratuit avec fourchette de prix et alternative de desembuage.",
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    url: URL,
    title: "Calculateur cout thermos - Vosthermos",
    description:
      "Calculateur gratuit pour estimer le remplacement d'une vitre thermos selon largeur, hauteur et quantite.",
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
