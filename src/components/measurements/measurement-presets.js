export const MEASUREMENT_GEOMETRY_SCALE = 10_000;

export const MEASUREMENT_PRESET_ORDER = [
  "1x1",
  "2x1-narrow-left",
  "2x1",
  "1x2",
  "3x1",
  "2x2",
  "3x2",
  "3x3",
  "top-3-bottom-1",
  "top-1-bottom-3",
  "left-1-right-3",
  "left-3-right-1",
];

function equalSegments(count, scale = MEASUREMENT_GEOMETRY_SCALE) {
  const base = Math.floor(scale / count);
  let remainder = scale - base * count;
  let offset = 0;

  return Array.from({ length: count }, () => {
    const size = base + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    const segment = { offset, size };
    offset += size;
    return segment;
  });
}

function gridGeometry(columns, rows, bounds = {}) {
  const x = bounds.x ?? 0;
  const y = bounds.y ?? 0;
  const width = bounds.width ?? MEASUREMENT_GEOMETRY_SCALE;
  const height = bounds.height ?? MEASUREMENT_GEOMETRY_SCALE;
  const columnSegments = equalSegments(columns, width);
  const rowSegments = equalSegments(rows, height);

  return rowSegments.flatMap((row) => columnSegments.map((column) => ({
    x: x + column.offset,
    y: y + row.offset,
    width: column.size,
    height: row.size,
  })));
}

function previewFor(geometry) {
  return {
    viewBox: `0 0 ${MEASUREMENT_GEOMETRY_SCALE} ${MEASUREMENT_GEOMETRY_SCALE}`,
    panes: geometry.map((pane) => ({ ...pane })),
  };
}

function preset(key, geometry, labels) {
  return {
    key,
    paneCount: geometry.length,
    label: { fr: labels.fr.label, en: labels.en.label },
    detail: { fr: labels.fr.detail, en: labels.en.detail },
    ariaLabel: { fr: labels.fr.ariaLabel, en: labels.en.ariaLabel },
    panes: geometry,
    miniPreview: previewFor(geometry),
  };
}

const single = gridGeometry(1, 1);
const narrowLeft = [
  { x: 0, y: 0, width: 3_400, height: 10_000 },
  { x: 3_400, y: 0, width: 6_600, height: 10_000 },
];
const twoEqual = gridGeometry(2, 1);
const twoStacked = gridGeometry(1, 2);
const threeSideBySide = gridGeometry(3, 1);
const fourEqual = gridGeometry(2, 2);
const sixEqual = gridGeometry(3, 2);
const nineEqual = gridGeometry(3, 3);
const threeOnTop = [
  ...gridGeometry(3, 1, { x: 0, y: 0, width: 10_000, height: 3_400 }),
  { x: 0, y: 3_400, width: 10_000, height: 6_600 },
];
const threeOnBottom = [
  { x: 0, y: 0, width: 10_000, height: 6_600 },
  ...gridGeometry(3, 1, { x: 0, y: 6_600, width: 10_000, height: 3_400 }),
];
const largeOnLeft = [
  { x: 0, y: 0, width: 6_000, height: 10_000 },
  ...gridGeometry(1, 3, { x: 6_000, y: 0, width: 4_000, height: 10_000 }),
];
const largeOnRight = [
  ...gridGeometry(1, 3, { x: 0, y: 0, width: 4_000, height: 10_000 }),
  { x: 4_000, y: 0, width: 6_000, height: 10_000 },
];

