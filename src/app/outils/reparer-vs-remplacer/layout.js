import { COMPANY_INFO } from "@/lib/company-info";

const URL = "https://www.vosthermos.com/outils/reparer-vs-remplacer";

export const metadata = {
  title: "Reparer ou remplacer une fenetre? Comparateur | Vosthermos",
  description:
    "Comparez reparation et remplacement selon l'age, l'etat du cadre et le probleme observe. Outil gratuit avec cout, garantie et impact environnemental.",
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    url: URL,
    title: "Reparer ou remplacer une fenetre? - Vosthermos",
    description:
      "Comparateur gratuit pour choisir entre reparer ou remplacer une porte ou fenetre.",
    images: [{ url: COMPANY_INFO.logo }],
    locale: "fr_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reparer ou remplacer une fenetre? - Vosthermos",
    description: "Comparez cout, duree, garantie et impact environnemental.",
    images: [COMPANY_INFO.logo],
  },
};

export default function RepairVsReplaceLayout({ children }) {
  return children;
}
