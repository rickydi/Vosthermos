import MeasurementTechnicianClient from "./MeasurementTechnicianClient";

export const metadata = { title: "Mesures thermos | Vosthermos Terrain", robots: "noindex, nofollow" };

export default async function TechnicianMeasurementPage({ params }) {
  const { id } = await params;
  return <MeasurementTechnicianClient id={id} />;
}
