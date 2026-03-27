// Icon mapping for categories and subcategories
// Uses Font Awesome 6 classes

const CATEGORY_ICONS = {
  // Main categories
  'fenetres-battant': 'fas fa-window-maximize',
  'fenetres-guillotine': 'fas fa-arrows-alt-v',
  'fenetres-auvent': 'fas fa-window-restore',
  'fenetres-coulissantes': 'fas fa-arrows-alt-h',
  'portes-patio': 'fas fa-door-open',
  'moustiquaires': 'fas fa-border-all',
  'coupe-froids': 'fas fa-snowflake',
  'portes-residentielles': 'fas fa-home',
  'douches': 'fas fa-shower',
  'garde-robes': 'fas fa-door-closed',
  'portes-commerciales': 'fas fa-building',
  'contre-portes': 'fas fa-columns',
  'autres': 'fas fa-th-large',

  // Subcategories - Fenêtres à battant
  'battant-operateurs': 'fas fa-cog',
  'battant-poignees': 'fas fa-hand-paper',
  'battant-charnieres': 'fas fa-link',
  'battant-barrures': 'fas fa-lock',
  'battant-autres': 'fas fa-puzzle-piece',

  // Subcategories - Fenêtres à guillotine
  'guillotine-balances': 'fas fa-balance-scale',
  'guillotine-spirales': 'fas fa-redo',
  'guillotine-barrures': 'fas fa-lock',
  'guillotine-sabots': 'fas fa-cube',
  'guillotine-autres': 'fas fa-puzzle-piece',

  // Subcategories - Portes patio
  'patio-roulettes': 'fas fa-circle-notch',
  'patio-barrures': 'fas fa-lock',
  'patio-poignees': 'fas fa-hand-paper',
  'patio-autres': 'fas fa-puzzle-piece',

  // Subcategories - Moustiquaires
  'moustiquaire-fabrication': 'fas fa-tools',
  'moustiquaire-rouleaux': 'fas fa-scroll',
  'moustiquaire-bourrelets': 'fas fa-grip-lines',
  'moustiquaire-autres': 'fas fa-puzzle-piece',

  // Subcategories - Coupe-froids
  'cf-residentielles': 'fas fa-home',
  'cf-commerciales': 'fas fa-building',
  'cf-fenetres': 'fas fa-window-maximize',
  'cf-seuils': 'fas fa-ruler-horizontal',
  'cf-autocollants': 'fas fa-sticky-note',
  'cf-autres': 'fas fa-puzzle-piece',

  // Subcategories - Portes résidentielles
  'residentielle-coupefroids': 'fas fa-snowflake',
  'residentielle-balais': 'fas fa-broom',
  'residentielle-accessoires': 'fas fa-wrench',

  // Subcategories - Portes commerciales
  'commerciale-charnieres': 'fas fa-link',
  'commerciale-fermeportes': 'fas fa-compress-arrows-alt',
  'commerciale-barrures': 'fas fa-lock',
  'commerciale-coupefroids': 'fas fa-snowflake',
  'commerciale-accessoires': 'fas fa-wrench',
};

export function getCategoryIcon(slug) {
  return CATEGORY_ICONS[slug] || 'fas fa-box';
}
