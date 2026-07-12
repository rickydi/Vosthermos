import MeasurementPublicClient from "./MeasurementPublicClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Prendre les mesures de vos fenêtres | VosThermos",
  description: "Lien privé VosThermos pour photographier et mesurer vos fenêtres.",
  robots: "noindex, nofollow",
  referrer: "no-referrer",
};

export default async function PublicMeasurementPage({ params }) {
  const { token } = await params;
  return <MeasurementPublicClient token={token} />;
}
