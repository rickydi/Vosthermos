import { COMPANY_INFO } from "@/lib/company-info";

const URL = "https://www.vosthermos.com/outils/quiz-diagnostic";

export const metadata = {
  title: "Quiz diagnostic portes et fenetres | Vosthermos",
  description:
    "Diagnostiquez un probleme de fenetre, porte-patio, porte-fenetre, moustiquaire ou quincaillerie en 3 questions avec une recommandation de service.",
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    url: URL,
    title: "Quiz diagnostic portes et fenetres - Vosthermos",
    description:
      "Outil gratuit pour identifier le probleme de votre porte ou fenetre et obtenir une recommandation de reparation.",
    images: [{ url: COMPANY_INFO.logo }],
    locale: "fr_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiz diagnostic portes et fenetres - Vosthermos",
    description: "Identifiez votre probleme de porte ou fenetre en 3 questions.",
    images: [COMPANY_INFO.logo],
  },
};

export default function QuizDiagnosticLayout({ children }) {
  return children;
}
