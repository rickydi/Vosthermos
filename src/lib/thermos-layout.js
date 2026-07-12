const MAX_WINDOWS = 50;
const MAX_PANES_PER_WINDOW = 100;
const GEOMETRY_SCALE = 10000;
const MAX_DIMENSION_SIXTEENTHS = 240 * 16;
const MIN_THICKNESS_SIXTEENTHS = 4; // 1/4 po
const MAX_THICKNESS_SIXTEENTHS = 2 * 16;

function makeId(prefix) {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}_${uuid}`;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function cleanText(value, max = 300) {
  return String(value ?? "").trim().slice(0, max);
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function integerInRange(value, min, max, fallback) {
  const number = Math.round(finiteNumber(value, fallback));
  return Math.min(max, Math.max(min, number));
}

function dimensionInSixteenths(value, { min = 1, max = MAX_DIMENSION_SIXTEENTHS } = {}) {
  if (value === null || value === undefined || value === "") return null;
  const number = Math.round(Number(value));
  if (!Number.isFinite(number) || number < min || number > max) return null;
  return number;
}

function normalizeLinePositions(value) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value
    // L'éditeur travaille en 0..10000, mais accepte aussi une valeur UI en
    // pourcentage (50 = centre) pour rester tolérant aux anciens brouillons.
    .map((entry) => {
      const number = finiteNumber(entry, 0);
      return integerInRange(number > 0 && number <= 100 ? number * 100 : number, 1, GEOMETRY_SCALE - 1, 0);
    })
    .filter(Boolean)))
    .sort((a, b) => a - b)
    .slice(0, 40);
}

function normalizeOptions(value) {
  const options = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const glassType = ["simple", "double", "triple"].includes(options.glassType) ? options.glassType : "double";
  const access = ["easy", "medium", "hard"].includes(options.access) ? options.access : "easy";
  return {
    glassType,
    lowE: Boolean(options.lowE),
    argon: Boolean(options.argon),
    tempered: Boolean(options.tempered),
    laminated: Boolean(options.laminated),
    spacerColor: cleanText(options.spacerColor || "noir", 40),
    spacerType: cleanText(options.spacerType || "standard", 60),
    shape: cleanText(options.shape || "rectangle", 40) || "rectangle",
    access,
    problem: cleanText(options.problem || "", 200),
    notes: cleanText(options.notes || "", 1000),
  };
}

function normalizeGrille(value) {
  const grille = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const vertical = normalizeLinePositions(grille.vertical);
  const horizontal = normalizeLinePositions(grille.horizontal);
  return {
    enabled: Boolean(grille.enabled || vertical.length || horizontal.length),
    type: "decorative",
    vertical,
    horizontal,
    color: cleanText(grille.color || "", 40),
    profile: cleanText(grille.profile || "", 60),
  };
}

export function createEmptyPane(overrides = {}) {
  return normalizePane({
    id: makeId("thermos"),
    number: 1,
    x: 0,
    y: 0,
    width: GEOMETRY_SCALE,
    height: GEOMETRY_SCALE,
    widthSixteenths: null,
    heightSixteenths: null,
    thicknessSixteenths: null,
    options: {},
    grille: {},
    ...overrides,
  }, 0);
}

function normalizePane(value, index) {
  const pane = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const x = integerInRange(pane.x, 0, GEOMETRY_SCALE - 1, 0);
  const y = integerInRange(pane.y, 0, GEOMETRY_SCALE - 1, 0);
  const width = integerInRange(pane.width, 1, GEOMETRY_SCALE - x, GEOMETRY_SCALE - x);
  const height = integerInRange(pane.height, 1, GEOMETRY_SCALE - y, GEOMETRY_SCALE - y);
  return {
    id: cleanText(pane.id, 100) || makeId("thermos"),
    number: index + 1,
    x,
    y,
    width,
    height,
    widthSixteenths: dimensionInSixteenths(pane.widthSixteenths),
    heightSixteenths: dimensionInSixteenths(pane.heightSixteenths),
    thicknessSixteenths: dimensionInSixteenths(pane.thicknessSixteenths, {
      min: MIN_THICKNESS_SIXTEENTHS,
      max: MAX_THICKNESS_SIXTEENTHS,
    }),
    options: normalizeOptions(pane.options),
    grille: normalizeGrille(pane.grille),
  };
}

export function createEmptyWindow(overrides = {}) {
  return normalizeWindow({
    id: makeId("window"),
    number: 1,
    label: "Fenêtre 1",
    location: "",
    photoUrl: null,
    viewSide: "outside",
    frame: {},
    panes: [createEmptyPane()],
    ...overrides,
  }, 0);
}

function normalizeWindow(value, index) {
  const windowValue = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const frame = windowValue.frame && typeof windowValue.frame === "object" && !Array.isArray(windowValue.frame)
    ? windowValue.frame
    : {};
  const seenPaneIds = new Set();
  const panes = (Array.isArray(windowValue.panes) ? windowValue.panes : [])
    .slice(0, MAX_PANES_PER_WINDOW)
    .map((pane, paneIndex) => {
      const normalized = normalizePane(pane, paneIndex);
      if (seenPaneIds.has(normalized.id)) normalized.id = makeId("thermos");
      seenPaneIds.add(normalized.id);
      return normalized;
    });
  return {
    id: cleanText(windowValue.id, 100) || makeId("window"),
    number: index + 1,
    label: cleanText(windowValue.label, 120) || `Fenêtre ${index + 1}`,
    location: cleanText(windowValue.location, 160),
    photoUrl: cleanText(windowValue.photoUrl, 500) || null,
    viewSide: ["inside", "interior"].includes(windowValue.viewSide)
      ? "inside"
      : ["outside", "exterior"].includes(windowValue.viewSide)
        ? "outside"
        : "outside",
    frame: {
      widthSixteenths: dimensionInSixteenths(frame.widthSixteenths),
      heightSixteenths: dimensionInSixteenths(frame.heightSixteenths),
    },
    panes: panes.length ? panes : [createEmptyPane()],
  };
}

export function createEmptyMeasurementData() {
  return {
    version: 1,
    notes: "",
    windows: [createEmptyWindow()],
  };
}

export function normalizeMeasurementData(value) {
  const data = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const seenWindowIds = new Set();
  const windows = (Array.isArray(data.windows) ? data.windows : [])
    .slice(0, MAX_WINDOWS)
    .map((windowValue, windowIndex) => {
      const normalized = normalizeWindow(windowValue, windowIndex);
      if (seenWindowIds.has(normalized.id)) normalized.id = makeId("window");
      seenWindowIds.add(normalized.id);
      return normalized;
    });
  return {
    version: 1,
    notes: cleanText(data.notes, 4000),
    windows: windows.length ? windows : [createEmptyWindow()],
  };
}

export function countMeasurementData(value) {
  const data = normalizeMeasurementData(value);
  return {
    windowCount: data.windows.length,
    paneCount: data.windows.reduce((total, windowValue) => total + windowValue.panes.length, 0),
  };
}

export function addWindow(value, overrides = {}) {
  const data = normalizeMeasurementData(value);
  if (data.windows.length >= MAX_WINDOWS) return data;
  const nextNumber = data.windows.length + 1;
  return normalizeMeasurementData({
    ...data,
    windows: [...data.windows, createEmptyWindow({
      number: nextNumber,
      label: `Fenêtre ${nextNumber}`,
      ...overrides,
    })],
  });
}

export function removeWindow(value, windowId) {
  const data = normalizeMeasurementData(value);
  if (data.windows.length <= 1) return data;
  return normalizeMeasurementData({
    ...data,
    windows: data.windows.filter((windowValue) => windowValue.id !== windowId),
  });
}

export function splitPane(value, windowId, paneId, direction = "vertical", ratio = 0.5) {
  const data = normalizeMeasurementData(value);
  const safeRatio = Math.min(0.85, Math.max(0.15, finiteNumber(ratio, 0.5)));
  return normalizeMeasurementData({
    ...data,
    windows: data.windows.map((windowValue) => {
      if (windowValue.id !== windowId || windowValue.panes.length >= MAX_PANES_PER_WINDOW) return windowValue;
      const paneIndex = windowValue.panes.findIndex((pane) => pane.id === paneId);
      if (paneIndex < 0) return windowValue;
      const pane = windowValue.panes[paneIndex];
      if ((direction === "horizontal" ? pane.height : pane.width) < 2) return windowValue;
      let first;
      let second;
      if (direction === "horizontal") {
        const firstHeight = Math.max(1, Math.round(pane.height * safeRatio));
        first = { ...pane, id: makeId("thermos"), height: firstHeight, heightSixteenths: null };
        second = {
          ...pane,
          id: makeId("thermos"),
          y: pane.y + firstHeight,
          height: pane.height - firstHeight,
          heightSixteenths: null,
        };
      } else {
        const firstWidth = Math.max(1, Math.round(pane.width * safeRatio));
        first = { ...pane, id: makeId("thermos"), width: firstWidth, widthSixteenths: null };
        second = {
          ...pane,
          id: makeId("thermos"),
          x: pane.x + firstWidth,
          width: pane.width - firstWidth,
          widthSixteenths: null,
        };
      }
      const panes = [...windowValue.panes];
      panes.splice(paneIndex, 1, first, second);
      return { ...windowValue, panes };
    }),
  });
}

export function removePane(value, windowId, paneId) {
  const data = normalizeMeasurementData(value);
  return normalizeMeasurementData({
    ...data,
    windows: data.windows.map((windowValue) => {
      if (windowValue.id !== windowId || windowValue.panes.length <= 1) return windowValue;
      return { ...windowValue, panes: windowValue.panes.filter((pane) => pane.id !== paneId) };
    }),
  });
}

export function addDecorativeGrilleLine(value, windowId, paneId, direction, position = GEOMETRY_SCALE / 2) {
  const data = normalizeMeasurementData(value);
  const key = direction === "horizontal" ? "horizontal" : "vertical";
  const safePosition = integerInRange(position, 1, GEOMETRY_SCALE - 1, GEOMETRY_SCALE / 2);
  return normalizeMeasurementData({
    ...data,
    windows: data.windows.map((windowValue) => ({
      ...windowValue,
      panes: windowValue.panes.map((pane) => {
        if (windowValue.id !== windowId || pane.id !== paneId) return pane;
        return {
          ...pane,
          grille: {
            ...pane.grille,
            enabled: true,
            type: "decorative",
            [key]: [...pane.grille[key], safePosition],
          },
        };
      }),
    })),
  });
}

export function parseMeasurementToSixteenths(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Math.round(value * 16) : null;
  }
  const text = String(value || "").trim().replace(/[″”"]/g, "").replace(",", ".");
  if (!text) return null;
  const mixed = text.match(/^(\d+(?:\.\d+)?)\s+(\d+)\s*\/\s*(\d+)$/);
  const fraction = text.match(/^(\d+)\s*\/\s*(\d+)$/);
  let inches;
  if (mixed) {
    const denominator = Number(mixed[3]);
    if (!denominator) return null;
    inches = Number(mixed[1]) + Number(mixed[2]) / denominator;
  } else if (fraction) {
    const denominator = Number(fraction[2]);
    if (!denominator) return null;
    inches = Number(fraction[1]) / denominator;
  } else {
    inches = Number(text);
  }
  if (!Number.isFinite(inches) || inches <= 0) return null;
  const result = Math.round(inches * 16);
  return result <= MAX_DIMENSION_SIXTEENTHS ? result : null;
}

export function formatSixteenths(value, { unit = true } = {}) {
  const sixteenths = dimensionInSixteenths(value);
  if (!sixteenths) return "";
  const whole = Math.floor(sixteenths / 16);
  const remainder = sixteenths % 16;
  let fraction = "";
  if (remainder) {
    const divisor = remainder % 8 === 0 ? 8 : remainder % 4 === 0 ? 4 : remainder % 2 === 0 ? 2 : 1;
    fraction = `${remainder / divisor}/${16 / divisor}`;
  }
  const result = [whole || "", fraction].filter((part) => part !== "").join(" ") || "0";
  return unit ? `${result}\"` : result;
}

