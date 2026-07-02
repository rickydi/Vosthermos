import { redirect } from "next/navigation";

// Fusionne dans Gestionnaires (section Materiel de vente du portail).
export default function AdminVendeurPage() {
  redirect("/admin/gestionnaires");
}