export const MEASUREMENT_PRESETS = [
  preset("1x1", single, {
    fr: { label: "Vitre simple", detail: "1 thermos", ariaLabel: "Créer une fenêtre avec un seul thermos" },
    en: { label: "Single pane", detail: "1 glass unit", ariaLabel: "Create a window with one glass unit" },
  }),
  preset("2x1-narrow-left", narrowLeft, {
    fr: { label: "Petite à gauche", detail: "2 thermos", ariaLabel: "Créer une petite vitre à gauche et une grande vitre à droite" },
    en: { label: "Small on left", detail: "2 glass units", ariaLabel: "Create a small pane on the left and a large pane on the right" },
  }),
  preset("2x1", twoEqual, {
    fr: { label: "Deux égaux", detail: "2 thermos", ariaLabel: "Créer deux thermos égaux côte à côte" },
    en: { label: "Two equal", detail: "2 glass units", ariaLabel: "Create two equal glass units side by side" },
  }),
  preset("1x2", twoStacked, {
    fr: { label: "Deux superposés", detail: "2 thermos", ariaLabel: "Créer deux thermos égaux superposés" },
    en: { label: "Two stacked", detail: "2 glass units", ariaLabel: "Create two equal stacked glass units" },
  }),
  preset("3x1", threeSideBySide, {
    fr: { label: "Trois côte à côte", detail: "3 thermos", ariaLabel: "Créer trois thermos égaux côte à côte" },
    en: { label: "Three side by side", detail: "3 glass units", ariaLabel: "Create three equal glass units side by side" },
  }),
  preset("2x2", fourEqual, {
    fr: { label: "Quatre égaux", detail: "4 thermos", ariaLabel: "Créer quatre thermos égaux" },
    en: { label: "Four equal", detail: "4 glass units", ariaLabel: "Create four equal glass units" },
  }),
  preset("3x2", sixEqual, {
    fr: { label: "Six égaux", detail: "6 thermos", ariaLabel: "Créer six thermos égaux en deux rangées" },
    en: { label: "Six equal", detail: "6 glass units", ariaLabel: "Create six equal glass units in two rows" },
  }),
  preset("3x3", nineEqual, {
    fr: { label: "Neuf égaux", detail: "9 thermos", ariaLabel: "Créer neuf thermos égaux en trois rangées" },
    en: { label: "Nine equal", detail: "9 glass units", ariaLabel: "Create nine equal glass units in three rows" },
  }),
  preset("top-3-bottom-1", threeOnTop, {
    fr: { label: "Trois en haut", detail: "4 thermos", ariaLabel: "Créer trois petits thermos en haut et un grand thermos en bas" },
    en: { label: "Three on top", detail: "4 glass units", ariaLabel: "Create three small glass units on top and one large glass unit below" },
  }),
  preset("top-1-bottom-3", threeOnBottom, {
    fr: { label: "Trois en bas", detail: "4 thermos", ariaLabel: "Créer un grand thermos en haut et trois petits thermos en bas" },
    en: { label: "Three on bottom", detail: "4 glass units", ariaLabel: "Create one large glass unit on top and three small glass units below" },
  }),
  preset("left-1-right-3", largeOnLeft, {
    fr: { label: "Grand à gauche", detail: "4 thermos", ariaLabel: "Créer un grand thermos à gauche et trois petits thermos à droite" },
    en: { label: "Large on left", detail: "4 glass units", ariaLabel: "Create one large glass unit on the left and three small glass units on the right" },
  }),
  preset("left-3-right-1", largeOnRight, {
    fr: { label: "Grand à droite", detail: "4 thermos", ariaLabel: "Créer trois petits thermos à gauche et un grand thermos à droite" },
    en: { label: "Large on right", detail: "4 glass units", ariaLabel: "Create three small glass units on the left and one large glass unit on the right" },
  }),
];

export const MEASUREMENT_PRESET_BY_KEY = Object.fromEntries(
  MEASUREMENT_PRESETS.map((value) => [value.key, value]),
);

export function getMeasurementPreset(key) {
  return MEASUREMENT_PRESET_BY_KEY[key] || null;
}

export function getMeasurementPresetList(locale = "fr") {
  const language = String(locale).toLowerCase().startsWith("en") ? "en" : "fr";
  return MEASUREMENT_PRESETS.map((value) => {
    return {
      ...value,
      label: value.label[language],
      detail: value.detail[language],
      ariaLabel: value.ariaLabel[language],
    };
  });
}

// The editor owns IDs, measurements, options and decorative grilles. A preset
// deliberately returns geometry only so applying one cannot accidentally carry
// data from a different window or thermos.
export function getPresetPanes(key) {
  const value = getMeasurementPreset(key);
  return value ? value.panes.map(({ x, y, width, height }) => ({ x, y, width, height })) : [];
}

export const createPresetPanes = getPresetPanes;

export default MEASUREMENT_PRESETS;
