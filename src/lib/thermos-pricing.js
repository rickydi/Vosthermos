export const THERMOS_PRICING_KEYS = [
  "thermos_price_per_sqft",
  "thermos_minimum_unit_price",
  "thermos_install_per_unit",
  "thermos_low_e_per_sqft",
  "thermos_argon_per_sqft",
  "thermos_tempered_per_sqft",
  "thermos_triple_percent",
  "thermos_simple_discount_percent",
  "thermos_laminated_percent",
  "thermos_grill_per_unit",
  "thermos_spacer_option_per_unit",
  "thermos_nonstandard_thickness_per_unit",
  "thermos_access_medium_per_unit",
  "thermos_access_hard_per_unit",
  "thermos_trip_fee",
  "thermos_margin_percent",
  "thermos_quote_buffer_percent",
  "tps_rate",
  "tvq_rate",
];

export const THERMOS_PRICING_DEFAULTS = {
  thermos_price_per_sqft: "32.00",
  thermos_minimum_unit_price: "175.00",
  thermos_install_per_unit: "85.00",
  thermos_low_e_per_sqft: "6.00",
  thermos_argon_per_sqft: "3.00",
  thermos_tempered_per_sqft: "40.00",
  thermos_triple_percent: "0.00",
  thermos_simple_discount_percent: "0.00",
  thermos_laminated_percent: "0.00",
  thermos_grill_per_unit: "75.00",
  thermos_spacer_option_per_unit: "0.00",
  thermos_nonstandard_thickness_per_unit: "0.00",
  thermos_access_medium_per_unit: "45.00",
  thermos_access_hard_per_unit: "90.00",
  thermos_trip_fee: "0.00",
  thermos_margin_percent: "0.00",
  thermos_quote_buffer_percent: "12.00",
  tps_rate: "0.05",
  tvq_rate: "0.09975",
};

export const ACCESS_OPTIONS = [
  { value: "easy", label: "Facile", settingKey: null },
  { value: "medium", label: "Moyen", settingKey: "thermos_access_medium_per_unit" },
  { value: "hard", label: "Difficile", settingKey: "thermos_access_hard_per_unit" },
];

export const THERMOS_SPACER_COLORS = ["noir", "gris", "blanc", "inox"];

export function emptyThermosLine() {
  return {
    width: 24,
    height: 36,
    quantity: 1,
    lowE: true,
    argon: true,
    tempered: false,
    laminated: false,
    glassType: "double",
    spacerColor: "noir",
    thicknessSixteenths: 13,
    grill: false,
    access: "easy",
    note: "",
  };
}

