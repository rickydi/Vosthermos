import { requireAdmin } from "@/lib/admin-auth";
import MenuAdminClient from "./MenuAdminClient";

export const dynamic = "force-dynamic";

export default async function MenuAdminPage() {
  await requireAdmin();
  return <MenuAdminClient />;
}