export function measurementCompletenessErrors(value) {
  const data = normalizeMeasurementData(value);
  const errors = [];
  data.windows.forEach((windowValue, windowIndex) => {
    windowValue.panes.forEach((pane, paneIndex) => {
      const label = `Fenêtre ${windowIndex + 1}, thermos ${paneIndex + 1}`;
      if (!pane.widthSixteenths) errors.push(`${label}: largeur manquante ou invalide (maximum 240 po)`);
      if (!pane.heightSixteenths) errors.push(`${label}: hauteur manquante ou invalide (maximum 240 po)`);
      if (!pane.thicknessSixteenths) errors.push(`${label}: épaisseur manquante ou invalide (1/4 à 2 po)`);
    });
  });
  return errors;
}

export function clientMeasurementCompletenessErrors(value) {
  const data = normalizeMeasurementData(value);
  const errors = [];
  data.windows.forEach((windowValue, windowIndex) => {
    windowValue.panes.forEach((pane, paneIndex) => {
      const label = `Fenêtre ${windowIndex + 1}, thermos ${paneIndex + 1}`;
      if (!pane.widthSixteenths) errors.push(`${label}: largeur manquante ou invalide (maximum 240 po)`);
      if (!pane.heightSixteenths) errors.push(`${label}: hauteur manquante ou invalide (maximum 240 po)`);
    });
  });
  return errors;
}

