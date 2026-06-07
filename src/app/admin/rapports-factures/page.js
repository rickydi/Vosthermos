import MonthlyInvoiceReportSection from "@/components/admin/MonthlyInvoiceReportSection";

export const dynamic = "force-dynamic";

export default function RapportsFacturesPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="admin-text text-2xl font-bold">Rapports factures</h1>
        <p className="admin-text-muted text-sm">
          Rapport mensuel comptable, PDF, CSV, envoi courriel et depot Drive.
        </p>
      </div>

      <MonthlyInvoiceReportSection compact />
    </div>
  );
}
