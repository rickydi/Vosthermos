"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import InvoiceSheet from "@/components/admin/InvoiceSheet";

// Map DB snake_case settings to InvoiceSheet company prop shape
function mapCompany(s) {
  if (!s || typeof s !== "object") return null;
  return {
    legal: s.company_legal_name || s.company_neq || "",
    address: s.company_address || "",
    city: s.company_city || "",
    postalCode: s.company_postal_code || "",
    phone: s.company_phone || "",
    email: s.company_email || "",
    web: s.company_web || "",
    tps: s.tps_number || "",
    tvq: s.tvq_number || "",
  };
}

export default function BonDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [wo, setWo] = useState(null);
  const [company, setCompany] = useState(null);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [emailTo, setEmailTo] = useState("");

  useEffect(() => {
    fetch(`/api/admin/work-orders/${id}`)
      .then((r) => r.json())
      .then((data) => { setWo(data); setEmailTo(data?.client?.email || ""); })
      .catch(() => {});
    fetch("/api/admin/settings?section=company")
      .then((r) => r.json())
      .then((s) => { if (s && !s.error) setCompany(mapCompany(s)); })
      .catch(() => {});
  }, [id]);

  async function handleDelete() {
    if (!confirm(`Supprimer definitivement le bon ${wo?.number || `#${id}`}? Cette action est irreversible.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/work-orders/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur de suppression");
      }
      router.push("/admin/bons");
    } catch (err) {
      setMsg(err.message);
      setDeleting(false);
    }
  }

  async function sendEmail() {
    if (!emailTo.trim()) { setMsg("Adresse email requise"); return; }
    setSending(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/work-orders/${id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: emailTo.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'envoi");
      setMsg(`Envoye a ${data.to}`);
      setShowEmail(false);
      const refreshed = await fetch(`/api/admin/work-orders/${id}`).then((r) => r.json());
      setWo(refreshed);
    } catch (err) {
      setMsg(err.message);
    }
    setSending(false);
  }

  if (!wo) return (
    <div className="p-6 lg:p-8 text-center py-12 admin-text-muted">
      <i className="fas fa-spinner fa-spin text-2xl"></i>
    </div>
  );

  const statusColors = {
    draft: "bg-yellow-500/20 text-yellow-400",
    completed: "bg-green-500/20 text-green-400",
    sent: "bg-blue-500/20 text-blue-400",
  };
  const statusLabels = { draft: "Brouillon", completed: "Complete", sent: "Envoye" };

  return (
    <div className="p-6 lg:p-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print-hide">
        <div className="flex items-center gap-3">
          <Link href="/admin/bons" className="admin-text-muted text-sm hover:admin-text">
            <i className="fas fa-arrow-left mr-2"></i>Retour
          </Link>
          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColors[wo.statut] || ""}`}>
            {statusLabels[wo.statut] || wo.statut}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/bons/nouveau?edit=${id}`}
            className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
            <i className="fas fa-pen mr-2"></i>Modifier
          </Link>
          <button onClick={() => setShowEmail(true)}
            className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium">
            <i className="fas fa-envelope mr-2"></i>Envoyer par email
          </button>
          <button onClick={() => window.print()}
            className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm font-medium">
            <i className="fas fa-print mr-2"></i>Imprimer
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-colors disabled:opacity-50">
            <i className={`fas ${deleting ? "fa-spinner fa-spin" : "fa-trash"} mr-2`}></i>
            {deleting ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 admin-card border admin-border rounded-lg text-sm admin-text print-hide">
          {msg}
        </div>
      )}

      {/* Email modal */}
      {showEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm print-hide"
          onClick={() => setShowEmail(false)}>
          <div className="bg-white text-gray-900 border border-gray-200 rounded-xl w-full max-w-md p-6 shadow-2xl dark:bg-gray-900 dark:text-white dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Envoyer la facture par email</h3>
            <label className="text-xs mb-1 block text-gray-500 dark:text-gray-400">Destinataire</label>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm w-full mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowEmail(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm">
                Annuler
              </button>
              <button onClick={sendEmail} disabled={sending}
                className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {sending ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice sheet — WYSIWYG 8.5x11, paginated, prints 1:1 */}
      <InvoiceSheet wo={wo} company={company} />

      {/* Admin-only extras (NOT in print): signature + photos */}
      {(wo.signatureUrl || (wo.photos && wo.photos.length > 0)) && (
        <div className="max-w-5xl mx-auto mt-8 space-y-6 print-hide">
          {wo.signatureUrl && (
            <div className="admin-card border rounded-xl p-6">
              <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-2">
                Signature du client
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={wo.signatureUrl} alt="Signature" className="max-h-28 bg-white p-2 rounded" />
            </div>
          )}

          {wo.photos?.length > 0 && (
            <div className="admin-card border rounded-xl p-6">
              <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-3">
                Photos ({wo.photos.length})
              </p>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {wo.photos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
