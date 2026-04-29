"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ClientPicker from "@/components/admin/ClientPicker";

const STATUS_OPTIONS = [
  { key: "to_call", label: "A appeler", color: "bg-red-500/15 text-red-400", icon: "fa-phone" },
  { key: "called", label: "Appel fait", color: "bg-blue-500/15 text-blue-400", icon: "fa-headset" },
  { key: "estimate_sent", label: "Estime envoye", color: "bg-yellow-500/15 text-yellow-400", icon: "fa-file-invoice-dollar" },
  { key: "won", label: "Accepte", color: "bg-green-500/15 text-green-400", icon: "fa-check" },
  { key: "scheduled", label: "Job planifie", color: "bg-purple-500/15 text-purple-400", icon: "fa-calendar-check" },
  { key: "completed", label: "Job fait", color: "bg-emerald-500/15 text-emerald-400", icon: "fa-flag-checkered" },
  { key: "lost", label: "Perdu / refuse", color: "bg-gray-500/15 text-gray-400", icon: "fa-times" },
];

const STATUS_BY_KEY = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.key, s]));
const TERMINAL = new Set(["lost", "completed"]);

const FILTERS = [
  { key: "active", label: "Actifs" },
  { key: "to_call", label: "A appeler" },
  { key: "called", label: "Appeles" },
  { key: "estimate_sent", label: "Estimes" },
  { key: "won", label: "Acceptes" },
  { key: "scheduled", label: "Planifies" },
  { key: "completed", label: "Faits" },
  { key: "lost", label: "Perdus" },
  { key: "all", label: "Tous" },
];

const EMPTY_FORM = {
  title: "",
  status: "to_call",
  priority: "normal",
  source: "",
  contactName: "",
  phone: "",
  email: "",
  service: "",
  estimateAmount: "",
  nextAction: "Appeler le client",
  nextActionDate: "",
  lostReason: "",
  notes: "",
};

function toInputDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-CA", { day: "2-digit", month: "short", year: "numeric" });
}

function isLate(value) {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(value) < today;
}

