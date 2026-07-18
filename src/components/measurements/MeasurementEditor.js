"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createEmptyPane,
  createEmptyWindow,
  clientMeasurementCompletenessErrors,
  getStructuralDividers,
  measurementCompletenessErrors,
  moveStructuralDivider,
  normalizeMeasurementData,
  resetWindowDivisions,
  splitPaneEvenly,
} from "@/lib/thermos-layout";
import {
  formatMeasurementCopy,
  getMeasurementCopy,
  normalizeMeasurementLocale,
} from "./measurement-copy";
import {
  createPresetPanes,
  getMeasurementPresetList,
} from "./measurement-presets";
import "./measurement-editor.css";

const FRACTIONS = [
  [0, "0"], [1, "1/16"], [2, "1/8"], [3, "3/16"], [4, "1/4"], [5, "5/16"],
  [6, "3/8"], [7, "7/16"], [8, "1/2"], [9, "9/16"], [10, "5/8"],
  [11, "11/16"], [12, "3/4"], [13, "13/16"], [14, "7/8"], [15, "15/16"],
];

const UNIT_FACTORS = { in: 1, mm: 25.4, cm: 2.54 };
const MAX_HISTORY = 60;
const AUTOSAVE_DELAY = 1400;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sameData(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function windowCode(index) {
  return `F${String(index + 1).padStart(2, "0")}`;
}

function technicianOptionsAreComplete(pane) {
  const options = pane?.options || {};
  return Boolean(
    ["simple", "double", "triple"].includes(options.glassType)
    && options.spacerColor
    && options.spacerColor !== "unknown"
    && ["with_ladder", "without_ladder", "easy", "medium", "hard"].includes(options.access),
  );
}

function paneIsComplete(pane, technicianMode) {
  return Boolean(
    pane?.widthSixteenths > 0
    && pane?.heightSixteenths > 0
    && (!technicianMode || (
      pane?.thicknessSixteenths >= 4
      && technicianOptionsAreComplete(pane)
    )),
  );
}

function paneHasMeasurements(pane) {
  return Boolean(pane?.widthSixteenths || pane?.heightSixteenths || pane?.thicknessSixteenths);
}

function windowHasEnteredData(win) {
  return win.panes.some((pane) => (
    paneHasMeasurements(pane)
    || pane?.grille?.enabled
    || pane?.options?.lowE
    || pane?.options?.argon
    || pane?.options?.tempered
    || pane?.options?.laminated
    || pane?.options?.glassType
    || pane?.options?.spacerColor
    || pane?.options?.access
    || pane?.options?.notes
  ));
}

function displaySixteenths(value, unit = "in") {
  if (!(value > 0)) return "";
  if (unit === "in") {
    const whole = Math.floor(value / 16);
    const remainder = value % 16;
    const fraction = FRACTIONS.find(([entry]) => entry === remainder)?.[1] || "";
    return `${whole || ""}${whole && remainder ? " " : ""}${remainder ? fraction : ""}` || "0";
  }
  const converted = (value / 16) * UNIT_FACTORS[unit];
  return Number(converted.toFixed(unit === "mm" ? 1 : 2)).toString();
}

function valueToSixteenths(value, unit) {
  const numeric = Number(String(value).replace(",", "."));
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  const result = Math.round((numeric / UNIT_FACTORS[unit]) * 16);
  return result > 0 && result <= 240 * 16 ? result : null;
}

function Icon({ name, className = "" }) {
  const paths = {
    check: <path d="m5 12 4 4L19 6" />,
    camera: <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="m8 6 1.5-2h5L16 6" /><circle cx="12" cy="13" r="4" /></>,
    layout: <><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M12 4v16" /></>,
    pencil: <><path d="m4 20 4.3-1 10.8-10.8a2 2 0 0 0-2.8-2.8L5.5 16.2 4 20Z" /><path d="m14.8 6.8 2.8 2.8" /></>,
    split: <><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M12 4v16" /><path d="m8 12-2 2 2 2m8-4 2 2-2 2" /></>,
    undo: <><path d="M9 8 4 12l5 4" /><path d="M5 12h8a6 6 0 0 1 6 6" /></>,
    redo: <><path d="m15 8 5 4-5 4" /><path d="M19 12h-8a6 6 0 0 0-6 6" /></>,
    play: <path d="m9 7 8 5-8 5V7Z" />,
    pause: <><path d="M9 7v10" /><path d="M15 7v10" /></>,
    close: <><path d="m7 7 10 10" /><path d="m17 7-10 10" /></>,
    left: <path d="m15 18-6-6 6-6" />,
    right: <path d="m9 18 6-6-6-6" />,
  };
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || paths.check}
    </svg>
  );
}

function HelpButton({ label, active, onClick }) {
  return (
    <button type="button" className="help-trigger" aria-label={label} aria-expanded={active} onClick={onClick}>
      <span aria-hidden="true">?</span>
    </button>
  );
}

function DimensionInput({ label, value, unit, onChange, required, placeholder, copy, min = 1, max = 240 * 16 }) {
  const hasValue = value !== null && value !== undefined && value !== "" && Number(value) > 0;
  const safe = hasValue ? Math.min(max, Math.max(min, Math.round(Number(value)))) : null;
  const whole = safe === null ? "" : Math.floor(safe / 16);
  const fraction = safe === null ? "" : safe % 16;
  const decimalValue = safe === null ? "" : displaySixteenths(safe, unit);
  const [decimalDraft, setDecimalDraft] = useState(decimalValue);
  const editingDecimal = useRef(false);

  useEffect(() => {
    if (!editingDecimal.current) setDecimalDraft(decimalValue);
  }, [decimalValue, unit]);

  function setWhole(raw) {
    if (raw === "") { onChange(null); return; }
    const integer = Number.parseInt(raw, 10);
    if (!Number.isFinite(integer)) return;
    const next = integer * 16 + (Number(fraction) || 0);
    onChange(next >= min && next <= max ? next : null);
  }

  function setFraction(raw) {
    const nextFraction = Number(raw) || 0;
    const next = (Number(whole) || 0) * 16 + nextFraction;
    onChange(next >= min && next <= max ? next : null);
  }

  return (
    <div className="dimension">
      <span className="field-label">{label}{required ? " *" : ""}</span>
      <div className="dimension-control" data-unit={unit}>
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={unit === "in" ? whole : decimalDraft}
          placeholder={placeholder}
          onFocus={(event) => { if (unit !== "in") editingDecimal.current = true; event.currentTarget.select(); }}
          onBlur={() => { editingDecimal.current = false; setDecimalDraft(displaySixteenths(value, unit)); }}
          onChange={(event) => {
            if (unit === "in") setWhole(event.target.value.replace(/\D/g, ""));
            else {
              const raw = event.target.value.replace(/[^0-9.,]/g, "");
              setDecimalDraft(raw);
              onChange(valueToSixteenths(raw, unit));
            }
          }}
          aria-label={label}
        />
        <select value={unit === "in" ? fraction : ""} onChange={(event) => setFraction(event.target.value)} aria-label={formatMeasurementCopy(copy.measurements.fraction, { dimension: label })}>
          <option value="">—</option>
          {FRACTIONS.map(([entry, text]) => <option key={entry} value={entry}>{text}</option>)}
        </select>
        <span className="dimension-unit">{copy.measurements.units[unit]}</span>
      </div>
    </div>
  );
}

function MiniPreview({ preset }) {
  const panes = preset.panes || preset.geometry || preset.miniPreview?.panes || [];

  return (
    <span className="layout-card-preview" aria-hidden="true" style={{ position: "relative", display: "block" }}>
      {panes.map((pane, index) => (
        <span key={index} style={{ position: "absolute", left: `${pane.x / 100}%`, top: `${pane.y / 100}%`, width: `${pane.width / 100}%`, height: `${pane.height / 100}%` }} />
      ))}
    </span>
  );
}

