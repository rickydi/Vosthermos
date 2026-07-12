"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";

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
    widthSixteenths: 0, heightSixteenths: 0, thicknessSixteenths: 0,
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
    frame: { widthSixteenths: 0, heightSixteenths: 0 }, panes: [emptyPane(1)],
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

function DimensionInput({ label, value, onChange, required = false, maxSixteenths = 240 * 16 }) {
  const safe = Math.max(0, Math.round(Number(value) || 0));
  const whole = Math.floor(safe / 16);
  const fraction = safe % 16;
  const setPart = (nextWhole, nextFraction) => onChange(Math.min(maxSixteenths, Math.max(0, Number(nextWhole) || 0) * 16 + Number(nextFraction || 0)));
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-wide admin-text-muted mb-1">{label}{required ? " *" : ""}</span>
      <span className="flex rounded-lg border admin-border overflow-hidden admin-bg">
        <input
          type="number" min="0" max={Math.floor(maxSixteenths / 16)} inputMode="numeric" value={whole}
          onChange={(e) => setPart(e.target.value, fraction)}
          className="w-16 px-2 py-2.5 bg-transparent admin-text outline-none text-center font-semibold"
          aria-label={`${label}, pouces entiers`}
        />
        <select
          value={fraction} onChange={(e) => setPart(whole, e.target.value)}
          className="min-w-20 px-2 py-2.5 border-l admin-border bg-transparent admin-text outline-none"
          aria-label={`${label}, fraction de pouce`}
        >
          {FRACTIONS.map(([n, text]) => <option key={n} value={n}>{text}</option>)}
        </select>
        <span className="px-2 py-2.5 border-l admin-border admin-text-muted text-sm">po</span>
      </span>
    </label>
  );
}

function splitPane(pane, direction) {
  if (direction === "vertical") {
    const firstWidth = Math.round(pane.width / 2);
    return [
      { ...pane, id: uid("t"), width: firstWidth, widthSixteenths: 0, heightSixteenths: 0 },
      { ...pane, id: uid("t"), x: pane.x + firstWidth, width: pane.width - firstWidth, widthSixteenths: 0, heightSixteenths: 0 },
    ];
  }
  const firstHeight = Math.round(pane.height / 2);
  return [
    { ...pane, id: uid("t"), height: firstHeight, widthSixteenths: 0, heightSixteenths: 0 },
    { ...pane, id: uid("t"), y: pane.y + firstHeight, height: pane.height - firstHeight, widthSixteenths: 0, heightSixteenths: 0 },
  ];
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

function Blueprint({ win, selectedId, onSelect }) {
  return (
    <div className="relative aspect-[4/3] min-h-72 rounded-xl overflow-hidden border-4 border-slate-500/60 bg-sky-950/30 shadow-inner">
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
            className={`absolute border-2 transition-all overflow-hidden ${selected ? "border-cyan-300 bg-cyan-400/20 z-10 shadow-[0_0_0_2px_rgba(34,211,238,.25)]" : "border-white/65 bg-sky-300/5 hover:bg-sky-300/15"}`}
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
    const pieces = splitPane(selectedPane, direction);
    updateWindow((win) => ({ panes: win.panes.flatMap((pane) => pane.id === selectedPane.id ? pieces : [pane]) }));
    setSelectedPaneId(pieces[0].id);
  }

  function removePane() {
    if (activeWindow.panes.length <= 1) return;
    const panes = activeWindow.panes.filter((pane) => pane.id !== selectedPane.id);
    updateWindow({ panes });
    setSelectedPaneId(panes[0].id);
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
        if (technicianMode && !(pane.thicknessSixteenths > 0)) return `${win.label}, thermos ${pane.number}: épaisseur requise pour une mesure finale.`;
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

          <Blueprint win={activeWindow} selectedId={selectedPane.id} onSelect={setSelectedPaneId} />

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border admin-border p-3">
              <p className="admin-text font-bold text-sm">Divisions structurales</p>
              <p className="admin-text-muted text-xs mt-1 mb-3">Chaque division crée un thermos physique séparé.</p>
              <div className="flex gap-2 flex-wrap">
                <button type="button" onClick={() => structuralSplit("vertical")} className="rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 text-xs font-bold"><i className="fas fa-arrows-left-right-to-line mr-2" />Séparer verticalement</button>
                <button type="button" onClick={() => structuralSplit("horizontal")} className="rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 text-xs font-bold"><i className="fas fa-arrows-up-down-to-line mr-2" />Séparer horizontalement</button>
                {activeWindow.panes.length > 1 && <button type="button" onClick={removePane} className="rounded-lg border border-red-400/30 text-red-300 px-3 py-2 text-xs font-bold">Retirer T{selectedPane.number}</button>}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3 gap-3">
            <DimensionInput label="Largeur" value={selectedPane.widthSixteenths} onChange={(v) => updatePane({ widthSixteenths: v })} required />
            <DimensionInput label="Hauteur" value={selectedPane.heightSixteenths} onChange={(v) => updatePane({ heightSixteenths: v })} required />
            <DimensionInput label="Épaisseur" value={selectedPane.thicknessSixteenths} onChange={(v) => updatePane({ thicknessSixteenths: v })} required={technicianMode} maxSixteenths={32} />
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
