"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDateOnly } from "@/lib/date-only";
import { buildWhatsAppUrl, openWhatsAppWindow } from "@/lib/whatsapp";
import {
  adminDocumentDetailHref,
  adminDocumentEditHref,
  adminDocumentListHref,
  adminDocumentListLabel,
  adminDocumentTypeFromPathname,
} from "@/lib/admin-document-routes";
import { getWorkOrderDocumentMeta, getWorkOrderDocumentType, isQuoteStatus } from "@/lib/work-order-document";
import { workOrderStatusClass, workOrderStatusLabel } from "@/lib/work-order-status";
import {
  buildFriendlyDocumentEmailBody,
  emailGreetingName,
  isFriendlyBusinessClient,
  personalizeDocumentEmailText,
} from "@/lib/b2b-email-tone";

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

const JASON_WHATSAPP_PHONE = "15148258411";

function formatPhoneForWhatsapp(phone) {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return digits;
  return digits;
}

function adminAbsoluteUrl(path) {
  if (typeof window === "undefined") return `https://www.vosthermos.com${path}`;
  return `${window.location.origin}${path}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
  }).format(Number(value) || 0);
}

function workOrderAddressLine(wo) {
  return [wo?.interventionAddress, wo?.interventionCity, wo?.interventionPostalCode]
    .filter(Boolean)
    .join(", ")
    || [wo?.client?.address, wo?.client?.city, wo?.client?.postalCode]
      .filter(Boolean)
      .join(", ");
}

function documentDateLabel(documentMeta) {
  if (documentMeta.type === "invoice") return "Date facture";
  if (documentMeta.type === "quote") return "Date soumission";
  return "Date prevue";
}

function buildJasonDocumentMessage(wo, documentMeta, detailHref) {
  const documentUrl = adminAbsoluteUrl(detailHref || `/admin/bons/${wo.id}`);
  const pdfUrl = adminAbsoluteUrl(`/api/admin/work-orders/${wo.id}/pdf?documentType=${documentMeta.type}&inline=1`);
  const address = workOrderAddressLine(wo);
  const date = wo.date ? formatDateOnly(wo.date, { weekday: "long", day: "numeric", month: "long" }) : "";
  const units = wo.sections?.length > 0 ? wo.sections.map((section) => section.unitCode).filter(Boolean).join(", ") : "";
  const description = String(wo.description || "").trim();

  return [
    `${documentMeta.label} Vosthermos${wo.number ? ` ${wo.number}` : ""}`,
    "",
    `Client : ${wo.client?.name || "-"}`,
    wo.client?.phone ? `Tel : ${wo.client.phone}` : null,
    address ? `Adresse : ${address}` : null,
    date ? `${documentDateLabel(documentMeta)} : ${date}` : null,
    units ? `Unites : ${units}` : null,
    `Total : ${formatCurrency(wo.total)}`,
    wo.technician?.name ? `Technicien : ${wo.technician.name}` : null,
    description ? "" : null,
    description ? `Description : ${description}` : null,
    "",
    `Document admin : ${documentUrl}`,
    `PDF : ${pdfUrl}`,
  ].filter((line) => line !== null).join("\n");
}

function emailDraftStorageKey(workOrderId) {
  return `vosthermos:document-email-draft:${workOrderId}`;
}

function defaultEmailSubject(wo, documentMeta) {
  const number = wo?.number ? ` ${wo.number}` : "";
  return `${documentMeta.subjectPrefix}${number} - Vosthermos`;
}

function personalizeEmailBody(body, client) {
  return personalizeDocumentEmailText(body, client);
}

function defaultEmailBody(wo, documentMeta) {
  if (isFriendlyBusinessClient(wo?.client)) {
    return buildFriendlyDocumentEmailBody(wo, documentMeta);
  }

  const name = emailGreetingName(wo?.client);
  return [
    `Bonjour${name ? ` ${name}` : ""},`,
    "",
    documentMeta.emailIntro,
    "",
    "Le PDF est joint a ce courriel.",
    "",
    documentMeta.emailQuestion,
    "",
    "Merci,",
    "Vosthermos",
  ].join("\n");
}

export default function BonDetailPage({ forcedDocumentType = null } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { id } = useParams();
  const [wo, setWo] = useState(null);
  const [company, setCompany] = useState(null);
  const pdfFrameRef = useRef(null);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showApprove, setShowApprove] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [approving, setApproving] = useState(false);
  const [acceptingQuote, setAcceptingQuote] = useState(false);

  const pathDocumentType = forcedDocumentType || adminDocumentTypeFromPathname(pathname);

  function adminDocumentTypeFor(statut) {
    if (!statut) return pathDocumentType || "work_order";
    const statusType = getWorkOrderDocumentType(statut);
    return statusType;
  }

  useEffect(() => {
    fetch(`/api/admin/work-orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setWo(data);
        setSelectedTechId(data?.technicianId ? String(data.technicianId) : "");

        const meta = getWorkOrderDocumentMeta(data?.statut);
        setEmailTo(data?.client?.email || "");
        setEmailSubject(defaultEmailSubject(data, meta));
        setEmailBody(defaultEmailBody(data, meta));

        try {
          const key = emailDraftStorageKey(data?.id || id);
          const stored = JSON.parse(window.localStorage.getItem(key) || "null");
          if (stored && typeof stored === "object") {
            setEmailTo(stored.to || data?.client?.email || "");
            setEmailSubject(stored.subject || defaultEmailSubject(data, meta));
            setEmailBody(personalizeEmailBody(stored.body || defaultEmailBody(data, meta), data?.client));
            window.localStorage.removeItem(key);
            setShowEmail(true);
          }
        } catch {}
      })
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

    const shouldSchedule = wo.statut === "draft" || wo.statut === "quote_accepted";
    const isReassign = !shouldSchedule;
    const previousTechName = wo.technician?.name || null;

    setApproving(true);
    setMsg("");
    try {
      const payload = { technicianId: Number(selectedTechId) };
      if (shouldSchedule) {
        payload.statut = "scheduled";
        payload.followUpStatus = "scheduled";
      }
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
        : (wo.statut === "quote_accepted" ? `Soumission acceptee ${wo.number} - a planifier` : `Nouveau bon ${wo.number}`);

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

      openWhatsAppWindow(buildWhatsAppUrl(phone, lines));

      const refreshed = await fetch(`/api/admin/work-orders/${id}`).then((r) => r.json());
      setWo(refreshed);
      setShowApprove(false);
      setMsg(isReassign
        ? `Réassigné à ${tech.name}. WhatsApp ouvert.`
        : `Approuve et assigne a ${tech.name}. WhatsApp ouvert.`);
    } catch (err) {
      setMsg(err.message);
    }
    setApproving(false);
  }

  async function markQuoteAccepted() {
    setAcceptingQuote(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/work-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: "quote_accepted", followUpStatus: "won" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur mise a jour");
      }
      const refreshed = await fetch(`/api/admin/work-orders/${id}`).then((r) => r.json());
      setWo(refreshed);
      setMsg("Soumission marquee acceptee. Vous pouvez maintenant planifier le bon.");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setAcceptingQuote(false);
    }
  }

  async function handleDelete() {
    const deleteDocumentType = adminDocumentTypeFor(wo?.statut);
    const deleteDocumentMeta = getWorkOrderDocumentMeta(wo?.statut, deleteDocumentType);
    if (!confirm(`Supprimer definitivement ${deleteDocumentMeta.label.toLowerCase()} ${wo?.number || `#${id}`}? Cette action est irreversible.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/work-orders/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur de suppression");
      }
      router.push(adminDocumentListHref(deleteDocumentType));
    } catch (err) {
      setMsg(err.message);
      setDeleting(false);
    }
  }

  async function sendEmail() {
    if (!emailTo.trim()) {
      setEmailError("Adresse email requise");
      return;
    }
    const emailDocumentMeta = getWorkOrderDocumentMeta(wo?.statut);
    setSending(true);
    setMsg("");
    setEmailError("");
    try {
      const res = await fetch(`/api/admin/work-orders/${id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo.trim(),
          subject: emailSubject.trim(),
          message: emailBody.trim(),
          documentType: emailDocumentMeta.type,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur d'envoi");
      setMsg(`Envoye a ${data.to}`);
      setShowEmail(false);
      const refreshed = await fetch(`/api/admin/work-orders/${id}`).then((r) => r.json());
      setWo(refreshed);
    } catch (err) {
      setEmailError(err.message || "Erreur d'envoi");
    } finally {
      setSending(false);
    }
  }

  function sendDocumentToJason() {
    const meta = getWorkOrderDocumentMeta(wo?.statut);
    const message = buildJasonDocumentMessage(wo, meta, detailHref);
    const popup = openWhatsAppWindow(buildWhatsAppUrl(JASON_WHATSAPP_PHONE, message), 0);
    setMsg(popup
      ? `${meta.label} ${wo.number || ""} pret a envoyer a Jason sur WhatsApp.`
      : "WhatsApp a ete bloque par le navigateur. Autorisez les popups, puis reessayez.");
  }

  if (!wo) return (
    <div className="p-6 lg:p-8 text-center py-12 admin-text-muted">
      <i className="fas fa-spinner fa-spin text-2xl"></i>
    </div>
  );

  const documentMeta = getWorkOrderDocumentMeta(wo.statut);
  const adminDocumentType = adminDocumentTypeFor(wo.statut);
  const detailHref = adminDocumentDetailHref(id, adminDocumentType);
  const editHref = adminDocumentEditHref(id, adminDocumentType);
  const listHref = adminDocumentListHref(adminDocumentType);
  const listLabel = adminDocumentListLabel(adminDocumentType);
  const quoteCanBeAccepted = isQuoteStatus(wo.statut) && wo.statut !== "quote_accepted";
  const quoteReadyToSchedule = wo.statut === "quote_accepted";
  const canAssignWorkOrder = wo.statut === "draft" || quoteReadyToSchedule;
  const neutralActionClass = "px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50";
  const neutralLinkActionClass = `${neutralActionClass} inline-flex items-center`;

  return (
    <div className="p-6 lg:p-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print-hide">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href={editHref} className="admin-text-muted text-sm hover:admin-text">
            <i className="fas fa-arrow-left mr-2"></i>Retour a la modification
          </Link>
          <Link href={listHref} className="admin-text-muted text-sm hover:admin-text">
            {listLabel}
          </Link>
          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${workOrderStatusClass(wo.statut)}`}>
            {workOrderStatusLabel(wo.statut)}
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
          {quoteCanBeAccepted && (
            <button
              onClick={markQuoteAccepted}
              disabled={acceptingQuote}
              className={neutralActionClass}
            >
              <i className={`fas ${acceptingQuote ? "fa-spinner fa-spin" : "fa-check"} mr-2`}></i>
              {acceptingQuote ? "Mise a jour..." : "Marquer acceptee"}
            </button>
          )}
          {canAssignWorkOrder && (
            <button
              onClick={() => setShowApprove(true)}
              className={neutralActionClass}
            >
              <i className="fab fa-whatsapp mr-2"></i>{quoteReadyToSchedule ? "Planifier & envoyer WhatsApp" : "Approuver & envoyer WhatsApp"}
            </button>
          )}
          {(wo.statut === "scheduled" || wo.statut === "in_progress") && (
            <button
              onClick={() => setShowApprove(true)}
              className={neutralActionClass}
              title={wo.technician?.name ? `Actuellement assigné à ${wo.technician.name}` : "Aucun technicien assigné"}
            >
              <i className="fab fa-whatsapp mr-2"></i>Réassigner &amp; renvoyer WhatsApp
            </button>
          )}
          {(wo.statut === "scheduled" || wo.statut === "in_progress" || wo.statut === "completed") && (
            <Link
              href={adminDocumentEditHref(id, "invoice")}
              className={neutralLinkActionClass}
            >
              <i className="fas fa-file-invoice-dollar mr-2"></i>
              Facturer ce bon
            </Link>
          )}
          <Link href={editHref}
            className={neutralLinkActionClass}>
            <i className="fas fa-pen mr-2"></i>Modifier
          </Link>
          <button type="button" onClick={() => { setEmailError(""); setShowEmail(true); }}
            className={neutralActionClass}>
            <i className="fas fa-envelope mr-2"></i>Envoyer {documentMeta.label.toLowerCase()}
          </button>
          <button
            type="button"
            onClick={sendDocumentToJason}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold"
            title={`Envoyer ${documentMeta.label.toLowerCase()} a Jason sur WhatsApp`}
          >
            <i className="fab fa-whatsapp mr-2"></i>Jason
          </button>
          <button onClick={() => {
              const w = pdfFrameRef.current?.contentWindow;
              if (w) { try { w.focus(); w.print(); return; } catch { /* fallback */ } }
              window.open(`/api/admin/work-orders/${id}/pdf?documentType=${documentMeta.type}&inline=1`, "_blank");
            }}
            className={neutralActionClass}>
            <i className="fas fa-print mr-2"></i>Imprimer
          </button>
          <a
            href={`/api/admin/work-orders/${id}/pdf?documentType=${documentMeta.type}`}
            className={neutralLinkActionClass}
          >
            <i className="fas fa-file-pdf mr-2"></i>Telecharger PDF
          </a>
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
              {canAssignWorkOrder ? (quoteReadyToSchedule ? "Planifier et envoyer" : "Approuver et envoyer") : "Réassigner et renvoyer"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {canAssignWorkOrder
                ? "Le bon passera en \"Planifie\", le technicien sera assigne, et WhatsApp s'ouvrira avec le message pre-rempli."
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
                {approving ? "Traitement..." : (canAssignWorkOrder ? (quoteReadyToSchedule ? "Planifier & envoyer" : "Approuver & envoyer") : "Réassigner & renvoyer")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email modal */}
      {showEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm print-hide"
          onClick={() => setShowEmail(false)}>
          <div className="bg-white text-gray-900 border border-gray-200 rounded-xl w-full max-w-2xl p-6 shadow-2xl dark:bg-gray-900 dark:text-white dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Envoyer {documentMeta.label.toLowerCase()} par email</h3>
            <label className="text-xs mb-1 block text-gray-500 dark:text-gray-400">Destinataire</label>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm w-full mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
            <label className="text-xs mb-1 block text-gray-500 dark:text-gray-400">Sujet</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm w-full mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <label className="text-xs mb-1 block text-gray-500 dark:text-gray-400">Message</label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={9}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm w-full mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {emailError && (
              <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                {emailError}
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowEmail(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm">
                Annuler
              </button>
              <button type="button" onClick={sendEmail} disabled={sending}
                className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {sending ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apercu = le VRAI PDF (identique au telechargement et a l'email envoye au client) */}
      <div className="max-w-5xl mx-auto print-hide">
        <iframe
          ref={pdfFrameRef}
          src={`/api/admin/work-orders/${id}/pdf?documentType=${documentMeta.type}&inline=1`}
          title={`Apercu ${documentMeta.label}`}
          className="w-full rounded-lg border admin-border bg-white"
          style={{ height: "min(1150px, calc(100vh - 150px))" }}
        />
      </div>

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
