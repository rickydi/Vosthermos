import { redirect } from "next/navigation";

// Fusionne dans la page Factures (vue "Rapport mensuel").
export default function RapportsFacturesPage() {
  redirect("/admin/factures");
}
