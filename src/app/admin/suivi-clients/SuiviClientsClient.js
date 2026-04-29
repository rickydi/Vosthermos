"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
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

function addPhotoToActivity(activity = {}, photo) {
  const existingPhotos = activity.photos || [];
  const photos = [photo, ...existingPhotos.filter((item) => item.id !== photo.id)];
  return {
    ...activity,
    photos,
    counts: {
      ...(activity.counts || {}),
      photos: photos.length,
    },
  };
}

function removePhotoFromActivity(activity = {}, photoId) {
  const photos = (activity.photos || []).filter((item) => item.photoId !== photoId);
  return {
    ...activity,
    photos,
    counts: {
      ...(activity.counts || {}),
      photos: photos.length,
    },
  };
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
  const [activeDragId, setActiveDragId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [recentlyMovedId, setRecentlyMovedId] = useState(null);
  const [moveFeedback, setMoveFeedback] = useState(null);
  const timer = useRef(null);
  const moveTimer = useRef(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

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
    return () => clearTimeout(moveTimer.current);
  }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => load(search), 250);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const visibleColumns = useMemo(() => columns.filter((c) => c.visible), [columns]);
  const visibleColumnKeys = useMemo(() => new Set(visibleColumns.map((c) => c.key)), [visibleColumns]);

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

  const activeDragItem = useMemo(
    () => followUps.find((followUp) => followUp.id === activeDragId) || null,
    [followUps, activeDragId]
  );

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
    setRecentlyMovedId(followUp.id);
    setMoveFeedback({ id: followUp.id, label: columnMeta(columns, status).label });
    clearTimeout(moveTimer.current);
    moveTimer.current = setTimeout(() => {
      setRecentlyMovedId(null);
      setMoveFeedback(null);
    }, 1400);
    try {
      const res = await fetch(`/api/admin/follow-ups/${followUp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        clearTimeout(moveTimer.current);
        setRecentlyMovedId(null);
        setMoveFeedback(null);
        setFollowUps(previous);
        return;
      }
      const updated = await res.json().catch(() => null);
      if (updated) {
        setFollowUps((items) => items.map((item) => item.id === followUp.id
          ? { ...item, ...updated, status, activity: item.activity || updated.activity }
          : item));
      }
    } catch {
      clearTimeout(moveTimer.current);
      setRecentlyMovedId(null);
      setMoveFeedback(null);
      setFollowUps(previous);
    }
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

  async function saveCentralNotes(followUp, notes) {
    const previousFollowUps = followUps;
    const previousCentral = centralFollowUp;
    setFollowUps((items) => items.map((item) => item.id === followUp.id ? { ...item, notes } : item));
    setCentralFollowUp((current) => current?.id === followUp.id ? { ...current, notes } : current);
    try {
      const res = await fetch(`/api/admin/follow-ups/${followUp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const updated = await res.json().catch(() => null);
      if (!res.ok) throw new Error(updated?.error || "Erreur lors de la sauvegarde");
      if (updated) {
        setFollowUps((items) => items.map((item) => item.id === followUp.id
          ? { ...item, ...updated, activity: item.activity || updated.activity }
          : item));
        setCentralFollowUp((current) => current?.id === followUp.id
          ? { ...current, ...updated, activity: current.activity || updated.activity }
          : current);
      }
    } catch (err) {
      setFollowUps(previousFollowUps);
      setCentralFollowUp(previousCentral);
      throw err;
    }
  }

  function handleCentralPhotoAdded(followUpId, photo) {
    setFollowUps((items) => items.map((item) => item.id === followUpId
      ? { ...item, activity: addPhotoToActivity(item.activity, photo) }
      : item));
    setCentralFollowUp((current) => current?.id === followUpId
      ? { ...current, activity: addPhotoToActivity(current.activity, photo) }
      : current);
  }

  function handleCentralPhotoDeleted(followUpId, photoId) {
    setFollowUps((items) => items.map((item) => item.id === followUpId
      ? { ...item, activity: removePhotoFromActivity(item.activity, photoId) }
      : item));
    setCentralFollowUp((current) => current?.id === followUpId
      ? { ...current, activity: removePhotoFromActivity(current.activity, photoId) }
      : current);
  }

  function handleDragStart(event) {
    setActiveDragId(Number(event.active.id));
  }

  function handleDragOver(event) {
    const columnKey = event.over?.id ? String(event.over.id) : null;
    setDragOverColumn(columnKey && visibleColumnKeys.has(columnKey) ? columnKey : null);
  }

  function handleDragCancel() {
    setActiveDragId(null);
    setDragOverColumn(null);
  }

  function handleDragEnd(event) {
    const followUp = followUps.find((f) => f.id === Number(event.active.id));
    const columnKey = event.over?.id ? String(event.over.id) : null;
    setActiveDragId(null);
    setDragOverColumn(null);
    if (followUp && visibleColumnKeys.has(columnKey)) quickStatus(followUp, columnKey);
  }

  return (
    <div className="p-6 lg:p-8">
      <style jsx global>{`
        .kanban-card-pressed {
          transform: translateY(-4px) scale(1.018);
          box-shadow: 0 16px 34px rgba(8, 145, 178, 0.18);
          border-color: rgba(103, 232, 249, 0.55);
        }
        .kanban-card-source-dragging {
          transform: scale(0.985);
          opacity: 0.34;
          border-color: rgba(103, 232, 249, 0.68);
        }
        .kanban-drag-overlay {
          width: min(330px, calc(100vw - 32px));
          transform-origin: center;
          animation: kanban-overlay-in 140ms ease-out both;
          box-shadow: 0 30px 75px rgba(8, 145, 178, 0.34), 0 0 0 1px rgba(103, 232, 249, 0.5);
        }
        .kanban-card-dropped {
          animation: kanban-card-drop 980ms cubic-bezier(0.2, 0.85, 0.2, 1);
        }
        .kanban-card-dropped::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.18), transparent);
          transform: translateX(-120%);
          animation: kanban-card-sheen 760ms ease-out;
        }
        .kanban-drop-badge {
          animation: kanban-drop-badge 980ms ease-out both;
        }
        @keyframes kanban-overlay-in {
          0% { opacity: 0.72; transform: scale(0.96) rotate(0deg); }
          100% { opacity: 1; transform: scale(1.035) rotate(1.15deg); }
        }
        @keyframes kanban-card-drop {
          0% { transform: translateY(-18px) scale(1.04); box-shadow: 0 26px 60px rgba(8, 145, 178, 0.30); }
          44% { transform: translateY(3px) scale(0.992); }
          68% { transform: translateY(-2px) scale(1.006); }
          100% { transform: translateY(0) scale(1); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12); }
        }
        @keyframes kanban-card-sheen {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
        @keyframes kanban-drop-badge {
          0% { opacity: 0; transform: translateY(-8px) scale(0.92); }
          18% { opacity: 1; transform: translateY(0) scale(1.04); }
          78% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-4px) scale(0.98); }
        }
      `}</style>
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

      {moveFeedback && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm font-bold text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.16)]">
          <i className="fas fa-arrows-alt"></i>
          Carte deplacee vers {moveFeedback.label}
        </div>
      )}

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragCancel={handleDragCancel}
            onDragEnd={handleDragEnd}
          >
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
                  isDragOver={dragOverColumn === column.key}
                  activeDragId={activeDragId}
                  recentlyMovedId={recentlyMovedId}
                />
              ))}
            </div>
            <DragOverlay
              adjustScale={false}
              dropAnimation={{ duration: 260, easing: "cubic-bezier(0.2, 0.85, 0.2, 1)" }}
              zIndex={70}
            >
              {activeDragItem ? <KanbanCardPreview followUp={activeDragItem} columns={columns} /> : null}
            </DragOverlay>
          </DndContext>
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
        <CentralModal
          key={centralFollowUp.id}
          followUp={centralFollowUp}
          columns={columns}
          onSaveNotes={saveCentralNotes}
          onPhotoAdded={handleCentralPhotoAdded}
          onPhotoDeleted={handleCentralPhotoDeleted}
          onClose={() => setCentralFollowUp(null)}
        />
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

