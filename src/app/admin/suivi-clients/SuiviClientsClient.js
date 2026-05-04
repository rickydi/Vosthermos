"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
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
import AddressAutocomplete from "@/components/AddressAutocomplete";
import {
  DEFAULT_FOLLOW_UP_COLUMNS as DEFAULT_COLUMNS,
  FOLLOW_UP_COLUMNS_SETTINGS_KEY as SETTINGS_KEY,
  FOLLOW_UP_ICON_OPTIONS as ICON_OPTIONS,
  FOLLOW_UP_TERMINAL_SET as TERMINAL,
  FOLLOW_UP_TONES as TONES,
  followUpColumnMeta as columnMeta,
  followUpSlug as slugify,
  followUpToneClasses as toneClasses,
  isAcceptedFollowUpStatus as isAcceptedStatus,
  isLostFollowUpColumn as isLostColumn,
  isLostFollowUpStatus as isLostStatus,
  normalizeFollowUpColumns as normalizeColumns,
} from "@/lib/follow-up-columns";
import { WORK_ORDER_STATUS_OPTIONS } from "@/lib/work-order-status";

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

const FIREWORK_BURSTS = [
  { x: "26%", y: "42%", delay: 0, scale: 1 },
  { x: "54%", y: "30%", delay: 260, scale: 1.18 },
  { x: "76%", y: "48%", delay: 520, scale: 0.96 },
  { x: "42%", y: "68%", delay: 760, scale: 0.82 },
];

const FIREWORK_SPARKS = Array.from({ length: 30 }, (_, index) => {
  const angle = (index * 12) + (index % 2 ? 4 : -3);
  const radians = (angle * Math.PI) / 180;
  const distance = 68 + (index % 6) * 9;
  return {
    angle,
    dx: Math.cos(radians) * distance,
    dy: Math.sin(radians) * distance,
    fall: 18 + (index % 5) * 5,
    delay: (index % 4) * 18,
  };
});

