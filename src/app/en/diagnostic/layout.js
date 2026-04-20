export const metadata = {
  title: "Door & Window Diagnostic Tool | Vosthermos",
  description:
    "Answer two questions to identify your door or window problem, estimate the cost, and find the right Vosthermos service.",
  alternates: {
    canonical: "https://www.vosthermos.com/en/diagnostic",
    languages: {
      fr: "https://www.vosthermos.com/diagnostic",
      en: "https://www.vosthermos.com/en/diagnostic",
    },
  },
  openGraph: {
    type: "website",
    url: "https://www.vosthermos.com/en/diagnostic",
    title: "Door & Window Diagnostic Tool | Vosthermos",
    description:
      "Quickly diagnose the issue, get an estimated cost, and navigate to the right service or pricing page.",
    images: [{ url: "https://www.vosthermos.com/images/Vos-Thermos-Logo.png" }],
    locale: "en_CA",
  },
  robots: "index, follow",
};

export default function EnDiagnosticLayout({ children }) {
  return children;
}
