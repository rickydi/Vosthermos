"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import InvoiceSheet from "@/components/admin/InvoiceSheet";
import { formatDateOnly } from "@/lib/date-only";

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
    rbq: s.rbq_number || "",
  };
}

function formatPhoneForWhatsapp(phone) {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return digits;
  return digits;
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
  const [showApprove, setShowApprove] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/work-orders/${id}`)
      .then((r) => r.json())
      .then((data) => { setWo(data); setEmailTo(data?.client?.email || ""); setSelectedTechId(data?.technicianId ? String(data.technicianId) : ""); })
      .catch(() => {});
    fetch("/api/admin/settings?section=company")
      .then((r) => r.json())
      .then((s) => { if (s && !s.error) setCompany(mapCompany(s)); })
      .catch(() => {});
    fetch("/api/admin/technicians")
      .then((r) => r.json())
      .then((d) => setTechnicians(Array.isArray(d) ? d : (d.technicians || [])))
      .catch(() => {});
  }, [id]);

  async function approveAndSend() {
    if (!selectedTechId) { setMsg("Choisissez un technicien."); return; }
    const tech = technicians.find((t) => String(t.id) === String(selectedTechId));
    if (!tech) { setMsg("Technicien introuvable."); return; }
    if (!tech.phone) { setMsg(`${tech.name} n'a pas de numéro de téléphone dans la DB.`); return; }

    const isReassign = wo.statut !== "draft";
    const previousTechName = wo.technician?.name || null;

    setApproving(true);
    setMsg("");
    try {
      const payload = { technicianId: Number(selectedTechId) };
      if (!isReassign) payload.statut = "scheduled";
      const res = await fetch(`/api/admin/work-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erreur mise à jour");
      }

      const phone = formatPhoneForWhatsapp(tech.phone);
      const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://www.vosthermos.com";
      const datePart = wo.date ? formatDateOnly(wo.date, { weekday: "long", day: "numeric", month: "long" }) : "";
      const unitsPart = wo.sections?.length > 0 ? wo.sections.map((s) => s.unitCode).join(", ") : "";
      const addressPart = [wo.interventionAddress, wo.interventionCity].filter(Boolean).join(", ") || wo.client?.address || "";

      const header = isReassign
        ? (previousTechName && previousTechName !== tech.name
            ? `Bon ${wo.number} — réassigné (anciennement ${previousTechName})`
            : `Rappel bon ${wo.number}`)
        : `Nouveau bon ${wo.number}`;

      const lines = [
        header,
        "",
        `Client : ${wo.client?.name || "—"}`,
        addressPart ? `Adresse : ${addressPart}` : null,
        datePart ? `Date : ${datePart}` : null,
        unitsPart ? `Unités : ${unitsPart}` : null,
        "",
        "Demande :",
        (wo.description || "").trim(),
        "",
        `Détails : ${siteUrl}/admin/bons/${id}`,
      ].filter((l) => l !== null).join("\n");

      const wa = `https://wa.me/${phone}?text=${encodeURIComponent(lines)}`;
      window.open(wa, "_blank", "noopener,noreferrer");

      const refreshed = await fetch(`/api/admin/work-orders/${id}`).then((r) => r.json());
      setWo(refreshed);
      setShowApprove(false);
      setMsg(isReassign
        ? `Réassigné à ${tech.name}. WhatsApp ouvert.`
        : `Approuvé et assigné à ${tech.name}. WhatsApp ouvert.`);
    } catch (err) {
      setMsg(err.message);
    }
    setApproving(false);
  }

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
    scheduled: "bg-blue-500/20 text-blue-400",
    in_progress: "bg-purple-500/20 text-purple-400",
    completed: "bg-green-500/20 text-green-400",
    invoiced: "bg-orange-500/20 text-orange-400",
    paid: "bg-emerald-500/20 text-emerald-400",
    sent: "bg-blue-500/20 text-blue-400",
  };
  const statusLabels = {
    draft: "Brouillon",
    scheduled: "Job planifie",
    in_progress: "En cours",
    completed: "Job fait",
    invoiced: "Facturé",
    paid: "Payé",
    sent: "Envoyé",
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print-hide">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/admin/bons" className="admin-text-muted text-sm hover:admin-text">
            <i className="fas fa-arrow-left mr-2"></i>Retour
          </Link>
          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusColors[wo.statut] || ""}`}>
            {statusLabels[wo.statut] || wo.statut}
          </span>
          {wo.createdAt && (
            <span className="admin-text-muted text-xs">
              <i className="far fa-clock mr-1"></i>
              Demandé le {new Date(wo.createdAt).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })} à {new Date(wo.createdAt).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {wo.statut === "draft" && typeof wo.notes === "string" && wo.notes.startsWith("Demande du gestionnaire") && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-500 text-white uppercase tracking-wider animate-pulse">
              <i className="fas fa-bell mr-1"></i>Nouvelle demande
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {wo.statut === "draft" && (
            <button
              onClick={() => setShowApprove(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold"
            >
              <i className="fab fa-whatsapp mr-2"></i>Approuver &amp; envoyer WhatsApp
            </button>
          )}
          {(wo.statut === "scheduled" || wo.statut === "in_progress") && (
            <button
              onClick={() => setShowApprove(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold"
              title={wo.technician?.name ? `Actuellement assigné à ${wo.technician.name}` : "Aucun technicien assigné"}
            >
              <i className="fab fa-whatsapp mr-2"></i>Réassigner &amp; renvoyer WhatsApp
            </button>
          )}
          {(wo.statut === "scheduled" || wo.statut === "in_progress" || wo.statut === "completed") && (
            <Link
              href={`/admin/bons/nouveau?edit=${id}&mode=invoice`}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold inline-flex items-center"
            >
              <i className="fas fa-file-invoice-dollar mr-2"></i>
              Facturer ce bon
            </Link>
          )}
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

      {/* Approve + WhatsApp modal */}
      {showApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm print-hide"
          onClick={() => !approving && setShowApprove(false)}>
          <div className="bg-white text-gray-900 border border-gray-200 rounded-xl w-full max-w-md p-6 shadow-2xl dark:bg-gray-900 dark:text-white dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-1">
              <i className="fab fa-whatsapp text-green-500 mr-2"></i>
              {wo.statut === "draft" ? "Approuver et envoyer" : "Réassigner et renvoyer"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {wo.statut === "draft"
                ? "Le bon passera en \"Planifié\", le technicien sera assigné, et WhatsApp s'ouvrira avec le message pré-rempli."
                : `Le bon sera réassigné au nouveau technicien et WhatsApp s'ouvrira pour l'aviser.${wo.technician?.name ? ` Actuellement : ${wo.technician.name}.` : ""}`}
            </p>

            <label className="text-xs mb-1 block text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Technicien</label>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            >
              <option value="">— Sélectionner —</option>
              {technicians.filter((t) => t.isActive).map((t) => (
                <option key={t.id} value={t.id}>{t.name}{t.phone ? ` · ${t.phone}` : " · pas de téléphone"}</option>
              ))}
            </select>

            {selectedTechId && (() => {
              const tech = technicians.find((t) => String(t.id) === String(selectedTechId));
              if (!tech?.phone) return <p className="text-xs text-red-500 mb-4"><i className="fas fa-exclamation-triangle mr-1"></i>Pas de numéro de téléphone pour ce technicien.</p>;
              return (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4 text-xs text-gray-700 dark:text-gray-300">
                  <div className="font-bold mb-1">Aperçu du message WhatsApp :</div>
                  <div className="whitespace-pre-wrap font-mono text-[11px]">{`Nouveau bon ${wo.number}\n\nClient : ${wo.client?.name || "—"}\n...\nDétails : /admin/bons/${id}`}</div>
                </div>
              );
            })()}

            {msg && <p className="text-sm text-red-500 mb-3">{msg}</p>}

            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowApprove(false)} disabled={approving}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm disabled:opacity-50">
                Annuler
              </button>
              <button onClick={approveAndSend} disabled={approving || !selectedTechId}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-2">
                <i className={approving ? "fas fa-spinner fa-spin" : "fab fa-whatsapp"}></i>
                {approving ? "Traitement..." : (wo.statut === "draft" ? "Approuver & envoyer" : "Réassigner & renvoyer")}
              </button>
            </div>
          </div>
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
