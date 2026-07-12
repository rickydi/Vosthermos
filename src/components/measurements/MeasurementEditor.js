"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { getStructuralDividers, moveStructuralDivider, resetWindowDivisions, splitPaneEvenly } from "@/lib/thermos-layout";

const FRACTIONS = [
  [0, "0"], [1, "1/16"], [2, "1/8"], [3, "3/16"], [4, "1/4"], [5, "5/16"],
  [6, "3/8"], [7, "7/16"], [8, "1/2"], [9, "9/16"], [10, "5/8"],
  [11, "11/16"], [12, "3/4"], [13, "13/16"], [14, "7/8"], [15, "15/16"],
];

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function emptyPane(number = 1, geometry = {}) {
  return {
    id: uid("t"), number,
    x: geometry.x ?? 0, y: geometry.y ?? 0,
    width: geometry.width ?? 10000, height: geometry.height ?? 10000,
    widthSixteenths: null, heightSixteenths: null, thicknessSixteenths: null,
    options: {
      glassType: "double", lowE: false, argon: false, tempered: false,
      laminated: false, spacerColor: "noir", spacerType: "standard", shape: "rectangle", access: "easy", notes: "",
    },
    grille: { enabled: false, type: "decorative", vertical: [], horizontal: [], color: "", profile: "" },
  };
}

function emptyWindow(number = 1) {
  return {
    id: uid("f"), number, label: `Fenêtre ${number}`, location: "", photoUrl: "", viewSide: "interior",
    frame: { widthSixteenths: null, heightSixteenths: null }, panes: [emptyPane(1)],
  };
}

function normalizeData(value) {
  const raw = value && typeof value === "object" ? value : {};
  const windows = Array.isArray(raw.windows) && raw.windows.length ? raw.windows : [emptyWindow(1)];
  return {
    version: 1,
    notes: typeof raw.notes === "string" ? raw.notes : "",
    windows: windows.map((win, wi) => ({
      ...emptyWindow(wi + 1), ...win, number: wi + 1,
      label: win?.label || `Fenêtre ${wi + 1}`,
      frame: { widthSixteenths: 0, heightSixteenths: 0, ...(win?.frame || {}) },
      panes: (Array.isArray(win?.panes) && win.panes.length ? win.panes : [emptyPane(1)]).map((pane, pi) => ({
        ...emptyPane(pi + 1), ...pane, number: pi + 1,
        options: { ...emptyPane().options, ...(pane?.options || {}) },
        grille: { ...emptyPane().grille, ...(pane?.grille || {}) },
      })),
    })),
  };
}

function formatSixteenths(raw) {
  const value = Math.max(0, Math.round(Number(raw) || 0));
  const whole = Math.floor(value / 16);
  const rem = value % 16;
  const label = FRACTIONS.find(([n]) => n === rem)?.[1];
  return `${whole}${rem ? ` ${label}` : ""} po`;
}