export function flattenThermos(value, clientId, clientName = "") {
  const data = normalizeMeasurementData(value);
  return data.windows.flatMap((windowValue, windowIndex) => windowValue.panes.map((pane, paneIndex) => ({
    ...pane,
    windowId: windowValue.id,
    windowNumber: windowIndex + 1,
    thermosNumber: paneIndex + 1,
    windowLabel: windowValue.label,
    location: windowValue.location,
    photoUrl: windowValue.photoUrl,
    label: buildThermosHumanLabel(clientName, windowIndex + 1, paneIndex + 1),
    internalCode: buildThermosInternalCode(clientId, windowIndex + 1, paneIndex + 1),
  })));
}

export function buildThermosHumanLabel(clientName, windowNumber, thermosNumber) {
  const name = cleanText(clientName, 160) || "Client";
  return `${name} — Fenêtre ${Number(windowNumber) || 1} — Thermos ${Number(thermosNumber) || 1}`;
}

export function buildThermosInternalCode(clientId, windowNumber, thermosNumber) {
  const clientPart = String(Math.max(0, Number.parseInt(clientId, 10) || 0)).padStart(5, "0");
  const windowPart = String(Math.max(1, Number.parseInt(windowNumber, 10) || 1)).padStart(2, "0");
  const thermosPart = String(Math.max(1, Number.parseInt(thermosNumber, 10) || 1)).padStart(2, "0");
  return `VT-${clientPart}-F${windowPart}-T${thermosPart}`;
}

export { GEOMETRY_SCALE };