function dividerHandlePoint(divider, allDividers) {
  const segments = (divider.segments || []).filter((segment) => segment.end > segment.start);
  if (!segments.length) return { main: divider.position, cross: 5000 };

  const trackStart = Math.min(...segments.map((segment) => segment.start));
  const trackEnd = Math.max(...segments.map((segment) => segment.end));
  const touchesStartEdge = trackStart <= 80;
  const touchesEndEdge = trackEnd >= 9920;
  const towardStartEdge = touchesStartEdge !== touchesEndEdge
    ? touchesStartEdge
    : touchesStartEdge && touchesEndEdge
      ? divider.axis === "vertical"
      : (trackStart + trackEnd) / 2 <= 5000;
  const segment = [...segments].sort((first, second) => towardStartEdge
    ? first.start - second.start || second.end - first.end
    : second.end - first.end || first.start - second.start)[0];

  const crossCuts = allDividers
    .filter((candidate) => candidate.axis !== divider.axis)
    .filter((candidate) => (candidate.segments || []).some((entry) => divider.position >= entry.start - 80 && divider.position <= entry.end + 80))
    .map((candidate) => candidate.position)
    .filter((position) => position > segment.start + 80 && position < segment.end - 80)
    .sort((first, second) => first - second);
  const exteriorStart = towardStartEdge ? segment.start : (crossCuts.at(-1) ?? segment.start);
  const exteriorEnd = towardStartEdge ? (crossCuts[0] ?? segment.end) : segment.end;
  const sectionLength = Math.max(0, exteriorEnd - exteriorStart);
  const edgeMargin = Math.min(220, sectionLength / 4);
  const target = towardStartEdge
    ? exteriorStart + sectionLength / 3
    : exteriorEnd - sectionLength / 3;
  const cross = Math.min(exteriorEnd - edgeMargin, Math.max(exteriorStart + edgeMargin, target));
  return { main: divider.position, cross };
}

