import MeasurementAdminClient from "./MeasurementAdminClient";

export const metadata = { title: "Fiche de mesures | Vosthermos Admin", robots: "noindex, nofollow" };

export default async function AdminMeasurementPage({ params }) {
  const { id } = await params;
  return <MeasurementAdminClient id={id} />;
}
