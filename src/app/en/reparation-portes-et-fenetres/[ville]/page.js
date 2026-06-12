import { permanentRedirect } from "next/navigation";

export default async function ReparationPortesFenetresVilleEnRedirect({ params }) {
  const { ville } = await params;
  permanentRedirect(`/en/services/sealed-glass-replacement/${ville}`);
}
