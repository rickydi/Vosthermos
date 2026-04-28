import { redirect } from "next/navigation";

export default async function ReparationPortesFenetresVilleEnRedirect({ params }) {
  const { ville } = await params;
  redirect(`/en/services/sealed-glass-replacement/${ville}`);
}