function money(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function numberSetting(settings, key) {
  const raw = settings?.[key] ?? THERMOS_PRICING_DEFAULTS[key] ?? 0;
  const value = Number(String(raw).replace(",", "."));
  return Number.isFinite(value) ? value : Number(THERMOS_PRICING_DEFAULTS[key] || 0);
}

export function normalizeThermosPricingSettings(raw = {}) {
  const result = { ...THERMOS_PRICING_DEFAULTS };
  for (const key of THERMOS_PRICING_KEYS) {
    if (raw[key] === undefined || raw[key] === null || raw[key] === "") continue;
    result[key] = String(raw[key]);
  }
  return result;
}

export function emptyThermosQuote(settingsInput = {}) {
  return {
    settings: normalizeThermosPricingSettings(settingsInput),
    lines: [],
    totals: {
      quantity: 0,
      sqft: 0,
      piecesSubtotal: 0,
      tripFee: 0,
      margin: 0,
      subtotal: 0,
      estimateMin: 0,
      estimateMax: 0,
      tps: 0,
      tvq: 0,
      total: 0,
      totalMinWithTaxes: 0,
      totalMaxWithTaxes: 0,
    },
  };
}

export function measurementAccessToPricingAccess(value) {
  const access = String(value || "").trim().toLowerCase();
  if (access === "without_ladder") return "easy";
  if (access === "with_ladder") return "hard";
  return ["easy", "medium", "hard"].includes(access) ? access : "easy";
}

export function measurementPaneToThermosLine(pane = {}, overrides = {}) {
  const options = pane?.options || {};
  const rawSpacerColor = String(options.spacerColor || "").trim().toLowerCase();
  const spacerColor = THERMOS_SPACER_COLORS.includes(rawSpacerColor) ? rawSpacerColor : "";
  return {
    width: Math.max(0, Number(pane?.widthSixteenths) || 0) / 16,
    height: Math.max(0, Number(pane?.heightSixteenths) || 0) / 16,
    quantity: 1,
    lowE: Boolean(options.lowE),
    argon: Boolean(options.argon),
    tempered: Boolean(options.tempered),
    laminated: Boolean(options.laminated),
    glassType: String(options.glassType || "").trim().toLowerCase(),
    spacerColor: spacerColor === "unknown" ? "" : spacerColor,
    thicknessSixteenths: pane?.thicknessSixteenths ?? null,
    grill: Boolean(pane?.grille?.enabled),
    access: measurementAccessToPricingAccess(options.access),
    note: String(options.notes || "").trim(),
    ...overrides,
  };
}

export function calculateThermosQuote(linesInput = [], settingsInput = {}) {
  const settings = normalizeThermosPricingSettings(settingsInput);
  if (!Array.isArray(linesInput) || !linesInput.length) return emptyThermosQuote(settings);
  const lines = linesInput
    .map((line) => ({
      ...emptyThermosLine(),
      ...line,
      width: Math.max(0, Number(line.width) || 0),
      height: Math.max(0, Number(line.height) || 0),
      quantity: Math.max(1, Number(line.quantity) || 1),
    }));

  const pricePerSqft = numberSetting(settings, "thermos_price_per_sqft");
  const minimumUnit = numberSetting(settings, "thermos_minimum_unit_price");
  const installPerUnit = numberSetting(settings, "thermos_install_per_unit");
  const lowEPerSqft = numberSetting(settings, "thermos_low_e_per_sqft");
  const argonPerSqft = numberSetting(settings, "thermos_argon_per_sqft");
  const temperedPerSqft = numberSetting(settings, "thermos_tempered_per_sqft");
  const triplePercent = numberSetting(settings, "thermos_triple_percent");
  const simpleDiscountPercent = numberSetting(settings, "thermos_simple_discount_percent");
  const laminatedPercent = numberSetting(settings, "thermos_laminated_percent");
  const grillPerUnit = numberSetting(settings, "thermos_grill_per_unit");
  const spacerOptionPerUnit = numberSetting(settings, "thermos_spacer_option_per_unit");
  const nonstandardThicknessPerUnit = numberSetting(settings, "thermos_nonstandard_thickness_per_unit");
  const tripFee = numberSetting(settings, "thermos_trip_fee");
  const marginPercent = numberSetting(settings, "thermos_margin_percent");
  const bufferPercent = numberSetting(settings, "thermos_quote_buffer_percent");
  const tpsRate = numberSetting(settings, "tps_rate");
  const tvqRate = numberSetting(settings, "tvq_rate");

  const computedLines = lines.map((line) => {
    const hasDimensions = line.width > 0 && line.height > 0;
    const sqftPerUnit = hasDimensions ? money((line.width * line.height) / 144) : 0;
    const baseGlassUnit = hasDimensions ? money(Math.max(minimumUnit, sqftPerUnit * pricePerSqft)) : 0;
    const lowEUnit = hasDimensions && line.lowE ? money(sqftPerUnit * lowEPerSqft) : 0;
    const argonUnit = hasDimensions && line.argon ? money(sqftPerUnit * argonPerSqft) : 0;
    const tripleUnit = hasDimensions && line.glassType === "triple" ? money(baseGlassUnit * (triplePercent / 100)) : 0;
    const simpleDiscountUnit = hasDimensions && line.glassType === "simple" ? money(baseGlassUnit * (simpleDiscountPercent / 100)) : 0;
    const laminatedUnit = hasDimensions && line.laminated ? money(baseGlassUnit * (laminatedPercent / 100)) : 0;
    const spacerUnit = hasDimensions && line.spacerColor && line.spacerColor !== "noir" ? spacerOptionPerUnit : 0;
    const thicknessUnit = hasDimensions && line.thicknessSixteenths && Number(line.thicknessSixteenths) !== 13 ? nonstandardThicknessPerUnit : 0;
    const adjustedGlassBase = Math.max(0, baseGlassUnit - simpleDiscountUnit + tripleUnit + laminatedUnit);
    const temperedUnit = hasDimensions && line.tempered ? money(sqftPerUnit * temperedPerSqft) : 0;
    const grillUnit = hasDimensions && line.grill ? grillPerUnit : 0;
    const accessOption = ACCESS_OPTIONS.find((option) => option.value === line.access) || ACCESS_OPTIONS[0];
    const accessUnit = hasDimensions && accessOption.settingKey ? numberSetting(settings, accessOption.settingKey) : 0;
    const installUnit = hasDimensions ? installPerUnit : 0;
    const unitSubtotal = money(Math.max(0, adjustedGlassBase + lowEUnit + argonUnit + temperedUnit + grillUnit + spacerUnit + thicknessUnit + installUnit + accessUnit));
    const lineSubtotal = money(unitSubtotal * line.quantity);

    return {
      ...line,
      sqftPerUnit,
      totalSqft: money(sqftPerUnit * line.quantity),
      baseGlassUnit,
      lowEUnit,
      argonUnit,
      tripleUnit,
      simpleDiscountUnit,
      laminatedUnit,
      temperedUnit,
      grillUnit,
      spacerUnit,
      thicknessUnit,
      installUnit,
      accessUnit,
      unitSubtotal,
      lineSubtotal,
    };
  });

  const piecesSubtotal = money(computedLines.reduce((sum, line) => sum + line.lineSubtotal, 0));
  const margin = money((piecesSubtotal + tripFee) * (marginPercent / 100));
  const subtotal = money(piecesSubtotal + tripFee + margin);
  const estimateMin = money(subtotal * (1 - bufferPercent / 100));
  const estimateMax = money(subtotal * (1 + bufferPercent / 100));
  const tps = money(subtotal * tpsRate);
  const tvq = money(subtotal * tvqRate);
  const total = money(subtotal + tps + tvq);
  const totalMinWithTaxes = money(estimateMin * (1 + tpsRate + tvqRate));
  const totalMaxWithTaxes = money(estimateMax * (1 + tpsRate + tvqRate));

  return {
    settings,
    lines: computedLines,
    totals: {
      quantity: computedLines.reduce((sum, line) => sum + line.quantity, 0),
      sqft: money(computedLines.reduce((sum, line) => sum + line.totalSqft, 0)),
      piecesSubtotal,
      tripFee,
      margin,
      subtotal,
      estimateMin,
      estimateMax,
      tps,
      tvq,
      total,
      totalMinWithTaxes,
      totalMaxWithTaxes,
    },
  };
}
