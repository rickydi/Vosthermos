import { redirect } from "next/navigation";

// Fusionne dans Parametres (section Administrateurs).
export default function AdminUsersPage() {
  redirect("/admin/parametres#administrateurs");
}
