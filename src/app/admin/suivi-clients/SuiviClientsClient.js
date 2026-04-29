"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ClientPicker from "@/components/admin/ClientPicker";

const SETTINGS_KEY = "admin_follow_up_columns";
const TERMINAL = new Set(["lost", "completed"]);

const DEFAULT_COLUMNS = [
  { key: "to_call", label: "A appeler", icon: "fa-phone", tone: "sky", visible: true, locked: true },
  { key: "called", label: "Appel fait", icon: "fa-headset", tone: "blue", visible: true, locked: true },
  { key: "estimate_sent", label: "Estime envoye", icon: "fa-file-invoice-dollar", tone: "amber", visible: true, locked: true },
  { key: "won", label: "Accepte", icon: "fa-check", tone: "emerald", visible: true, locked: true },
  { key: "scheduled", label: "Job planifie", icon: "fa-calendar-check", tone: "violet", visible: true, locked: true },
  { key: "completed", label: "Job fait", icon: "fa-flag-checkered", tone: "teal", visible: true, locked: true },
  { key: "lost", label: "Perdu / refuse", icon: "fa-ban", tone: "slate", visible: true, locked: true },
];

const TONES = {
  sky: {
    label: "Bleu pale",
    badge: "bg-sky-500/15 text-sky-300",
    soft: "bg-sky-500/10 text-sky-300",
    ring: "ring-sky-400/25",
    border: "border-sky-400/30",
    button: "bg-sky-600 hover:bg-sky-500 text-white",
  },
  blue: {
    label: "Bleu",
    badge: "bg-blue-500/15 text-blue-300",
    soft: "bg-blue-500/10 text-blue-300",
    ring: "ring-blue-400/25",
    border: "border-blue-400/30",
    button: "bg-blue-600 hover:bg-blue-500 text-white",
  },
  amber: {
    label: "Ambre",
    badge: "bg-amber-500/15 text-amber-300",
    soft: "bg-amber-500/10 text-amber-300",
    ring: "ring-amber-400/25",
    border: "border-amber-400/30",
    button: "bg-amber-600 hover:bg-amber-500 text-white",
  },
  emerald: {
    label: "Vert",
    badge: "bg-emerald-500/15 text-emerald-300",
    soft: "bg-emerald-500/10 text-emerald-300",
    ring: "ring-emerald-400/25",
    border: "border-emerald-400/30",
    button: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
  violet: {
    label: "Violet",
    badge: "bg-violet-500/15 text-violet-300",
    soft: "bg-violet-500/10 text-violet-300",
    ring: "ring-violet-400/25",
    border: "border-violet-400/30",
    button: "bg-violet-600 hover:bg-violet-500 text-white",
  },
  teal: {
    label: "Sarcelle",
    badge: "bg-teal-500/15 text-teal-300",
    soft: "bg-teal-500/10 text-teal-300",
    ring: "ring-teal-400/25",
    border: "border-teal-400/30",
    button: "bg-teal-600 hover:bg-teal-500 text-white",
  },
  slate: {
    label: "Gris",
    badge: "bg-slate-500/15 text-slate-300",
    soft: "bg-slate-500/10 text-slate-300",
    ring: "ring-slate-400/25",
    border: "border-slate-400/30",
    button: "bg-slate-600 hover:bg-slate-500 text-white",
  },
};

const ICON_OPTIONS = [
  "fa-list-check",
  "fa-phone",
  "fa-headset",
  "fa-file-invoice-dollar",
  "fa-check",
  "fa-calendar-check",
  "fa-flag-checkered",
  "fa-ban",
  "fa-comments",
  "fa-clipboard-list",
  "fa-hourglass-half",
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

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 36);
}

function normalizeColumns(columns) {
  if (!Array.isArray(columns)) return DEFAULT_COLUMNS;
  const byKey = new Map(DEFAULT_COLUMNS.map((c) => [c.key, c]));
  const normalized = [];
  for (const col of columns) {
    if (!col?.key) continue;
    const base = byKey.get(col.key) || {};
    normalized.push({
      key: slugify(col.key),
      label: String(col.label || base.label || col.key).slice(0, 40),
      icon: ICON_OPTIONS.includes(col.icon) ? col.icon : (base.icon || "fa-list-check"),
      tone: TONES[col.tone] ? col.tone : (base.tone || "blue"),
      visible: col.visible !== false,
      locked: Boolean(base.locked || col.locked),
    });
    byKey.delete(col.key);
  }
  for (const col of byKey.values()) normalized.push(col);
  return normalized.length ? normalized : DEFAULT_COLUMNS;
}

