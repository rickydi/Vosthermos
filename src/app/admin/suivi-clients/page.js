import { requireAdmin } from "@/lib/admin-auth";
import SuiviSimple from "./SuiviSimple";

export const dynamic = "force-dynamic";

export default async function SuiviClientsPage() {
  await requireAdmin();
  return <SuiviSimple />;
}