function DimensionInput({ label, value, onChange, required = false, minSixteenths = 1, maxSixteenths = 240 * 16 }) {
  const numericValue = Number(value);
  const hasValue = value !== null && value !== undefined && value !== "" && Number.isFinite(numericValue) && numericValue > 0;
  const safe = hasValue ? Math.min(maxSixteenths, Math.max(minSixteenths, Math.round(numericValue))) : null;
  const whole = safe === null ? "" : Math.floor(safe / 16);
  const fraction = safe === null ? 0 : safe % 16;
  const clamp = (nextValue) => Math.min(maxSixteenths, Math.max(minSixteenths, Math.round(nextValue)));

  function setWhole(raw) {
    if (raw === "") { onChange(null); return; }
    const nextValue = (Number(raw) || 0) * 16 + fraction;
    onChange(nextValue > 0 ? clamp(nextValue) : null);
  }

  function setFraction(raw) {
    const nextFraction = Number(raw) || 0;
    if (whole === "") {
      onChange(nextFraction > 0 ? clamp(nextFraction) : null);
      return;
    }
    onChange(clamp(Number(whole) * 16 + nextFraction));
  }

  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-wide admin-text-muted mb-2">{label}{required ? " *" : ""}</span>
      <span className="grid grid-cols-[minmax(5.5rem,1fr)_7.5rem_auto] rounded-xl border admin-border overflow-hidden admin-bg focus-within:border-cyan-400/60 focus-within:ring-2 focus-within:ring-cyan-400/10">
        <input
          type="number" min="0" max={Math.floor(maxSixteenths / 16)} inputMode="numeric" value={whole}
          onChange={(e) => setWhole(e.target.value)} placeholder="Ex. 32"
          className="min-w-0 w-full px-3 py-3 bg-transparent admin-text outline-none text-center text-lg font-bold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label={`${label}, pouces entiers`}
        />
        <select
          value={hasValue ? fraction : ""} onChange={(e) => setFraction(e.target.value)}
          className="w-full px-3 py-3 border-l admin-border bg-transparent admin-text outline-none"
          aria-label={`${label}, fraction de pouce`}
        >
          <option value="" disabled>Fraction</option>
          {FRACTIONS.map(([n, text]) => <option key={n} value={n} disabled={(whole === "" || whole === 0) && n > 0 && n < minSixteenths}>{text}</option>)}
        </select>
        <span className="shrink-0 px-3 py-3 border-l admin-border admin-text-muted text-sm">po</span>
      </span>
    </label>
  );
}

function reNumberWindows(data) {
  return {
    ...data,
    windows: data.windows.map((win, wi) => ({
      ...win, number: wi + 1, label: win.label?.trim() || `Fenêtre ${wi + 1}`,
      panes: win.panes.map((pane, pi) => ({ ...pane, number: pi + 1 })),
    })),
  };
}