export default function SuiviClientsClient() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef(null);

  function load(q = search) {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("status", "all");
    params.set("limit", "200");
    if (q.trim()) params.set("q", q.trim());
    fetch(`/api/admin/follow-ups?${params}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setFollowUps(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => load(search), 250);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const visibleFollowUps = useMemo(() => {
    return followUps.filter((f) => {
      if (filter === "all") return true;
      if (filter === "active") return !TERMINAL.has(f.status);
      return f.status === filter;
    });
  }, [followUps, filter]);

  const stats = useMemo(() => {
    const active = followUps.filter((f) => !TERMINAL.has(f.status));
    return {
      active: active.length,
      toCall: followUps.filter((f) => f.status === "to_call").length,
      estimates: followUps.filter((f) => f.status === "estimate_sent").length,
      late: active.filter((f) => isLate(f.nextActionDate)).length,
    };
  }, [followUps]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSelectedClient(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(followUp) {
    setEditing(followUp);
    setSelectedClient(followUp.client || null);
    setForm({
      title: followUp.title || "",
      status: followUp.status || "to_call",
      priority: followUp.priority || "normal",
      source: followUp.source || "",
      contactName: followUp.contactName || followUp.client?.name || "",
      phone: followUp.phone || followUp.client?.phone || "",
      email: followUp.email || followUp.client?.email || "",
      service: followUp.service || "",
      estimateAmount: followUp.estimateAmount ?? "",
      nextAction: followUp.nextAction || "",
      nextActionDate: toInputDate(followUp.nextActionDate),
      lostReason: followUp.lostReason || "",
      notes: followUp.notes || "",
    });
    setError("");
    setShowForm(true);
  }

  function applyClient(client) {
    setSelectedClient(client);
    setClientPickerOpen(false);
    setForm((prev) => ({
      ...prev,
      title: prev.title || client.name || "",
      contactName: prev.contactName || client.name || "",
      phone: prev.phone || client.phone || "",
      email: prev.email || client.email || "",
    }));
  }

  async function saveFollowUp(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        clientId: selectedClient?.id || null,
        estimateAmount: form.estimateAmount === "" ? null : form.estimateAmount,
        nextActionDate: form.nextActionDate || null,
      };
      const url = editing ? `/api/admin/follow-ups/${editing.id}` : "/api/admin/follow-ups";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'enregistrement");
      setShowForm(false);
      setEditing(null);
      setSelectedClient(null);
      load(search);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function quickStatus(followUp, status) {
    const res = await fetch(`/api/admin/follow-ups/${followUp.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) load(search);
  }

  async function deleteFollowUp(followUp) {
    if (!confirm(`Supprimer le suivi "${followUp.title}"?`)) return;
    const res = await fetch(`/api/admin/follow-ups/${followUp.id}`, { method: "DELETE" });
    if (res.ok) load(search);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div>
          <h1 className="admin-text text-2xl font-extrabold">Suivi clients</h1>
          <p className="admin-text-muted text-sm mt-1">
            Appels, estimes, acceptations, refus et jobs faits au meme endroit.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold"
        >
          <i className="fas fa-plus"></i>
          Ajouter un suivi
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Suivis actifs" value={stats.active} icon="fa-list-check" tone="text-blue-400 bg-blue-500/10" />
        <StatCard label="A appeler" value={stats.toCall} icon="fa-phone" tone="text-red-400 bg-red-500/10" />
        <StatCard label="Estimes envoyes" value={stats.estimates} icon="fa-file-invoice-dollar" tone="text-yellow-400 bg-yellow-500/10" />
        <StatCard label="En retard" value={stats.late} icon="fa-bell" tone="text-orange-400 bg-orange-500/10" />
      </div>

      <div className="admin-card border rounded-xl p-4 mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher nom, telephone, email, service, notes..."
            className="admin-input border rounded-lg px-4 py-2.5 text-sm flex-1"
          />
          <button onClick={() => load(search)} className="px-4 py-2.5 admin-text-muted admin-hover rounded-lg text-sm">
            <i className="fas fa-rotate-right mr-2"></i>Actualiser
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                filter === item.key ? "bg-[var(--color-red)]/10 text-[var(--color-red)]" : "admin-text-muted admin-hover"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 admin-text-muted">
          <i className="fas fa-spinner fa-spin text-2xl"></i>
        </div>
      ) : visibleFollowUps.length === 0 ? (
        <div className="admin-card border rounded-xl text-center py-12 admin-text-muted">
          <i className="fas fa-clipboard-check text-4xl mb-3"></i>
          <p>Aucun suivi dans cette vue</p>
        </div>
      ) : (
        <div className="admin-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b admin-border admin-text-muted text-xs text-left">
                  <th className="px-4 py-3 min-w-[240px]">Client</th>
                  <th className="px-4 py-3 min-w-[150px]">Statut</th>
                  <th className="px-4 py-3 min-w-[170px]">Prochain suivi</th>
                  <th className="px-4 py-3 min-w-[130px]">Estime</th>
                  <th className="px-4 py-3 min-w-[150px]">Source</th>
                  <th className="px-4 py-3 min-w-[220px]">Notes</th>
                  <th className="px-4 py-3 w-28"></th>
                </tr>
              </thead>
              <tbody>
                {visibleFollowUps.map((followUp) => (
                  <FollowUpRow
                    key={followUp.id}
                    followUp={followUp}
                    onEdit={openEdit}
                    onDelete={deleteFollowUp}
                    onStatus={quickStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <FollowUpForm
          editing={editing}
          form={form}
          setForm={setForm}
          selectedClient={selectedClient}
          onPickClient={() => setClientPickerOpen(true)}
          onClearClient={() => setSelectedClient(null)}
          onClose={() => { setShowForm(false); setEditing(null); setSelectedClient(null); }}
          onSubmit={saveFollowUp}
          saving={saving}
          error={error}
        />
      )}

      <ClientPicker
        open={clientPickerOpen}
        onClose={() => setClientPickerOpen(false)}
        onPick={applyClient}
      />
    </div>
  );
}

function StatCard({ label, value, icon, tone }) {
  return (
    <div className="admin-card border rounded-xl p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tone}`}>
          <i className={`fas ${icon}`}></i>
        </div>
        <div>
          <p className="admin-text-muted text-xs uppercase tracking-wider font-bold">{label}</p>
          <p className="admin-text text-2xl font-extrabold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function FollowUpRow({ followUp, onEdit, onDelete, onStatus }) {
  const status = STATUS_BY_KEY[followUp.status] || STATUS_BY_KEY.to_call;
  const late = isLate(followUp.nextActionDate) && !TERMINAL.has(followUp.status);
  const clientName = followUp.client?.name || followUp.contactName || followUp.title;
  const phone = followUp.phone || followUp.client?.phone;
  const email = followUp.email || followUp.client?.email;

  return (
    <tr className={`border-b admin-border admin-hover ${late ? "bg-orange-500/5" : ""}`}>
      <td className="px-4 py-3 align-top">
        <div className="flex items-start gap-2">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-red)]/10 text-[var(--color-red)] flex items-center justify-center shrink-0">
            <i className="fas fa-user"></i>
          </div>
          <div className="min-w-0">
            <p className="admin-text font-bold truncate">{clientName}</p>
            <p className="admin-text-muted text-xs truncate">{followUp.service || "Service non precise"}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs">
              {phone && <a href={`tel:${phone}`} className="text-[var(--color-red)] hover:underline">{phone}</a>}
              {email && <a href={`mailto:${email}`} className="admin-text-muted hover:admin-text">{email}</a>}
              {followUp.client?.id && (
                <Link href={`/admin/clients/${followUp.client.id}`} className="admin-text-muted hover:admin-text">
                  Fiche client
                </Link>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 align-top">
        <select
          value={followUp.status}
          onChange={(e) => onStatus(followUp, e.target.value)}
          className={`border-0 rounded-lg px-2 py-1.5 text-xs font-bold ${status.color}`}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 align-top">
        <p className={`text-sm font-semibold ${late ? "text-orange-400" : "admin-text"}`}>
          {formatDate(followUp.nextActionDate)}
        </p>
        <p className="admin-text-muted text-xs line-clamp-2">{followUp.nextAction || "-"}</p>
      </td>
      <td className="px-4 py-3 align-top">
        <p className="admin-text font-bold">
          {followUp.estimateAmount ? `${Number(followUp.estimateAmount).toFixed(2)} $` : "-"}
        </p>
        {followUp.estimateSentAt && <p className="admin-text-muted text-xs">Envoye {formatDate(followUp.estimateSentAt)}</p>}
      </td>
      <td className="px-4 py-3 align-top">
        <p className="admin-text-muted text-xs">{followUp.source || "-"}</p>
        <p className="admin-text-muted text-[10px] mt-1">Maj {formatDate(followUp.updatedAt)}</p>
      </td>
      <td className="px-4 py-3 align-top">
        <p className="admin-text-muted text-xs line-clamp-3 whitespace-pre-wrap">{followUp.notes || followUp.lostReason || "-"}</p>
      </td>
      <td className="px-4 py-3 align-top text-right whitespace-nowrap">
        <button onClick={() => onEdit(followUp)} className="admin-text-muted hover:admin-text text-xs mr-4" title="Modifier">
          <i className="fas fa-pen"></i>
        </button>
        <button onClick={() => onDelete(followUp)} className="text-red-500 hover:text-red-600 text-xs" title="Supprimer">
          <i className="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  );
}

function FollowUpForm({
  editing,
  form,
  setForm,
  selectedClient,
  onPickClient,
  onClearClient,
  onClose,
  onSubmit,
  saving,
  error,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={onSubmit}
        className="admin-bg admin-border border rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b admin-border">
          <h2 className="admin-text font-bold text-lg">{editing ? "Modifier le suivi" : "Nouveau suivi client"}</h2>
          <button type="button" onClick={onClose} className="admin-text-muted hover:admin-text">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="admin-card border rounded-xl p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="admin-text-muted text-xs uppercase tracking-wider font-bold mb-1">Client lie</p>
                {selectedClient ? (
                  <div>
                    <p className="admin-text font-bold">{selectedClient.name}</p>
                    <p className="admin-text-muted text-xs">{[selectedClient.phone, selectedClient.email, selectedClient.city].filter(Boolean).join(" | ")}</p>
                  </div>
                ) : (
                  <p className="admin-text-muted text-sm">Aucun client lie. Le suivi peut quand meme etre cree.</p>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={onPickClient} className="px-3 py-2 bg-[var(--color-red)] text-white rounded-lg text-xs font-bold">
                  <i className="fas fa-address-book mr-2"></i>Choisir
                </button>
                {selectedClient && (
                  <button type="button" onClick={onClearClient} className="px-3 py-2 admin-text-muted admin-hover rounded-lg text-xs">
                    Retirer
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Titre">
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Mme Tremblay - thermos cuisine" className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
            </Field>
            <Field label="Statut">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full">
                {STATUS_OPTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Nom contact">
              <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
            </Field>
            <Field label="Priorite">
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full">
                <option value="low">Basse</option>
                <option value="normal">Normale</option>
                <option value="high">Haute</option>
              </select>
            </Field>
            <Field label="Telephone">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
            </Field>
            <Field label="Service / besoin">
              <input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}
                placeholder="Thermos, quincaillerie, porte..." className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
            </Field>
            <Field label="Source">
              <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="telephone, contact, chat, rendez-vous..." className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
            </Field>
            <Field label="Montant estime">
              <input type="number" step="0.01" min="0" value={form.estimateAmount} onChange={(e) => setForm({ ...form, estimateAmount: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
            </Field>
            <Field label="Prochain suivi">
              <input type="date" value={form.nextActionDate} onChange={(e) => setForm({ ...form, nextActionDate: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
            </Field>
          </div>

          <Field label="Action a faire">
            <input value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
              placeholder="Ex: Relancer pour savoir si l'estime est accepte" className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
          </Field>

          {form.status === "lost" && (
            <Field label="Raison du refus">
              <input value={form.lostReason} onChange={(e) => setForm({ ...form, lostReason: e.target.value })}
                placeholder="Trop cher, pas de reponse, autre compagnie..." className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
            </Field>
          )}

          <Field label="Notes">
            <textarea rows={5} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Historique: appele le..., estime donne..., client veut attendre..." className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
          </Field>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="px-5 py-4 border-t admin-border flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 admin-text-muted admin-hover rounded-lg text-sm">
            Annuler
          </button>
          <button type="submit" disabled={saving} className="px-5 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold disabled:opacity-50">
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="admin-text-muted text-xs uppercase tracking-wider font-bold mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
