import { Suspense } from "react";
import ThermosOrdersClient from "./ThermosOrdersClient";

export const metadata = { title: "Commandes de thermos | Vosthermos Admin", robots: "noindex, nofollow" };

export default function ThermosOrdersPage() {
  return <Suspense fallback={<div className="p-8 admin-text-muted">Chargement…</div>}><ThermosOrdersClient /></Suspense>;
}
