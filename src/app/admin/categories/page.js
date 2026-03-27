import { requireAdmin } from "@/lib/admin-auth";
import CategoriesManager from "@/components/admin/CategoriesManager";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  return <CategoriesManager />;
}
