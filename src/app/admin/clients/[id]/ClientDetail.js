"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { workOrderStatusClass, workOrderStatusLabel } from "@/lib/work-order-status";
import { DEFAULT_FOLLOW_UP_COLUMNS } from "@/lib/follow-up-columns";

const OPENING_TYPES = [
  { value: "fenetre", label: "Fenêtre" },
  { value: "porte", label: "Porte" },
  { value: "porte-patio", label: "Porte-patio" },
  { value: "porte-francaise", label: "Porte française" },
  { value: "mur-rideau", label: "Mur-rideau" },
];

// ─── Vue 360 : helpers d'affichage ───────────────────────────────
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("fr-CA", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const fmtDateTime = (v) => (v ? new Date(v).toLocaleString("fr-CA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");
const fmtMoney = (n) => (n === null || n === undefined ? "—" : new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(n));

const SOUMISSION_STATUTS = new Set(["quote", "quote_sent", "quote_accepted"]);
const FACTURE_STATUTS = new Set(["invoiced", "sent", "paid"]);

const FOLLOW_UP_STATUS_LABELS = Object.fromEntries(
  DEFAULT_FOLLOW_UP_COLUMNS.map((col) => [col.key, col.label])
);
const followUpStatusLabel = (status) =>
  FOLLOW_UP_STATUS_LABELS[status] || workOrderStatusLabel(status);

const RDV_STATUS_LABELS = {
  pending: "En attente",
  waiting_client: "Attend retour client",
  confirmed: "Confirmé",
  completed: "Complété",
  cancelled: "Annulé",
};
const rdvStatusLabel = (status) => RDV_STATUS_LABELS[status] || status || "—";
const dossierFilterFn = (f) => (wo) =>
  f === "all" ? true : f === "soumissions" ? SOUMISSION_STATUTS.has(wo.statut) : FACTURE_STATUTS.has(wo.statut);

function TabLoading() {
  return <div className="admin-text-muted text-sm py-12 text-center"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement…</div>;
}
function TabEmpty({ icon, text }) {
  return (
    <div className="admin-card border rounded-xl p-12 text-center admin-text-muted">
      <i className={`fas ${icon} text-3xl opacity-30 mb-3 block`}></i>
      {text}
    </div>
  );
}

// Barre d'actions de l'onglet Photos : ajouter nos propres photos (upload
// direct) ou texter au client un lien sécurisé pour qu'il envoie les siennes.
// Les photos du chat et du terrain continuent d'arriver automatiquement.
function PhotosActions({ client, onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [confirmSms, setConfirmSms] = useState(false);
  const [smsSending, setSmsSending] = useState(false);
  const [smsResult, setSmsResult] = useState(null); // { sent, link, phone, error }
  const [msg, setMsg] = useState(null); // { ok, text }

  async function upload(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length || uploading) return;
    setUploading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      files.slice(0, 10).forEach((f) => fd.append("photos", f));
      const res = await fetch(`/api/admin/clients/${client.id}/photos`, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur d'envoi");
      const n = data.photos?.length || files.length;
      setMsg({ ok: true, text: `${n} photo${n > 1 ? "s" : ""} ajoutée${n > 1 ? "s" : ""} ✓` });
      onUploaded();
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function sendSmsRequest() {
    if (smsSending) return;
    setSmsSending(true);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}/photo-request`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSmsResult(data);
    } catch (err) {
      setSmsResult({ sent: false, error: err.message });
    } finally {
      setSmsSending(false);
    }
  }

  function closeSmsModal() {
    setConfirmSms(false);
    setSmsResult(null);
  }

  return (
    <div className="mb-4">
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold disabled:opacity-50"
        >
          {uploading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Envoi…</> : <><i className="fas fa-plus mr-2"></i>Ajouter des photos</>}
        </button>
        <button
          onClick={() => setConfirmSms(true)}
          className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm font-bold hover:border-[var(--color-red)] transition-colors"
        >
          <i className="fas fa-comment-sms mr-2"></i>Demander par texto
        </button>
        {msg && <span className={`text-sm font-semibold ${msg.ok ? "text-green-500" : "text-red-500"}`}>{msg.text}</span>}
      </div>

      {confirmSms && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) closeSmsModal(); }}>
          <div className="admin-bg border admin-border rounded-xl w-full max-w-md shadow-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b admin-border">
              <h2 className="admin-text font-bold text-lg"><i className="fas fa-comment-sms mr-2 text-sky-400"></i>Demander des photos</h2>
              <button onClick={closeSmsModal} className="w-8 h-8 rounded admin-card border admin-border hover:bg-white/5 inline-flex items-center justify-center"><i className="fas fa-times admin-text-muted"></i></button>
            </div>
            <div className="p-5 space-y-4">
              {!smsResult ? (
                <>
                  <p className="admin-text text-sm">
                    {client.phone || client.secondaryPhone ? (
                      <>Un texto sera envoyé à <span className="font-bold">{client.phone || client.secondaryPhone}</span> avec
                      un lien sécurisé (valide 7 jours). Le client clique, prend ses photos, et elles
                      arrivent directement ici.</>
                    ) : (
                      <>Ce client n&apos;a pas de numéro de téléphone au dossier — le lien sera généré
                      pour que vous puissiez l&apos;envoyer vous-même (courriel, etc.).</>
                    )}
                  </p>
                  <div className="flex justify-end gap-2">
                    <button onClick={closeSmsModal} className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm">Annuler</button>
                    <button onClick={sendSmsRequest} disabled={smsSending}
                      className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-bold disabled:opacity-50">
                      {smsSending ? <><i className="fas fa-spinner fa-spin mr-2"></i>Envoi…</> : (client.phone || client.secondaryPhone) ? "Envoyer le texto" : "Générer le lien"}
                    </button>
                  </div>
                </>
              ) : smsResult.sent ? (
                <>
                  <p className="text-green-400 font-semibold"><i className="fas fa-circle-check mr-2"></i>Texto envoyé à {smsResult.phone}.</p>
                  <p className="admin-text-muted text-xs">Les photos du client apparaîtront dans cet onglet dès qu&apos;il les envoie.</p>
                  <div className="flex justify-end">
                    <button onClick={closeSmsModal} className="px-5 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold">Fermer</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-amber-300 font-semibold text-sm">
                    <i className="fas fa-triangle-exclamation mr-2"></i>
                    {smsResult.error ? smsResult.error : "Le texto n'est pas parti (SMS non configuré)."}
                  </p>
                  {smsResult.link && (
                    <>
                      <p className="admin-text-muted text-xs">Copiez le lien et envoyez-le au client vous-même :</p>
                      <div className="flex items-center gap-2">
                        <input readOnly value={smsResult.link} onFocus={(e) => e.target.select()}
                          className="admin-input border rounded-lg px-3 py-2 text-xs w-full" />
                        <button
                          onClick={() => { navigator.clipboard?.writeText(smsResult.link); setMsg({ ok: true, text: "Lien copié ✓" }); }}
                          className="shrink-0 px-3 py-2 admin-card border admin-border admin-text rounded-lg text-xs font-bold">
                          <i className="fas fa-copy mr-1"></i>Copier
                        </button>
                      </div>
                    </>
                  )}
                  <div className="flex justify-end">
                    <button onClick={closeSmsModal} className="px-5 py-2 admin-card border admin-border admin-text rounded-lg text-sm">Fermer</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientDetail({ client }) {
  const router = useRouter();
  const [tab, setTab] = useState("infos");
  const isB2B = client.type === "gestionnaire";
  const tabs = [
    { id: "infos", label: "Infos", icon: "fa-id-card" },
    { id: "suivi", label: "Suivi", icon: "fa-list-check" },
    { id: "dossiers", label: "Dossiers", icon: "fa-file-invoice-dollar" },
    { id: "photos", label: "Photos", icon: "fa-images" },
    { id: "notes", label: "Notes", icon: "fa-note-sticky" },
    { id: "rdv", label: "RDV", icon: "fa-calendar-check" },
    { id: "chats", label: "Chats", icon: "fa-comments" },
    ...(isB2B
      ? [
          { id: "batiments", label: "Bâtiments", icon: "fa-building" },
          { id: "unites", label: "Unités", icon: "fa-door-open" },
        ]
      : []),
  ];

  // Vue 360 (suivis, dossiers, photos, RDV, chats) chargée à la demande.
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [dossierFilter, setDossierFilter] = useState("all");
  const loadOverview = useCallback(async (silent = false) => {
    if (!silent) setLoadingOverview(true);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}/overview`);
      if (res.ok) setOverview(await res.json());
    } catch {}
    setLoadingOverview(false);
  }, [client.id]);
  useEffect(() => { loadOverview(); }, [loadOverview]);

  // Notes client (onglet Notes)
  const [notesDraft, setNotesDraft] = useState(client.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesMsg, setNotesMsg] = useState("");
  async function saveNotes() {
    setSavingNotes(true);
    setNotesMsg("");
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesDraft }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Erreur d'enregistrement"); }
      setNotesMsg("Enregistré ✓");
      setTimeout(() => setNotesMsg(""), 2500);
    } catch (err) {
      setNotesMsg(err.message);
    }
    setSavingNotes(false);
  }

  // State local pour bâtiments et unités
  const [buildings, setBuildings] = useState(client.buildings);
  const [units, setUnits] = useState(client.units);

  // Infos client éditables
  const [infoForm, setInfoForm] = useState({
    name: client.name || "",
    contactName: client.contactName || "",
    friendlyEmail: client.friendlyEmail === true,
    address: client.address || "",
    city: client.city || "",
    postalCode: client.postalCode || "",
    phone: client.phone || "",
    secondaryPhone: client.secondaryPhone || "",
    email: client.email || "",
    paymentTermsDays: client.paymentTermsDays ?? 30,
  });
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  async function saveClientInfo() {
    setSavingInfo(true);
    setInfoMsg("");
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(infoForm),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erreur"); }
      setInfoMsg("Enregistré ✓");
      setTimeout(() => setInfoMsg(""), 2500);
      router.refresh();
    } catch (err) {
      setInfoMsg(err.message);
    }
    setSavingInfo(false);
  }

  // Modaux
  const [buildingModal, setBuildingModal] = useState(null); // null | {isNew:true} | {id, code, name, address}
  const [unitModal, setUnitModal] = useState(null);
  const [openingsUnit, setOpeningsUnit] = useState(null);
  const [openingModal, setOpeningModal] = useState(null);

  async function refresh() {
    router.refresh();
    const res = await fetch(`/api/admin/buildings?clientId=${client.id}`);
    if (res.ok) setBuildings(await res.json());
  }

  async function saveBuilding(form) {
    const isNew = !form.id;
    const url = isNew ? "/api/admin/buildings" : `/api/admin/buildings/${form.id}`;
    const method = isNew ? "POST" : "PUT";
    const body = isNew ? { ...form, clientId: client.id } : form;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) { const d = await res.json(); alert(d.error || "Erreur"); return; }
    setBuildingModal(null);
    router.refresh();
  }

  async function deleteBuilding(id) {
    if (!confirm("Supprimer ce bâtiment? Les unités seront détachées (pas supprimées).")) return;
    const res = await fetch(`/api/admin/buildings/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Erreur"); return; }
    router.refresh();
  }

  async function saveUnit(form) {
    const isNew = !form.id;
    const url = isNew ? "/api/admin/units" : `/api/admin/units/${form.id}`;
    const method = isNew ? "POST" : "PUT";
    const body = isNew ? { ...form, clientId: client.id } : form;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) { const d = await res.json(); alert(d.error || "Erreur"); return; }
    setUnitModal(null);
    router.refresh();
  }

  async function deleteUnit(id) {
    if (!confirm("Désactiver cette unité? (elle disparaît du portail mais reste dans les historiques)")) return;
    await fetch(`/api/admin/units/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function saveOpening(form, file, removePhoto) {
    const isNew = !form.id;
    const url = isNew ? "/api/admin/openings" : `/api/admin/openings/${form.id}`;
    const method = isNew ? "POST" : "PUT";

    const fd = new FormData();
    if (isNew) fd.set("unitId", openingsUnit.id);
    for (const k of ["type", "location", "description", "year", "brand", "status"]) {
      if (form[k] !== undefined && form[k] !== null) fd.set(k, form[k]);
    }
    if (file) fd.set("photo", file);
    if (removePhoto) fd.set("removePhoto", "true");

    const res = await fetch(url, { method, body: fd });
    if (!res.ok) { const d = await res.json(); alert(d.error || "Erreur"); return; }
    setOpeningModal(null);
    router.refresh();
  }

  async function deleteOpening(id) {
    if (!confirm("Supprimer cette ouverture?")) return;
    await fetch(`/api/admin/openings/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const unitsByBuilding = {};
  for (const b of buildings) unitsByBuilding[b.id] = [];
  const orphans = [];
  for (const u of units) {
    if (u.buildingId && unitsByBuilding[u.buildingId]) unitsByBuilding[u.buildingId].push(u);
    else orphans.push(u);
  }

  return (
    <div className="p-6 lg:p-8">
      <button
        onClick={() => { if (typeof window !== "undefined" && window.history.length > 1) router.back(); else router.push("/admin/clients"); }}
        className="admin-text-muted hover:admin-text text-sm mb-3 inline-flex items-center cursor-pointer">
        <i className="fas fa-arrow-left mr-1"></i>Retour
      </button>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="admin-text text-2xl font-extrabold">{client.name}</h1>
          <p className="admin-text-muted text-sm mt-1">
            {isB2B ? "Copropriété / gestionnaire" : "Client particulier"}
            {client.city && ` · ${client.city}`}
            {client.contactName && ` · Contact: ${client.contactName}`}
            {isB2B && client.friendlyEmail && " · Courriel amical"}
            {client.phone && ` · ${client.phone}`}
            {client.secondaryPhone && ` · ${client.secondaryPhone}`}
          </p>
        </div>
      </div>

      {/* flex-wrap : sur mobile les 7 onglets passent sur 2 lignes — tout est
          visible d'un coup, sans défilement ni onglet coupé. */}
      <div className="flex flex-wrap gap-x-1 sm:gap-x-2 mb-6 border-b admin-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap px-2.5 sm:px-5 py-2.5 sm:py-3 text-[13px] sm:text-sm font-bold transition-colors ${tab === t.id ? "admin-text border-b-2 border-[var(--color-red)]" : "admin-text-muted hover:admin-text"}`}
          >
            <i className={`fas ${t.icon} mr-1.5 sm:mr-2`}></i>{t.label}
          </button>
        ))}
      </div>

      {tab === "infos" && (
        <div className="admin-card border rounded-xl p-6 max-w-3xl">
          <h2 className="admin-text font-bold mb-4">{isB2B ? "Informations de la copropriété" : "Informations du client"}</h2>
          <p className="admin-text-muted text-xs mb-4">
            {isB2B
              ? "Ces infos apparaissent sur les factures et documents envoyés à la copropriété."
              : "Ces infos apparaissent sur les bons, factures et documents envoyés au client."}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="admin-text-muted text-xs mb-1 block font-medium">Nom</label>
              <input value={infoForm.name} onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            {isB2B && (
              <>
                <div>
                  <label className="admin-text-muted text-xs mb-1 block font-medium">Nom du contact courriel</label>
                  <input value={infoForm.contactName} onChange={(e) => setInfoForm({ ...infoForm, contactName: e.target.value })}
                    placeholder="Ex: Marie-Claude Tremblay"
                    className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
                </div>
                <label className="admin-card border admin-border rounded-lg px-3 py-2 flex items-center justify-between gap-3 cursor-pointer">
                  <span>
                    <span className="admin-text text-sm font-medium block">Courriel amical</span>
                    <span className="admin-text-muted text-xs">Ton relationnel B2B</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={infoForm.friendlyEmail}
                    onChange={(e) => setInfoForm({ ...infoForm, friendlyEmail: e.target.checked })}
                    className="h-5 w-5 accent-[var(--color-red)]"
                  />
                </label>
              </>
            )}
            <div className="md:col-span-2">
              <label className="admin-text-muted text-xs mb-1 block font-medium">Adresse</label>
              <AddressAutocomplete
                value={infoForm.address}
                onChange={(address) => setInfoForm((prev) => ({ ...prev, address }))}
                onSelect={(address) => setInfoForm((prev) => ({ ...prev, ...address }))}
                placeholder="1500 Montée Monette"
                inputClassName="admin-input border rounded-lg px-3 py-2 text-sm w-full"
              />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block font-medium">Ville</label>
              <input value={infoForm.city} onChange={(e) => setInfoForm({ ...infoForm, city: e.target.value })}
                placeholder="Laval"
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block font-medium">Code postal</label>
              <input value={infoForm.postalCode} onChange={(e) => setInfoForm({ ...infoForm, postalCode: e.target.value })}
                placeholder="H7N 5K3"
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block font-medium">Téléphone</label>
              <input value={infoForm.phone} onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block font-medium">Autre téléphone</label>
              <input value={infoForm.secondaryPhone} onChange={(e) => setInfoForm({ ...infoForm, secondaryPhone: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block font-medium">Email</label>
              <input type="email" value={infoForm.email} onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block font-medium">Termes de paiement</label>
              <select value={infoForm.paymentTermsDays} onChange={(e) => setInfoForm({ ...infoForm, paymentTermsDays: Number(e.target.value) })}
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full">
                <option value="15">Net 15 jours</option>
                <option value="30">Net 30 jours</option>
                <option value="45">Net 45 jours</option>
                <option value="60">Net 60 jours</option>
              </select>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t admin-border flex items-center gap-3">
            <button onClick={saveClientInfo} disabled={savingInfo}
              className="px-5 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold disabled:opacity-50">
              {savingInfo ? "Enregistrement..." : "Enregistrer"}
            </button>
            {infoMsg && <span className={`text-sm ${infoMsg.includes("✓") ? "text-green-500" : "text-red-500"}`}>{infoMsg}</span>}
          </div>
        </div>
      )}

      {/* ─── Onglet Suivi ─────────────────────────────────────── */}
      {tab === "suivi" && (
        <div className="max-w-4xl">
          {loadingOverview ? <TabLoading /> : !overview?.followUps?.length ? (
            <TabEmpty icon="fa-list-check" text="Aucun suivi pour ce client." />
          ) : (
            <div className="space-y-3">
              {overview.followUps.map((f) => (
                <div key={f.id} className="admin-card border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="admin-text font-bold">{f.title}</div>
                      {f.service && <div className="admin-text-muted text-xs mt-0.5">{f.service}</div>}
                    </div>
                    <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-white/10 admin-text whitespace-nowrap">{followUpStatusLabel(f.status)}</span>
                  </div>
                  {f.estimateAmount != null && (
                    <div className="mt-2 text-xs admin-text"><i className="fas fa-dollar-sign mr-1 admin-text-muted"></i><span className="font-semibold">{fmtMoney(f.estimateAmount)}</span></div>
                  )}
                  {/* Étapes franchies, chacune avec sa date (horodatée à la sélection). */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[
                      ["contactedAt", "Contacté", "fa-phone"],
                      ["visitDoneAt", "Visite faite", "fa-location-dot"],
                      ["estimateSentAt", f.estimateType === "phone" ? "Soumission téléphone" : f.estimateType === "written" ? "Soumission écrite" : "Soumission", "fa-file-lines"],
                      ["acceptedAt", "Approuvé", "fa-thumbs-up"],
                      ["jobCompletedAt", "Service fait", "fa-screwdriver-wrench"],
                      ["invoicedAt", "Facturé", "fa-file-invoice-dollar"],
                    ].map(([key, label, icon]) => f[key] ? (
                      <span key={key} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 border border-emerald-400/30 text-emerald-300">
                        <i className={`fas ${icon}`}></i>{label}
                        <span className="opacity-70 font-normal">{fmtDate(f[key])}</span>
                      </span>
                    ) : null)}
                    {f.visitStatus === "todo" && !f.visitDoneAt && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/10 border border-amber-400/30 text-amber-300"><i className="fas fa-clock"></i>Visite à faire</span>
                    )}
                    {f.visitStatus === "rdv" && !f.visitDoneAt && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold bg-violet-500/10 border border-violet-400/30 text-violet-300">
                        <i className="fas fa-calendar-check"></i>Visite avec RDV{f.visitScheduledAt ? ` · ${fmtDate(f.visitScheduledAt)}${f.visitTimeSlot ? ` ${f.visitTimeSlot}` : ""}` : ""}
                      </span>
                    )}
                    {f.visitStatus === "anytime" && !f.visitDoneAt && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold bg-sky-500/10 border border-sky-400/30 text-sky-300"><i className="fas fa-door-open"></i>Passage libre</span>
                    )}
                    {f.visitStatus === "none" && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold admin-bg border admin-border admin-text-muted"><i className="fas fa-ban"></i>Sans visite</span>
                    )}
                    {(f.contactAttempts || 0) > 0 && !f.contactedAt && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold bg-rose-500/10 border border-rose-400/30 text-rose-300">
                        <i className="fas fa-phone-slash"></i>{f.contactAttempts} tentative{f.contactAttempts > 1 ? "s" : ""}{f.lastAttemptAt ? ` · ${fmtDate(f.lastAttemptAt)}` : ""}
                      </span>
                    )}
                    {f.outcome === "won" && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300"><i className="fas fa-trophy"></i>Gagné</span>}
                    {f.outcome === "lost" && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-500/20 border border-slate-400/40 text-slate-300"><i className="fas fa-ban"></i>Perdu</span>}
                  </div>
                  {f.nextAction && (
                    <div className="mt-2 text-xs admin-text">
                      <i className="fas fa-arrow-right mr-1 text-[var(--color-red)]"></i>{f.nextAction}
                      {f.nextActionDate && ` · ${fmtDate(f.nextActionDate)}`}
                    </div>
                  )}
                  {f.notes && <div className="mt-2 admin-text-muted text-xs whitespace-pre-wrap">{f.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Onglet Dossiers (bons / soumissions / factures) ──── */}
      {tab === "dossiers" && (
        <div>
          {loadingOverview ? <TabLoading /> : !overview?.workOrders?.length ? (
            <TabEmpty icon="fa-file-invoice-dollar" text="Aucun bon, soumission ou facture." />
          ) : (
            <>
              <div className="flex gap-2 mb-4 flex-wrap">
                {[["all", "Tous"], ["soumissions", "Soumissions"], ["factures", "Factures"]].map(([k, l]) => (
                  <button key={k} onClick={() => setDossierFilter(k)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${dossierFilter === k ? "bg-[var(--color-red)] text-white" : "admin-card border admin-border admin-text-muted hover:admin-text"}`}>
                    {l}
                  </button>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {overview.workOrders.filter(dossierFilterFn(dossierFilter)).map((wo) => (
                  <Link key={wo.id} href={`/admin/bons/${wo.id}`}
                    className="admin-card border rounded-xl p-4 hover:border-[var(--color-red)] transition-colors block">
                    <div className="flex items-center justify-between gap-2">
                      <span className="admin-text font-bold">#{wo.number}</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${workOrderStatusClass(wo.statut)}`}>{wo.statutLabel}</span>
                    </div>
                    {wo.description && <div className="admin-text-muted text-xs mt-2 line-clamp-2">{wo.description}</div>}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs admin-text-muted">
                      <span>{fmtDate(wo.date)}</span>
                      <span className="admin-text font-bold">{fmtMoney(wo.total)}</span>
                      {wo.technicianName && <span><i className="fas fa-user-gear mr-1"></i>{wo.technicianName}</span>}
                      {wo.photosCount > 0 && <span><i className="fas fa-image mr-1"></i>{wo.photosCount}</span>}
                      {/* Garde-fou : on n'affiche Payé/Facturé que si le STATUT le confirme.
                          Un bon "soumission" avec une vieille date paidAt résiduelle ne montre rien. */}
                      {FACTURE_STATUTS.has(wo.statut) && (wo.paidAt
                        ? <span className="text-emerald-400">Payé · {fmtDate(wo.paidAt)}</span>
                        : wo.invoiceSentAt ? <span className="text-orange-400">Facturé · {fmtDate(wo.invoiceSentAt)}</span> : null)}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Onglet Photos ────────────────────────────────────── */}
      {tab === "photos" && (
        <div>
          <PhotosActions client={client} onUploaded={() => loadOverview(true)} />
          {loadingOverview ? <TabLoading /> : !overview?.photos?.length ? (
            <TabEmpty icon="fa-images" text="Aucune photo pour ce client. Ajoutez-en ou demandez-en au client par texto." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {overview.photos.map((p) => (
                <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="admin-card border rounded-lg overflow-hidden block group">
                  <div className="aspect-square bg-white/5">
                    <img src={p.url} alt={p.title || ""} loading="lazy" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                  </div>
                  <div className="p-2">
                    <div className="admin-text-muted text-[11px] truncate">{p.from}</div>
                    {p.title && <div className="admin-text text-xs truncate">{p.title}</div>}
                    <div className="admin-text-muted text-[10px]">{fmtDate(p.date)}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Onglet Notes ─────────────────────────────────────── */}
      {tab === "notes" && (
        <div className="max-w-3xl">
          <div className="admin-card border rounded-xl p-6">
            <h2 className="admin-text font-bold mb-2">Notes internes</h2>
            <p className="admin-text-muted text-xs mb-4">Visible uniquement par l'équipe (pas envoyé au client).</p>
            <textarea rows={8} value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="Notes, rappels, préférences du client…"
              className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            <div className="mt-4 flex items-center gap-3">
              <button onClick={saveNotes} disabled={savingNotes}
                className="px-5 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold disabled:opacity-50">
                {savingNotes ? "Enregistrement…" : "Enregistrer"}
              </button>
              {notesMsg && <span className={`text-sm ${notesMsg.includes("✓") ? "text-green-500" : "text-red-500"}`}>{notesMsg}</span>}
            </div>
          </div>
        </div>
      )}

      {/* ─── Onglet RDV ───────────────────────────────────────── */}
      {tab === "rdv" && (
        <div className="max-w-3xl">
          {loadingOverview ? <TabLoading /> : !overview?.appointments?.length ? (
            <TabEmpty icon="fa-calendar-check" text="Aucun rendez-vous." />
          ) : (
            <div className="space-y-3">
              {overview.appointments.map((a) => (
                <div key={a.id} className="admin-card border rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="admin-text font-bold">{a.serviceType || "Rendez-vous"}</div>
                    <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-white/10 admin-text whitespace-nowrap">{rdvStatusLabel(a.status)}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs admin-text-muted">
                    <span><i className="fas fa-calendar mr-1"></i>{fmtDate(a.date)}{a.timeSlot && ` · ${a.timeSlot}`}</span>
                    {(a.address || a.city) && <span><i className="fas fa-location-dot mr-1"></i>{[a.address, a.city].filter(Boolean).join(", ")}</span>}
                  </div>
                  {a.notes && <div className="mt-2 admin-text-muted text-xs whitespace-pre-wrap">{a.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Onglet Chats ─────────────────────────────────────── */}
      {tab === "chats" && (
        <div className="max-w-3xl">
          {loadingOverview ? <TabLoading /> : !overview?.chats?.length ? (
            <TabEmpty icon="fa-comments" text="Aucune conversation de clavardage." />
          ) : (
            <div className="space-y-3">
              {overview.chats.map((c) => (
                <Link key={c.id} href={`/admin/chat/${c.id}`} className="admin-card border rounded-xl p-4 hover:border-[var(--color-red)] transition-colors block">
                  <div className="flex items-center justify-between gap-3">
                    <div className="admin-text font-bold">{c.clientName || "Conversation"}</div>
                    <div className="flex items-center gap-2">
                      {c.unreadCount > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-red)] text-white">{c.unreadCount}</span>}
                      <span className="admin-text-muted text-[11px] whitespace-nowrap">{fmtDateTime(c.lastMessageAt)}</span>
                    </div>
                  </div>
                  {c.messages?.[0] && (
                    <div className="mt-2 admin-text-muted text-xs line-clamp-2">
                      <span className="font-semibold">{c.messages[0].senderType === "ADMIN" ? "Nous : " : ""}</span>
                      {c.messages[0].imageUrl && <i className="fas fa-image mr-1"></i>}
                      {c.messages[0].content}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {isB2B && tab === "batiments" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="admin-text-muted text-sm">{buildings.length} bâtiment{buildings.length > 1 ? "s" : ""}</p>
            <button onClick={() => setBuildingModal({ code: "", name: "", address: "", position: buildings.length })}
              className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold">
              <i className="fas fa-plus mr-2"></i>Ajouter bâtiment
            </button>
          </div>

          {buildings.length === 0 ? (
            <div className="admin-card border rounded-xl p-12 text-center admin-text-muted">
              Aucun bâtiment. Ajoutez-en un pour commencer à organiser les unités.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {buildings.map((b) => (
                <div key={b.id} className="admin-card border rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--color-teal-dark)] text-white rounded-lg flex items-center justify-center font-bold">{b.code}</div>
                      <div>
                        <div className="admin-text font-bold">{b.name}</div>
                        <div className="admin-text-muted text-xs">{b._count.units} unité{b._count.units > 1 ? "s" : ""} {b.address && `· ${b.address}`}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setBuildingModal(b)} className="w-8 h-8 rounded admin-bg border admin-border hover:bg-white/5 inline-flex items-center justify-center">
                        <i className="fas fa-edit text-xs admin-text-muted"></i>
                      </button>
                      <button onClick={() => deleteBuilding(b.id)} className="w-8 h-8 rounded admin-bg border admin-border hover:bg-red-500/10 inline-flex items-center justify-center">
                        <i className="fas fa-trash text-xs text-red-400"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isB2B && tab === "unites" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="admin-text-muted text-sm">{units.length} unité{units.length > 1 ? "s" : ""}</p>
            <button onClick={() => setUnitModal({ code: "", buildingId: buildings[0]?.id || null, description: "" })}
              className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold">
              <i className="fas fa-plus mr-2"></i>Ajouter unité
            </button>
          </div>

          {buildings.map((b) => {
            const list = unitsByBuilding[b.id] || [];
            return (
              <div key={b.id} className="mb-6">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b admin-border">
                  <div className="w-8 h-8 bg-[var(--color-teal-dark)] text-white rounded flex items-center justify-center text-sm font-bold">{b.code}</div>
                  <h3 className="admin-text font-bold">{b.name}</h3>
                  <span className="admin-text-muted text-xs ml-auto">{list.length} unité{list.length > 1 ? "s" : ""}</span>
                </div>
                {list.length === 0 ? (
                  <p className="admin-text-muted text-sm italic p-3">Aucune unité dans ce bâtiment</p>
                ) : (
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {list.map((u) => (
                      <div key={u.id} className="admin-card border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="admin-text font-bold">{u.code}</div>
                            {u.description && <div className="admin-text-muted text-xs mt-1">{u.description}</div>}
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => setUnitModal(u)} title="Modifier" className="w-7 h-7 rounded admin-bg border admin-border hover:bg-white/5 inline-flex items-center justify-center">
                              <i className="fas fa-edit text-[10px] admin-text-muted"></i>
                            </button>
                            <button onClick={() => deleteUnit(u.id)} title="Supprimer" className="w-7 h-7 rounded admin-bg border admin-border hover:bg-red-500/10 inline-flex items-center justify-center">
                              <i className="fas fa-trash text-[10px] text-red-400"></i>
                            </button>
                          </div>
                        </div>
                        <button onClick={() => setOpeningsUnit(u)} className="w-full mt-2 text-xs admin-text-muted hover:admin-text py-1.5 bg-white/5 rounded">
                          <i className="fas fa-door-open mr-1"></i>{u.openings.length} ouverture{u.openings.length !== 1 ? "s" : ""}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {orphans.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b admin-border">
                <div className="w-8 h-8 bg-gray-500 text-white rounded flex items-center justify-center text-sm font-bold">?</div>
                <h3 className="admin-text font-bold">Unités sans bâtiment</h3>
                <span className="admin-text-muted text-xs ml-auto">{orphans.length}</span>
              </div>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                {orphans.map((u) => (
                  <div key={u.id} className="admin-card border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="admin-text font-bold">{u.code}</div>
                      <div className="flex gap-1">
                        <button onClick={() => setUnitModal(u)} className="w-7 h-7 rounded admin-bg border admin-border hover:bg-white/5 inline-flex items-center justify-center">
                          <i className="fas fa-edit text-[10px] admin-text-muted"></i>
                        </button>
                        <button onClick={() => deleteUnit(u.id)} className="w-7 h-7 rounded admin-bg border admin-border hover:bg-red-500/10 inline-flex items-center justify-center">
                          <i className="fas fa-trash text-[10px] text-red-400"></i>
                        </button>
                      </div>
                    </div>
                    <button onClick={() => setOpeningsUnit(u)} className="w-full mt-2 text-xs admin-text-muted hover:admin-text py-1.5 bg-white/5 rounded">
                      <i className="fas fa-door-open mr-1"></i>{u.openings.length} ouverture{u.openings.length !== 1 ? "s" : ""}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal bâtiment */}
      {isB2B && buildingModal && (
        <BuildingModal
          initial={buildingModal}
          onSave={saveBuilding}
          onClose={() => setBuildingModal(null)}
        />
      )}

      {/* Modal unité */}
      {isB2B && unitModal && (
        <UnitModal
          initial={unitModal}
          buildings={buildings}
          onSave={saveUnit}
          onClose={() => setUnitModal(null)}
        />
      )}

      {/* Liste ouvertures d'une unité */}
      {openingsUnit && !openingModal && (
        <OpeningsListModal
          unit={openingsUnit}
          onClose={() => setOpeningsUnit(null)}
          onAdd={() => setOpeningModal({ type: "fenetre", location: "", status: "ok" })}
          onEdit={(o) => setOpeningModal(o)}
          onDelete={deleteOpening}
        />
      )}

      {/* Modal ouverture */}
      {openingModal && openingsUnit && (
        <OpeningModal
          initial={openingModal}
          unitCode={openingsUnit.code}
          onSave={saveOpening}
          onClose={() => setOpeningModal(null)}
        />
      )}
    </div>
  );
}

function Modal({ children, onClose, title, size = "md" }) {
  const maxW = size === "lg" ? "max-w-3xl" : "max-w-xl";
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`admin-bg border admin-border rounded-xl w-full ${maxW} shadow-2xl my-8`}>
        <div className="flex items-center justify-between p-5 border-b admin-border">
          <h2 className="admin-text font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded admin-card border admin-border hover:bg-white/5 inline-flex items-center justify-center">
            <i className="fas fa-times admin-text-muted"></i>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BuildingModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial });
  return (
    <Modal title={form.id ? "Modifier bâtiment" : "Nouveau bâtiment"} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="p-5 space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Code</label>
            <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="A" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          </div>
          <div className="md:col-span-2">
            <label className="admin-text-muted text-xs mb-1 block font-medium">Nom</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Bâtiment A" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          </div>
        </div>
        <div>
          <label className="admin-text-muted text-xs mb-1 block font-medium">Adresse (optionnel)</label>
          <AddressAutocomplete
            value={form.address || ""}
            onChange={(address) => setForm((prev) => ({ ...prev, address }))}
            onSelect={(address) => setForm((prev) => ({ ...prev, address: address.address }))}
            inputClassName="admin-input border rounded-lg px-3 py-2 text-sm w-full"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm">Annuler</button>
          <button type="submit" className="px-5 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold">Enregistrer</button>
        </div>
      </form>
    </Modal>
  );
}

function UnitModal({ initial, buildings, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial });
  return (
    <Modal title={form.id ? "Modifier unité" : "Nouvelle unité"} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Code</label>
            <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="A-101" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Bâtiment</label>
            <select value={form.buildingId || ""} onChange={(e) => setForm({ ...form, buildingId: e.target.value || null })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full">
              <option value="">Aucun</option>
              {buildings.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="admin-text-muted text-xs mb-1 block font-medium">Description (optionnel)</label>
          <input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: 3 chambres" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
        </div>
        <div>
          <label className="admin-text-muted text-xs mb-1 block font-medium">Notes internes</label>
          <textarea rows={2} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm">Annuler</button>
          <button type="submit" className="px-5 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold">Enregistrer</button>
        </div>
      </form>
    </Modal>
  );
}

function OpeningsListModal({ unit, onClose, onAdd, onEdit, onDelete }) {
  return (
    <Modal title={`Ouvertures · Unité ${unit.code}`} onClose={onClose} size="lg">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="admin-text-muted text-sm">{unit.openings.length} ouverture{unit.openings.length !== 1 ? "s" : ""}</p>
          <button onClick={onAdd} className="px-3 py-1.5 bg-[var(--color-red)] text-white rounded-lg text-xs font-bold">
            <i className="fas fa-plus mr-1"></i>Ajouter ouverture
          </button>
        </div>
        {unit.openings.length === 0 ? (
          <p className="admin-text-muted text-sm italic text-center py-8">Aucune ouverture enregistrée</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unit.openings.map((o) => (
              <div key={o.id} className="admin-card border rounded-lg overflow-hidden">
                <div className="aspect-video bg-white/5 relative">
                  {o.photoUrl ? (
                    <img src={o.photoUrl} alt={o.location} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center admin-text-muted">
                      <i className="fas fa-camera text-2xl opacity-30"></i>
                    </div>
                  )}
                  {o.status === "active" && <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-500 text-white rounded-full">Actif</span>}
                  {o.status === "done" && <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-green-500 text-white rounded-full">Fait</span>}
                </div>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-[var(--color-red)] uppercase tracking-wider">{o.type.replace("-", " ")}</div>
                  <div className="admin-text font-bold text-sm">{o.location}</div>
                  {o.description && <div className="admin-text-muted text-xs mt-1 line-clamp-2">{o.description}</div>}
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => onEdit(o)} className="flex-1 px-2 py-1.5 admin-bg border admin-border rounded text-xs admin-text-muted hover:admin-text">
                      <i className="fas fa-edit mr-1"></i>Modifier
                    </button>
                    <button onClick={() => onDelete(o.id)} className="px-2 py-1.5 admin-bg border admin-border rounded text-xs text-red-400">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

function OpeningModal({ initial, unitCode, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial });
  const [file, setFile] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [preview, setPreview] = useState(initial.photoUrl || null);

  function handleFile(f) {
    setFile(f);
    setRemovePhoto(false);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    }
  }

  return (
    <Modal title={form.id ? `Modifier ouverture · ${unitCode}` : `Nouvelle ouverture · ${unitCode}`} onClose={onClose} size="lg">
      <form onSubmit={(e) => { e.preventDefault(); onSave(form, file, removePhoto); }} className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Type</label>
            <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full">
              {OPENING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Localisation</label>
            <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Salon · nord" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          </div>
        </div>

        <div>
          <label className="admin-text-muted text-xs mb-1 block font-medium">Description</label>
          <textarea rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Détails ou notes" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Année</label>
            <input type="number" value={form.year || ""} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2014" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Marque</label>
            <input value={form.brand || ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Novatech" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Statut</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full">
              <option value="ok">OK</option>
              <option value="active">Bon actif</option>
              <option value="done">Terminé récemment</option>
            </select>
          </div>
        </div>

        <div>
          <label className="admin-text-muted text-xs mb-1 block font-medium">Photo</label>
          {preview && !removePhoto ? (
            <div className="relative inline-block">
              <img src={preview} alt="Aperçu" className="max-h-40 rounded-lg" />
              <button type="button" onClick={() => { setPreview(null); setFile(null); setRemovePhoto(true); }} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs">
                <i className="fas fa-times"></i>
              </button>
            </div>
          ) : (
            <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])}
              className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          )}
          <p className="admin-text-muted text-xs mt-1">JPEG, PNG, WebP ou GIF · max 8 MB</p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm">Annuler</button>
          <button type="submit" className="px-5 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold">Enregistrer</button>
        </div>
      </form>
    </Modal>
  );
}
