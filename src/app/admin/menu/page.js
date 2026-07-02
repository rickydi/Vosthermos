import { redirect } from "next/navigation";

// Fusionne dans Parametres (section Menu admin).
export default function MenuAdminPage() {
  redirect("/admin/parametres#menu-admin");
}
