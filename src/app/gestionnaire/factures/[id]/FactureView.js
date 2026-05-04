"use client";

import Link from "next/link";
import InvoiceSheet from "@/components/admin/InvoiceSheet";

export default function FactureView({ wo, company }) {
  const isInvoice = wo.statut === "invoiced" || wo.statut === "paid" || wo.statut === "sent";
  const label = isInvoice ? "Facture" : "Bon de commande";

  return (
    <div>
      <div className="print-hide" style={{
        padding: "14px 24px",
        background: "#002530",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        fontFamily: "Montserrat, sans-serif",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/gestionnaire?tab=factures" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: 13 }}>
            <i className="fas fa-arrow-left" style={{ marginRight: 6 }}></i>Retour
          </Link>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{label} {wo.number}</div>
            {wo.dueDate && isInvoice && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                Échéance : {new Date(wo.dueDate).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })} · Net {wo.paymentTermsDays} jours
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => window.print()}
            style={{
              padding: "8px 16px",
              background: "#e30718",
              color: "#fff",
              border: 0,
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <i className="fas fa-print" style={{ marginRight: 6 }}></i>Imprimer
          </button>
          <button
            onClick={() => window.print()}
            title="Utiliser 'Enregistrer en PDF' dans la fenêtre d'impression"
            style={{
              padding: "8px 16px",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <i className="fas fa-download" style={{ marginRight: 6 }}></i>Télécharger PDF
          </button>
        </div>
      </div>
      <InvoiceSheet wo={wo} company={company} />
    </div>
  );
}