function columnMeta(columns, key) {
  return columns.find((c) => c.key === key) || { key, label: key, icon: "fa-list-check", tone: "slate", visible: true };
}

function toneClasses(tone) {
  return TONES[tone] || TONES.slate;
}

export default function SuiviClientsClient() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [centralFollowUp, setCentralFollowUp] = useState(null);
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [showColumns, setShowColumns] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
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
    fetch(`/api/admin/settings?key=${SETTINGS_KEY}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.value) return;
        setColumns(normalizeColumns(JSON.parse(data.value)));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => load(search), 250);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const visibleColumns = useMemo(() => columns.filter((c) => c.visible), [columns]);

  const visibleFollowUps = useMemo(() => {
    const allowed = new Set(visibleColumns.map((c) => c.key));
    return followUps.filter((f) => allowed.has(f.status));
  }, [followUps, visibleColumns]);

  const byColumn = useMemo(() => {
    const result = new Map(visibleColumns.map((c) => [c.key, []]));
    for (const followUp of visibleFollowUps) {
      if (!result.has(followUp.status)) result.set(followUp.status, []);
      result.get(followUp.status).push(followUp);
    }
    return result;
  }, [visibleColumns, visibleFollowUps]);

  const stats = useMemo(() => {
    const active = followUps.filter((f) => !TERMINAL.has(f.status));
    return {
      active: active.length,
      toCall: followUps.filter((f) => f.status === "to_call").length,
      estimates: followUps.filter((f) => f.status === "estimate_sent").length,
      late: active.filter((f) => isLate(f.nextActionDate)).length,
      activities: followUps.reduce((sum, f) => sum + (f.activity?.counts?.total || 0), 0),
    };
  }, [followUps]);

  function openCreate(status = columns[0]?.key || "to_call") {
    setEditing(null);
    setForm({ ...EMPTY_FORM, status });
    setSelectedClient(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(followUp) {
    setEditing(followUp);
    setSelectedClient(followUp.client || null);
    setForm({
      title: followUp.title || "",
      status: followUp.status || columns[0]?.key || "to_call",
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
    if (!status || followUp.status === status) return;
    const previous = followUps;
    setFollowUps((items) => items.map((item) => item.id === followUp.id ? { ...item, status } : item));
    const res = await fetch(`/api/admin/follow-ups/${followUp.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) setFollowUps(previous);
    else load(search);
  }

  async function deleteFollowUp(followUp) {
    if (!confirm(`Supprimer le suivi "${followUp.title}"?`)) return;
    const res = await fetch(`/api/admin/follow-ups/${followUp.id}`, { method: "DELETE" });
    if (res.ok) load(search);
  }

  async function saveColumns(nextColumns) {
    const normalized = normalizeColumns(nextColumns);
    setColumns(normalized);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: SETTINGS_KEY, value: JSON.stringify(normalized) }),
    }).catch(() => {});
  }

  function handleDrop(columnKey) {
    const followUp = followUps.find((f) => f.id === draggedId);
    setDraggedId(null);
    if (followUp) quickStatus(followUp, columnKey);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div>
          <h1 className="admin-text text-2xl font-extrabold">Suivi clients</h1>
          <p className="admin-text-muted text-sm mt-1">
            Centrale Kanban: chats, rendez-vous, bons, estimes et relances dans un seul tableau.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowColumns(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm font-bold"
          >
            <i className="fas fa-sliders"></i>
            Colonnes
          </button>
          <button
            onClick={() => openCreate()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-sm font-bold"
          >
            <i className="fas fa-plus"></i>
            Ajouter un suivi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <StatCard label="Suivis actifs" value={stats.active} icon="fa-list-check" tone="sky" />
        <StatCard label="A appeler" value={stats.toCall} icon="fa-phone" tone="blue" />
        <StatCard label="Estimes envoyes" value={stats.estimates} icon="fa-file-invoice-dollar" tone="amber" />
        <StatCard label="En retard" value={stats.late} icon="fa-bell" tone="amber" />
        <StatCard label="Activites liees" value={stats.activities} icon="fa-layer-group" tone="emerald" />
      </div>

      <div className="admin-card border rounded-xl p-4 mb-6">
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
      </div>

      {loading ? (
        <div className="text-center py-12 admin-text-muted">
          <i className="fas fa-spinner fa-spin text-2xl"></i>
        </div>
      ) : visibleFollowUps.length === 0 ? (
        <div className="admin-card border rounded-xl text-center py-12 admin-text-muted">
          <i className="fas fa-columns text-4xl mb-3"></i>
          <p>Aucune carte dans les colonnes visibles</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-3">
          <div className="grid auto-cols-[minmax(290px,1fr)] grid-flow-col gap-4 min-h-[560px]">
            {visibleColumns.map((column) => (
              <KanbanColumn
                key={column.key}
                column={column}
                items={byColumn.get(column.key) || []}
                columns={columns}
                onAdd={() => openCreate(column.key)}
                onEdit={openEdit}
                onDelete={deleteFollowUp}
                onCentral={setCentralFollowUp}
                onDragStart={setDraggedId}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <FollowUpForm
          editing={editing}
          form={form}
          setForm={setForm}
          selectedClient={selectedClient}
          columns={columns}
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

      {centralFollowUp && (
        <CentralModal followUp={centralFollowUp} columns={columns} onClose={() => setCentralFollowUp(null)} />
      )}

      {showColumns && (
        <ColumnEditor
          columns={columns}
          onClose={() => setShowColumns(false)}
          onSave={saveColumns}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, tone }) {
  const t = toneClasses(tone);
  return (
    <div className="admin-card border rounded-xl p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.soft}`}>
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

function KanbanColumn({ column, items, columns, onAdd, onEdit, onDelete, onCentral, onDragStart, onDrop }) {
  const t = toneClasses(column.tone);
  const totalEstimate = items.reduce((sum, item) => sum + (Number(item.estimateAmount) || 0), 0);

  return (
    <section
      className={`admin-card border ${t.border} rounded-xl min-h-[560px] flex flex-col`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(column.key)}
    >
      <div className="p-4 border-b admin-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.soft}`}>
                <i className={`fas ${column.icon} text-xs`}></i>
              </span>
              <h2 className="admin-text font-extrabold truncate">{column.label}</h2>
            </div>
            <p className="admin-text-muted text-xs mt-2">
              {items.length} carte{items.length > 1 ? "s" : ""}{totalEstimate > 0 ? ` | ${totalEstimate.toFixed(2)} $` : ""}
            </p>
          </div>
          <button onClick={onAdd} className="w-8 h-8 rounded-lg admin-hover admin-text-muted hover:admin-text shrink-0" title="Ajouter">
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {items.length === 0 ? (
          <div className="border border-dashed admin-border rounded-xl min-h-32 flex items-center justify-center admin-text-muted text-sm">
            Glisser ici
          </div>
        ) : (
          items.map((followUp) => (
            <KanbanCard
              key={followUp.id}
              followUp={followUp}
              columns={columns}
              onEdit={onEdit}
              onDelete={onDelete}
              onCentral={onCentral}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </section>
  );
}

function KanbanCard({ followUp, columns, onEdit, onDelete, onCentral, onDragStart }) {
  const meta = columnMeta(columns, followUp.status);
  const t = toneClasses(meta.tone);
  const late = isLate(followUp.nextActionDate) && !TERMINAL.has(followUp.status);
  const clientName = followUp.client?.name || followUp.contactName || followUp.title;
  const phone = followUp.phone || followUp.client?.phone;
  const email = followUp.email || followUp.client?.email;
  const counts = followUp.activity?.counts || { chats: 0, workOrders: 0, appointments: 0, total: 0 };

  return (
    <article
      draggable
      onDragStart={() => onDragStart(followUp.id)}
      className={`rounded-xl border admin-border admin-bg p-4 shadow-sm cursor-grab active:cursor-grabbing hover:ring-2 ${t.ring} transition-all`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="admin-text font-extrabold truncate">{clientName}</p>
          <p className="admin-text-muted text-xs truncate mt-1">{followUp.service || "Service non precise"}</p>
        </div>
        <span className={`text-[10px] font-bold rounded-full px-2 py-1 shrink-0 ${t.badge}`}>
          {meta.label}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-xs">
        {phone && <a href={`tel:${phone}`} className="text-sky-300 hover:underline block truncate">{phone}</a>}
        {email && <a href={`mailto:${email}`} className="admin-text-muted hover:admin-text block truncate">{email}</a>}
      </div>

      <div className={`mt-3 rounded-lg px-3 py-2 ${late ? "bg-amber-500/10 text-amber-300" : "bg-white/5 admin-text-muted"}`}>
        <p className="text-[10px] uppercase tracking-wider font-bold">Prochain suivi</p>
        <p className="text-xs font-semibold mt-0.5">{formatDate(followUp.nextActionDate)}</p>
        <p className="text-xs line-clamp-2 mt-1">{followUp.nextAction || "-"}</p>
      </div>

      <button
        type="button"
        onClick={() => onCentral(followUp)}
        className="mt-3 w-full text-left rounded-lg admin-hover px-2 py-2"
      >
        <div className="flex flex-wrap gap-1.5">
          <MiniCount icon="fa-comments" value={counts.chats} label="chats" />
          <MiniCount icon="fa-clipboard-list" value={counts.workOrders} label="bons" />
          <MiniCount icon="fa-calendar-check" value={counts.appointments} label="rdv" />
        </div>
      </button>

      {followUp.estimateAmount ? (
        <p className="admin-text text-sm font-bold mt-2">{Number(followUp.estimateAmount).toFixed(2)} $</p>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-2">
        {followUp.client?.id ? (
          <Link href={`/admin/clients/${followUp.client.id}`} className="admin-text-muted hover:admin-text text-xs">
            Fiche client
          </Link>
        ) : <span />}
        <div className="flex items-center gap-3">
          <button onClick={() => onEdit(followUp)} className="admin-text-muted hover:admin-text text-xs" title="Modifier">
            <i className="fas fa-pen"></i>
          </button>
          <button onClick={() => onDelete(followUp)} className="text-amber-300 hover:text-amber-200 text-xs" title="Supprimer">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </article>
  );
}

function MiniCount({ icon, value, label }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold ${value > 0 ? "bg-cyan-500/10 text-cyan-300" : "bg-white/5 admin-text-muted"}`}>
      <i className={`fas ${icon}`}></i>
      {value} {label}
    </span>
  );
}

function CentralModal({ followUp, columns, onClose }) {
  const activity = followUp.activity || {};
  const counts = activity.counts || { chats: 0, workOrders: 0, appointments: 0, total: 0 };
  const name = followUp.client?.name || followUp.contactName || followUp.title;
  const phone = followUp.phone || followUp.client?.phone;
  const email = followUp.email || followUp.client?.email;
  const meta = columnMeta(columns, followUp.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="admin-bg admin-border border rounded-xl w-full max-w-6xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b admin-border flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <p className="admin-text-muted text-xs uppercase tracking-wider font-bold">Centrale client</p>
            <h2 className="admin-text text-xl font-extrabold">{name}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-1">
              {phone && <a href={`tel:${phone}`} className="text-sky-300 hover:underline">{phone}</a>}
              {email && <a href={`mailto:${email}`} className="admin-text-muted hover:admin-text">{email}</a>}
              {followUp.client?.id && (
                <Link href={`/admin/clients/${followUp.client.id}`} className="admin-text-muted hover:admin-text">
                  Fiche client
                </Link>
              )}
            </div>
          </div>
          <button onClick={onClose} className="admin-text-muted hover:admin-text self-start lg:self-center">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <CentralStat label="Chats" value={counts.chats} icon="fa-comments" />
            <CentralStat label="Bons" value={counts.workOrders} icon="fa-clipboard-list" />
            <CentralStat label="Rendez-vous" value={counts.appointments} icon="fa-calendar-check" />
            <CentralStat label="Total activites" value={counts.total} icon="fa-layer-group" />
          </div>

          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">
            <div className="admin-card border rounded-xl p-4">
              <h3 className="admin-text font-bold mb-3">Suivi courant</h3>
              <InfoLine label="Statut" value={meta.label} />
              <InfoLine label="Prochaine action" value={followUp.nextAction || "-"} />
              <InfoLine label="Date de suivi" value={formatDate(followUp.nextActionDate)} />
              <InfoLine label="Estime" value={followUp.estimateAmount ? `${Number(followUp.estimateAmount).toFixed(2)} $` : "-"} />
              {followUp.notes && (
                <div className="mt-3">
                  <p className="admin-text-muted text-xs uppercase tracking-wider font-bold mb-1">Notes</p>
                  <p className="admin-text text-sm whitespace-pre-wrap">{followUp.notes}</p>
                </div>
              )}
            </div>

            <div className="admin-card border rounded-xl p-4">
              <h3 className="admin-text font-bold mb-3">Activite recente</h3>
              {activity.recent?.length > 0 ? (
                <div className="space-y-2">
                  {activity.recent.map((item) => (
                    <Link key={`${item.type}-${item.id}`} href={item.href} className="flex items-start gap-3 rounded-lg admin-hover px-3 py-2">
                      <ActivityIcon type={item.type} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="admin-text font-semibold text-sm truncate">{item.title}</p>
                          <p className="admin-text-muted text-xs shrink-0">{formatDate(item.date)}</p>
                        </div>
                        <p className="admin-text-muted text-xs truncate">{item.subtitle || item.status || "-"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="admin-text-muted text-sm">Aucune activite reliee pour le moment.</p>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <ActivitySection
              title="Chats"
              icon="fa-comments"
              items={activity.chats || []}
              empty="Aucun chat lie"
              render={(chat) => (
                <Link href={chat.href} className="block rounded-lg admin-hover px-3 py-2">
                  <p className="admin-text font-semibold text-sm truncate">{chat.clientName}</p>
                  <p className="admin-text-muted text-xs truncate">{chat.lastMessage || chat.clientPhone}</p>
                  <p className="admin-text-muted text-[10px] mt-1">{formatDate(chat.lastMessageAt)}{chat.unreadCount > 0 ? ` | ${chat.unreadCount} non-lu` : ""}</p>
                </Link>
              )}
            />
            <ActivitySection
              title="Bons de travail"
              icon="fa-clipboard-list"
              items={activity.workOrders || []}
              empty="Aucun bon lie"
              render={(wo) => (
                <Link href={wo.href} className="block rounded-lg admin-hover px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="admin-text font-semibold text-sm">{wo.number}</p>
                    <p className="admin-text-muted text-xs">{wo.total ? `${Number(wo.total).toFixed(2)} $` : "-"}</p>
                  </div>
                  <p className="admin-text-muted text-xs">{wo.statut}{wo.technicianName ? ` | ${wo.technicianName}` : ""}</p>
                  <p className="admin-text-muted text-[10px] mt-1">{formatDate(wo.date || wo.updatedAt)}</p>
                </Link>
              )}
            />
            <ActivitySection
              title="Rendez-vous"
              icon="fa-calendar-check"
              items={activity.appointments || []}
              empty="Aucun rendez-vous lie"
              render={(appt) => (
                <Link href={appt.href} className="block rounded-lg admin-hover px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="admin-text font-semibold text-sm">{appt.timeSlot}</p>
                    <p className="admin-text-muted text-xs">{appt.status}</p>
                  </div>
                  <p className="admin-text-muted text-xs truncate">{appt.serviceType}</p>
                  <p className="admin-text-muted text-[10px] mt-1">{formatDate(appt.date)}</p>
                </Link>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CentralStat({ label, value, icon }) {
  return (
    <div className="admin-card border rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-300 flex items-center justify-center">
          <i className={`fas ${icon}`}></i>
        </div>
        <div>
          <p className="admin-text-muted text-xs uppercase tracking-wider font-bold">{label}</p>
          <p className="admin-text text-xl font-extrabold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b admin-border py-2 last:border-b-0">
      <p className="admin-text-muted text-xs uppercase tracking-wider font-bold">{label}</p>
      <p className="admin-text text-sm text-right">{value}</p>
    </div>
  );
}

function ActivityIcon({ type }) {
  const icon = type === "chat" ? "fa-comments" : type === "appointment" ? "fa-calendar-check" : "fa-clipboard-list";
  return (
    <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-300 flex items-center justify-center shrink-0">
      <i className={`fas ${icon} text-xs`}></i>
    </span>
  );
}

function ActivitySection({ title, icon, items, empty, render }) {
  return (
    <div className="admin-card border rounded-xl p-4">
      <h3 className="admin-text font-bold mb-3">
        <i className={`fas ${icon} text-cyan-300 mr-2`}></i>{title}
      </h3>
      {items.length > 0 ? (
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id}>{render(item)}</div>
          ))}
        </div>
      ) : (
        <p className="admin-text-muted text-sm">{empty}</p>
      )}
    </div>
  );
}

function FollowUpForm({
  editing,
  form,
  setForm,
  selectedClient,
  columns,
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
                <button type="button" onClick={onPickClient} className="px-3 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold">
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
            <Field label="Colonne">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full">
                {columns.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
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

          {error && <p className="text-sm text-amber-300">{error}</p>}
        </div>

        <div className="px-5 py-4 border-t admin-border flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 admin-text-muted admin-hover rounded-lg text-sm">
            Annuler
          </button>
          <button type="submit" disabled={saving} className="px-5 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-sm font-bold disabled:opacity-50">
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

function ColumnEditor({ columns, onSave, onClose }) {
  const [draft, setDraft] = useState(columns);
  const [newLabel, setNewLabel] = useState("");

  function updateColumn(index, patch) {
    setDraft((items) => items.map((item, i) => i === index ? { ...item, ...patch } : item));
  }

  function move(index, direction) {
    const next = [...draft];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setDraft(next);
  }

  function addColumn() {
    const label = newLabel.trim();
    if (!label) return;
    const baseKey = slugify(label) || "colonne";
    let key = baseKey;
    let n = 2;
    while (draft.some((c) => c.key === key)) {
      key = `${baseKey}_${n}`;
      n += 1;
    }
    setDraft((items) => [...items, { key, label, icon: "fa-list-check", tone: "blue", visible: true, locked: false }]);
    setNewLabel("");
  }

  async function submit(e) {
    e.preventDefault();
    await onSave(draft);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={submit}
        className="admin-bg admin-border border rounded-xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b admin-border">
          <div>
            <h2 className="admin-text font-bold text-lg">Colonnes du Kanban</h2>
            <p className="admin-text-muted text-xs mt-1">Renomme, masque, ajoute et deplace les colonnes.</p>
          </div>
          <button type="button" onClick={onClose} className="admin-text-muted hover:admin-text">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-5 space-y-3">
          {draft.map((column, index) => {
            const t = toneClasses(column.tone);
            return (
              <div key={column.key} className="admin-card border admin-border rounded-xl p-3 grid grid-cols-1 lg:grid-cols-[auto_1fr_150px_150px_auto] gap-3 lg:items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.soft}`}>
                  <i className={`fas ${column.icon}`}></i>
                </div>
                <input
                  value={column.label}
                  onChange={(e) => updateColumn(index, { label: e.target.value })}
                  className="admin-input border rounded-lg px-3 py-2 text-sm w-full"
                />
                <select
                  value={column.icon}
                  onChange={(e) => updateColumn(index, { icon: e.target.value })}
                  className="admin-input border rounded-lg px-3 py-2 text-sm"
                >
                  {ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{icon.replace("fa-", "")}</option>)}
                </select>
                <select
                  value={column.tone}
                  onChange={(e) => updateColumn(index, { tone: e.target.value })}
                  className="admin-input border rounded-lg px-3 py-2 text-sm"
                >
                  {Object.entries(TONES).map(([key, tone]) => <option key={key} value={key}>{tone.label}</option>)}
                </select>
                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => updateColumn(index, { visible: !column.visible })} className={`w-9 h-9 rounded-lg ${column.visible ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 admin-text-muted"}`} title="Afficher / masquer">
                    <i className={`fas ${column.visible ? "fa-eye" : "fa-eye-slash"}`}></i>
                  </button>
                  <button type="button" onClick={() => move(index, -1)} className="w-9 h-9 rounded-lg admin-hover admin-text-muted" title="Monter">
                    <i className="fas fa-arrow-left"></i>
                  </button>
                  <button type="button" onClick={() => move(index, 1)} className="w-9 h-9 rounded-lg admin-hover admin-text-muted" title="Descendre">
                    <i className="fas fa-arrow-right"></i>
                  </button>
                  {!column.locked && (
                    <button type="button" onClick={() => setDraft((items) => items.filter((_, i) => i !== index))} className="w-9 h-9 rounded-lg text-amber-300 hover:bg-amber-500/10" title="Retirer">
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <div className="admin-card border admin-border rounded-xl p-3 flex flex-col md:flex-row gap-3">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Nouvelle colonne"
              className="admin-input border rounded-lg px-3 py-2 text-sm flex-1"
            />
            <button type="button" onClick={addColumn} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-sm font-bold">
              <i className="fas fa-plus mr-2"></i>Ajouter
            </button>
          </div>
        </div>

        <div className="px-5 py-4 border-t admin-border flex justify-between gap-3">
          <button type="button" onClick={() => setDraft(DEFAULT_COLUMNS)} className="px-4 py-2 admin-text-muted admin-hover rounded-lg text-sm">
            Restaurer defaut
          </button>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 admin-text-muted admin-hover rounded-lg text-sm">
              Annuler
            </button>
            <button type="submit" className="px-5 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-sm font-bold">
              Enregistrer les colonnes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
