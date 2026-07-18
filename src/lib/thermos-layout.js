const MAX_WINDOWS = 50;
const MAX_PANES_PER_WINDOW = 100;
const GEOMETRY_SCALE = 10000;
const MAX_DIMENSION_SIXTEENTHS = 240 * 16;
const MIN_THICKNESS_SIXTEENTHS = 4; // 1/4 po
const MAX_THICKNESS_SIXTEENTHS = 2 * 16;
const MIN_DIVIDER_PANE_SIZE = 100;
const DIVIDER_ADJACENCY_TOLERANCE = 800;
const DIVIDER_GROUP_POSITION_TOLERANCE = 150;
const DIVIDER_SEGMENT_TOLERANCE = 12;
const GEOMETRY_EDGE_TOLERANCE = 20;
const GEOMETRY_COVERAGE_TOLERANCE = 0.005;
const FINAL_GLASS_TYPES = new Set(["simple", "double", "triple"]);
const FINAL_ACCESS_TYPES = new Set(["with_ladder", "without_ladder", "easy", "medium", "hard"]);

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
  const glassType = ["unknown", "simple", "double", "triple"].includes(options.glassType) ? options.glassType : "";
  const access = ["unknown", "with_ladder", "without_ladder", "easy", "medium", "hard"].includes(options.access) ? options.access : "";
  return {
    glassType,
    lowE: Boolean(options.lowE),
    argon: Boolean(options.argon),
    tempered: Boolean(options.tempered),
    laminated: Boolean(options.laminated),
    spacerColor: cleanText(options.spacerColor || "", 40),
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
    layoutPreset: cleanText(windowValue.layoutPreset, 60),
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
    locale: ["fr", "en"].includes(data.locale) ? data.locale : "fr",
    displayUnit: ["in", "mm", "cm"].includes(data.displayUnit) ? data.displayUnit : "in",
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

function rectangleUnionArea(rectangles) {
  const xCoordinates = Array.from(new Set(rectangles.flatMap((rectangle) => [rectangle.left, rectangle.right])))
    .sort((a, b) => a - b);
  let area = 0;

  for (let index = 0; index < xCoordinates.length - 1; index += 1) {
    const left = xCoordinates[index];
    const right = xCoordinates[index + 1];
    if (!(right > left)) continue;
    const intervals = rectangles
      .filter((rectangle) => rectangle.left < right && rectangle.right > left)
      .map((rectangle) => [rectangle.top, rectangle.bottom])
      .sort((first, second) => first[0] - second[0] || first[1] - second[1]);
    if (!intervals.length) continue;

    let coveredHeight = 0;
    let [start, end] = intervals[0];
    for (const [nextStart, nextEnd] of intervals.slice(1)) {
      if (nextStart <= end) {
        end = Math.max(end, nextEnd);
      } else {
        coveredHeight += end - start;
        start = nextStart;
        end = nextEnd;
      }
    }
    coveredHeight += end - start;
    area += (right - left) * coveredHeight;
  }

  return area;
}

export function validatePaneGeometry(value, options = {}) {
  const panes = Array.isArray(value) ? value : [];
  const edgeTolerance = Math.min(100, Math.max(0, finiteNumber(options.edgeTolerance, GEOMETRY_EDGE_TOLERANCE)));
  const coverageTolerance = Math.min(0.05, Math.max(0, finiteNumber(options.coverageTolerance, GEOMETRY_COVERAGE_TOLERANCE)));
  const errors = [];
  const rectangles = [];

  if (!panes.length) {
    return { valid: false, errors: ["Aucun thermos ne couvre le cadre"] };
  }

  panes.forEach((pane, index) => {
    const x = Number(pane?.x);
    const y = Number(pane?.y);
    const width = Number(pane?.width);
    const height = Number(pane?.height);
    const label = `Thermos ${index + 1}`;
    if (![x, y, width, height].every(Number.isFinite)) {
      errors.push(`${label}: coordonnées invalides`);
      return;
    }
    if (!(width > 0) || !(height > 0)) {
      errors.push(`${label}: surface nulle ou négative`);
      return;
    }
    const right = x + width;
    const bottom = y + height;
    if (
      x < -edgeTolerance
      || y < -edgeTolerance
      || right > GEOMETRY_SCALE + edgeTolerance
      || bottom > GEOMETRY_SCALE + edgeTolerance
    ) {
      errors.push(`${label}: dépasse les limites du cadre`);
    }
    rectangles.push({
      index,
      left: Math.max(0, Math.min(GEOMETRY_SCALE, x)),
      top: Math.max(0, Math.min(GEOMETRY_SCALE, y)),
      right: Math.max(0, Math.min(GEOMETRY_SCALE, right)),
      bottom: Math.max(0, Math.min(GEOMETRY_SCALE, bottom)),
      raw: { x, y, right, bottom },
    });
  });

  for (let firstIndex = 0; firstIndex < rectangles.length; firstIndex += 1) {
    const first = rectangles[firstIndex];
    for (let secondIndex = firstIndex + 1; secondIndex < rectangles.length; secondIndex += 1) {
      const second = rectangles[secondIndex];
      const overlapWidth = Math.min(first.raw.right, second.raw.right) - Math.max(first.raw.x, second.raw.x);
      const overlapHeight = Math.min(first.raw.bottom, second.raw.bottom) - Math.max(first.raw.y, second.raw.y);
      if (overlapWidth > edgeTolerance && overlapHeight > edgeTolerance) {
        errors.push(`Thermos ${first.index + 1} et ${second.index + 1}: chevauchement détecté`);
      }
    }
  }

  const usableRectangles = rectangles.filter((rectangle) => rectangle.right > rectangle.left && rectangle.bottom > rectangle.top);
  const frameArea = GEOMETRY_SCALE * GEOMETRY_SCALE;
  const uncoveredArea = frameArea - rectangleUnionArea(usableRectangles);
  if (uncoveredArea > frameArea * coverageTolerance) {
    errors.push("Le dessin ne couvre pas complètement le cadre");
  }

  return { valid: errors.length === 0, errors };
}

export function measurementGeometryErrors(value) {
  const data = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const windows = Array.isArray(data.windows) ? data.windows : [];
  if (!windows.length) return ["Aucune fenêtre à valider"];
  return windows.flatMap((windowValue, windowIndex) => {
    const validation = validatePaneGeometry(windowValue?.panes);
    return validation.errors.map((error) => `Fenêtre ${windowIndex + 1}: ${error}`);
  });
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

function mergeDividerSegments(segments) {
  const sorted = [...segments]
    .filter((segment) => segment && segment.end > segment.start)
    .sort((a, b) => a.start - b.start || a.end - b.end);
  const merged = [];
  for (const segment of sorted) {
    const previous = merged[merged.length - 1];
    if (previous && segment.start <= previous.end + DIVIDER_SEGMENT_TOLERANCE) {
      previous.end = Math.max(previous.end, segment.end);
    } else {
      merged.push({ start: segment.start, end: segment.end });
    }
  }
  return merged;
}

export function getStructuralDividers(value) {
  const panes = Array.isArray(value) ? value : Array.isArray(value?.panes) ? value.panes : [];
  const groups = [];

  function addDivider(axis, position, start, end, beforePaneId, afterPaneId) {
    if (!(end > start)) return;
    const matchingGroups = groups.filter((candidate) => (
      candidate.axis === axis
      && Math.abs(candidate.position - position) <= DIVIDER_GROUP_POSITION_TOLERANCE
      && candidate.segments.some((segment) => (
        start <= segment.end + DIVIDER_SEGMENT_TOLERANCE
        && end >= segment.start - DIVIDER_SEGMENT_TOLERANCE
      ))
    ));
    let group = matchingGroups[0];
    if (!group) {
      group = {
        axis,
        position: Math.round(position),
        positions: [],
        beforePaneIds: new Set(),
        afterPaneIds: new Set(),
        segments: [],
      };
      groups.push(group);
    } else {
      for (const matchingGroup of matchingGroups.slice(1)) {
        group.positions.push(...matchingGroup.positions);
        matchingGroup.beforePaneIds.forEach((paneId) => group.beforePaneIds.add(paneId));
        matchingGroup.afterPaneIds.forEach((paneId) => group.afterPaneIds.add(paneId));
        group.segments.push(...matchingGroup.segments);
        groups.splice(groups.indexOf(matchingGroup), 1);
      }
    }
    group.positions.push(position);
    group.position = Math.round(group.positions.reduce((sum, entry) => sum + entry, 0) / group.positions.length);
    group.beforePaneIds.add(beforePaneId);
    group.afterPaneIds.add(afterPaneId);
    group.segments.push({ start, end });
  }

  function hasInterveningPane(firstIndex, secondIndex, axis, firstEdge, secondEdge, start, end) {
    const minimumEdge = Math.min(firstEdge, secondEdge);
    const maximumEdge = Math.max(firstEdge, secondEdge);
    if (!(end > start) || maximumEdge - minimumEdge <= DIVIDER_SEGMENT_TOLERANCE) return false;
    return panes.some((pane, paneIndex) => {
      if (paneIndex === firstIndex || paneIndex === secondIndex) return false;
      const paneAxisStart = axis === "vertical" ? finiteNumber(pane.x) : finiteNumber(pane.y);
      const paneAxisEnd = paneAxisStart + (axis === "vertical" ? finiteNumber(pane.width) : finiteNumber(pane.height));
      const paneSegmentStart = axis === "vertical" ? finiteNumber(pane.y) : finiteNumber(pane.x);
      const paneSegmentEnd = paneSegmentStart + (axis === "vertical" ? finiteNumber(pane.height) : finiteNumber(pane.width));
      const overlapsDividerSegment = Math.min(end, paneSegmentEnd) - Math.max(start, paneSegmentStart) > DIVIDER_SEGMENT_TOLERANCE;
      const occupiesEdgeGap = paneAxisStart < maximumEdge - DIVIDER_SEGMENT_TOLERANCE
        && paneAxisEnd > minimumEdge + DIVIDER_SEGMENT_TOLERANCE;
      return overlapsDividerSegment && occupiesEdgeGap;
    });
  }

  for (let firstIndex = 0; firstIndex < panes.length; firstIndex += 1) {
    const first = panes[firstIndex];
    for (let secondIndex = firstIndex + 1; secondIndex < panes.length; secondIndex += 1) {
      const second = panes[secondIndex];
      const firstRight = finiteNumber(first.x) + finiteNumber(first.width);
      const secondRight = finiteNumber(second.x) + finiteNumber(second.width);
      const firstBottom = finiteNumber(first.y) + finiteNumber(first.height);
      const secondBottom = finiteNumber(second.y) + finiteNumber(second.height);
      const verticalStart = Math.max(finiteNumber(first.y), finiteNumber(second.y));
      const verticalEnd = Math.min(firstBottom, secondBottom);
      const horizontalStart = Math.max(finiteNumber(first.x), finiteNumber(second.x));
      const horizontalEnd = Math.min(firstRight, secondRight);

      if (
        Math.abs(firstRight - finiteNumber(second.x)) <= DIVIDER_ADJACENCY_TOLERANCE
        && !hasInterveningPane(firstIndex, secondIndex, "vertical", firstRight, finiteNumber(second.x), verticalStart, verticalEnd)
      ) {
        addDivider("vertical", (firstRight + finiteNumber(second.x)) / 2, verticalStart, verticalEnd, first.id, second.id);
      } else if (
        Math.abs(secondRight - finiteNumber(first.x)) <= DIVIDER_ADJACENCY_TOLERANCE
        && !hasInterveningPane(firstIndex, secondIndex, "vertical", secondRight, finiteNumber(first.x), verticalStart, verticalEnd)
      ) {
        addDivider("vertical", (secondRight + finiteNumber(first.x)) / 2, verticalStart, verticalEnd, second.id, first.id);
      }

      if (
        Math.abs(firstBottom - finiteNumber(second.y)) <= DIVIDER_ADJACENCY_TOLERANCE
        && !hasInterveningPane(firstIndex, secondIndex, "horizontal", firstBottom, finiteNumber(second.y), horizontalStart, horizontalEnd)
      ) {
        addDivider("horizontal", (firstBottom + finiteNumber(second.y)) / 2, horizontalStart, horizontalEnd, first.id, second.id);
      } else if (
        Math.abs(secondBottom - finiteNumber(first.y)) <= DIVIDER_ADJACENCY_TOLERANCE
        && !hasInterveningPane(firstIndex, secondIndex, "horizontal", secondBottom, finiteNumber(first.y), horizontalStart, horizontalEnd)
      ) {
        addDivider("horizontal", (secondBottom + finiteNumber(first.y)) / 2, horizontalStart, horizontalEnd, second.id, first.id);
      }
    }
  }

  return groups.map((group) => {
    const beforePaneIds = [...group.beforePaneIds].sort();
    const afterPaneIds = [...group.afterPaneIds].sort();
    const beforePanes = panes.filter((pane) => group.beforePaneIds.has(pane.id));
    const afterPanes = panes.filter((pane) => group.afterPaneIds.has(pane.id));
    const minimumPosition = Math.max(...beforePanes.map((pane) => (
      group.axis === "vertical"
        ? finiteNumber(pane.x) + MIN_DIVIDER_PANE_SIZE
        : finiteNumber(pane.y) + MIN_DIVIDER_PANE_SIZE
    )));
    const maximumPosition = Math.min(...afterPanes.map((pane) => (
      group.axis === "vertical"
        ? finiteNumber(pane.x) + finiteNumber(pane.width) - MIN_DIVIDER_PANE_SIZE
        : finiteNumber(pane.y) + finiteNumber(pane.height) - MIN_DIVIDER_PANE_SIZE
    )));
    return {
      id: `${group.axis}:${beforePaneIds.join(",")}|${afterPaneIds.join(",")}`,
      axis: group.axis,
      position: group.position,
      minimumPosition,
      maximumPosition,
      beforePaneIds,
      afterPaneIds,
      segments: mergeDividerSegments(group.segments),
    };
  }).filter((divider) => divider.minimumPosition <= divider.maximumPosition);
}

export function moveStructuralDivider(value, divider, nextPosition) {
  const panes = Array.isArray(value) ? value : [];
  if (!divider || !["vertical", "horizontal"].includes(divider.axis)) return panes;
  const beforePaneIds = new Set(Array.isArray(divider.beforePaneIds) ? divider.beforePaneIds : []);
  const afterPaneIds = new Set(Array.isArray(divider.afterPaneIds) ? divider.afterPaneIds : []);
  if (!beforePaneIds.size || !afterPaneIds.size) return panes;

  const beforePanes = panes.filter((pane) => beforePaneIds.has(pane.id));
  const afterPanes = panes.filter((pane) => afterPaneIds.has(pane.id));
  if (!beforePanes.length || !afterPanes.length) return panes;
  const minimumPosition = Math.max(...beforePanes.map((pane) => (
    divider.axis === "vertical"
      ? finiteNumber(pane.x) + MIN_DIVIDER_PANE_SIZE
      : finiteNumber(pane.y) + MIN_DIVIDER_PANE_SIZE
  )));
  const maximumPosition = Math.min(...afterPanes.map((pane) => (
    divider.axis === "vertical"
      ? finiteNumber(pane.x) + finiteNumber(pane.width) - MIN_DIVIDER_PANE_SIZE
      : finiteNumber(pane.y) + finiteNumber(pane.height) - MIN_DIVIDER_PANE_SIZE
  )));
  if (minimumPosition > maximumPosition) return panes;
  const target = integerInRange(nextPosition, minimumPosition, maximumPosition, divider.position);

  return panes.map((pane) => {
    if (beforePaneIds.has(pane.id)) {
      return divider.axis === "vertical"
        ? { ...pane, width: target - finiteNumber(pane.x) }
        : { ...pane, height: target - finiteNumber(pane.y) };
    }
    if (afterPaneIds.has(pane.id)) {
      if (divider.axis === "vertical") {
        const right = finiteNumber(pane.x) + finiteNumber(pane.width);
        return { ...pane, x: target, width: right - target };
      }
      const bottom = finiteNumber(pane.y) + finiteNumber(pane.height);
      return { ...pane, y: target, height: bottom - target };
    }
    return pane;
  });
}

export function resetWindowDivisions(value, windowId) {
  const data = normalizeMeasurementData(value);
  return normalizeMeasurementData({
    ...data,
    windows: data.windows.map((windowValue) => (
      windowValue.id === windowId
        ? { ...windowValue, layoutPreset: "", panes: [createEmptyPane()] }
        : windowValue
    )),
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

export function splitPaneEvenly(value, windowId, paneId, direction = "vertical", sectionCount = 2) {
  const data = normalizeMeasurementData(value);
  const count = integerInRange(sectionCount, 2, 12, 2);
  return normalizeMeasurementData({
    ...data,
    windows: data.windows.map((windowValue) => {
      if (windowValue.id !== windowId) return windowValue;
      const paneIndex = windowValue.panes.findIndex((pane) => pane.id === paneId);
      if (paneIndex < 0 || windowValue.panes.length - 1 + count > MAX_PANES_PER_WINDOW) return windowValue;
      const pane = windowValue.panes[paneIndex];
      const axis = direction === "horizontal" ? "horizontal" : "vertical";
      const span = axis === "horizontal" ? pane.height : pane.width;
      if (span < count * MIN_DIVIDER_PANE_SIZE) return windowValue;

      const baseSize = Math.floor(span / count);
      const remainder = span % count;
      let cursor = axis === "horizontal" ? pane.y : pane.x;
      const pieces = Array.from({ length: count }, (_, index) => {
        const size = baseSize + (index < remainder ? 1 : 0);
        const piece = {
          ...pane,
          id: makeId("thermos"),
          widthSixteenths: null,
          heightSixteenths: null,
          thicknessSixteenths: null,
          options: normalizeOptions({}),
          grille: normalizeGrille({}),
          ...(axis === "horizontal"
            ? { y: cursor, height: size }
            : { x: cursor, width: size }),
        };
        cursor += size;
        return piece;
      });
      const panes = [...windowValue.panes];
      panes.splice(paneIndex, 1, ...pieces);
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
  const errors = measurementGeometryErrors(value);
  data.windows.forEach((windowValue, windowIndex) => {
    windowValue.panes.forEach((pane, paneIndex) => {
      const label = `Fenêtre ${windowIndex + 1}, thermos ${paneIndex + 1}`;
      if (!pane.widthSixteenths) errors.push(`${label}: largeur manquante ou invalide (maximum 240 po)`);
      if (!pane.heightSixteenths) errors.push(`${label}: hauteur manquante ou invalide (maximum 240 po)`);
      if (!pane.thicknessSixteenths) errors.push(`${label}: épaisseur manquante ou invalide (1/4 à 2 po)`);
      if (!FINAL_GLASS_TYPES.has(pane.options?.glassType)) errors.push(`${label}: type de vitrage requis`);
      const spacerColor = cleanText(pane.options?.spacerColor, 40).toLowerCase();
      if (!spacerColor || spacerColor === "unknown") errors.push(`${label}: intercalaire requis`);
      if (!FINAL_ACCESS_TYPES.has(pane.options?.access)) errors.push(`${label}: accès requis`);
    });
  });
  return errors;
}

export function clientMeasurementCompletenessErrors(value) {
  const data = normalizeMeasurementData(value);
  const errors = measurementGeometryErrors(value);
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