function toInputDate(value) {
  if (!value) return "";
  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function dateOnly(value) {
  const input = toInputDate(value);
  if (!input) return null;
  const [year, month, day] = input.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDate(value) {
  if (!value) return "-";
  const date = dateOnly(value) || new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fr-CA", { day: "2-digit", month: "short", year: "numeric" });
}

function isLate(value) {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = dateOnly(value);
  return date ? date < today : false;
}

function priorityLabel(value) {
  if (value === "high") return "Haute";
  if (value === "low") return "Basse";
  return "Normale";
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
  const [celebratingId, setCelebratingId] = useState(null);
  const [archivingLost, setArchivingLost] = useState(false);
  const timer = useRef(null);
  const moveTimer = useRef(null);
  const celebrationTimer = useRef(null);
  const boardScrollRef = useRef(null);
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

  function scrollBoard(direction) {
    boardScrollRef.current?.scrollBy({
      left: direction * 520,
      behavior: "smooth",
    });
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
    return () => {
      clearTimeout(moveTimer.current);
      clearTimeout(celebrationTimer.current);
    };
  }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => load(search), 250);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const visibleColumns = useMemo(() => columns.filter((c) => c.visible), [columns]);
  const visibleColumnKeys = useMemo(() => new Set(visibleColumns.map((c) => c.key)), [visibleColumns]);
  const lostFollowUps = useMemo(
    () => followUps.filter((followUp) => followUp.status !== "archived" && isLostStatus(columns, followUp.status)),
    [followUps, columns]
  );

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
      contactName: followUp.client?.name || followUp.contactName || "",
      phone: followUp.client?.phone || followUp.client?.secondaryPhone || followUp.phone || "",
      email: followUp.client?.email || followUp.email || "",
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
      phone: prev.phone || client.phone || client.secondaryPhone || "",
      email: prev.email || client.email || "",
    }));
  }

  function showAcceptedCelebration(followUpId, status = "won") {
    setRecentlyMovedId(followUpId);
    setMoveFeedback({ id: followUpId, label: columnMeta(columns, status).label, accepted: true });
    clearTimeout(moveTimer.current);
    moveTimer.current = setTimeout(() => {
      setRecentlyMovedId(null);
      setMoveFeedback(null);
    }, 2600);
    clearTimeout(celebrationTimer.current);
    setCelebratingId(followUpId);
    celebrationTimer.current = setTimeout(() => setCelebratingId(null), 2850);
  }

  async function saveFollowUp(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const shouldCelebrateAccepted = editing?.id && isAcceptedStatus(columns, form.status) && !isAcceptedStatus(columns, editing.status);
      const shouldCelebrateCreatedAccepted = !editing?.id && isAcceptedStatus(columns, form.status);
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
      if (shouldCelebrateAccepted) {
        setFollowUps((items) => items.map((item) => item.id === editing.id
          ? { ...item, ...data, status: data.status || form.status, activity: item.activity || data.activity }
          : item));
        showAcceptedCelebration(editing.id, form.status);
      } else if (shouldCelebrateCreatedAccepted && data?.id) {
        setFollowUps((items) => [{ ...data, activity: data.activity || {} }, ...items]);
        showAcceptedCelebration(data.id, form.status);
      } else {
        load(search);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function quickStatus(followUp, status) {
    if (!status || followUp.status === status) return;
    const previous = followUps;
    const accepted = isAcceptedStatus(columns, status);
    setFollowUps((items) => items.map((item) => item.id === followUp.id ? { ...item, status } : item));
    if (accepted) {
      showAcceptedCelebration(followUp.id, status);
    } else {
      setRecentlyMovedId(followUp.id);
      setMoveFeedback({ id: followUp.id, label: columnMeta(columns, status).label });
      clearTimeout(moveTimer.current);
      moveTimer.current = setTimeout(() => {
        setRecentlyMovedId(null);
        setMoveFeedback(null);
      }, 1400);
      clearTimeout(celebrationTimer.current);
      setCelebratingId(null);
    }
    try {
      const res = await fetch(`/api/admin/follow-ups/${followUp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        clearTimeout(moveTimer.current);
        clearTimeout(celebrationTimer.current);
        setRecentlyMovedId(null);
        setMoveFeedback(null);
        setCelebratingId(null);
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
      clearTimeout(celebrationTimer.current);
      setRecentlyMovedId(null);
      setMoveFeedback(null);
      setCelebratingId(null);
      setFollowUps(previous);
    }
  }

  async function archiveLostFollowUps(items) {
    const targets = items.filter((item) => item.status !== "archived");
    if (!targets.length || archivingLost) return;
    const countLabel = `${targets.length} carte${targets.length > 1 ? "s" : ""}`;
    if (!confirm(`Archiver ${countLabel} dans Perdu / refuse? Elles seront cachees du kanban.`)) return;

    const previous = followUps;
    const ids = new Set(targets.map((item) => item.id));
    setArchivingLost(true);
    setFollowUps((current) => current.map((item) => ids.has(item.id) ? { ...item, status: "archived" } : item));
    setCentralFollowUp((current) => current && ids.has(current.id) ? null : current);
    setRecentlyMovedId(null);
    setMoveFeedback({ id: null, label: "Archive", archived: true, count: targets.length });
    clearTimeout(moveTimer.current);

    try {
      const responses = await Promise.all(targets.map((item) => fetch(`/api/admin/follow-ups/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      })));
      if (responses.some((res) => !res.ok)) throw new Error("archive_failed");
      moveTimer.current = setTimeout(() => setMoveFeedback(null), 1600);
    } catch {
      setFollowUps(previous);
      setMoveFeedback(null);
      alert("L'archive n'a pas fonctionne. Les cartes perdues sont remises dans la colonne.");
    } finally {
      setArchivingLost(false);
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
    return saveCentralFollowUp(followUp, { notes });
  }

  async function saveCentralFollowUp(followUp, patch) {
    const previousFollowUps = followUps;
    const previousCentral = centralFollowUp;
    setFollowUps((items) => items.map((item) => item.id === followUp.id ? { ...item, ...patch } : item));
    setCentralFollowUp((current) => current?.id === followUp.id ? { ...current, ...patch } : current);
    try {
      const res = await fetch(`/api/admin/follow-ups/${followUp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
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

  function handleCentralClientUpdated(followUpId, client) {
    setFollowUps((items) => items.map((item) => item.id === followUpId
      ? { ...item, client: { ...(item.client || {}), ...client } }
      : item));
    setCentralFollowUp((current) => current?.id === followUpId
      ? { ...current, client: { ...(current.client || {}), ...client } }
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
          width: min(285px, calc(100vw - 32px));
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
        .kanban-card-accepted-burst {
          animation: kanban-card-drop 980ms cubic-bezier(0.2, 0.85, 0.2, 1), kanban-accepted-glow 1250ms ease-out both;
        }
        .kanban-mini-fireworks {
          position: absolute;
          inset: 0;
          z-index: 20;
          pointer-events: none;
          overflow: hidden;
        }
        .kanban-firework-ring,
        .kanban-firework-core,
        .kanban-firework-particle {
          position: absolute;
          left: 62%;
          top: 34%;
        }
        .kanban-firework-ring {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(110, 231, 183, 0.82);
          border-radius: 999px;
          transform: translate(-50%, -50%) scale(0.2);
          animation: kanban-firework-ring 760ms ease-out both;
        }
        .kanban-firework-core {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: rgb(103, 232, 249);
          box-shadow: 0 0 18px rgba(103, 232, 249, 0.92), 0 0 26px rgba(110, 231, 183, 0.72);
          transform: translate(-50%, -50%) scale(0.2);
          animation: kanban-firework-core 680ms ease-out both;
        }
        .kanban-firework-particle {
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: rgb(103, 232, 249);
          box-shadow: 0 0 12px currentColor;
          transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(0.35);
          animation: kanban-firework-particle 920ms ease-out var(--delay) both;
        }
        .kanban-firework-particle.particle-1 { background: rgb(110, 231, 183); color: rgb(110, 231, 183); }
        .kanban-firework-particle.particle-2 { background: rgb(251, 191, 36); color: rgb(251, 191, 36); }
        .kanban-firework-particle.particle-3 { background: rgb(125, 211, 252); color: rgb(125, 211, 252); }
        .kanban-firework-particle.particle-4 { background: rgb(196, 181, 253); color: rgb(196, 181, 253); }
        .kanban-win-badge {
          position: absolute;
          right: 8px;
          top: 8px;
          border-radius: 999px;
          background: rgb(16, 185, 129);
          color: rgb(2, 6, 23);
          padding: 2px 8px;
          font-size: 9px;
          font-weight: 900;
          box-shadow: 0 0 24px rgba(16, 185, 129, 0.45);
          animation: kanban-win-badge 1350ms ease-out both;
        }
        .kanban-board-fireworks {
          position: fixed;
          inset: 0;
          z-index: 80;
          pointer-events: none;
          overflow: hidden;
        }
        .kanban-real-fireworks {
          position: absolute;
          inset: 0;
          z-index: 20;
          pointer-events: none;
          overflow: hidden;
        }
        .kanban-real-fireworks:not(.compact) {
          background:
            radial-gradient(circle at 52% 34%, rgba(16, 185, 129, 0.16), transparent 24%),
            radial-gradient(circle at 78% 48%, rgba(103, 232, 249, 0.13), transparent 22%),
            linear-gradient(180deg, rgba(2, 6, 23, 0.10), transparent 58%);
          animation: kanban-fireworks-stage 2850ms ease-out both;
        }
        .kanban-real-fireworks.compact {
          border-radius: inherit;
          background: radial-gradient(circle at 55% 36%, rgba(16, 185, 129, 0.22), transparent 62%);
        }
        .kanban-firework-burst {
          position: absolute;
          left: var(--x);
          top: var(--y);
          width: 1px;
          height: 1px;
          transform: scale(var(--scale));
          animation: kanban-burst-pop 1260ms ease-out var(--delay) both;
        }
        .kanban-real-fireworks.compact .kanban-firework-burst {
          left: 62%;
          top: 36%;
          transform: scale(0.68);
        }
        .kanban-real-fireworks.compact .kanban-firework-burst:nth-child(n+3) {
          display: none;
        }
        .kanban-firework-launch {
          position: absolute;
          left: 0;
          top: 0;
          width: 2px;
          height: 95px;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(251, 191, 36, 0), rgba(251, 191, 36, 0.92), rgba(103, 232, 249, 0));
          box-shadow: 0 0 16px rgba(251, 191, 36, 0.45);
          transform: translate(-50%, 42px) scaleY(0);
          animation: kanban-firework-launch 660ms ease-out var(--delay) both;
        }
        .kanban-firework-flash {
          position: absolute;
          left: 0;
          top: 0;
          width: 15px;
          height: 15px;
          border-radius: 999px;
          background: rgb(236, 253, 245);
          box-shadow: 0 0 18px rgba(236, 253, 245, 0.95), 0 0 38px rgba(103, 232, 249, 0.68), 0 0 58px rgba(16, 185, 129, 0.48);
          transform: translate(-50%, -50%) scale(0.15);
          animation: kanban-firework-flash 1180ms ease-out var(--delay) both;
        }
        .kanban-firework-halo {
          position: absolute;
          left: 0;
          top: 0;
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 2px solid rgba(103, 232, 249, 0.52);
          box-shadow: 0 0 24px rgba(103, 232, 249, 0.28), inset 0 0 22px rgba(110, 231, 183, 0.18);
          transform: translate(-50%, -50%) scale(0.08);
          animation: kanban-firework-halo 1240ms cubic-bezier(0.06, 0.72, 0.28, 1) var(--delay) both;
        }
        .kanban-firework-spark {
          position: absolute;
          left: 0;
          top: 0;
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: currentColor;
          color: rgb(103, 232, 249);
          box-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
          transform: translate(-50%, -50%) translate(0, 0) scale(0.2);
          animation: kanban-real-spark 1420ms cubic-bezier(0.08, 0.78, 0.18, 1) calc(var(--delay) + var(--spark-delay)) both;
        }
        .kanban-firework-spark::after {
          content: "";
          position: absolute;
          right: 4px;
          top: 50%;
          width: 20px;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent, currentColor);
          opacity: 0.62;
          transform: translateY(-50%);
        }
        .kanban-firework-spark.spark-1 { color: rgb(110, 231, 183); }
        .kanban-firework-spark.spark-2 { color: rgb(251, 191, 36); }
        .kanban-firework-spark.spark-3 { color: rgb(125, 211, 252); }
        .kanban-firework-spark.spark-4 { color: rgb(196, 181, 253); }
        .kanban-firework-spark.spark-5 { color: rgb(190, 242, 100); }
        .kanban-fireworks-badge {
          position: absolute;
          left: 50%;
          top: 22px;
          transform: translateX(-50%);
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.94);
          color: rgb(2, 6, 23);
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0;
          box-shadow: 0 0 34px rgba(16, 185, 129, 0.48);
          animation: kanban-fireworks-badge 2500ms ease-out both;
        }
        .kanban-real-fireworks.compact .kanban-fireworks-badge {
          display: none;
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
        @keyframes kanban-accepted-glow {
          0% { box-shadow: 0 0 0 rgba(16, 185, 129, 0); border-color: rgba(110, 231, 183, 0.85); }
          28% { box-shadow: 0 22px 58px rgba(16, 185, 129, 0.22), 0 0 0 1px rgba(103, 232, 249, 0.36); }
          100% { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12); }
        }
        @keyframes kanban-firework-ring {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(5.2); }
        }
        @keyframes kanban-firework-core {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
          26% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
        }
        @keyframes kanban-firework-particle {
          0% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(0.35); }
          18% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--distance)) scale(0.1); }
        }
        @keyframes kanban-win-badge {
          0% { opacity: 0; transform: translateY(-8px) scale(0.86); }
          18% { opacity: 1; transform: translateY(0) scale(1.05); }
          72% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-6px) scale(0.96); }
        }
        @keyframes kanban-fireworks-stage {
          0% { opacity: 0; }
          8% { opacity: 1; }
          82% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes kanban-burst-pop {
          0% { opacity: 0; filter: blur(0); }
          8% { opacity: 1; }
          88% { opacity: 1; filter: blur(0); }
          100% { opacity: 0; filter: blur(2px); }
        }
        @keyframes kanban-firework-launch {
          0% { opacity: 0; transform: translate(-50%, 120px) scaleY(0); }
          18% { opacity: 0.92; transform: translate(-50%, 80px) scaleY(0.58); }
          74% { opacity: 0.72; transform: translate(-50%, 8px) scaleY(1); }
          100% { opacity: 0; transform: translate(-50%, -4px) scaleY(0.18); }
        }
        @keyframes kanban-firework-flash {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.12); }
          18% { opacity: 0; transform: translate(-50%, -50%) scale(0.12); }
          26% { opacity: 1; transform: translate(-50%, -50%) scale(1.4); }
          48% { opacity: 0.62; transform: translate(-50%, -50%) scale(0.72); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.12); }
        }
        @keyframes kanban-firework-halo {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.08); }
          20% { opacity: 0; transform: translate(-50%, -50%) scale(0.08); }
          34% { opacity: 0.86; transform: translate(-50%, -50%) scale(1.4); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(5.6); }
        }
        @keyframes kanban-real-spark {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(0, 0) scale(0.18);
          }
          18% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(0, 0) scale(0.22);
          }
          28% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(var(--start-dx), var(--start-dy)) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(var(--dx), calc(var(--dy) + var(--fall))) scale(0.05);
          }
        }
        @keyframes kanban-fireworks-badge {
          0% { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.88); }
          18% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.04); }
          76% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.96); }
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
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold"
          >
            <i className="fas fa-sliders"></i>
            Modifier colonnes
          </button>
          <button
            onClick={() => archiveLostFollowUps(lostFollowUps)}
            disabled={archivingLost || lostFollowUps.length === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/80 hover:bg-slate-600 text-white rounded-lg text-sm font-bold disabled:opacity-45 disabled:hover:bg-slate-700/80"
            title="Archiver les cartes perdues ou refusees"
          >
            <i className={`fas ${archivingLost ? "fa-spinner fa-spin" : "fa-archive"}`}></i>
            Archiver perdus{lostFollowUps.length > 0 ? ` (${lostFollowUps.length})` : ""}
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
        <div className={`mb-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold shadow-[0_0_24px_rgba(34,211,238,0.16)] ${
          moveFeedback.accepted
            ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
            : moveFeedback.archived
              ? "border-slate-400/30 bg-slate-500/10 text-slate-200"
              : "border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
        }`}>
          <i className={`fas ${moveFeedback.accepted ? "fa-star" : moveFeedback.archived ? "fa-archive" : "fa-arrows-alt"}`}></i>
          {moveFeedback.accepted
            ? "Carte acceptee"
            : moveFeedback.archived
              ? `${moveFeedback.count || 0} carte${moveFeedback.count > 1 ? "s" : ""} archivee${moveFeedback.count > 1 ? "s" : ""}`
              : `Carte deplacee vers ${moveFeedback.label}`}
        </div>
      )}
      {moveFeedback?.accepted && (
        <div className="kanban-board-fireworks">
          <FireworksShow />
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
        <>
          <div className="mb-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => scrollBoard(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border admin-border admin-card admin-text-muted hover:admin-text"
              title="Colonnes a gauche"
              aria-label="Voir les colonnes a gauche"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              type="button"
              onClick={() => scrollBoard(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border admin-border admin-card admin-text-muted hover:admin-text"
              title="Colonnes a droite"
              aria-label="Voir les colonnes a droite"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          <div ref={boardScrollRef} className="w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragCancel={handleDragCancel}
              onDragEnd={handleDragEnd}
              autoScroll
            >
              <div className="flex w-max min-w-full gap-2.5 pr-2 min-h-[500px]">
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
                    onArchiveLost={archiveLostFollowUps}
                    isDragOver={dragOverColumn === column.key}
                    activeDragId={activeDragId}
                    recentlyMovedId={recentlyMovedId}
                    celebratingId={celebratingId}
                    archivingLost={archivingLost}
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
        </>
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
          onSaveFollowUp={saveCentralFollowUp}
          onClientUpdated={handleCentralClientUpdated}
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
  onArchiveLost,
  isDragOver,
  activeDragId,
  recentlyMovedId,
  celebratingId,
  archivingLost,
}) {
  const { isOver, setNodeRef } = useDroppable({ id: column.key });
  const t = toneClasses(column.tone);
  const totalEstimate = items.reduce((sum, item) => sum + (Number(item.estimateAmount) || 0), 0);
  const active = isDragOver || isOver;
  const archiveColumn = isLostColumn(column);

  return (
    <section
      ref={setNodeRef}
      className={`admin-card border ${t.border} rounded-xl w-[82vw] sm:w-[218px] shrink-0 min-h-[500px] flex flex-col transition-all duration-200 ${
        active ? "ring-2 ring-cyan-300/40 bg-cyan-500/5 shadow-[0_0_30px_rgba(34,211,238,0.08)]" : ""
      }`}
    >
      <div className="p-2.5 border-b admin-border">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${t.soft}`}>
                <i className={`fas ${column.icon} text-xs`}></i>
              </span>
              <h2 className="admin-text text-[13px] font-extrabold truncate">{column.label}</h2>
            </div>
            <p className="admin-text-muted text-[11px] mt-1.5">
              {items.length} carte{items.length > 1 ? "s" : ""}{totalEstimate > 0 ? ` | ${totalEstimate.toFixed(2)} $` : ""}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {archiveColumn && (
              <button
                type="button"
                onClick={() => onArchiveLost(items)}
                disabled={archivingLost || items.length === 0}
                className="h-7 rounded-lg bg-slate-500/15 px-2 text-[10px] font-bold text-slate-200 hover:bg-slate-500/25 disabled:opacity-50"
                title="Archiver les cartes perdues"
              >
                <i className={`fas ${archivingLost ? "fa-spinner fa-spin" : "fa-archive"} mr-1`}></i>
                Archive{items.length > 0 ? ` (${items.length})` : ""}
              </button>
            )}
            <button onClick={onAdd} className="w-7 h-7 rounded-lg admin-hover admin-text-muted hover:admin-text" title="Ajouter">
              <i className="fas fa-plus text-xs"></i>
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {items.length === 0 ? (
          <div className="border border-dashed admin-border rounded-lg min-h-24 flex items-center justify-center admin-text-muted text-xs">
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
              celebrating={celebratingId === followUp.id}
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

function KanbanCard({ followUp, columns, onEdit, onDelete, onCentral, isDragging, highlighted, celebrating }) {
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
  const phone = followUp.client?.phone || followUp.client?.secondaryPhone || followUp.phone;
  const email = followUp.client?.email || followUp.email;
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
      className={`relative overflow-hidden rounded-lg border admin-border admin-bg p-2.5 shadow-sm cursor-grab active:cursor-grabbing hover:ring-2 ${t.ring} transition-all duration-300 ${
        dragging ? "kanban-card-source-dragging ring-2 ring-cyan-300/70" : ""
      } ${
        pressed && !dragging ? "kanban-card-pressed ring-2 ring-cyan-300/55" : ""
      } ${
        highlighted ? "kanban-card-dropped ring-2 ring-cyan-300/80" : ""
      } ${
        celebrating ? "kanban-card-accepted-burst ring-2 ring-emerald-300/80" : ""
      }`}
    >
      {celebrating && <FireworksShow compact />}
      {dragging && (
        <div className="absolute inset-x-2 top-2 z-10 rounded-lg border border-cyan-300/35 bg-cyan-500/10 px-2 py-1.5 text-[11px] font-extrabold text-cyan-100">
          <i className="fas fa-hand-pointer mr-2"></i>En mouvement
        </div>
      )}
      {highlighted && (
        <div className="kanban-drop-badge absolute right-2 top-2 z-10 rounded-full bg-cyan-500 px-2 py-0.5 text-[9px] font-extrabold text-slate-950 shadow-[0_0_22px_rgba(34,211,238,0.35)]">
          <i className="fas fa-check mr-1"></i>Deposee
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="admin-text text-[13px] font-extrabold truncate">{clientName}</p>
          <p className="admin-text-muted text-[10px] truncate mt-0.5">{followUp.service || "Service non precise"}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[8px] font-bold rounded-full px-1.5 py-0.5 ${t.badge}`}>
            {meta.label}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(followUp)}
              className="admin-text-muted hover:admin-text text-[11px]"
              title="Modifier"
            >
              <i className="fas fa-pen"></i>
            </button>
            <button
              type="button"
              onClick={() => onDelete(followUp)}
              className="text-amber-300 hover:text-amber-200 text-[11px]"
              title="Supprimer"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-1.5 space-y-0.5 text-[10px]">
        {phone && <a href={`tel:${phone}`} className="text-sky-300 hover:underline block truncate">{phone}</a>}
        {email && <a href={`mailto:${email}`} className="admin-text-muted hover:admin-text block truncate">{email}</a>}
      </div>

      <div className={`mt-1.5 rounded-lg px-2 py-1.5 ${late ? "bg-amber-500/10 text-amber-300" : "bg-white/5 admin-text-muted"}`}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] uppercase tracking-wider font-bold">Prochain suivi</p>
          <p className="text-[10px] font-semibold shrink-0">{formatDate(followUp.nextActionDate)}</p>
        </div>
        <p className="text-[10px] line-clamp-1 mt-1">{followUp.nextAction || "-"}</p>
      </div>

      <div className="mt-1.5 flex flex-wrap gap-1">
        <MiniCount icon="fa-comments" value={counts.chats} label="chats" />
        <MiniCount icon="fa-clipboard-list" value={counts.workOrders} label="bons" />
        <MiniCount icon="fa-calendar-check" value={counts.appointments} label="rdv" />
        <MiniCount icon="fa-images" value={counts.photos || 0} label="photos" />
      </div>

      {followUp.estimateAmount ? (
        <p className="admin-text text-[11px] font-bold mt-1.5">{Number(followUp.estimateAmount).toFixed(2)} $</p>
      ) : null}
    </article>
  );
}

function KanbanCardPreview({ followUp, columns }) {
  const meta = columnMeta(columns, followUp.status);
  const t = toneClasses(meta.tone);
  const late = isLate(followUp.nextActionDate) && !TERMINAL.has(followUp.status);
  const clientName = followUp.client?.name || followUp.contactName || followUp.title;
  const phone = followUp.client?.phone || followUp.client?.secondaryPhone || followUp.phone;
  const email = followUp.client?.email || followUp.email;
  const counts = followUp.activity?.counts || { chats: 0, workOrders: 0, appointments: 0, total: 0 };

  return (
    <div className={`kanban-drag-overlay relative overflow-hidden rounded-lg border ${t.border} admin-bg p-3 pointer-events-none`}>
      <div className="absolute right-2 top-2 z-10 rounded-full bg-cyan-400 px-2 py-0.5 text-[9px] font-extrabold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.35)]">
        <i className="fas fa-arrows-alt mr-1"></i>Deplacement
      </div>
      <div className="flex items-start justify-between gap-2 pr-16">
        <div className="min-w-0">
          <p className="admin-text text-sm font-extrabold truncate">{clientName}</p>
          <p className="admin-text-muted text-[11px] truncate mt-0.5">{followUp.service || "Service non precise"}</p>
        </div>
        <span className={`text-[9px] font-bold rounded-full px-1.5 py-0.5 shrink-0 ${t.badge}`}>
          {meta.label}
        </span>
      </div>

      <div className="mt-2 space-y-0.5 text-[11px]">
        {phone && <p className="text-sky-300 truncate">{phone}</p>}
        {email && <p className="admin-text-muted truncate">{email}</p>}
      </div>

      <div className={`mt-2 rounded-lg px-2.5 py-1.5 ${late ? "bg-amber-500/10 text-amber-300" : "bg-white/5 admin-text-muted"}`}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] uppercase tracking-wider font-bold">Prochain suivi</p>
          <p className="text-[11px] font-semibold shrink-0">{formatDate(followUp.nextActionDate)}</p>
        </div>
        <p className="text-[11px] line-clamp-1 mt-1">{followUp.nextAction || "-"}</p>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        <MiniCount icon="fa-comments" value={counts.chats} label="chats" />
        <MiniCount icon="fa-clipboard-list" value={counts.workOrders} label="bons" />
        <MiniCount icon="fa-calendar-check" value={counts.appointments} label="rdv" />
        <MiniCount icon="fa-images" value={counts.photos || 0} label="photos" />
      </div>
    </div>
  );
}

function FireworksShow({ compact = false }) {
  return (
    <div className={`kanban-real-fireworks ${compact ? "compact" : ""}`} aria-hidden="true">
      {FIREWORK_BURSTS.map((burst, burstIndex) => (
        <span
          key={`${burst.x}-${burst.y}`}
          className="kanban-firework-burst"
          style={{
            "--x": burst.x,
            "--y": burst.y,
            "--delay": `${compact ? Math.min(burst.delay, 180) : burst.delay}ms`,
            "--scale": compact ? Math.min(burst.scale, 0.78) : burst.scale,
          }}
        >
          <span className="kanban-firework-launch"></span>
          <span className="kanban-firework-flash"></span>
          <span className="kanban-firework-halo"></span>
          {FIREWORK_SPARKS.map((spark, sparkIndex) => (
            <span
              key={`${burstIndex}-${spark.angle}`}
              className={`kanban-firework-spark spark-${sparkIndex % 6}`}
              style={{
                "--dx": `${compact ? spark.dx * 0.46 : spark.dx}px`,
                "--dy": `${compact ? spark.dy * 0.46 : spark.dy}px`,
                "--start-dx": `${compact ? spark.dx * 0.0736 : spark.dx * 0.16}px`,
                "--start-dy": `${compact ? spark.dy * 0.0736 : spark.dy * 0.16}px`,
                "--fall": `${compact ? spark.fall * 0.38 : spark.fall}px`,
                "--spark-delay": `${spark.delay}ms`,
              }}
            />
          ))}
        </span>
      ))}
      <span className="kanban-fireworks-badge">
        <i className="fas fa-check mr-1"></i>Accepte
      </span>
    </div>
  );
}

function MiniCount({ icon, value, label }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold ${value > 0 ? "bg-cyan-500/10 text-cyan-300" : "bg-white/5 admin-text-muted"}`}>
      <i className={`fas ${icon}`}></i>
      {value} {label}
    </span>
  );
}

function clientFormFrom(client = {}) {
  return {
    name: client.name || "",
    type: client.type || "particulier",
    company: client.company || "",
    phone: client.phone || "",
    secondaryPhone: client.secondaryPhone || "",
    email: client.email || "",
    address: client.address || "",
    city: client.city || "",
    province: client.province || "QC",
    postalCode: client.postalCode || "",
    paymentTermsDays: client.paymentTermsDays ?? 30,
    notes: client.notes || "",
  };
}

function CentralModal({ followUp, columns, onSaveNotes, onSaveFollowUp, onClientUpdated, onPhotoAdded, onPhotoDeleted, onClose }) {
  const activity = followUp.activity || {};
  const counts = activity.counts || { chats: 0, workOrders: 0, appointments: 0, photos: 0, total: 0 };
  const photos = activity.photos || [];
  const name = followUp.client?.name || followUp.contactName || followUp.title;
  const phone = followUp.client?.phone || followUp.client?.secondaryPhone || followUp.phone;
  const email = followUp.client?.email || followUp.email;
  const meta = columnMeta(columns, followUp.status);
  const [activeTab, setActiveTab] = useState("suivi");
  const [notesDraft, setNotesDraft] = useState(followUp.notes || "");
  const [nextActionDraft, setNextActionDraft] = useState(followUp.nextAction || "");
  const [nextActionDateDraft, setNextActionDateDraft] = useState(toInputDate(followUp.nextActionDate));
  const [trackingState, setTrackingState] = useState("idle");
  const [trackingError, setTrackingError] = useState("");
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
  const trackingTimer = useRef(null);
  const notesDirty = notesDraft !== (followUp.notes || "");
  const trackingDirty = nextActionDraft !== (followUp.nextAction || "") || nextActionDateDraft !== toInputDate(followUp.nextActionDate);
  const hasEstimate = followUp.estimateAmount !== null && followUp.estimateAmount !== undefined && followUp.estimateAmount !== "";
  const estimateLabel = hasEstimate ? `${Number(followUp.estimateAmount).toFixed(2)} $` : "Aucun estime";
  const nextActionLate = isLate(nextActionDateDraft);
  const nextActionStatus = nextActionDateDraft ? (nextActionLate ? "A reprendre" : "Planifie") : "A planifier";
  const saveTrackingLabel = trackingState === "saving" ? "Sauvegarde..." : trackingState === "saved" ? "Enregistre" : trackingDirty ? "Sauvegarder" : "A jour";
  const saveNotesLabel = noteState === "saving" ? "Sauvegarde..." : noteState === "saved" ? "Enregistre" : notesDirty ? "Sauvegarder" : "A jour";

  useEffect(() => {
    return () => {
      clearTimeout(savedTimer.current);
      clearTimeout(trackingTimer.current);
    };
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

  async function saveTracking() {
    setTrackingState("saving");
    setTrackingError("");
    try {
      await onSaveFollowUp(followUp, {
        nextAction: nextActionDraft,
        nextActionDate: nextActionDateDraft || null,
      });
      setTrackingState("saved");
      clearTimeout(trackingTimer.current);
      trackingTimer.current = setTimeout(() => setTrackingState("idle"), 1400);
    } catch (err) {
      setTrackingState("idle");
      setTrackingError(err.message || "Erreur lors de la sauvegarde");
    }
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
              {followUp.client?.id && <span className="admin-text-muted">BD client #{followUp.client.id}</span>}
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
              { key: "client", label: "Fiche BD", icon: "fa-database" },
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
          ) : activeTab === "client" ? (
            <ClientDatabaseTab
              followUp={followUp}
              onClientUpdated={(client) => onClientUpdated(followUp.id, client)}
            />
          ) : (
            <>
          <div className="grid xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] gap-5">
            <div className="space-y-5 min-w-0">
              <div className="admin-card border rounded-xl overflow-hidden">
                <div className="border-b admin-border bg-white/[0.03] px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="admin-text-muted text-xs uppercase tracking-wider font-bold">Plan de suivi</p>
                      <h3 className="admin-text text-lg font-extrabold mt-0.5">Prochaine action client</h3>
                    </div>
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                      nextActionLate
                        ? "bg-amber-500/15 text-amber-300"
                        : nextActionDateDraft
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-slate-500/15 text-slate-300"
                    }`}>
                      <i className={`fas ${nextActionLate ? "fa-clock" : nextActionDateDraft ? "fa-calendar-check" : "fa-calendar-plus"}`}></i>
                      {nextActionStatus}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid lg:grid-cols-[190px_1fr] gap-4">
                    <div>
                      <label className="admin-text-muted text-xs font-bold block mb-1">Date du prochain suivi</label>
                      <div className="relative">
                        <i className="fas fa-calendar-day absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300 text-xs"></i>
                        <input
                          type="date"
                          value={nextActionDateDraft}
                          onChange={(e) => setNextActionDateDraft(e.target.value)}
                          className="admin-input border rounded-lg pl-9 pr-3 py-2.5 text-sm w-full"
                        />
                      </div>
                      <p className="admin-text-muted text-xs mt-2">
                        {nextActionDateDraft ? formatDate(nextActionDateDraft) : "Aucune date choisie"}
                      </p>
                    </div>
                    <div>
                      <label className="admin-text-muted text-xs font-bold block mb-1">Action a faire</label>
                      <textarea
                        value={nextActionDraft}
                        onChange={(e) => setNextActionDraft(e.target.value)}
                        rows={4}
                        placeholder="Rappeler le client, envoyer l'estime, confirmer le rendez-vous..."
                        className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full resize-y min-h-28"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="admin-text-muted text-xs">
                      {trackingDirty ? "Modification non sauvegardee" : "Plan de suivi a jour"}
                    </p>
                    <button
                      type="button"
                      onClick={saveTracking}
                      disabled={!trackingDirty || trackingState === "saving"}
                      className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-cyan-600 disabled:opacity-45 disabled:hover:bg-cyan-700"
                    >
                      <i className={`fas ${trackingState === "saving" ? "fa-spinner fa-spin" : trackingState === "saved" ? "fa-check" : "fa-save"}`}></i>
                      {saveTrackingLabel}
                    </button>
                  </div>
                  {trackingError && <p className="text-xs text-amber-300">{trackingError}</p>}
                </div>

                <div className="border-t admin-border bg-white/[0.02] p-4">
                  <p className="admin-text-muted text-xs uppercase tracking-wider font-bold mb-3">Resume client</p>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    <FollowUpMetric label="Etape" value={meta.label} icon={meta.icon} tone={meta.tone} />
                    <FollowUpMetric label="Estime" value={estimateLabel} icon="fa-file-invoice-dollar" tone="amber" />
                    <FollowUpMetric label="Priorite" value={priorityLabel(followUp.priority)} icon="fa-signal" tone={followUp.priority === "high" ? "amber" : "sky"} />
                    <FollowUpMetric label="Service" value={followUp.service || "Non precise"} icon="fa-tools" tone="teal" />
                    <FollowUpMetric label="Source" value={followUp.source || "Non precisee"} icon="fa-map-marker-alt" tone="slate" />
                    <FollowUpMetric label="Contact" value={phone || email || "Non precise"} icon="fa-address-book" tone="blue" />
                  </div>
                </div>
              </div>

              <div className="admin-card border rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="admin-text-muted text-xs uppercase tracking-wider font-bold">Notes de suivi</p>
                    <h3 className="admin-text font-bold mt-0.5">Notes internes du client</h3>
                  </div>
                  <button
                    type="button"
                    onClick={saveNotes}
                    disabled={!notesDirty || noteState === "saving"}
                    className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-cyan-600 disabled:opacity-45 disabled:hover:bg-cyan-700"
                  >
                    <i className={`fas ${noteState === "saving" ? "fa-spinner fa-spin" : noteState === "saved" ? "fa-check" : "fa-save"}`}></i>
                    {saveNotesLabel}
                  </button>
                </div>
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={6}
                  placeholder="Ajouter une note: appel, reponse du client, prochaines consignes..."
                  className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full resize-y min-h-32"
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="admin-text-muted text-xs">{notesDirty ? "Note non sauvegardee" : "Notes a jour"}</p>
                  {noteError && <p className="text-xs text-amber-300">{noteError}</p>}
                </div>
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

function FollowUpMetric({ label, value, icon, tone = "slate" }) {
  const colors = toneClasses(tone);
  return (
    <div className="min-w-0 rounded-lg border admin-border bg-white/[0.03] p-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colors.soft}`}>
          <i className={`fas ${icon} text-xs`}></i>
        </span>
        <div className="min-w-0">
          <p className="admin-text-muted text-[10px] uppercase tracking-wider font-bold">{label}</p>
          <p className="admin-text text-sm font-bold truncate">{value || "-"}</p>
        </div>
      </div>
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

function ClientDatabaseTab({ followUp, onClientUpdated }) {
  const clientId = followUp.client?.id;
  const [client, setClient] = useState(followUp.client || null);
  const [form, setForm] = useState(clientFormFrom(followUp.client));
  const [loading, setLoading] = useState(Boolean(clientId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setMessage("");
    fetch(`/api/admin/clients/${clientId}`, { cache: "no-store" })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!active) return;
        if (!ok) throw new Error(data.error || "Impossible de charger la fiche BD");
        setClient(data);
        setForm(clientFormFrom(data));
      })
      .catch((err) => {
        if (active) setMessage(err.message || "Impossible de charger la fiche BD");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [clientId]);

  async function saveClient(e) {
    e.preventDefault();
    if (!clientId || saving) return;
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        ...form,
        paymentTermsDays: Number(form.paymentTermsDays) || 30,
      };
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur lors de la sauvegarde");
      const updated = { ...(client || {}), ...data, _count: client?._count, workOrders: client?.workOrders || [] };
      setClient(updated);
      setForm(clientFormFrom(updated));
      onClientUpdated(updated);
      setMessage("Fiche BD enregistree");
      setTimeout(() => setMessage(""), 1800);
    } catch (err) {
      setMessage(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  if (!clientId) {
    return (
      <div className="admin-card border rounded-xl p-8 text-center">
        <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-300 flex items-center justify-center">
          <i className="fas fa-database"></i>
        </div>
        <p className="admin-text font-bold">Aucune fiche client BD liee</p>
        <p className="admin-text-muted text-sm mt-1">Cette carte garde seulement les coordonnees du suivi.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-card border rounded-xl p-10 text-center admin-text-muted">
        <i className="fas fa-spinner fa-spin text-2xl"></i>
      </div>
    );
  }

  const dbCounts = client?._count || {};
  const workOrders = client?.workOrders || [];

  return (
    <div className="grid xl:grid-cols-[1.35fr_0.85fr] gap-5">
      <form onSubmit={saveClient} className="admin-card border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="admin-text font-bold">Fiche client BD</h3>
            <p className="admin-text-muted text-xs mt-1">Source client #{clientId}</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-600 disabled:opacity-50 disabled:hover:bg-cyan-700"
          >
            <i className={`fas ${saving ? "fa-spinner fa-spin" : "fa-save"}`}></i>
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="md:col-span-2 flex gap-2">
            {[
              { value: "particulier", label: "Particulier", icon: "fa-user" },
              { value: "gestionnaire", label: "Gestionnaire", icon: "fa-building" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setForm({ ...form, type: option.value })}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
                  form.type === option.value
                    ? "border-cyan-300/45 bg-cyan-500/15 text-cyan-100"
                    : "admin-border admin-card admin-text-muted hover:admin-text"
                }`}
              >
                <i className={`fas ${option.icon} mr-2`}></i>{option.label}
              </button>
            ))}
          </div>
          <ClientField label="Nom" value={form.name} onChange={(value) => setForm({ ...form, name: value })} className="md:col-span-2" required />
          <ClientField label="Compagnie" value={form.company} onChange={(value) => setForm({ ...form, company: value })} className="md:col-span-2" />
          <ClientField label="Telephone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
          <ClientField label="Autre telephone" value={form.secondaryPhone} onChange={(value) => setForm({ ...form, secondaryPhone: value })} />
          <ClientField label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
          <div className="md:col-span-2">
            <label className="admin-text-muted text-xs font-bold block mb-1">Adresse</label>
            <AddressAutocomplete
              value={form.address}
              onChange={(address) => setForm((prev) => ({ ...prev, address }))}
              onSelect={(address) => setForm((prev) => ({
                ...prev,
                address: address.address || prev.address || "",
                city: address.city || prev.city || "",
                province: address.province || prev.province || "QC",
                postalCode: address.postalCode || prev.postalCode || "",
              }))}
              inputClassName="admin-input border rounded-lg px-3 py-2.5 text-sm w-full"
            />
          </div>
          <ClientField label="Ville" value={form.city} onChange={(value) => setForm({ ...form, city: value })} />
          <div className="grid grid-cols-[0.7fr_1fr] gap-3">
            <ClientField label="Province" value={form.province} onChange={(value) => setForm({ ...form, province: value })} />
            <ClientField label="Code postal" value={form.postalCode} onChange={(value) => setForm({ ...form, postalCode: value })} />
          </div>
          <div>
            <label className="admin-text-muted text-xs font-bold block mb-1">Termes paiement</label>
            <select
              value={form.paymentTermsDays}
              onChange={(e) => setForm({ ...form, paymentTermsDays: Number(e.target.value) })}
              className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full"
            >
              <option value="15">Net 15 jours</option>
              <option value="30">Net 30 jours</option>
              <option value="45">Net 45 jours</option>
              <option value="60">Net 60 jours</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="admin-text-muted text-xs font-bold block mb-1">Notes BD client</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={5}
              className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full resize-y min-h-28"
            />
          </div>
        </div>
        {message && <p className="mt-3 text-sm font-semibold text-cyan-200">{message}</p>}
      </form>

      <div className="space-y-4">
        <div className="admin-card border rounded-xl p-4">
          <h3 className="admin-text font-bold mb-3">References BD</h3>
          <div className="grid grid-cols-2 gap-2">
            <DbPill label="Bons" value={dbCounts.workOrders ?? workOrders.length} icon="fa-clipboard-list" />
            <DbPill label="Suivis" value={dbCounts.followUps ?? 0} icon="fa-list-check" />
            <DbPill label="Photos" value={dbCounts.photos ?? 0} icon="fa-images" />
            <DbPill label="Unites" value={dbCounts.units ?? 0} icon="fa-door-open" />
            <DbPill label="Batiments" value={dbCounts.buildings ?? 0} icon="fa-building" />
            <DbPill label="Gestionnaires" value={client?.managers?.length || 0} icon="fa-users" />
          </div>
        </div>

        <div className="admin-card border rounded-xl p-4">
          <h3 className="admin-text font-bold mb-3">Derniers bons</h3>
          {workOrders.length ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {workOrders.slice(0, 8).map((wo) => (
                <div key={wo.id} className="rounded-lg bg-white/5 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="admin-text text-sm font-bold truncate">{wo.number}</p>
                    <p className="admin-text-muted text-xs shrink-0">{money(wo.total)}</p>
                  </div>
                  <p className="admin-text-muted text-xs truncate">{wo.statut}{wo.technician?.name ? ` | ${wo.technician.name}` : ""}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-text-muted text-sm">Aucun bon relie dans la BD.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ClientField({ label, value, onChange, type = "text", className = "", required = false }) {
  return (
    <div className={className}>
      <label className="admin-text-muted text-xs font-bold block mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full"
      />
    </div>
  );
}

function DbPill({ label, value, icon }) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-300 flex items-center justify-center">
          <i className={`fas ${icon} text-xs`}></i>
        </span>
        <div>
          <p className="admin-text text-sm font-extrabold">{value}</p>
          <p className="admin-text-muted text-[10px] uppercase tracking-wider font-bold">{label}</p>
        </div>
      </div>
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
              {WORK_ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status.key} value={status.key}>{status.label}</option>
              ))}
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
                    <p className="admin-text-muted text-xs">{[selectedClient.phone, selectedClient.secondaryPhone, selectedClient.email, selectedClient.city].filter(Boolean).join(" | ")}</p>
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
                <label className="min-w-0">
                  <span className="admin-text-muted text-[10px] uppercase tracking-wider font-bold mb-1 block">Nom de la colonne</span>
                  <input
                    value={column.label}
                    onChange={(e) => updateColumn(index, { label: e.target.value })}
                    className="admin-input border rounded-lg px-3 py-2 text-sm w-full"
                  />
                </label>
                <label>
                  <span className="admin-text-muted text-[10px] uppercase tracking-wider font-bold mb-1 block">Icone</span>
                  <select
                    value={column.icon}
                    onChange={(e) => updateColumn(index, { icon: e.target.value })}
                    className="admin-input border rounded-lg px-3 py-2 text-sm w-full"
                  >
                    {ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{icon.replace("fa-", "")}</option>)}
                  </select>
                </label>
                <label>
                  <span className="admin-text-muted text-[10px] uppercase tracking-wider font-bold mb-1 block">Couleur</span>
                  <select
                    value={column.tone}
                    onChange={(e) => updateColumn(index, { tone: e.target.value })}
                    className="admin-input border rounded-lg px-3 py-2 text-sm w-full"
                  >
                    {Object.entries(TONES).map(([key, tone]) => <option key={key} value={key}>{tone.label}</option>)}
                  </select>
                </label>
                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => updateColumn(index, { visible: !column.visible })} className={`w-9 h-9 rounded-lg ${column.visible ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 admin-text-muted"}`} title="Afficher / masquer">
                    <i className={`fas ${column.visible ? "fa-eye" : "fa-eye-slash"}`}></i>
                  </button>
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="h-9 rounded-lg admin-hover admin-text-muted px-2 disabled:opacity-35" title="Deplacer vers la gauche">
                    <i className="fas fa-arrow-left"></i>
                    <span className="hidden xl:inline ml-1 text-xs font-bold">Gauche</span>
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === draft.length - 1} className="h-9 rounded-lg admin-hover admin-text-muted px-2 disabled:opacity-35" title="Deplacer vers la droite">
                    <i className="fas fa-arrow-right"></i>
                    <span className="hidden xl:inline ml-1 text-xs font-bold">Droite</span>
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
