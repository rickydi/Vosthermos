import MeasurementPublicClient from "./MeasurementPublicClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Prendre les mesures de vos fenêtres | VosThermos",
  description: "Lien privé VosThermos pour photographier et mesurer vos fenêtres.",
  robots: "noindex, nofollow",
  referrer: "no-referrer",
};

export default async function PublicMeasurementPage({ params, searchParams }) {
  const { token } = await params;
  const query = await searchParams;
  const requestedLanguage = String(query?.lang || "").trim();
  const language = requestedLanguage
    ? requestedLanguage.toLowerCase().startsWith("en") ? "en" : "fr"
    : undefined;
  return <MeasurementPublicClient token={token} language={language} />;
}
