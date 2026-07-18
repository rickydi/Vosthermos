export const THERMOS_SPACER_COLORS = ["noir", "gris", "blanc", "inox"];

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
    spacerColor,
    thicknessSixteenths: pane?.thicknessSixteenths ?? null,
    grill: Boolean(pane?.grille?.enabled),
    access: measurementAccessToPricingAccess(options.access),
    note: String(options.notes || "").trim(),
    ...overrides,
  };
}