function Blueprint({ win, selectedId, onSelect, onMoveDivider }) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const dividers = useMemo(() => getStructuralDividers(win.panes), [win.panes]);

  function pointerPosition(event, divider) {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!rect || !canvas.clientWidth || !canvas.clientHeight) return divider.position;
    const ratio = divider.axis === "vertical"
      ? (event.clientX - rect.left - canvas.clientLeft) / canvas.clientWidth
      : (event.clientY - rect.top - canvas.clientTop) / canvas.clientHeight;
    return Math.min(divider.maximumPosition, Math.max(divider.minimumPosition, Math.round(ratio * 10000)));
  }

  function startDividerDrag(event, divider) {
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = { pointerId: event.pointerId, dividerId: divider.id };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function dragDivider(event, divider) {
    if (dragRef.current?.pointerId !== event.pointerId || dragRef.current?.dividerId !== divider.id) return;
    event.preventDefault();
    onMoveDivider(divider, pointerPosition(event, divider));
  }

  function stopDividerDrag(event) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  }

  function moveDividerWithKeyboard(event, divider) {
    const previousKey = divider.axis === "vertical" ? "ArrowLeft" : "ArrowUp";
    const nextKey = divider.axis === "vertical" ? "ArrowRight" : "ArrowDown";
    if (![previousKey, nextKey, "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const step = event.shiftKey ? 500 : 100;
    const nextPosition = event.key === "Home"
      ? divider.minimumPosition
      : event.key === "End"
        ? divider.maximumPosition
        : divider.position + (event.key === previousKey ? -step : step);
    onMoveDivider(divider, Math.min(divider.maximumPosition, Math.max(divider.minimumPosition, nextPosition)));
  }

  return (
    <div ref={canvasRef} className="relative aspect-[4/3] min-h-72 rounded-xl overflow-hidden border-4 border-slate-500/60 bg-sky-950/30 shadow-inner">
      {win.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={win.photoUrl} alt={`Photo de ${win.label}`} className="absolute inset-0 w-full h-full object-cover opacity-45" />
      ) : (
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(56,189,248,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,.15) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
      )}
      {win.panes.map((pane) => {
        const selected = pane.id === selectedId;
        return (
          <button
            key={pane.id} type="button" onClick={() => onSelect(pane.id)}
            className={`absolute border-2 transition-colors overflow-hidden ${selected ? "border-cyan-300 bg-cyan-400/20 z-10 shadow-[0_0_0_2px_rgba(34,211,238,.25)]" : "border-white/65 bg-sky-300/5 hover:bg-sky-300/15"}`}
            style={{ left: `${pane.x / 100}%`, top: `${pane.y / 100}%`, width: `${pane.width / 100}%`, height: `${pane.height / 100}%` }}
            aria-label={`Thermos ${pane.number}`}
          >
            <span className="absolute left-1.5 top-1.5 rounded-md bg-slate-950/80 text-white text-[10px] font-bold px-2 py-1">T{pane.number}</span>
            {pane.grille?.enabled && (pane.grille.vertical || []).map((position, i) => (
              <span key={`v-${i}`} className="absolute top-0 bottom-0 w-0.5 bg-amber-200/80" style={{ left: `${Number(position) / 100}%` }} />
            ))}
            {pane.grille?.enabled && (pane.grille.horizontal || []).map((position, i) => (
              <span key={`h-${i}`} className="absolute left-0 right-0 h-0.5 bg-amber-200/80" style={{ top: `${Number(position) / 100}%` }} />
            ))}
            {(pane.widthSixteenths > 0 || pane.heightSixteenths > 0) && (
              <span className="absolute inset-x-1 bottom-1 rounded bg-slate-950/75 text-white text-[9px] py-1 px-1 text-center">
                {formatSixteenths(pane.widthSixteenths)} × {formatSixteenths(pane.heightSixteenths)}
              </span>
            )}
          </button>
        );
      })}
      {dividers.flatMap((divider) => divider.segments.map((segment, segmentIndex) => {
        const vertical = divider.axis === "vertical";
        const positionStyle = vertical
          ? {
              left: `${divider.position / 100}%`,
              top: `${segment.start / 100}%`,
              height: `${(segment.end - segment.start) / 100}%`,
              width: "36px",
              transform: "translateX(-50%)",
            }
          : {
              top: `${divider.position / 100}%`,
              left: `${segment.start / 100}%`,
              width: `${(segment.end - segment.start) / 100}%`,
              height: "36px",
              transform: "translateY(-50%)",
            };
        const percentage = Math.round(divider.position / 100);
        return (
          <button
            key={`${divider.id}:${segmentIndex}`}
            type="button"
            role="slider"
            aria-label={`Déplacer la division ${vertical ? "verticale" : "horizontale"}`}
            aria-orientation={vertical ? "horizontal" : "vertical"}
            aria-valuemin={Math.round(divider.minimumPosition / 100)}
            aria-valuemax={Math.round(divider.maximumPosition / 100)}
            aria-valuenow={percentage}
            aria-valuetext={`${percentage} % du cadre`}
            title="Glisser pour déplacer · Flèches: 1 % · Maj + flèche: 5 %"
            className={`group absolute z-30 flex items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-white/90 ${vertical ? "cursor-col-resize" : "cursor-row-resize"}`}
            style={{ ...positionStyle, touchAction: "none" }}
            onPointerDown={(event) => startDividerDrag(event, divider)}
            onPointerMove={(event) => dragDivider(event, divider)}
            onPointerUp={stopDividerDrag}
            onPointerCancel={stopDividerDrag}
            onLostPointerCapture={() => { dragRef.current = null; }}
            onKeyDown={(event) => moveDividerWithKeyboard(event, divider)}
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}
          >
            <span className={`absolute rounded-full bg-cyan-200 shadow-[0_0_0_1px_rgba(8,47,73,.75),0_0_12px_rgba(34,211,238,.85)] transition-all group-hover:bg-white group-focus-visible:bg-white ${vertical ? "inset-y-0 left-1/2 w-1 -translate-x-1/2 group-hover:w-1.5" : "inset-x-0 top-1/2 h-1 -translate-y-1/2 group-hover:h-1.5"}`} />
            <span className={`relative rounded-full border border-cyan-100/80 bg-slate-900 text-cyan-100 shadow-lg ${vertical ? "h-9 w-3" : "h-3 w-9"}`} aria-hidden="true" />
          </button>
        );
      }))}
    </div>
  );
}

