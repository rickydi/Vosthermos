import SupplierConfirmationClient from "./SupplierConfirmationClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Confirmation de commande | VosThermos", robots: "noindex, nofollow", referrer: "no-referrer" };

export default async function SupplierConfirmationPage({ params, searchParams }) {
  const { token } = await params;
  const query = await searchParams;
  const initialAnswer = ["yes", "no"].includes(query?.answer) ? query.answer : "";
  return <SupplierConfirmationClient token={token} initialAnswer={initialAnswer} />;
}