function Blueprint({ win, windowIndex, selectedId, copy, unit, onSelect, onDividerStart, onMoveDivider }) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const dividers = useMemo(() => getStructuralDividers(win.panes), [win.panes]);

  function positionFromPointer(event, divider) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect?.width || !rect?.height) return divider.position;
    const ratio = divider.axis === "vertical"
      ? (event.clientX - rect.left) / rect.width
      : (event.clientY - rect.top) / rect.height;
    return Math.min(divider.maximumPosition, Math.max(divider.minimumPosition, Math.round(ratio * 10000)));
  }

  function startDrag(event, divider) {
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = { pointerId: event.pointerId, dividerId: divider.id };
    onDividerStart();
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveDrag(event, divider) {
    if (dragRef.current?.pointerId !== event.pointerId || dragRef.current?.dividerId !== divider.id) return;
    event.preventDefault();
    onMoveDivider(divider, positionFromPointer(event, divider), false);
  }

  function stopDrag(event) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  }

  function moveWithKeyboard(event, divider) {
    const previous = divider.axis === "vertical" ? "ArrowLeft" : "ArrowUp";
    const next = divider.axis === "vertical" ? "ArrowRight" : "ArrowDown";
    if (![previous, next, "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const amount = event.shiftKey ? 500 : 100;
    const position = event.key === "Home" ? divider.minimumPosition
      : event.key === "End" ? divider.maximumPosition
        : divider.position + (event.key === previous ? -amount : amount);
    onMoveDivider(divider, Math.min(divider.maximumPosition, Math.max(divider.minimumPosition, position)), true);
  }

  return (
    <div className="blueprint-stage">
      <div ref={canvasRef} className="blueprint" aria-label={copy.canvas.aria}>
        {win.panes.map((pane) => {
          const selected = pane.id === selectedId;
          return (
            <button
              key={pane.id}
              type="button"
              className={`pane${selected ? " is-selected pane-selected" : ""}`}
              style={{ left: `${pane.x / 100}%`, top: `${pane.y / 100}%`, width: `${pane.width / 100}%`, height: `${pane.height / 100}%` }}
              aria-pressed={selected}
              aria-label={formatMeasurementCopy(selected ? copy.canvas.selectedLabel : copy.canvas.availableLabel, { code: windowCode(windowIndex), pane: pane.number })}
              onClick={() => onSelect(pane.id)}
            >
              <span className="pane-code">{selected && <small>{copy.canvas.editing}</small>}T{pane.number}</span>
              {pane.grille?.enabled && (pane.grille.vertical || []).map((position, index) => <span key={`v-${index}`} className="decorative-line is-vertical" style={{ left: `${position / 100}%` }} />)}
              {pane.grille?.enabled && (pane.grille.horizontal || []).map((position, index) => <span key={`h-${index}`} className="decorative-line is-horizontal" style={{ top: `${position / 100}%` }} />)}
              {pane.widthSixteenths > 0 && pane.heightSixteenths > 0 ? (
                <span className="pane-measurement">{displaySixteenths(pane.widthSixteenths, unit)} × {displaySixteenths(pane.heightSixteenths, unit)} {copy.measurements.units[unit]}</span>
              ) : !selected ? <span className="pane-hint">{copy.canvas.tapToSelect}</span> : null}
            </button>
          );
        })}
        {dividers.map((divider, dividerIndex) => {
          const vertical = divider.axis === "vertical";
          const point = dividerHandlePoint(divider, dividers);
          return (
            <button
              key={divider.id}
              type="button"
              className={`divider-handle is-${vertical ? "vertical" : "horizontal"}`}
              data-axis={divider.axis}
              style={{ left: `${vertical ? point.main / 100 : point.cross / 100}%`, top: `${vertical ? point.cross / 100 : point.main / 100}%`, transform: "translate(-50%, -50%)", touchAction: "none" }}
              role="slider"
              aria-label={formatMeasurementCopy(copy.canvas.dividerAria, { axis: vertical ? copy.modals.split.vertical : copy.modals.split.horizontal, index: dividerIndex + 1 })}
              aria-orientation={vertical ? "horizontal" : "vertical"}
              aria-valuemin={Math.round(divider.minimumPosition / 100)}
              aria-valuemax={Math.round(divider.maximumPosition / 100)}
              aria-valuenow={Math.round(divider.position / 100)}
              title={vertical ? copy.canvas.dividerVerticalTitle : copy.canvas.dividerHorizontalTitle}
              onPointerDown={(event) => startDrag(event, divider)}
              onPointerMove={(event) => moveDrag(event, divider)}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
              onLostPointerCapture={() => { dragRef.current = null; }}
              onKeyDown={(event) => moveWithKeyboard(event, divider)}
              onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}
            >
              <span aria-hidden="true">{vertical ? "↔" : "↕"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Modal({ children, onClose, labelledBy, className = "", cardClassName = "modal-card", disabled = false }) {
  const cardRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const disabledRef = useRef(disabled);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { disabledRef.current = disabled; }, [disabled]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      const focusable = cardRef.current?.querySelector(
        "[autofocus], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])",
      );
      focusable?.focus();
    });

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (disabledRef.current || cardRef.current?.closest("fieldset")?.disabled) return;
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...(cardRef.current?.querySelectorAll(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex='-1'])",
      ) || [])].filter((node) => !node.hidden && node.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  return (
    <div className={`modal ${className}`} onMouseDown={(event) => event.target === event.currentTarget && !disabled && !event.currentTarget.closest("fieldset")?.disabled && onClose?.()}>
      <section ref={cardRef} className={cardClassName} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </section>
    </div>
  );
}

const MeasurementEditor = forwardRef(function MeasurementEditor({
  initialMeasurement,
  apiBase,
  publicMode = false,
  technicianMode = false,
  demoMode = false,
  interactionDisabled = false,
  language,
  onSaved,
  onFinalized,
  onLanguageChange,
}, ref) {
  const measurement = initialMeasurement || {};
  const initialRef = useRef(null);
  if (!initialRef.current) {
    const normalized = normalizeMeasurementData(measurement.data);
    initialRef.current = {
      ...normalized,
      locale: normalizeMeasurementLocale(language || normalized.locale),
    };
  }
  const [data, setData] = useState(initialRef.current);
  const dataRef = useRef(initialRef.current);
  const [locale, setLocale] = useState(() => normalizeMeasurementLocale(language || initialRef.current.locale));
  const copy = getMeasurementCopy(locale);
  const presets = useMemo(() => getMeasurementPresetList(locale), [locale]);
  const [activeSelection, setActiveSelection] = useState(() => ({ windowId: initialRef.current.windows[0]?.id, paneId: initialRef.current.windows[0]?.panes[0]?.id }));
  const [openLayoutId, setOpenLayoutId] = useState(null);
  const [message, setMessage] = useState(null);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const finalizingRef = useRef(false);
  const finalizationSnapshotRef = useRef(null);
  const [autosaveState, setAutosaveState] = useState("saved");
  const [savedAt, setSavedAt] = useState(null);
  const [uploadingWindowId, setUploadingWindowId] = useState(null);
  const [analyzingWindowId, setAnalyzingWindowId] = useState(null);
  const [renameModal, setRenameModal] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [splitModal, setSplitModal] = useState(null);
  const [splitAxis, setSplitAxis] = useState("");
  const [splitCount, setSplitCount] = useState(2);
  const [incompleteModal, setIncompleteModal] = useState(null);
  const [helpKey, setHelpKey] = useState(null);
  const [tutorialPrompt, setTutorialPrompt] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialPlaying, setTutorialPlaying] = useState(false);
  const historyPast = useRef([]);
  const historyFuture = useRef([]);
  const [historyVersion, setHistoryVersion] = useState(0);
  const saveQueue = useRef(Promise.resolve(true));
  const cardRefs = useRef({});

  const totalPanes = useMemo(() => data.windows.reduce((total, win) => total + win.panes.length, 0), [data]);
  const completedPanes = useMemo(() => data.windows.reduce((total, win) => total + win.panes.filter((pane) => paneIsComplete(pane, technicianMode)).length, 0), [data, technicianMode]);
  const activeWindowIndex = Math.max(0, data.windows.findIndex((win) => win.id === activeSelection.windowId));
  const activeWindow = data.windows[activeWindowIndex] || data.windows[0];
  const activePane = activeWindow?.panes.find((pane) => pane.id === activeSelection.paneId) || activeWindow?.panes[0];
  const unit = data.displayUnit || "in";
  const canUndo = historyPast.current.length > 0;
  const canRedo = historyFuture.current.length > 0;
  void historyVersion;

  const commitData = useCallback((updater, { history = true, clearMessage = true } = {}) => {
    if (finalizingRef.current) return dataRef.current;
    const current = dataRef.current;
    const candidate = typeof updater === "function" ? updater(clone(current)) : updater;
    const next = normalizeMeasurementData(candidate);
    if (sameData(current, next)) return current;
    if (history) {
      historyPast.current = [...historyPast.current, clone(current)].slice(-MAX_HISTORY);
      historyFuture.current = [];
      setHistoryVersion((value) => value + 1);
    }
    dataRef.current = next;
    setData(next);
    dirtyRef.current = true;
    setDirty(true);
    setAutosaveState("unsaved");
    if (clearMessage) setMessage(null);
    return next;
  }, []);

  function pushDividerHistory() {
    if (finalizingRef.current) return;
    historyPast.current = [...historyPast.current, clone(dataRef.current)].slice(-MAX_HISTORY);
    historyFuture.current = [];
    setHistoryVersion((value) => value + 1);
  }

  function undo() {
    if (finalizingRef.current) return;
    const previous = historyPast.current.pop();
    if (!previous) return;
    historyFuture.current = [clone(dataRef.current), ...historyFuture.current].slice(0, MAX_HISTORY);
    dataRef.current = normalizeMeasurementData(previous);
    setData(dataRef.current);
    dirtyRef.current = true;
    setDirty(true);
    setAutosaveState("unsaved");
    setMessage({ tone: "success", text: copy.history.undone });
    setHistoryVersion((value) => value + 1);
  }

  function redo() {
    if (finalizingRef.current) return;
    const next = historyFuture.current.shift();
    if (!next) return;
    historyPast.current = [...historyPast.current, clone(dataRef.current)].slice(-MAX_HISTORY);
    dataRef.current = normalizeMeasurementData(next);
    setData(dataRef.current);
    dirtyRef.current = true;
    setDirty(true);
    setAutosaveState("unsaved");
    setMessage({ tone: "success", text: copy.history.redone });
    setHistoryVersion((value) => value + 1);
  }

  function updateWindow(windowId, patch, options) {
    return commitData((current) => ({
      ...current,
      windows: current.windows.map((win) => win.id === windowId ? { ...win, ...(typeof patch === "function" ? patch(win) : patch) } : win),
    }), options);
  }

  function updatePane(windowId, paneId, patch, options) {
    return updateWindow(windowId, (win) => ({
      panes: win.panes.map((pane) => pane.id === paneId ? { ...pane, ...(typeof patch === "function" ? patch(pane) : patch) } : pane),
    }), options);
  }

  function selectPane(windowId, paneId) {
    if (finalizingRef.current) return;
    setActiveSelection({ windowId, paneId });
  }

  function scrollToSelection(windowId, paneId) {
    selectPane(windowId, paneId);
    cardRefs.current[windowId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    const win = data.windows.find((entry) => entry.id === activeSelection.windowId) || data.windows[0];
    if (!win) return;
    const pane = win.panes.find((entry) => entry.id === activeSelection.paneId) || win.panes[0];
    if (win.id !== activeSelection.windowId || pane.id !== activeSelection.paneId) setActiveSelection({ windowId: win.id, paneId: pane.id });
  }, [data, activeSelection]);

  useEffect(() => {
    onLanguageChange?.(locale);
    if (publicMode && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("lang") !== locale) {
        url.searchParams.set("lang", locale);
        window.history.replaceState(window.history.state, "", url);
      }
    }
  }, [locale, onLanguageChange, publicMode]);

  const persistSnapshot = useCallback((snapshot, finalize = false, { silent = false } = {}) => {
    if (!finalize && finalizingRef.current) return Promise.resolve(false);
    const stableSnapshot = normalizeMeasurementData(clone(snapshot));
    const snapshotFingerprint = JSON.stringify(stableSnapshot);
    const queued = async () => {
      setSaving(true);
      if (!finalize) setAutosaveState("saving");
      try {
        if (finalize && (
          finalizationSnapshotRef.current !== snapshotFingerprint
          || JSON.stringify(normalizeMeasurementData(dataRef.current)) !== snapshotFingerprint
        )) {
          setAutosaveState("unsaved");
          setMessage({
            tone: "error",
            text: locale === "en"
              ? "The measurements changed before confirmation. Review them and try again."
              : "Les mesures ont changé avant la validation. Vérifiez-les et réessayez.",
          });
          return false;
        }
        if (demoMode) {
          await new Promise((resolve) => setTimeout(resolve, 180));
          const isCurrent = snapshotFingerprint === JSON.stringify(normalizeMeasurementData(dataRef.current));
          if (!isCurrent) {
            setAutosaveState("unsaved");
            setMessage({
              tone: "error",
              text: locale === "en"
                ? "The measurements changed during confirmation. Review them and try again."
                : "Les mesures ont changé pendant la validation. Vérifiez-les et réessayez.",
            });
            return false;
          }
          dirtyRef.current = false;
          setDirty(false);
          setAutosaveState("saved");
          setSavedAt(new Date());
          if (finalize) setMessage({ tone: "success", text: publicMode ? copy.validation.clientSuccess : copy.validation.technicianSuccess });
          return true;
        }
        if (!apiBase) throw new Error(copy.autosave.failed);
        const res = await fetch(apiBase, {
          method: finalize && publicMode ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: stableSnapshot,
            status: finalize ? (publicMode ? "received" : "validated") : "in_progress",
            accuracy: technicianMode ? "final" : publicMode ? "client" : measurement.accuracy,
            finalize,
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(publicMode && locale === "en" ? copy.autosave.failed : body.error || copy.autosave.failed);
        const isCurrent = snapshotFingerprint === JSON.stringify(normalizeMeasurementData(dataRef.current));
        if (isCurrent) {
          dirtyRef.current = false;
          setDirty(false);
          setAutosaveState("saved");
          setSavedAt(new Date());
        } else {
          dirtyRef.current = true;
          setDirty(true);
          setAutosaveState("unsaved");
        }
        if (isCurrent) onSaved?.(body.measurement || body);
        if (finalize && isCurrent) {
          setMessage({ tone: "success", text: publicMode ? copy.validation.clientSuccess : technicianMode ? copy.validation.technicianSuccess : copy.validation.adminSuccess });
          onFinalized?.(body.measurement || body);
        } else if (finalize) {
          setMessage({
            tone: "error",
            text: locale === "en"
              ? "The measurements changed during confirmation. Review them and try again."
              : "Les mesures ont changé pendant la validation. Vérifiez-les et réessayez.",
          });
        } else if (isCurrent && !silent) {
          setMessage({ tone: "success", text: copy.autosave.saved });
        } else if (!silent) {
          setMessage({
            tone: "warning",
            text: locale === "en"
              ? "New changes were made while saving. Save again before continuing."
              : "De nouveaux changements ont été faits pendant l’enregistrement. Enregistrez de nouveau avant de continuer.",
          });
        }
        return isCurrent;
      } catch (error) {
        setAutosaveState("error");
        setMessage({ tone: "error", text: error.message || copy.autosave.failed });
        return false;
      } finally {
        setSaving(false);
        if (finalize) {
          finalizationSnapshotRef.current = null;
          finalizingRef.current = false;
          setFinalizing(false);
        }
      }
    };
    saveQueue.current = saveQueue.current.catch(() => true).then(queued);
    return saveQueue.current;
  }, [apiBase, copy, demoMode, locale, measurement.accuracy, onFinalized, onSaved, publicMode, technicianMode]);

  function findFirstIncomplete(snapshot = dataRef.current) {
    for (const win of snapshot.windows) {
      for (const pane of win.panes) {
        const fields = [];
        if (!(pane.widthSixteenths > 0)) fields.push(copy.measurements.width.toLowerCase());
        if (!(pane.heightSixteenths > 0)) fields.push(copy.measurements.height.toLowerCase());
        if (technicianMode && !(pane.thicknessSixteenths >= 4)) fields.push(copy.measurements.thickness.toLowerCase());
        if (technicianMode && !["simple", "double", "triple"].includes(pane.options?.glassType)) fields.push(copy.options.glazing.toLowerCase());
        if (technicianMode && (!pane.options?.spacerColor || pane.options.spacerColor === "unknown")) fields.push(copy.options.spacer.toLowerCase());
        if (technicianMode && !["with_ladder", "without_ladder", "easy", "medium", "hard"].includes(pane.options?.access)) fields.push(copy.options.access.toLowerCase());
        if (fields.length) return { win, pane, fields };
      }
    }
    return null;
  }

  async function save(finalize = false) {
    if (finalizingRef.current) return false;
    if (uploadingWindowId || analyzingWindowId) {
      setMessage({ tone: "warning", text: copy.history.waitForPhoto });
      return false;
    }
    const snapshot = normalizeMeasurementData(clone(dataRef.current));
    if (finalize) {
      const missing = findFirstIncomplete(snapshot);
      const validationErrors = technicianMode
        ? measurementCompletenessErrors(snapshot)
        : clientMeasurementCompletenessErrors(snapshot);
      if (missing || validationErrors.length) {
        if (!missing) {
          setMessage({ tone: "error", text: copy.validation.incompleteDossier });
          return false;
        }
        setMessage({ tone: "error", text: formatMeasurementCopy(copy.validation.missingPane, { window: missing.win.label, pane: missing.pane.number, fields: missing.fields.join(", ") }) });
        scrollToSelection(missing.win.id, missing.pane.id);
        return false;
      }
      const fingerprint = JSON.stringify(snapshot);
      finalizationSnapshotRef.current = fingerprint;
      finalizingRef.current = true;
      setFinalizing(true);
    }
    return persistSnapshot(snapshot, finalize, { silent: !finalize });
  }

  useImperativeHandle(ref, () => ({
    save,
    isDirty: () => dirtyRef.current,
    isPhotoPending: () => Boolean(uploadingWindowId || analyzingWindowId),
  }));

  useEffect(() => {
    if (!dirty || saving || finalizing || uploadingWindowId || analyzingWindowId) return undefined;
    const timer = setTimeout(() => persistSnapshot(clone(dataRef.current), false, { silent: true }), AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  }, [data, dirty, saving, finalizing, uploadingWindowId, analyzingWindowId, persistSnapshot]);

  useEffect(() => {
    const beforeUnload = (event) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = copy.autosave.leaveWarning;
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [copy.autosave.leaveWarning]);

  useEffect(() => {
    if (!publicMode) return;
    try {
      if (!localStorage.getItem("vosthermos-measurement-tutorial-prompt")) setTutorialPrompt(true);
    } catch {}
  }, [publicMode]);

  useEffect(() => {
    if (!tutorialOpen || !tutorialPlaying) return undefined;
    const timer = setTimeout(() => {
      if (tutorialStep >= copy.tutorial.steps.length - 1) setTutorialPlaying(false);
      else setTutorialStep((step) => step + 1);
    }, 5200);
    return () => clearTimeout(timer);
  }, [tutorialOpen, tutorialPlaying, tutorialStep, copy.tutorial.steps.length]);

  useEffect(() => {
    if (!tutorialOpen) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const dialog = document.querySelector(".measurement-workspace .tutorial-card");
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => dialog?.querySelector("button:not(:disabled)")?.focus());

    function handleTutorialKeyDown(event) {
      if (event.key === "Escape") {
        if (finalizingRef.current) return;
        event.preventDefault();
        setTutorialOpen(false);
        setTutorialPlaying(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...(dialog?.querySelectorAll("button:not(:disabled), [href], [tabindex]:not([tabindex='-1'])") || [])]
        .filter((node) => !node.hidden && node.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleTutorialKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleTutorialKeyDown);
      document.body.style.overflow = previousOverflow;
      const restoreTarget = previousFocus instanceof HTMLElement
        && previousFocus !== document.body
        && previousFocus.isConnected
        ? previousFocus
        : document.querySelector(".measurement-workspace .topbar-tutorial");
      restoreTarget?.focus();
    };
  }, [tutorialOpen]);

  function changeLocale(nextLocale) {
    if (finalizingRef.current) return;
    const normalized = normalizeMeasurementLocale(nextLocale);
    setLocale(normalized);
    commitData((current) => ({ ...current, locale: normalized }), { history: false, clearMessage: false });
  }

  function changeUnit(nextUnit) {
    if (finalizingRef.current) return;
    commitData((current) => ({ ...current, displayUnit: nextUnit }), { history: false });
    setMessage({ tone: "success", text: formatMeasurementCopy(copy.measurements.unitChanged, { unit: copy.measurements.units[nextUnit] }) });
  }

  function applyPreset(win, preset) {
    if (finalizingRef.current) return;
    if (win.layoutPreset === preset.key && win.panes.length === preset.paneCount) {
      setOpenLayoutId(null);
      return;
    }
    if (windowHasEnteredData(win) && !window.confirm(formatMeasurementCopy(copy.models.changeConfirmation, { code: windowCode(data.windows.findIndex((entry) => entry.id === win.id)) }))) return;
    const panes = createPresetPanes(preset.key).map((geometry) => createEmptyPane(geometry));
    updateWindow(win.id, { layoutPreset: preset.key, panes });
    setActiveSelection({ windowId: win.id, paneId: panes[0].id });
    setOpenLayoutId(null);
    setMessage({ tone: "success", text: formatMeasurementCopy(copy.models.created, { label: preset.label, count: panes.length }) });
  }

  function openRename(win) {
    if (finalizingRef.current) return;
    setRenameValue(win.label || "");
    setRenameModal({ windowId: win.id });
  }

  function submitRename(event) {
    event.preventDefault();
    if (finalizingRef.current) return;
    const value = renameValue.trim();
    if (!value) return;
    updateWindow(renameModal.windowId, { label: value });
    setRenameModal(null);
  }

  function requestAddWindow() {
    if (finalizingRef.current) return;
    const lastWindow = dataRef.current.windows[dataRef.current.windows.length - 1];
    const missing = lastWindow.panes.filter((pane) => !paneIsComplete(pane, technicianMode)).length;
    if (missing) {
      setIncompleteModal({ win: lastWindow, missing });
      return;
    }
    addWindowNow();
  }

  function addWindowNow() {
    if (finalizingRef.current) return;
    const number = dataRef.current.windows.length + 1;
    const win = createEmptyWindow({ label: formatMeasurementCopy(copy.windows.defaultName, { number }) });
    commitData((current) => ({ ...current, windows: [...current.windows, win] }));
    setActiveSelection({ windowId: win.id, paneId: win.panes[0].id });
    setIncompleteModal(null);
    setTimeout(() => cardRefs.current[win.id]?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function openSplit(win, pane) {
    if (finalizingRef.current) return;
    setActiveSelection({ windowId: win.id, paneId: pane.id });
    setSplitAxis("");
    setSplitCount(2);
    setSplitModal({ windowId: win.id, paneId: pane.id });
  }

  function applySplit() {
    if (finalizingRef.current) return;
    if (!splitModal || !splitAxis) return;
    const current = dataRef.current;
    const win = current.windows.find((entry) => entry.id === splitModal.windowId);
    const paneIndex = win?.panes.findIndex((entry) => entry.id === splitModal.paneId) ?? -1;
    const next = splitPaneEvenly(current, splitModal.windowId, splitModal.paneId, splitAxis, splitCount);
    const nextWindow = next.windows.find((entry) => entry.id === splitModal.windowId);
    if (!nextWindow || nextWindow.panes.length !== win.panes.length - 1 + splitCount) {
      setMessage({ tone: "error", text: formatMeasurementCopy(copy.canvas.maximumReached, { max: 100, code: windowCode(data.windows.findIndex((entry) => entry.id === win.id)) }) });
      return;
    }
    commitData(next);
    setActiveSelection({ windowId: nextWindow.id, paneId: nextWindow.panes[Math.max(0, paneIndex)]?.id });
    setSplitModal(null);
  }

  function resetWindow(win) {
    if (finalizingRef.current) return;
    if (!window.confirm(formatMeasurementCopy(copy.canvas.resetConfirmation, { code: windowCode(data.windows.findIndex((entry) => entry.id === win.id)) }))) return;
    const next = resetWindowDivisions(dataRef.current, win.id);
    const reset = next.windows.find((entry) => entry.id === win.id);
    commitData(next);
    setActiveSelection({ windowId: win.id, paneId: reset.panes[0].id });
    setSplitModal(null);
    setMessage({ tone: "success", text: formatMeasurementCopy(copy.canvas.resetDone, { code: windowCode(data.windows.findIndex((entry) => entry.id === win.id)) }) });
  }

  function moveDivider(win, divider, position, history) {
    if (finalizingRef.current) return;
    updateWindow(win.id, (entry) => ({ layoutPreset: "", panes: moveStructuralDivider(entry.panes, divider, position) }), { history });
  }

  function setDecorativeCount(win, pane, direction, delta) {
    if (finalizingRef.current) return;
    updatePane(win.id, pane.id, (entry) => {
      const grille = { ...entry.grille };
      const count = Math.max(0, Math.min(12, (grille[direction]?.length || 0) + delta));
      grille[direction] = Array.from({ length: count }, (_, index) => Math.round(((index + 1) * 10000) / (count + 1)));
      grille.enabled = Boolean(grille.vertical?.length || grille.horizontal?.length);
      return { grille };
    });
  }

  async function uploadAndAnalyze(win, file) {
    if (!file || finalizingRef.current || uploadingWindowId || analyzingWindowId) return;
    const currentWindow = dataRef.current.windows.find((entry) => entry.id === win.id);
    if (!currentWindow) return;
    if (windowHasEnteredData(currentWindow)) {
      const index = dataRef.current.windows.findIndex((entry) => entry.id === currentWindow.id);
      const confirmed = window.confirm(locale === "en"
        ? `Automatic detection will replace the glass units, measurements, options and decorative grilles in ${windowCode(index)}. Continue?`
        : `La détection automatique remplacera les thermos, mesures, options et carreaux décoratifs de ${windowCode(index)}. Continuer?`);
      if (!confirmed) return;
    }

    setUploadingWindowId(win.id);
    setMessage({ tone: "warning", text: copy.photo.uploading });
    try {
      if (dirtyRef.current) {
        const saved = await save(false);
        if (!saved || dirtyRef.current) {
          throw new Error(locale === "en"
            ? "The latest changes could not be saved. The photo was not uploaded. Try again."
            : "Les derniers changements n’ont pas pu être enregistrés. La photo n’a pas été envoyée. Réessayez.");
        }
      }
      const sourceWindow = dataRef.current.windows.find((entry) => entry.id === win.id);
      if (!sourceWindow) throw new Error(copy.photo.analysisFailed);
      const sourcePanesFingerprint = JSON.stringify(sourceWindow.panes);

      if (demoMode) {
        setUploadingWindowId(null);
        setAnalyzingWindowId(win.id);
        setMessage({ tone: "warning", text: copy.photo.analyzingMessage });
        await new Promise((resolve) => setTimeout(resolve, 850));
        if (finalizingRef.current) return;
        const latestWindow = dataRef.current.windows.find((entry) => entry.id === win.id);
        if (!latestWindow || JSON.stringify(latestWindow.panes) !== sourcePanesFingerprint) {
          setMessage({
            tone: "warning",
            text: locale === "en"
              ? "The window changed during detection. The demo layout was not applied."
              : "La fenêtre a changé pendant la détection. La disposition de démonstration n’a pas été appliquée.",
          });
          return;
        }
        const demoPreset = presets.find((entry) => entry.key === (win.layoutPreset === "3x1" ? "2x2" : "3x1")) || presets[0];
        const panes = createPresetPanes(demoPreset.key).map((geometry) => createEmptyPane(geometry));
        updateWindow(win.id, { layoutPreset: demoPreset.key, panes });
        setActiveSelection({ windowId: win.id, paneId: panes[0].id });
        setOpenLayoutId(null);
        setMessage({
          tone: "success",
          text: locale === "en"
            ? `Demo: ${demoPreset.label} was detected automatically. No photo was uploaded.`
            : `Démo : ${demoPreset.label} a été détecté automatiquement. Aucune photo n'a été envoyée.`,
        });
        return;
      }
      if (!apiBase) throw new Error(copy.photo.uploadFailed);
      const form = new FormData();
      form.append("photo", file);
      form.append("windowId", win.id);
      const uploadRes = await fetch(`${apiBase}/photo`, { method: "POST", body: form });
      const uploadBody = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) throw new Error(publicMode && locale === "en" ? copy.photo.uploadFailed : uploadBody.error || copy.photo.uploadFailed);
      const photoUrl = uploadBody.photoUrl || uploadBody.url;
      if (!photoUrl) throw new Error(copy.photo.uploadFailed);
      historyPast.current = [];
      historyFuture.current = [];
      setHistoryVersion((value) => value + 1);
      updateWindow(win.id, { photoUrl }, { history: false, clearMessage: false });
      setUploadingWindowId(null);
      setAnalyzingWindowId(win.id);
      setMessage({ tone: "warning", text: copy.photo.analyzingMessage });
      const analyzeRes = await fetch(`${apiBase}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ windowId: win.id, photoUrl }),
      });
      const analyzeBody = await analyzeRes.json().catch(() => ({}));
      if (!analyzeRes.ok) throw new Error(publicMode && locale === "en" ? copy.photo.analysisFailed : analyzeBody.error || copy.photo.analysisFailed);
      const suggested = analyzeBody.suggestedWindow || analyzeBody.data?.windows?.find((entry) => entry.id === win.id);
      if (!suggested?.panes?.length) throw new Error(copy.photo.failed);
      const latestWindow = dataRef.current.windows.find((entry) => entry.id === win.id);
      if (!latestWindow || JSON.stringify(latestWindow.panes) !== sourcePanesFingerprint) {
        setMessage({
          tone: "warning",
          text: locale === "en"
            ? "The photo was saved, but the window changed during analysis. Automatic detection was not applied. Start the photo again if you still want to replace the layout."
            : "La photo a été enregistrée, mais la fenêtre a changé pendant l’analyse. La détection automatique n’a pas été appliquée. Reprenez la photo si vous voulez toujours remplacer la disposition.",
        });
        return;
      }
      const next = updateWindow(win.id, {
        panes: suggested.panes,
        photoUrl,
        layoutPreset: "",
      }, { history: true, clearMessage: false });
      const detectedWindow = next.windows.find((entry) => entry.id === win.id);
      setActiveSelection({ windowId: win.id, paneId: detectedWindow?.panes[0]?.id });
      setMessage({ tone: "success", text: copy.photo.uploaded });
    } catch (error) {
      setMessage({ tone: "error", text: error.message || copy.photo.analysisFailed });
    } finally {
      setUploadingWindowId(null);
      setAnalyzingWindowId(null);
    }
  }

  function updateOption(win, pane, key, value) {
    if (finalizingRef.current) return;
    updatePane(win.id, pane.id, (entry) => ({ options: { ...entry.options, [key]: value } }));
  }

  const modeLabel = technicianMode ? copy.modes.technician : publicMode ? copy.modes.client : measurement.accuracy === "approximate" ? copy.modes.approximate : copy.modes.admin;
  const autosaveText = autosaveState === "saving" ? copy.autosave.saving
    : autosaveState === "error" ? copy.autosave.failed
      : autosaveState === "unsaved" ? copy.autosave.unsaved
        : savedAt ? formatMeasurementCopy(copy.autosave.savedAt, { time: savedAt.toLocaleTimeString(locale === "en" ? "en-CA" : "fr-CA", { hour: "2-digit", minute: "2-digit" }) }) : copy.autosave.saved;
  const help = helpKey ? copy.help[helpKey] : null;
  const tutorial = copy.tutorial.steps[tutorialStep];

  return (
    <div className="measurement-workspace" lang={locale}>
      <fieldset
        disabled={finalizing || interactionDisabled}
        aria-busy={finalizing || interactionDisabled}
        style={{ width: "100%", minWidth: 0, margin: 0, padding: 0, border: 0 }}
      >
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-brand">
            <img className="topbar-logo" src="/images/Vos-Thermos-Logo_Blanc.png" alt={copy.brandAlt} />
          </div>
          <div className="topbar-actions">
            <button type="button" className="topbar-tutorial" onClick={() => { setTutorialStep(0); setTutorialOpen(true); setTutorialPlaying(true); }}><Icon name="play" /><span>{copy.tutorial.launcher}</span></button>
            <button type="button" className="topbar-mode" onClick={() => changeLocale(locale === "fr" ? "en" : "fr")} aria-label={locale === "fr" ? "English" : "Français"}>{locale.toUpperCase()}</button>
            <span className="topbar-mode">{modeLabel}</span>
          </div>
        </header>

        <section className="progress-card" aria-label={copy.progress.title}>
          <div className="progress-head"><span>{copy.progress.title}</span><strong>{formatMeasurementCopy(copy.progress.summary, { complete: completedPanes, total: totalPanes })}</strong></div>
          <div className="progress-track">
            {data.windows.flatMap((win) => win.panes.map((pane, paneIndex) => {
              const complete = paneIsComplete(pane, technicianMode);
              const current = win.id === activeWindow?.id && pane.id === activePane?.id;
              return (
                <button key={pane.id} type="button" className={`progress-step${complete ? " is-complete" : ""}${current ? " is-current" : ""}`} data-complete={complete} aria-current={current ? "step" : undefined} onClick={() => scrollToSelection(win.id, pane.id)}>
                  <span className="progress-node">{complete ? <Icon name="check" /> : pane.number}</span>
                  <span className="progress-label">{windowCode(data.windows.findIndex((entry) => entry.id === win.id))}·T{paneIndex + 1}</span>
                </button>
              );
            }))}
          </div>
        </section>

        {publicMode && (
          <div className="status is-warning" data-tone="warning">
            <span aria-hidden="true">i</span><span>{locale === "en" ? "Take every photo straight on. These measurements are used for the quote; a technician confirms final dimensions before ordering." : "Prenez chaque photo bien de face. Ces mesures servent à la soumission; un technicien confirme les dimensions finales avant la commande."}</span>
          </div>
        )}

        <div className="window-list">
          {data.windows.map((win, windowIndex) => {
            const isActive = activeWindow?.id === win.id;
            const selectedPane = isActive ? activePane : null;
            const completeCount = win.panes.filter((pane) => paneIsComplete(pane, technicianMode)).length;
            const preset = presets.find((entry) => entry.key === win.layoutPreset);
            const photoBusy = uploadingWindowId === win.id || analyzingWindowId === win.id;
            return (
              <article key={win.id} ref={(node) => { cardRefs.current[win.id] = node; }} className="window-card" tabIndex="-1">
                <header className="window-head">
                  <div className="window-identity">
                    <h2 className="window-title">{windowCode(windowIndex)} · {win.label}</h2>
                    <button type="button" className="window-rename" onClick={() => openRename(win)} aria-label={formatMeasurementCopy(copy.windows.renameAria, { code: windowCode(windowIndex), name: win.label })}><Icon name="pencil" /></button>
                  </div>
                  <span className="window-status"><strong>{completeCount}</strong>&nbsp;/ {win.panes.length} {copy.progress.measured}</span>
                </header>

                <section aria-label={copy.models.toolbarAria}>
                  <div className="layout-picker-row">
                    <div className={`layout-picker${openLayoutId === win.id ? " is-open" : ""}`}>
                      <button
                        type="button"
                        className="layout-picker-trigger"
                        aria-expanded={openLayoutId === win.id}
                        onClick={() => setOpenLayoutId((current) => current === win.id ? null : win.id)}
                      >
                        <span className="choice-icon"><Icon name="layout" /></span>
                        <span className="choice-copy"><strong>{copy.models.chooseType}</strong><small>{copy.models.selection} <span>{preset?.label || copy.models.custom}</span></small></span>
                        <span className="choice-arrow" aria-hidden="true">›</span>
                      </button>
                      <div className={`layout-grid${openLayoutId === win.id ? " is-open" : ""}`} aria-label={copy.models.menuAria}>
                        {presets.map((entry) => (
                          <button key={entry.key} type="button" className={`layout-card${win.layoutPreset === entry.key ? " is-selected" : ""}`} aria-pressed={win.layoutPreset === entry.key} aria-label={entry.ariaLabel} onClick={() => applyPreset(win, entry)}>
                            <MiniPreview preset={entry} />
                            <span className="layout-card-copy"><strong>{entry.label}</strong><small>{entry.detail}</small></span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <HelpButton label={copy.help.trigger} active={helpKey === "plan"} onClick={() => setHelpKey(helpKey === "plan" ? null : "plan")} />
                  </div>
                  <div className="choice-separator">{locale === "en" ? "or" : "ou"}</div>
                  <div className="photo-action-row">
                    <label className={`photo-action${photoBusy ? " is-loading" : ""}${win.photoUrl ? " is-complete" : ""}`} aria-busy={photoBusy} data-state={win.photoUrl ? "success" : undefined}>
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" capture="environment" disabled={photoBusy || finalizing} aria-label={copy.photo.inputAria} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; uploadAndAnalyze(win, file); }} />
                      <span className="photo-action-icon">{photoBusy ? <span className="spinner" /> : <Icon name="camera" />}</span>
                      <span className="photo-action-copy"><strong>{photoBusy ? copy.photo.analyzing : win.photoUrl ? copy.photo.retake : copy.photo.take}</strong><small>{photoBusy ? copy.photo.analyzingHelp : win.photoUrl ? copy.photo.replaceHelp : copy.photo.detectedAutomatically}</small></span>
                      <span className="choice-arrow" aria-hidden="true">›</span>
                    </label>
                    <HelpButton label={copy.help.trigger} active={helpKey === "photo"} onClick={() => setHelpKey(helpKey === "photo" ? null : "photo")} />
                  </div>
                  {win.photoUrl && !publicMode && <div className="status is-success"><img src={win.photoUrl} alt={formatMeasurementCopy(copy.photo.adminPreviewAlt, { code: windowCode(windowIndex), name: win.label })} style={{ width: 54, height: 42, objectFit: "cover", borderRadius: 7 }} /><span>{copy.photo.adminPreview}</span></div>}
                </section>

                <Blueprint
                  win={win}
                  windowIndex={windowIndex}
                  selectedId={selectedPane?.id}
                  copy={copy}
                  unit={unit}
                  onSelect={(paneId) => selectPane(win.id, paneId)}
                  onDividerStart={pushDividerHistory}
                  onMoveDivider={(divider, position, history) => moveDivider(win, divider, position, history)}
                />

                <button type="button" className="edit-pane" onClick={() => openSplit(win, selectedPane || win.panes[0])}>
                  <span className="edit-pane-icon"><Icon name="split" /></span>
                  <span className="edit-pane-copy"><strong>{copy.canvas.editSelected}</strong><small>{copy.canvas.editSelectedHelp}</small></span>
                  <span className="choice-arrow" aria-hidden="true">›</span>
                </button>

                {isActive && selectedPane && (
                  <section className="pane-editor" aria-label={copy.canvas.selectedThermos}>
                    <header className="pane-editor-head">
                      <div><span className="pane-editor-kicker">{copy.canvas.selectedThermos}</span><h3 className="pane-editor-title">{windowCode(windowIndex)} · T{selectedPane.number}</h3></div>
                      <span className={`pane-editor-state${paneIsComplete(selectedPane, technicianMode) ? " is-complete" : ""}`} data-state={paneIsComplete(selectedPane, technicianMode) ? "complete" : "incomplete"}>{paneIsComplete(selectedPane, technicianMode) ? copy.progress.paneComplete : copy.progress.paneEmpty}</span>
                    </header>
                    <div className="pane-editor-body">
                      <section className="pane-editor-section">
                        <div className="section-head"><h4>{copy.measurements.title}</h4><div style={{ display: "flex", alignItems: "center", gap: 8 }}><label className="unit-picker"><span>{copy.measurements.unit}</span><select value={unit} onChange={(event) => changeUnit(event.target.value)}><option value="in">po</option><option value="mm">mm</option><option value="cm">cm</option></select></label><HelpButton label={copy.help.trigger} active={helpKey === "measurements"} onClick={() => setHelpKey(helpKey === "measurements" ? null : "measurements")} /></div></div>
                        <div className="field-grid">
                          <DimensionInput copy={copy} label={copy.measurements.width} placeholder={copy.measurements.widthPlaceholder} value={selectedPane.widthSixteenths} unit={unit} required onChange={(value) => updatePane(win.id, selectedPane.id, { widthSixteenths: value })} />
                          <DimensionInput copy={copy} label={copy.measurements.height} placeholder={copy.measurements.heightPlaceholder} value={selectedPane.heightSixteenths} unit={unit} required onChange={(value) => updatePane(win.id, selectedPane.id, { heightSixteenths: value })} />
                          <DimensionInput copy={copy} label={copy.measurements.thickness} placeholder={copy.measurements.thicknessPlaceholder} value={selectedPane.thicknessSixteenths} unit={unit} required={technicianMode} min={4} max={32} onChange={(value) => updatePane(win.id, selectedPane.id, { thicknessSixteenths: value })} />
                        </div>
                      </section>

                      <section className="pane-editor-section">
                        <div className="section-head"><h4>{copy.options.title}</h4><HelpButton label={copy.help.trigger} active={helpKey === "options"} onClick={() => setHelpKey(helpKey === "options" ? null : "options")} /></div>
                        <div className="option-grid">
                          {[["lowE", copy.options.lowE], ["argon", copy.options.argon], ["tempered", copy.options.tempered], ["laminated", copy.options.laminated]].map(([key, label]) => (
                            <label key={key} className={`option-chip${selectedPane.options?.[key] ? " is-selected" : ""}`}><input type="checkbox" checked={Boolean(selectedPane.options?.[key])} onChange={(event) => updateOption(win, selectedPane, key, event.target.checked)} />{label}</label>
                          ))}
                        </div>
                        <div className="select-grid">
                          <label className="field"><span className="field-label">{copy.options.spacer}</span><select value={selectedPane.options?.spacerColor || ""} onChange={(event) => updateOption(win, selectedPane, "spacerColor", event.target.value)}><option value="">{copy.options.spacerChoices.empty}</option><option value="unknown">{copy.options.spacerChoices.unknown}</option><option value="noir">{copy.options.spacerChoices.black}</option><option value="gris">{copy.options.spacerChoices.gray}</option><option value="blanc">{copy.options.spacerChoices.white}</option><option value="inox">{copy.options.spacerChoices.stainless}</option></select></label>
                          <label className="field"><span className="field-label">{copy.options.glazing}</span><select value={selectedPane.options?.glassType || ""} onChange={(event) => updateOption(win, selectedPane, "glassType", event.target.value)}><option value="">{copy.options.glazingChoices.empty}</option><option value="unknown">{copy.options.glazingChoices.unknown}</option><option value="simple">{copy.options.glazingChoices.single}</option><option value="double">{copy.options.glazingChoices.double}</option><option value="triple">{copy.options.glazingChoices.triple}</option></select></label>
                          <label className="field"><span className="field-label">{copy.options.access}</span><select value={selectedPane.options?.access || ""} onChange={(event) => updateOption(win, selectedPane, "access", event.target.value)}><option value="">{copy.options.accessChoices.empty}</option>{selectedPane.options?.access === "unknown" && <option value="unknown">{copy.common.unknown}</option>}{["easy", "medium", "hard"].includes(selectedPane.options?.access) && <option value={selectedPane.options.access}>{locale === "en" ? { easy: "Easy access (legacy)", medium: "Medium access (legacy)", hard: "Difficult access (legacy)" }[selectedPane.options.access] : { easy: "Accès facile (ancien)", medium: "Accès moyen (ancien)", hard: "Accès difficile (ancien)" }[selectedPane.options.access]}</option>}<option value="with_ladder">{copy.options.accessChoices.withLadder}</option><option value="without_ladder">{copy.options.accessChoices.withoutLadder}</option></select></label>
                        </div>
                        <label className="field" style={{ marginTop: 12 }}><span className="field-label">{copy.options.notes}</span><textarea className="notes" value={selectedPane.options?.notes || ""} placeholder={copy.options.notesPlaceholder} onChange={(event) => updateOption(win, selectedPane, "notes", event.target.value)} /></label>
                      </section>

                      <section className="pane-editor-section decorative">
                        <button type="button" className={`decorative-toggle${selectedPane.grille?.enabled ? " is-enabled" : ""}`} role="switch" aria-checked={Boolean(selectedPane.grille?.enabled)} onClick={() => updatePane(win.id, selectedPane.id, { grille: selectedPane.grille?.enabled ? { ...selectedPane.grille, enabled: false, vertical: [], horizontal: [] } : { ...selectedPane.grille, enabled: true } })}>
                          <span className="decorative-copy"><strong>{copy.options.decorative.title}</strong><small>{copy.options.decorative.help}</small></span><span className="decorative-value">{selectedPane.grille?.enabled ? copy.common.yes : copy.common.no}</span><span className="decorative-switch" />
                        </button>
                        {selectedPane.grille?.enabled && <div className="decorative-options"><p>{copy.options.decorative.instruction}</p><div className="decorative-counters">{[["vertical", copy.options.decorative.vertical], ["horizontal", copy.options.decorative.horizontal]].map(([direction, label]) => { const count = selectedPane.grille?.[direction]?.length || 0; return <div key={direction}><span className="field-label">{label}</span><div className="counter"><button type="button" disabled={!count} onClick={() => setDecorativeCount(win, selectedPane, direction, -1)}>−</button><output>{count}</output><button type="button" onClick={() => setDecorativeCount(win, selectedPane, direction, 1)}>+</button></div></div>; })}</div></div>}
                      </section>
                    </div>
                  </section>
                )}
              </article>
            );
          })}
        </div>

        <button type="button" className="add-window" onClick={requestAddWindow}><span className="add-window-icon">+</span><span className="add-window-copy"><strong>{copy.windows.add}</strong><small>{copy.windows.addHelp}</small></span></button>
        {message && <div className={`status is-${message.tone || "success"}`} data-tone={message.tone || "success"} role="status"><span>{message.text}</span></div>}
      </div>

      <div className="action-bar">
        <span className={`autosave is-${autosaveState}`} data-state={autosaveState}><span className="autosave-dot" />{autosaveText}</span>
        <div className="action-history" role="group" aria-label={copy.history.groupAria}>
          <button type="button" className="action-button" disabled={!canUndo || saving} onClick={undo} aria-label={copy.history.undo}><Icon name="undo" /><span className="action-label">{copy.history.undoShort}</span></button>
          <button type="button" className="action-button" disabled={!canRedo || saving} onClick={redo} aria-label={copy.history.redo}><Icon name="redo" /><span className="action-label">{copy.history.redoShort}</span></button>
        </div>
        <button type="button" className="action-primary" disabled={saving || finalizing || Boolean(uploadingWindowId || analyzingWindowId)} onClick={() => save(true)}>{finalizing ? copy.validation.validating : publicMode ? copy.validation.clientAction : technicianMode ? copy.validation.technicianAction : copy.validation.adminAction}</button>
        <HelpButton label={copy.help.trigger} active={helpKey === "finalization"} onClick={() => setHelpKey(helpKey === "finalization" ? null : "finalization")} />
      </div>

      {renameModal && <Modal onClose={() => setRenameModal(null)} labelledBy="measurement-rename-title"><form onSubmit={submitRename}><div className="modal-head"><div><span className="modal-kicker">{windowCode(data.windows.findIndex((win) => win.id === renameModal.windowId))}</span><h2 className="modal-title" id="measurement-rename-title">{copy.modals.rename.title}</h2></div><button type="button" className="modal-close" onClick={() => setRenameModal(null)} aria-label={copy.common.close}><Icon name="close" /></button></div><div className="modal-body"><label className="field"><span className="field-label">{copy.windows.nameField}</span><input autoFocus maxLength={60} value={renameValue} placeholder={copy.windows.namePlaceholder} onChange={(event) => setRenameValue(event.target.value)} /></label></div><div className="modal-actions"><button type="button" className="modal-action" onClick={() => setRenameModal(null)}>{copy.common.cancel}</button><button type="submit" className="modal-action is-primary" disabled={!renameValue.trim()}>{copy.modals.rename.save}</button></div></form></Modal>}

      {splitModal && (() => { const win = data.windows.find((entry) => entry.id === splitModal.windowId); const pane = win?.panes.find((entry) => entry.id === splitModal.paneId); return <Modal onClose={() => setSplitModal(null)} labelledBy="measurement-split-title"><div className="modal-head"><div><span className="modal-kicker">{windowCode(data.windows.findIndex((entry) => entry.id === win?.id))} · T{pane?.number}</span><h2 className="modal-title" id="measurement-split-title">{copy.modals.split.title}</h2><p className="modal-description">{copy.modals.split.intro}</p></div><button type="button" className="modal-close" onClick={() => setSplitModal(null)} aria-label={copy.common.close}><Icon name="close" /></button></div><div className="modal-body"><span className="field-label">1 · {copy.modals.split.direction}</span><div className="option-grid" style={{ marginTop: 8 }}><button type="button" className={`option-chip${splitAxis === "vertical" ? " is-selected" : ""}`} onClick={() => setSplitAxis("vertical")}><strong>↔ {copy.modals.split.vertical}</strong><small>{copy.modals.split.verticalHelp}</small></button><button type="button" className={`option-chip${splitAxis === "horizontal" ? " is-selected" : ""}`} onClick={() => setSplitAxis("horizontal")}><strong>↕ {copy.modals.split.horizontal}</strong><small>{copy.modals.split.horizontalHelp}</small></button></div><span className="field-label" style={{ display: "block", marginTop: 16 }}>2 · {copy.modals.split.count}</span><div className="option-grid" style={{ marginTop: 8 }}>{[2, 3, 4].map((count) => <button key={count} type="button" className={`option-chip${splitCount === count ? " is-selected" : ""}`} onClick={() => setSplitCount(count)}><strong>{count}</strong>&nbsp;{copy.modals.split.sections}</button>)}</div></div><div className="modal-actions"><button type="button" className="modal-action is-danger" onClick={() => resetWindow(win)}>{copy.canvas.reset}</button><button type="button" className="modal-action is-primary" disabled={!splitAxis} onClick={applySplit}>{splitAxis ? formatMeasurementCopy(copy.modals.split.create, { count: splitCount }) : copy.modals.split.chooseDirection}</button></div></Modal>; })()}

      {incompleteModal && <Modal onClose={() => setIncompleteModal(null)} labelledBy="measurement-incomplete-title"><div className="modal-head"><div><span className="modal-kicker">{copy.modals.incomplete.kicker}</span><h2 className="modal-title" id="measurement-incomplete-title">{formatMeasurementCopy(copy.modals.incomplete.title, { code: windowCode(data.windows.findIndex((win) => win.id === incompleteModal.win.id)), name: incompleteModal.win.label })}</h2></div><button type="button" className="modal-close" onClick={() => setIncompleteModal(null)} aria-label={copy.common.close}><Icon name="close" /></button></div><div className="modal-body"><p>{formatMeasurementCopy(copy.modals.incomplete.message, { missing: incompleteModal.missing, total: incompleteModal.win.panes.length })}</p></div><div className="modal-actions"><button type="button" className="modal-action" onClick={() => { const pane = incompleteModal.win.panes.find((entry) => !paneIsComplete(entry, technicianMode)); setIncompleteModal(null); scrollToSelection(incompleteModal.win.id, pane.id); }}>{copy.modals.incomplete.complete}</button><button type="button" className="modal-action is-primary" onClick={addWindowNow}>{copy.modals.incomplete.addAnyway}</button></div></Modal>}

      {tutorialPrompt && <Modal onClose={() => setTutorialPrompt(false)} labelledBy="measurement-tutorial-prompt"><div className="modal-head"><div><span className="modal-kicker">{copy.tutorial.promptKicker}</span><h2 className="modal-title" id="measurement-tutorial-prompt">{copy.tutorial.promptTitle}</h2><p className="modal-description">{copy.tutorial.promptBody}</p></div><span className="choice-icon"><Icon name="play" /></span></div><div className="modal-actions"><button type="button" className="modal-action" onClick={() => { setTutorialPrompt(false); try { localStorage.setItem("vosthermos-measurement-tutorial-prompt", "skipped"); } catch {} }}>{copy.tutorial.skip}</button><button type="button" className="modal-action is-primary" onClick={() => { setTutorialPrompt(false); setTutorialOpen(true); setTutorialPlaying(true); setTutorialStep(0); try { localStorage.setItem("vosthermos-measurement-tutorial-prompt", "seen"); } catch {} }}>{copy.tutorial.start}</button></div></Modal>}

      {help && <aside className="help" role="dialog" aria-labelledby="measurement-help-title"><div className="help-head"><div><span className="help-kicker">{copy.help.kicker}</span><h2 className="help-title" id="measurement-help-title">{help.title}</h2></div><button type="button" className="modal-close" onClick={() => setHelpKey(null)} aria-label={copy.help.close}><Icon name="close" /></button></div><div className="help-body"><p>{help.body}</p>{help.items && <ul>{help.items.map((item) => <li key={item.label}><strong>{item.label}:</strong> {item.body}</li>)}</ul>}</div></aside>}

      {tutorialOpen && <div className="tutorial"><section className="tutorial-card" role="dialog" aria-modal="true" aria-labelledby="measurement-tutorial-title"><header className="tutorial-head"><div><span className="modal-kicker">{copy.tutorial.kicker}</span><h2 className="tutorial-title" id="measurement-tutorial-title">{copy.tutorial.title}</h2></div><button type="button" className="modal-close" onClick={() => { setTutorialOpen(false); setTutorialPlaying(false); }} aria-label={copy.tutorial.close}><Icon name="close" /></button></header><div className="tutorial-stage"><div className="tutorial-frame" aria-hidden="true"><div style={{ height: "100%", minHeight: 300, display: "grid", placeItems: "center", padding: 20 }}><div style={{ width: "min(520px, 92%)", padding: 16, borderRadius: 18, background: "#fffaf2", boxShadow: "0 18px 50px rgba(0,56,69,.16)" }}><div className="layout-picker-trigger"><span className="choice-icon"><Icon name={tutorialStep === 0 ? "layout" : tutorialStep === 6 ? "check" : "split"} /></span><span className="choice-copy"><strong>{tutorial.title}</strong><small>{tutorial.tip}</small></span><span className="choice-arrow">›</span></div><div style={{ marginTop: 14, aspectRatio: "1.7", border: "6px solid #1b3137", display: "grid", gridTemplateColumns: tutorialStep >= 1 ? "1fr 1fr" : "1fr", background: "#e6f1f3" }}><span style={{ display: "grid", placeItems: "center", borderRight: tutorialStep >= 1 ? "2px solid #003845" : 0, color: "#132127", fontWeight: 900 }}>T1</span>{tutorialStep >= 1 && <span style={{ display: "grid", placeItems: "center", color: "#132127", fontWeight: 900, background: tutorialStep === 1 ? "#d9f0f2" : "transparent" }}>T2</span>}</div></div></div></div><div className="tutorial-caption"><span className="modal-kicker">{copy.tutorial.step} {tutorialStep + 1} {copy.tutorial.of} {copy.tutorial.steps.length}</span><h3>{tutorial.title}</h3><p>{tutorial.body}</p><p><strong>{tutorial.tip}</strong></p></div></div><footer className="tutorial-controls"><button type="button" className="tutorial-control" disabled={tutorialStep === 0} onClick={() => setTutorialStep((step) => Math.max(0, step - 1))}><Icon name="left" />{copy.tutorial.previous}</button><button type="button" className="tutorial-control is-play" onClick={() => setTutorialPlaying((playing) => !playing)} aria-label={tutorialPlaying ? copy.tutorial.pause : copy.tutorial.resume}><Icon name={tutorialPlaying ? "pause" : "play"} /></button><button type="button" className="tutorial-control" onClick={() => tutorialStep >= copy.tutorial.steps.length - 1 ? setTutorialOpen(false) : setTutorialStep((step) => step + 1)}>{tutorialStep >= copy.tutorial.steps.length - 1 ? copy.tutorial.finish : copy.tutorial.next}<Icon name="right" /></button></footer></section></div>}
      </fieldset>
    </div>
  );
});

export default MeasurementEditor;