const MeasurementEditor = forwardRef(function MeasurementEditor({
  initialMeasurement,
  apiBase,
  publicMode = false,
  technicianMode = false,
  onSaved,
  onFinalized,
}, ref) {
  const measurement = initialMeasurement || {};
  const [data, setData] = useState(() => normalizeData(measurement.data));
  const [activeWindowId, setActiveWindowId] = useState(() => normalizeData(measurement.data).windows[0]?.id);
  const [selectedPaneId, setSelectedPaneId] = useState(() => normalizeData(measurement.data).windows[0]?.panes[0]?.id);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const [equalSectionCount, setEqualSectionCount] = useState(2);
  const fileRef = useRef(null);

  const activeIndex = Math.max(0, data.windows.findIndex((win) => win.id === activeWindowId));
  const activeWindow = data.windows[activeIndex] || data.windows[0];
  const selectedPane = activeWindow?.panes.find((pane) => pane.id === selectedPaneId) || activeWindow?.panes[0];
  const totalThermos = useMemo(() => data.windows.reduce((sum, win) => sum + win.panes.length, 0), [data]);

  function updateWindow(patch) {
    setDirty(true);
    setData((current) => reNumberWindows({
      ...current,
      windows: current.windows.map((win) => win.id === activeWindow.id ? { ...win, ...(typeof patch === "function" ? patch(win) : patch) } : win),
    }));
  }

  function updatePane(patch) {
    if (!selectedPane) return;
    updateWindow((win) => ({
      panes: win.panes.map((pane) => pane.id === selectedPane.id ? { ...pane, ...(typeof patch === "function" ? patch(pane) : patch) } : pane),
    }));
  }

  function addWindow() {
    const win = emptyWindow(data.windows.length + 1);
    setData((current) => reNumberWindows({ ...current, windows: [...current.windows, win] }));
    setDirty(true);
    setActiveWindowId(win.id);
    setSelectedPaneId(win.panes[0].id);
  }

  function duplicateWindow() {
    const win = normalizeData({ windows: [{ ...activeWindow, id: uid("f"), label: `${activeWindow.label} copie`, photoUrl: "", panes: activeWindow.panes.map((p) => ({ ...p, id: uid("t") })) }] }).windows[0];
    setData((current) => reNumberWindows({ ...current, windows: [...current.windows, win] }));
    setDirty(true);
    setActiveWindowId(win.id);
    setSelectedPaneId(win.panes[0].id);
  }

  function removeWindow() {
    if (data.windows.length <= 1 || !confirm(`Supprimer ${activeWindow.label}?`)) return;
    const next = data.windows.filter((win) => win.id !== activeWindow.id);
    setData((current) => reNumberWindows({ ...current, windows: next }));
    setDirty(true);
    setActiveWindowId(next[0].id);
    setSelectedPaneId(next[0].panes[0].id);
  }

  function structuralSplit(direction) {
    const clearsMeasurements = selectedPane.widthSixteenths > 0 || selectedPane.heightSixteenths > 0;
    const clearsGrille = selectedPane.grille?.enabled || selectedPane.grille?.vertical?.length || selectedPane.grille?.horizontal?.length;
    if ((clearsMeasurements || clearsGrille) && !confirm(`Créer ${equalSectionCount} sections dans T${selectedPane.number}?\n\nLa largeur, la hauteur et le carrelage décoratif actuels de ce thermos seront effacés. L’épaisseur et les autres options seront conservées.`)) return;
    const paneIndex = activeWindow.panes.findIndex((pane) => pane.id === selectedPane.id);
    const expectedPaneCount = activeWindow.panes.length - 1 + equalSectionCount;
    const next = reNumberWindows(splitPaneEvenly(data, activeWindow.id, selectedPane.id, direction, equalSectionCount));
    const nextWindow = next.windows.find((win) => win.id === activeWindow.id);
    if (!nextWindow || nextWindow.panes.length !== expectedPaneCount) {
      setMessage("Impossible de créer ces sections: le thermos sélectionné est trop petit ou la limite de thermos est atteinte.");
      return;
    }
    setData(next);
    setDirty(true);
    setSelectedPaneId(nextWindow.panes[Math.max(0, paneIndex)]?.id);
    setMessage(`${equalSectionCount} sections égales créées. Vous pouvez maintenant déplacer les poignées cyan.`);
  }

  function moveDivider(divider, nextPosition) {
    updateWindow((win) => ({ panes: moveStructuralDivider(win.panes, divider, nextPosition) }));
  }

  function resetDivisions() {
    const hasCustomDrawing = activeWindow.panes.length !== 1
      || activeWindow.panes[0]?.x !== 0
      || activeWindow.panes[0]?.y !== 0
      || activeWindow.panes[0]?.width !== 10000
      || activeWindow.panes[0]?.height !== 10000;
    if (!hasCustomDrawing) return;
    const confirmed = confirm(
      `Réinitialiser le dessin de ${activeWindow.label}?\n\nToutes les divisions et les mesures/options des thermos de cette fenêtre seront effacées. La photo, le nom et l’emplacement seront conservés.`
    );
    if (!confirmed) return;
    const next = reNumberWindows(resetWindowDivisions(data, activeWindow.id));
    const resetWindow = next.windows.find((win) => win.id === activeWindow.id);
    setData(next);
    setDirty(true);
    setSelectedPaneId(resetWindow?.panes[0]?.id);
    setMessage("Le dessin de la fenêtre a été réinitialisé. Ajoutez les divisions nécessaires.");
  }

  function changeGrille(direction, delta) {
    updatePane((pane) => {
      const grille = { ...pane.grille, enabled: true };
      const key = direction === "vertical" ? "vertical" : "horizontal";
      const nextCount = Math.max(0, Math.min(12, (grille[key]?.length || 0) + delta));
      grille[key] = Array.from({ length: nextCount }, (_, index) => Math.round(((index + 1) * 10000) / (nextCount + 1)));
      grille.enabled = grille.vertical.length > 0 || grille.horizontal.length > 0;
      return { grille };
    });
  }

  function validate(finalize) {
    if (!finalize) return "";
    for (const win of data.windows) {
      for (const pane of win.panes) {
        if (!(pane.widthSixteenths > 0) || !(pane.heightSixteenths > 0)) return `${win.label}, thermos ${pane.number}: largeur et hauteur requises.`;
        if (technicianMode && !(pane.thicknessSixteenths >= 4 && pane.thicknessSixteenths <= 32)) return `${win.label}, thermos ${pane.number}: épaisseur requise entre 1/4 et 2 po pour une mesure finale.`;
      }
    }
    return "";
  }

  async function save(finalize = false) {
    const error = validate(finalize);
    if (error) { setMessage(error); return false; }
    setSaving(true); setMessage("");
    try {
      const res = await fetch(apiBase, {
        method: finalize && publicMode ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: reNumberWindows(data),
          status: finalize ? (publicMode ? "received" : "validated") : "in_progress",
          accuracy: technicianMode ? "final" : publicMode ? "client" : measurement.accuracy,
          finalize,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Impossible d’enregistrer les mesures.");
      setMessage(finalize ? (publicMode ? "Mesures envoyées à VosThermos. Merci!" : "Mesures finales validées.") : "Mesures enregistrées.");
      setDirty(false);
      onSaved?.(body.measurement || body);
      if (finalize) onFinalized?.(body.measurement || body);
      return true;
    } catch (err) {
      setMessage(err.message);
      return false;
    } finally { setSaving(false); }
  }

  useImperativeHandle(ref, () => ({
    save,
    isDirty: () => dirty,
  }));

  async function uploadPhoto(file) {
    if (!file) return;
    setUploading(true); setMessage("");
    try {
      const form = new FormData();
      form.append("photo", file);
      form.append("windowId", activeWindow.id);
      const res = await fetch(`${apiBase}/photo`, { method: "POST", body: form });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Téléversement impossible.");
      const url = body.photoUrl || body.url;
      if (!url) throw new Error("La photo n’a pas été reçue.");
      updateWindow({ photoUrl: url });
      setMessage("Photo ajoutée. Lancez la détection ou tracez les divisions manuellement.");
    } catch (err) { setMessage(err.message); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function analyzePhoto() {
    if (!activeWindow.photoUrl) { setMessage("Ajoutez d’abord une photo prise bien de face."); return; }
    setAnalyzing(true); setMessage("");
    try {
      const res = await fetch(`${apiBase}/analyze`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ windowId: activeWindow.id, photoUrl: activeWindow.photoUrl }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Détection impossible.");
      const updated = body.data?.windows?.find((win) => win.id === activeWindow.id) || body.suggestedWindow || body.window;
      if (!updated?.panes?.length) throw new Error("Aucune division fiable détectée. Vous pouvez les ajouter manuellement.");
      updateWindow(updated);
      setSelectedPaneId(updated.panes[0].id);
      setMessage("Divisions proposées. Vérifiez le dessin avant d’entrer les mesures.");
    } catch (err) { setMessage(err.message); }
    finally { setAnalyzing(false); }
  }

  return (
    <div className="space-y-5">
      <div className="admin-card border admin-border rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-cyan-400 text-xs uppercase tracking-[0.18em] font-bold">Plan de vitrage</p>
            <h2 className="admin-text text-xl font-bold mt-1">{measurement.client?.name || measurement.clientName || "Prise de mesures"}</h2>
            <p className="admin-text-muted text-sm mt-1">{data.windows.length} fenêtre{data.windows.length > 1 ? "s" : ""} · {totalThermos} thermos physique{totalThermos > 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">{technicianMode ? "Mesures finales" : publicMode ? "Mesures client" : measurement.accuracy === "approximate" ? "Pré-soumission" : "Fiche de mesures"}</span>
          </div>
        </div>
      </div>

      {publicMode && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          <strong>Important :</strong> prenez chaque fenêtre bien de face. Ces mesures servent à préparer la soumission; un technicien confirmera les dimensions finales avant la commande.
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {data.windows.map((win) => (
          <button key={win.id} type="button" onClick={() => { setActiveWindowId(win.id); setSelectedPaneId(win.panes[0]?.id); }}
            className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors ${win.id === activeWindow.id ? "border-cyan-400 bg-cyan-400/10 text-cyan-300" : "admin-border admin-card admin-text-muted"}`}>
            {win.label} <span className="opacity-60">· {win.panes.length}T</span>
          </button>
        ))}
        <button type="button" onClick={addWindow} className="shrink-0 rounded-xl border border-dashed admin-border px-4 py-2.5 admin-text-muted hover:text-cyan-300"><i className="fas fa-plus mr-2" />Fenêtre</button>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1.15fr)_minmax(350px,.85fr)] gap-5">
        <section className="admin-card border admin-border rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <input value={activeWindow.label} onChange={(e) => updateWindow({ label: e.target.value })} className="admin-input border admin-border rounded-lg px-3 py-2 font-bold min-w-40 flex-1" aria-label="Nom de la fenêtre" />
            <input value={activeWindow.location || ""} onChange={(e) => updateWindow({ location: e.target.value })} placeholder="Pièce / emplacement" className="admin-input border admin-border rounded-lg px-3 py-2 min-w-40 flex-1" />
            <button type="button" onClick={duplicateWindow} className="rounded-lg border admin-border px-3 py-2 admin-text-muted" title="Dupliquer"><i className="fas fa-copy" /></button>
            {data.windows.length > 1 && <button type="button" onClick={removeWindow} className="rounded-lg border border-red-400/30 px-3 py-2 text-red-300" title="Supprimer"><i className="fas fa-trash" /></button>}
          </div>

          <Blueprint win={activeWindow} selectedId={selectedPane.id} onSelect={setSelectedPaneId} onMoveDivider={moveDivider} />
          {activeWindow.panes.length > 1 && (
            <p className="flex items-center gap-2 text-xs admin-text-muted">
              <span className="inline-block h-3 w-1 rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(34,211,238,.8)]" aria-hidden="true" />
              Glissez les poignées cyan pour placer les divisions. Les flèches du clavier permettent un ajustement précis.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border admin-border p-3">
              <p className="admin-text font-bold text-sm">Divisions structurales</p>
              <p className="admin-text-muted text-xs mt-1 mb-3">Choisissez le nombre de thermos égaux à créer dans le thermos sélectionné.</p>
              <label className="block mb-3">
                <span className="block text-[10px] font-bold uppercase tracking-wide admin-text-muted mb-1.5">Nombre de sections égales</span>
                <select value={equalSectionCount} onChange={(event) => setEqualSectionCount(Number(event.target.value))} className="w-full admin-input border admin-border rounded-lg px-3 py-2.5 font-bold">
                  {Array.from({ length: 11 }, (_, index) => index + 2).map((count) => <option key={count} value={count}>{count} thermos égaux</option>)}
                </select>
                <span className="block admin-text-muted text-[10px] mt-1.5">Exemple: 3 sections créent 3 thermos et 2 lignes de séparation.</span>
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-2 mb-2">
                <button type="button" onClick={() => structuralSplit("vertical")} className="rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2.5 text-xs font-bold"><i className="fas fa-arrows-left-right-to-line mr-2" />Créer verticalement</button>
                <button type="button" onClick={() => structuralSplit("horizontal")} className="rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2.5 text-xs font-bold"><i className="fas fa-arrows-up-down-to-line mr-2" />Créer horizontalement</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={resetDivisions}
                  disabled={activeWindow.panes.length === 1 && activeWindow.panes[0]?.x === 0 && activeWindow.panes[0]?.y === 0 && activeWindow.panes[0]?.width === 10000 && activeWindow.panes[0]?.height === 10000}
                  className="rounded-lg border admin-border px-3 py-2 text-xs font-bold admin-text-muted hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <i className="fas fa-rotate-left mr-2" />Réinitialiser le dessin
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-amber-300/25 bg-amber-300/5 p-3">
              <p className="text-amber-200 font-bold text-sm">Carrelage décoratif</p>
              <p className="text-amber-100/55 text-xs mt-1 mb-3">La croix reste à l’intérieur du même thermos.</p>
              <div className="grid grid-cols-2 gap-2">
                {[['vertical', 'Verticales'], ['horizontal', 'Horizontales']].map(([direction, label]) => {
                  const count = selectedPane.grille?.[direction]?.length || 0;
                  return <div key={direction} className="rounded-lg border border-amber-300/20 bg-black/5 p-2"><p className="text-[10px] text-amber-100/65 mb-1">{label}</p><div className="flex items-center justify-between gap-2"><button type="button" onClick={() => changeGrille(direction, -1)} disabled={!count} className="w-7 h-7 rounded-md border border-amber-200/25 disabled:opacity-30">−</button><span className="text-amber-100 font-bold text-sm">{count}</span><button type="button" onClick={() => changeGrille(direction, 1)} className="w-7 h-7 rounded-md border border-amber-200/25">+</button></div></div>;
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={(e) => uploadPhoto(e.target.files?.[0])} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-xl border admin-border px-4 py-3 admin-text font-bold text-sm disabled:opacity-50"><i className={`fas ${uploading ? "fa-spinner fa-spin" : "fa-camera"} mr-2`} />{activeWindow.photoUrl ? "Changer la photo" : "Prendre une photo de face"}</button>
            <button type="button" onClick={analyzePhoto} disabled={analyzing || !activeWindow.photoUrl} className="rounded-xl border border-violet-400/30 bg-violet-400/10 px-4 py-3 text-violet-300 font-bold text-sm disabled:opacity-40"><i className={`fas ${analyzing ? "fa-spinner fa-spin" : "fa-wand-magic-sparkles"} mr-2`} />Détecter les divisions</button>
          </div>
        </section>

        <section className="admin-card border admin-border rounded-2xl p-4 sm:p-5 space-y-5 self-start xl:sticky xl:top-4">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-cyan-400 text-xs uppercase tracking-wider font-bold">Thermos physique</p><h3 className="admin-text text-lg font-bold">{activeWindow.label} · T{selectedPane.number}</h3></div>
            <span className="font-mono text-xs admin-text-muted">F{String(activeIndex + 1).padStart(2, "0")}-T{String(selectedPane.number).padStart(2, "0")}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-4">
            <DimensionInput label="Largeur" value={selectedPane.widthSixteenths} onChange={(v) => updatePane({ widthSixteenths: v })} required />
            <DimensionInput label="Hauteur" value={selectedPane.heightSixteenths} onChange={(v) => updatePane({ heightSixteenths: v })} required />
            <DimensionInput label="Épaisseur" value={selectedPane.thicknessSixteenths} onChange={(v) => updatePane({ thicknessSixteenths: v })} required={technicianMode} minSixteenths={4} maxSixteenths={32} />
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide admin-text-muted mb-2">Options du thermos</p>
            <div className="grid grid-cols-2 gap-2">
              {[["lowE", "Low-E"], ["argon", "Argon"], ["tempered", "Trempé"], ["laminated", "Laminé"]].map(([key, label]) => (
                <label key={key} className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer ${selectedPane.options?.[key] ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200" : "admin-border admin-text-muted"}`}>
                  <input type="checkbox" checked={!!selectedPane.options?.[key]} onChange={(e) => updatePane((pane) => ({ options: { ...pane.options, [key]: e.target.checked } }))} />
                  <span className="text-sm font-semibold">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <label className="block"><span className="block text-[11px] font-bold uppercase tracking-wide admin-text-muted mb-1">Intercalaire</span><select value={selectedPane.options?.spacerColor || "noir"} onChange={(e) => updatePane((pane) => ({ options: { ...pane.options, spacerColor: e.target.value } }))} className="w-full admin-input border admin-border rounded-lg px-3 py-2.5"><option value="noir">Noir</option><option value="gris">Gris</option><option value="blanc">Blanc</option><option value="inox">Inox</option></select></label>
            <label className="block"><span className="block text-[11px] font-bold uppercase tracking-wide admin-text-muted mb-1">Type</span><select value={selectedPane.options?.glassType || "double"} onChange={(e) => updatePane((pane) => ({ options: { ...pane.options, glassType: e.target.value } }))} className="w-full admin-input border admin-border rounded-lg px-3 py-2.5"><option value="double">Double</option><option value="triple">Triple</option><option value="simple">Simple</option></select></label>
            <label className="block"><span className="block text-[11px] font-bold uppercase tracking-wide admin-text-muted mb-1">Accès</span><select value={selectedPane.options?.access || "easy"} onChange={(e) => updatePane((pane) => ({ options: { ...pane.options, access: e.target.value } }))} className="w-full admin-input border admin-border rounded-lg px-3 py-2.5"><option value="easy">Facile</option><option value="medium">Moyen</option><option value="hard">Difficile</option></select></label>
          </div>

          <label className="block"><span className="block text-[11px] font-bold uppercase tracking-wide admin-text-muted mb-1">Notes particulières</span><textarea rows={3} value={selectedPane.options?.notes || ""} onChange={(e) => updatePane((pane) => ({ options: { ...pane.options, notes: e.target.value } }))} className="w-full admin-input border admin-border rounded-lg px-3 py-2.5 resize-y" placeholder="Forme, défaut, accès, particularité…" /></label>
        </section>
      </div>

      {message && <div role="status" className={`rounded-xl border p-3 text-sm ${/impossible|requise|Aucune|n’a pas/i.test(message) ? "border-red-400/30 bg-red-400/10 text-red-200" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"}`}>{message}</div>}

      <div className="sticky bottom-3 z-20 rounded-2xl border admin-border bg-slate-950/95 backdrop-blur p-3 shadow-2xl flex flex-wrap justify-end gap-2">
        <button type="button" onClick={() => save(false)} disabled={saving} className="rounded-xl border admin-border px-5 py-3 admin-text font-bold disabled:opacity-50">{saving ? "Enregistrement…" : "Enregistrer"}</button>
        <button type="button" onClick={() => save(true)} disabled={saving} className="rounded-xl bg-[var(--color-red)] hover:bg-[var(--color-red-dark)] px-5 py-3 text-white font-bold disabled:opacity-50">
          <i className="fas fa-circle-check mr-2" />{publicMode ? "Envoyer mes mesures" : technicianMode ? "Valider les mesures finales" : "Marquer les mesures reçues"}
        </button>
      </div>
    </div>
  );
});

export default MeasurementEditor;
