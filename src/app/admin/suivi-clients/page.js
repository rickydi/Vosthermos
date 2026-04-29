import { requireAdmin } from "@/lib/admin-auth";
import SuiviClientsClient from "./SuiviClientsClient";

export const dynamic = "force-dynamic";

export default async function SuiviClientsPage() {
  await requireAdmin();
  return <SuiviClientsClient />;
}