function KanbanColumn({
  column,
  items,
  columns,
  onAdd,
  onEdit,
  onDelete,
  onCentral,
  isDragOver,
  activeDragId,
  recentlyMovedId,
}) {
  const { isOver, setNodeRef } = useDroppable({ id: column.key });
  const t = toneClasses(column.tone);
  const totalEstimate = items.reduce((sum, item) => sum + (Number(item.estimateAmount) || 0), 0);
  const active = isDragOver || isOver;

  return (
    <section
      ref={setNodeRef}
      className={`admin-card border ${t.border} rounded-xl min-h-[560px] flex flex-col transition-all duration-200 ${
        active ? "ring-2 ring-cyan-300/40 bg-cyan-500/5 shadow-[0_0_30px_rgba(34,211,238,0.08)]" : ""
      }`}
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
              isDragging={activeDragId === followUp.id}
              highlighted={recentlyMovedId === followUp.id}
            />
          ))
        )}
      </div>
    </section>
  );
}

function isInteractiveTarget(target) {
  return Boolean(target?.closest?.("a,button,input,textarea,select,label"));
}

function KanbanCard({ followUp, columns, onEdit, onDelete, onCentral, isDragging, highlighted }) {
  const [pressed, setPressed] = useState(false);
  const didDrag = useRef(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging: dndDragging,
  } = useDraggable({ id: followUp.id });
  const meta = columnMeta(columns, followUp.status);
  const t = toneClasses(meta.tone);
  const late = isLate(followUp.nextActionDate) && !TERMINAL.has(followUp.status);
  const clientName = followUp.client?.name || followUp.contactName || followUp.title;
  const phone = followUp.phone || followUp.client?.phone;
  const email = followUp.email || followUp.client?.email;
  const counts = followUp.activity?.counts || { chats: 0, workOrders: 0, appointments: 0, total: 0 };
  const dragging = isDragging || dndDragging;
  const dragListeners = { ...(listeners || {}) };
  const startPointerDrag = dragListeners.onPointerDown;
  delete dragListeners.onPointerDown;

  useEffect(() => {
    if (dragging) didDrag.current = true;
  }, [dragging]);

  return (
    <article
      ref={setNodeRef}
      {...attributes}
      {...dragListeners}
      onPointerDown={(e) => {
        if (isInteractiveTarget(e.target)) return;
        setPressed(true);
        startPointerDrag?.(e);
      }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onClick={(e) => {
        if (isInteractiveTarget(e.target)) return;
        if (didDrag.current) {
          didDrag.current = false;
          return;
        }
        onCentral(followUp);
      }}
      className={`relative overflow-hidden rounded-xl border admin-border admin-bg p-4 shadow-sm cursor-grab active:cursor-grabbing hover:ring-2 ${t.ring} transition-all duration-300 ${
        dragging ? "kanban-card-source-dragging ring-2 ring-cyan-300/70" : ""
      } ${
        pressed && !dragging ? "kanban-card-pressed ring-2 ring-cyan-300/55" : ""
      } ${
        highlighted ? "kanban-card-dropped ring-2 ring-cyan-300/80" : ""
      }`}
    >
      {dragging && (
        <div className="absolute inset-x-3 top-3 z-10 rounded-lg border border-cyan-300/35 bg-cyan-500/10 px-3 py-2 text-xs font-extrabold text-cyan-100">
          <i className="fas fa-hand-pointer mr-2"></i>En mouvement
        </div>
      )}
      {highlighted && (
        <div className="kanban-drop-badge absolute right-3 top-3 z-10 rounded-full bg-cyan-500 px-3 py-1 text-[10px] font-extrabold text-slate-950 shadow-[0_0_22px_rgba(34,211,238,0.35)]">
          <i className="fas fa-check mr-1"></i>Deposee
        </div>
      )}
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
          <MiniCount icon="fa-images" value={counts.photos || 0} label="photos" />
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

function KanbanCardPreview({ followUp, columns }) {
  const meta = columnMeta(columns, followUp.status);
  const t = toneClasses(meta.tone);
  const late = isLate(followUp.nextActionDate) && !TERMINAL.has(followUp.status);
  const clientName = followUp.client?.name || followUp.contactName || followUp.title;
  const phone = followUp.phone || followUp.client?.phone;
  const email = followUp.email || followUp.client?.email;
  const counts = followUp.activity?.counts || { chats: 0, workOrders: 0, appointments: 0, total: 0 };

  return (
    <div className={`kanban-drag-overlay relative overflow-hidden rounded-xl border ${t.border} admin-bg p-4 pointer-events-none`}>
      <div className="absolute right-3 top-3 z-10 rounded-full bg-cyan-400 px-3 py-1 text-[10px] font-extrabold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.35)]">
        <i className="fas fa-arrows-alt mr-1"></i>Deplacement
      </div>
      <div className="flex items-start justify-between gap-3 pr-20">
        <div className="min-w-0">
          <p className="admin-text font-extrabold truncate">{clientName}</p>
          <p className="admin-text-muted text-xs truncate mt-1">{followUp.service || "Service non precise"}</p>
        </div>
        <span className={`text-[10px] font-bold rounded-full px-2 py-1 shrink-0 ${t.badge}`}>
          {meta.label}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-xs">
        {phone && <p className="text-sky-300 truncate">{phone}</p>}
        {email && <p className="admin-text-muted truncate">{email}</p>}
      </div>

      <div className={`mt-3 rounded-lg px-3 py-2 ${late ? "bg-amber-500/10 text-amber-300" : "bg-white/5 admin-text-muted"}`}>
        <p className="text-[10px] uppercase tracking-wider font-bold">Prochain suivi</p>
        <p className="text-xs font-semibold mt-0.5">{formatDate(followUp.nextActionDate)}</p>
        <p className="text-xs line-clamp-2 mt-1">{followUp.nextAction || "-"}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <MiniCount icon="fa-comments" value={counts.chats} label="chats" />
        <MiniCount icon="fa-clipboard-list" value={counts.workOrders} label="bons" />
        <MiniCount icon="fa-calendar-check" value={counts.appointments} label="rdv" />
        <MiniCount icon="fa-images" value={counts.photos || 0} label="photos" />
      </div>
    </div>
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

function CentralModal({ followUp, columns, onSaveNotes, onPhotoAdded, onPhotoDeleted, onClose }) {
  const activity = followUp.activity || {};
  const counts = activity.counts || { chats: 0, workOrders: 0, appointments: 0, photos: 0, total: 0 };
  const photos = activity.photos || [];
  const name = followUp.client?.name || followUp.contactName || followUp.title;
  const phone = followUp.phone || followUp.client?.phone;
  const email = followUp.email || followUp.client?.email;
  const meta = columnMeta(columns, followUp.status);
  const [activeTab, setActiveTab] = useState("suivi");
  const [notesDraft, setNotesDraft] = useState(followUp.notes || "");
  const [noteState, setNoteState] = useState("idle");
  const [noteError, setNoteError] = useState("");
  const [embeddedView, setEmbeddedView] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoNotes, setPhotoNotes] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const photoInputRef = useRef(null);
  const savedTimer = useRef(null);
  const notesDirty = notesDraft !== (followUp.notes || "");

  useEffect(() => {
    return () => clearTimeout(savedTimer.current);
  }, []);

  async function saveNotes() {
    setNoteState("saving");
    setNoteError("");
    try {
      await onSaveNotes(followUp, notesDraft);
      setNoteState("saved");
      clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setNoteState("idle"), 1400);
    } catch (err) {
      setNoteState("idle");
      setNoteError(err.message || "Erreur lors de la sauvegarde");
    }
  }

  function openEmbeddedView(view) {
    if (!view?.href) return;
    setEmbeddedView(view);
  }

  async function uploadPhotos(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setPhotoUploading(true);
    setPhotoError("");
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("photo", file);
        if (files.length === 1 && photoTitle.trim()) formData.append("title", photoTitle.trim());
        if (photoNotes.trim()) formData.append("notes", photoNotes.trim());
        const res = await fetch(`/api/admin/follow-ups/${followUp.id}/photos`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Erreur upload photo");
        onPhotoAdded(followUp.id, data);
      }
      setPhotoTitle("");
      setPhotoNotes("");
    } catch (err) {
      setPhotoError(err.message || "Erreur upload photo");
    } finally {
      setPhotoUploading(false);
    }
  }

  async function deletePhoto(photo) {
    if (!photo?.photoId || !photo.canDelete) return;
    if (!confirm("Supprimer cette photo du suivi client?")) return;
    setPhotoError("");
    try {
      const res = await fetch(`/api/admin/client-photos/${photo.photoId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur suppression photo");
      onPhotoDeleted(followUp.id, photo.photoId);
      if (selectedPhoto?.photoId === photo.photoId) setSelectedPhoto(null);
    } catch (err) {
      setPhotoError(err.message || "Erreur suppression photo");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="admin-bg admin-border border rounded-xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden shadow-2xl"
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

        <div className="p-5 space-y-6 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <CentralStat label="Chats" value={counts.chats} icon="fa-comments" />
            <CentralStat label="Bons" value={counts.workOrders} icon="fa-clipboard-list" />
            <CentralStat label="Rendez-vous" value={counts.appointments} icon="fa-calendar-check" />
            <CentralStat label="Photos" value={counts.photos || photos.length} icon="fa-images" />
            <CentralStat label="Total activites" value={counts.total} icon="fa-layer-group" />
          </div>

          <div className="flex flex-wrap gap-2 border-b admin-border">
            {[
              { key: "suivi", label: "Suivi", icon: "fa-list-check" },
              { key: "photos", label: `Photos (${photos.length})`, icon: "fa-images" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-cyan-300 text-cyan-200"
                    : "border-transparent admin-text-muted hover:admin-text"
                }`}
              >
                <i className={`fas ${tab.icon} mr-2`}></i>{tab.label}
              </button>
            ))}
          </div>

          {activeTab === "photos" ? (
            <>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={uploadPhotos}
                disabled={photoUploading}
              />
              <PhotoTab
                photos={photos}
                onSelect={setSelectedPhoto}
                onUpload={() => photoInputRef.current?.click()}
                uploading={photoUploading}
                error={photoError}
                photoTitle={photoTitle}
                setPhotoTitle={setPhotoTitle}
                photoNotes={photoNotes}
                setPhotoNotes={setPhotoNotes}
                onDelete={deletePhoto}
              />
            </>
          ) : (
            <>
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">
            <div className="admin-card border rounded-xl p-4">
              <h3 className="admin-text font-bold mb-3">Suivi courant</h3>
              <InfoLine label="Statut" value={meta.label} />
              <InfoLine label="Prochaine action" value={followUp.nextAction || "-"} />
              <InfoLine label="Date de suivi" value={formatDate(followUp.nextActionDate)} />
              <InfoLine label="Estime" value={followUp.estimateAmount ? `${Number(followUp.estimateAmount).toFixed(2)} $` : "-"} />
              <div className="mt-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="admin-text-muted text-xs uppercase tracking-wider font-bold">Notes client</p>
                  <button
                    type="button"
                    onClick={saveNotes}
                    disabled={!notesDirty || noteState === "saving"}
                    className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-600 disabled:opacity-45 disabled:hover:bg-cyan-700"
                  >
                    <i className={`fas ${noteState === "saving" ? "fa-spinner fa-spin" : noteState === "saved" ? "fa-check" : "fa-save"}`}></i>
                    {noteState === "saving" ? "Sauvegarde..." : noteState === "saved" ? "Enregistre" : "Sauvegarder"}
                  </button>
                </div>
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={7}
                  placeholder="Ajouter une note: appel, reponse du client, prochaines consignes..."
                  className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full resize-y min-h-36"
                />
                {noteError && <p className="mt-2 text-xs text-amber-300">{noteError}</p>}
              </div>
            </div>

            <div className="admin-card border rounded-xl p-4">
              <h3 className="admin-text font-bold mb-3">Activite recente</h3>
              {activity.recent?.length > 0 ? (
                <div className="space-y-2">
                  {activity.recent.map((item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      type="button"
                      onClick={() => openEmbeddedView({
                        id: item.id,
                        href: item.href,
                        title: item.title,
                        subtitle: item.subtitle || item.status || "",
                        type: item.type,
                      })}
                      className="flex w-full items-start gap-3 rounded-lg admin-hover px-3 py-2 text-left"
                    >
                      <ActivityIcon type={item.type} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="admin-text font-semibold text-sm truncate">{item.title}</p>
                          <p className="admin-text-muted text-xs shrink-0">{formatDate(item.date)}</p>
                        </div>
                        <p className="admin-text-muted text-xs truncate">{item.subtitle || item.status || "-"}</p>
                      </div>
                    </button>
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
                <button
                  type="button"
                  onClick={() => openEmbeddedView({
                    id: chat.id,
                    href: chat.href,
                    title: "Chat client",
                    subtitle: chat.clientName || chat.clientPhone || "",
                    type: "chat",
                  })}
                  className="block w-full rounded-lg admin-hover px-3 py-2 text-left"
                >
                  <p className="admin-text font-semibold text-sm truncate">{chat.clientName}</p>
                  <p className="admin-text-muted text-xs truncate">{chat.lastMessage || chat.clientPhone}</p>
                  <p className="admin-text-muted text-[10px] mt-1">{formatDate(chat.lastMessageAt)}{chat.unreadCount > 0 ? ` | ${chat.unreadCount} non-lu` : ""}</p>
                </button>
              )}
            />
            <ActivitySection
              title="Bons de travail"
              icon="fa-clipboard-list"
              items={activity.workOrders || []}
              empty="Aucun bon lie"
              render={(wo) => (
                <button
                  type="button"
                  onClick={() => openEmbeddedView({
                    id: wo.id,
                    href: wo.href,
                    title: `Bon ${wo.number}`,
                    subtitle: [wo.statut, wo.technicianName].filter(Boolean).join(" | "),
                    type: "work_order",
                  })}
                  className="block w-full rounded-lg admin-hover px-3 py-2 text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="admin-text font-semibold text-sm">{wo.number}</p>
                    <p className="admin-text-muted text-xs">{wo.total ? `${Number(wo.total).toFixed(2)} $` : "-"}</p>
                  </div>
                  <p className="admin-text-muted text-xs">{wo.statut}{wo.technicianName ? ` | ${wo.technicianName}` : ""}</p>
                  <p className="admin-text-muted text-[10px] mt-1">{formatDate(wo.date || wo.updatedAt)}</p>
                </button>
              )}
            />
            <ActivitySection
              title="Rendez-vous"
              icon="fa-calendar-check"
              items={activity.appointments || []}
              empty="Aucun rendez-vous lie"
              render={(appt) => (
                <button
                  type="button"
                  onClick={() => openEmbeddedView({
                    id: appt.id,
                    href: appt.href,
                    title: `Rendez-vous ${appt.timeSlot}`,
                    subtitle: appt.serviceType || appt.status || "",
                    type: "appointment",
                  })}
                  className="block w-full rounded-lg admin-hover px-3 py-2 text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="admin-text font-semibold text-sm">{appt.timeSlot}</p>
                    <p className="admin-text-muted text-xs">{appt.status}</p>
                  </div>
                  <p className="admin-text-muted text-xs truncate">{appt.serviceType}</p>
                  <p className="admin-text-muted text-[10px] mt-1">{formatDate(appt.date)}</p>
                </button>
              )}
            />
          </div>
            </>
          )}
        </div>

        {embeddedView && (
          <EmbeddedActivityPanel view={embeddedView} onClose={() => setEmbeddedView(null)} />
        )}
        {selectedPhoto && (
          <PhotoViewer photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
        )}
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

function PhotoTab({
  photos,
  onSelect,
  onUpload,
  uploading,
  error,
  photoTitle,
  setPhotoTitle,
  photoNotes,
  setPhotoNotes,
  onDelete,
}) {
  return (
    <div className="space-y-4">
      <div className="admin-card border rounded-xl p-4">
        <div className="flex flex-col xl:flex-row xl:items-end gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="admin-text font-bold">Ajouter des photos</h3>
            <p className="admin-text-muted text-sm mt-1">Choisir une ou plusieurs images; elles seront rattachees a ce client.</p>
            <div className="grid md:grid-cols-[0.9fr_1.4fr] gap-3 mt-3">
              <input
                type="text"
                value={photoTitle}
                onChange={(e) => setPhotoTitle(e.target.value)}
                placeholder="Titre optionnel"
                className="admin-input border rounded-lg px-3 py-2.5 text-sm"
                disabled={uploading}
              />
              <input
                type="text"
                value={photoNotes}
                onChange={(e) => setPhotoNotes(e.target.value)}
                placeholder="Note optionnelle"
                className="admin-input border rounded-lg px-3 py-2.5 text-sm"
                disabled={uploading}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={onUpload}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-600 disabled:opacity-50 disabled:hover:bg-cyan-700"
          >
            <i className={`fas ${uploading ? "fa-spinner fa-spin" : "fa-upload"}`}></i>
            {uploading ? "Upload..." : "Choisir photos"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm font-semibold text-amber-300">{error}</p>}
      </div>

      {!photos.length ? (
        <div className="admin-card border rounded-xl p-10 text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-300 flex items-center justify-center">
            <i className="fas fa-images text-lg"></i>
          </div>
          <p className="admin-text font-bold">Aucune photo reliee a ce client</p>
          <p className="admin-text-muted text-sm mt-1">Les photos ajoutees ici, les photos des bons et les photos des chats apparaitront au meme endroit.</p>
        </div>
      ) : (
        <>
          <div>
            <h3 className="admin-text font-bold">Photos client</h3>
            <p className="admin-text-muted text-sm">{photos.length} photo{photos.length > 1 ? "s" : ""} reliee{photos.length > 1 ? "s" : ""}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative admin-card border admin-border rounded-xl overflow-hidden hover:ring-2 hover:ring-cyan-300/45 transition-all"
              >
                {photo.canDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(photo)}
                    className="absolute right-2 top-2 z-10 w-8 h-8 rounded-lg bg-slate-950/75 text-white/80 hover:text-white hover:bg-slate-900"
                    title="Supprimer"
                  >
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSelect(photo)}
                  className="block w-full text-left"
                >
                  <div className="relative aspect-[4/3] bg-black/20 overflow-hidden">
                    <Image
                      src={photo.url}
                      alt={photo.title || "Photo client"}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.035]"
                      unoptimized
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="admin-text font-bold text-sm truncate">{photo.title || "Photo"}</p>
                      <span className="rounded-full bg-cyan-500/10 text-cyan-300 px-2 py-1 text-[10px] font-bold shrink-0">
                        {photo.source || photo.type}
                      </span>
                    </div>
                    {photo.subtitle && <p className="admin-text-muted text-xs truncate mt-1">{photo.subtitle}</p>}
                    <p className="admin-text-muted text-[10px] mt-2">{formatDate(photo.date)}</p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PhotoViewer({ photo, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-6xl max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="text-white font-extrabold truncate">{photo.title || "Photo client"}</h3>
            <p className="text-white/65 text-sm truncate">{[photo.source, photo.subtitle].filter(Boolean).join(" | ")}</p>
          </div>
          <button type="button" onClick={onClose} className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/15 text-white">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="relative rounded-xl overflow-hidden bg-black/40 flex-1 min-h-[70vh]">
          <Image
            src={photo.url}
            alt={photo.title || "Photo client"}
            fill
            sizes="100vw"
            className="object-contain"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}

function detailApiUrl(view) {
  if (view.type === "chat") return `/api/admin/chat/${view.id}`;
  if (view.type === "work_order") return `/api/admin/work-orders/${view.id}`;
  if (view.type === "appointment") return `/api/admin/appointments/${view.id}`;
  return null;
}

function money(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toFixed(2)} $` : "-";
}

function EmbeddedActivityPanel({ view, onClose }) {
  const icon = view.type === "chat"
    ? "fa-comments"
    : view.type === "appointment"
      ? "fa-calendar-check"
      : "fa-clipboard-list";
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [detailError, setDetailError] = useState("");
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [savingDetail, setSavingDetail] = useState(false);

  async function loadDetail() {
    const url = detailApiUrl(view);
    if (!url) {
      setDetailError("Detail indisponible");
      setLoadingDetail(false);
      return;
    }
    setLoadingDetail(true);
    setDetailError("");
    try {
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Impossible de charger le detail");
      setDetail(data);
    } catch (err) {
      setDetailError(err.message || "Impossible de charger le detail");
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.type, view.id]);

  async function sendChatReply(e) {
    e.preventDefault();
    const content = reply.trim();
    if (!content || sendingReply) return;
    setSendingReply(true);
    setDetailError("");
    try {
      const res = await fetch(`/api/admin/chat/${view.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Impossible d'envoyer le message");
      setReply("");
      await loadDetail();
    } catch (err) {
      setDetailError(err.message || "Impossible d'envoyer le message");
    } finally {
      setSendingReply(false);
    }
  }

  async function updateWorkOrder(patch) {
    if (!detail || savingDetail) return;
    setSavingDetail(true);
    setDetailError("");
    const optimistic = { ...detail, ...patch };
    setDetail(optimistic);
    try {
      const res = await fetch(`/api/admin/work-orders/${view.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Impossible de sauvegarder le bon");
      setDetail(data);
    } catch (err) {
      setDetail(detail);
      setDetailError(err.message || "Impossible de sauvegarder le bon");
    } finally {
      setSavingDetail(false);
    }
  }

  async function updateAppointmentStatus(status) {
    if (!status || savingDetail) return;
    setSavingDetail(true);
    setDetailError("");
    const previous = detail;
    setDetail((current) => ({ ...current, status }));
    try {
      const res = await fetch(`/api/admin/appointments/${view.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Impossible de sauvegarder le rendez-vous");
      setDetail(data);
    } catch (err) {
      setDetail(previous);
      setDetailError(err.message || "Impossible de sauvegarder le rendez-vous");
    } finally {
      setSavingDetail(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm" onClick={onClose}>
      <div
        className="admin-bg admin-border border rounded-xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 border-b admin-border">
          <div className="min-w-0">
            <p className="admin-text-muted text-xs uppercase tracking-wider font-bold">Ouvert dans la centrale</p>
            <h3 className="admin-text font-extrabold truncate">
              <i className={`fas ${icon} text-cyan-300 mr-2`}></i>{view.title}
            </h3>
            {view.subtitle && <p className="admin-text-muted text-xs truncate mt-0.5">{view.subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="inline-flex items-center justify-center gap-2 rounded-lg admin-hover admin-text-muted px-3 py-2 text-sm font-bold">
            <i className="fas fa-arrow-left"></i>
            Retour centrale
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {detailError && (
            <div className="mb-4 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              {detailError}
            </div>
          )}
          {loadingDetail ? (
            <DetailSkeleton />
          ) : view.type === "chat" ? (
            <ChatDetail detail={detail} reply={reply} setReply={setReply} sending={sendingReply} onSend={sendChatReply} />
          ) : view.type === "work_order" ? (
            <WorkOrderDetail detail={detail} saving={savingDetail} onPatch={updateWorkOrder} />
          ) : (
            <AppointmentDetail detail={detail} saving={savingDetail} onStatus={updateAppointmentStatus} />
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-16 rounded-xl bg-white/5 animate-pulse"></div>
      <div className="grid md:grid-cols-3 gap-3">
        <div className="h-28 rounded-xl bg-white/5 animate-pulse"></div>
        <div className="h-28 rounded-xl bg-white/5 animate-pulse"></div>
        <div className="h-28 rounded-xl bg-white/5 animate-pulse"></div>
      </div>
      <div className="h-64 rounded-xl bg-white/5 animate-pulse"></div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2">
      <p className="admin-text-muted text-[10px] uppercase tracking-wider font-bold">{label}</p>
      <p className="admin-text text-sm mt-1 whitespace-pre-wrap">{value || "-"}</p>
    </div>
  );
}

function DetailPill({ children, tone = "cyan" }) {
  const colors = {
    cyan: "bg-cyan-500/10 text-cyan-300",
    amber: "bg-amber-500/10 text-amber-300",
    emerald: "bg-emerald-500/10 text-emerald-300",
    slate: "bg-slate-500/15 text-slate-300",
  };
  return <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${colors[tone] || colors.slate}`}>{children}</span>;
}

function ChatDetail({ detail, reply, setReply, sending, onSend }) {
  const messages = detail?.messages || [];

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-4">
      <div className="admin-card border rounded-xl p-4 space-y-3">
        <div>
          <p className="admin-text-muted text-xs uppercase tracking-wider font-bold">Client</p>
          <h4 className="admin-text text-lg font-extrabold mt-1">{detail?.clientName || "-"}</h4>
        </div>
        <DetailRow label="Telephone" value={detail?.clientPhone} />
        <DetailRow label="Courriel" value={detail?.clientEmail} />
        <DetailRow label="Dernier message" value={formatDate(detail?.lastMessageAt)} />
        <div className="flex flex-wrap gap-2">
          <DetailPill tone={detail?.isArchived ? "slate" : "emerald"}>{detail?.isArchived ? "Archive" : "Actif"}</DetailPill>
          <DetailPill tone={detail?.unreadCount > 0 ? "amber" : "cyan"}>{detail?.unreadCount || 0} non-lu</DetailPill>
        </div>
      </div>

      <div className="admin-card border rounded-xl overflow-hidden flex flex-col min-h-[520px]">
        <div className="px-4 py-3 border-b admin-border">
          <h4 className="admin-text font-bold">Conversation</h4>
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[520px]">
          {messages.length === 0 ? (
            <p className="admin-text-muted text-sm">Aucun message.</p>
          ) : messages.map((message) => {
            const isAdmin = message.senderType === "ADMIN";
            return (
              <div key={message.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-xl px-3 py-2 ${isAdmin ? "bg-cyan-700 text-white" : "bg-white/5 admin-text"}`}>
                  <p className="text-[10px] font-bold opacity-75 mb-1">{message.senderName || message.senderType} | {formatDate(message.createdAt)}</p>
                  {message.content && <p className="text-sm whitespace-pre-wrap">{message.content}</p>}
                  {message.imageUrl && (
                    <a href={message.imageUrl} target="_blank" className="mt-2 block text-xs underline">
                      Voir la piece jointe
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <form onSubmit={onSend} className="border-t admin-border p-3 flex flex-col md:flex-row gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={2}
            placeholder="Repondre au client..."
            className="admin-input border rounded-lg px-3 py-2 text-sm flex-1 min-h-12"
          />
          <button type="submit" disabled={!reply.trim() || sending} className="px-4 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-sm font-bold disabled:opacity-45">
            <i className={`fas ${sending ? "fa-spinner fa-spin" : "fa-paper-plane"} mr-2`}></i>
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}

function WorkOrderDetail({ detail, saving, onPatch }) {
  const sections = detail?.sections || [];
  const looseItems = detail?.items || [];
  const [notesDraft, setNotesDraft] = useState(detail?.notes || "");

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="admin-card border rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <p className="admin-text-muted text-xs uppercase tracking-wider font-bold">Bon de travail</p>
              <h4 className="admin-text text-xl font-extrabold mt-1">{detail?.number || "-"}</h4>
              <p className="admin-text-muted text-sm mt-1">{detail?.client?.name || "-"}</p>
            </div>
            <select
              value={detail?.statut || "draft"}
              disabled={saving}
              onChange={(e) => onPatch({ statut: e.target.value })}
              className="admin-input border rounded-lg px-3 py-2 text-sm min-w-44"
            >
              <option value="draft">Brouillon</option>
              <option value="scheduled">Planifie</option>
              <option value="in_progress">En cours</option>
              <option value="sent">Envoye</option>
              <option value="invoiced">Facture</option>
              <option value="paid">Paye</option>
              <option value="completed">Complete</option>
            </select>
          </div>
          <div className="grid md:grid-cols-3 gap-3 mt-4">
            <DetailRow label="Date" value={formatDate(detail?.date)} />
            <DetailRow label="Technicien" value={detail?.technician?.name} />
            <DetailRow label="Total" value={money(detail?.total)} />
          </div>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <DetailRow label="Adresse" value={[detail?.interventionAddress, detail?.interventionCity, detail?.interventionPostalCode].filter(Boolean).join(", ")} />
            <DetailRow label="Description" value={detail?.description} />
          </div>
        </div>

        <div className="admin-card border rounded-xl p-4">
          <h4 className="admin-text font-bold mb-3">Totaux</h4>
          <DetailRow label="Pieces" value={money(detail?.totalPieces)} />
          <div className="mt-2"><DetailRow label="Main-d'oeuvre" value={money(detail?.totalLabor)} /></div>
          <div className="mt-2"><DetailRow label="Sous-total" value={money(detail?.subtotal)} /></div>
          <div className="mt-2"><DetailRow label="TPS / TVQ" value={`${money(detail?.tps)} / ${money(detail?.tvq)}`} /></div>
          <p className="admin-text text-2xl font-extrabold mt-3">{money(detail?.total)}</p>
        </div>
      </div>

      <div className="admin-card border rounded-xl p-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h4 className="admin-text font-bold">Notes du bon</h4>
          <button
            type="button"
            disabled={saving || notesDraft === (detail?.notes || "")}
            onClick={() => onPatch({ notes: notesDraft })}
            className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold disabled:opacity-45"
          >
            <i className={`fas ${saving ? "fa-spinner fa-spin" : "fa-save"} mr-2`}></i>Sauvegarder
          </button>
        </div>
        <textarea
          value={notesDraft}
          onChange={(e) => setNotesDraft(e.target.value)}
          rows={4}
          className="admin-input border rounded-lg px-3 py-2 text-sm w-full"
        />
      </div>

      <div className="admin-card border rounded-xl p-4">
        <h4 className="admin-text font-bold mb-3">Lignes</h4>
        {sections.length === 0 && looseItems.length === 0 ? (
          <p className="admin-text-muted text-sm">Aucune ligne.</p>
        ) : (
          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.id} className="rounded-xl border admin-border p-3">
                <p className="admin-text font-bold mb-2">Unite {section.unitCode}</p>
                {(section.items || []).map((item) => <WorkOrderItemLine key={item.id} item={item} />)}
              </div>
            ))}
            {looseItems.map((item) => <WorkOrderItemLine key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkOrderItemLine({ item }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-3 py-2 border-b admin-border last:border-b-0 text-sm">
      <p className="admin-text truncate">{item.description || item.product?.name || "-"}</p>
      <p className="admin-text-muted">{Number(item.quantity || 0).toString()}</p>
      <p className="admin-text font-bold">{money(item.totalPrice)}</p>
    </div>
  );
}

function AppointmentDetail({ detail, saving, onStatus }) {
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <div className="admin-card border rounded-xl p-4">
        <p className="admin-text-muted text-xs uppercase tracking-wider font-bold">Rendez-vous</p>
        <h4 className="admin-text text-xl font-extrabold mt-1">{detail?.name || "-"}</h4>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <DetailRow label="Telephone" value={detail?.phone} />
          <DetailRow label="Courriel" value={detail?.email} />
          <DetailRow label="Date" value={formatDate(detail?.date)} />
          <DetailRow label="Plage" value={detail?.timeSlot} />
          <DetailRow label="Service" value={detail?.serviceType} />
          <DetailRow label="Adresse" value={[detail?.address, detail?.city].filter(Boolean).join(", ")} />
        </div>
        <div className="mt-3">
          <DetailRow label="Notes" value={detail?.notes} />
        </div>
      </div>

      <div className="admin-card border rounded-xl p-4 space-y-3">
        <h4 className="admin-text font-bold">Statut</h4>
        <select
          value={detail?.status || "pending"}
          disabled={saving}
          onChange={(e) => onStatus(e.target.value)}
          className="admin-input border rounded-lg px-3 py-2 text-sm w-full"
        >
          <option value="pending">En attente</option>
          <option value="waiting_client">Attend client</option>
          <option value="confirmed">Confirme</option>
          <option value="completed">Complete</option>
          <option value="cancelled">Annule</option>
        </select>
        <DetailPill tone={detail?.status === "completed" ? "emerald" : detail?.status === "cancelled" ? "slate" : "cyan"}>
          {detail?.status || "pending"}
        </DetailPill>
      </div>
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
