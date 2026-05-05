export const ADMIN_MENU_SETTINGS_KEY = "admin_menu_layout";

export const ADMIN_MENU_ITEMS = {
  suiviClients: { href: "/admin/suivi-clients", label: "Suivi clients", icon: "fa-tasks" },
  bons: { href: "/admin/bons", label: "Bons de travail", icon: "fa-clipboard-list" },
  calculateurThermos: { href: "/admin/calculateur-thermos", label: "Calculateur thermos", icon: "fa-calculator" },
  rendezVous: { href: "/admin/rendez-vous", label: "Rendez-vous", icon: "fa-calendar-check" },
  chat: { href: "/admin/chat", label: "Chat clients", icon: "fa-comments" },
  techniciens: { href: "/admin/techniciens", label: "Techniciens", icon: "fa-hard-hat" },

  clients: { href: "/admin/clients", label: "Base clients", icon: "fa-address-book" },
  vendeur: { href: "/admin/vendeur", label: "Vendeur", icon: "fa-handshake" },
  gestionnaires: { href: "/admin/gestionnaires", label: "Acces gestionnaires", icon: "fa-door-open" },

  commandes: { href: "/admin/commandes", label: "Commandes", icon: "fa-shopping-bag" },
  produits: { href: "/admin/produits", label: "Produits", icon: "fa-boxes" },
  categories: { href: "/admin/categories", label: "Categories", icon: "fa-folder-open" },
  promotions: { href: "/admin/promotions", label: "Promotions", icon: "fa-tag" },

  analytics: { href: "/admin/analytics", label: "Analytics", icon: "fa-chart-line" },
  seo: { href: "/admin/seo", label: "SEO", icon: "fa-search" },
  blogue: { href: "/admin/blogue", label: "Blogue", icon: "fa-pen-nib" },
  services: { href: "/admin/services", label: "Services", icon: "fa-tools" },

  activite: { href: "/admin/activite", label: "Activite admin", icon: "fa-history" },
  parametres: { href: "/admin/parametres", label: "Parametres", icon: "fa-cog" },
  utilisateurs: { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "fa-users" },
  menu: { href: "/admin/menu", label: "Menu admin", icon: "fa-bars" },
};

export const ADMIN_MENU_SECTIONS = [
  {
    key: "production",
    label: "Production",
    icon: "fa-clipboard-check",
    dotClass: "bg-emerald-400",
    accentClass: "text-emerald-400",
    summary: "Suivis, bons, rendez-vous",
  },
  {
    key: "boutique",
    label: "Boutique",
    icon: "fa-shopping-bag",
    dotClass: "bg-violet-400",
    accentClass: "text-violet-400",
    summary: "Commandes et catalogue",
  },
  {
    key: "site",
    label: "Site web",
    icon: "fa-globe",
    dotClass: "bg-cyan-400",
    accentClass: "text-cyan-400",
    summary: "SEO, contenu, statistiques",
  },
  {
    key: "systeme",
    label: "Systeme",
    icon: "fa-shield-alt",
    dotClass: "bg-amber-400",
    accentClass: "text-amber-400",
    summary: "Reglages et utilisateurs",
  },
];

export const DEFAULT_ADMIN_MENU_LAYOUT = {
  production: ["suiviClients", "bons", "calculateurThermos", "rendezVous", "chat", "techniciens"],
  boutique: ["commandes", "produits", "categories", "promotions"],
  site: ["analytics", "seo", "blogue", "services", "vendeur"],
  systeme: ["clients", "gestionnaires", "activite", "parametres", "utilisateurs", "menu"],
};

const LEGACY_DEFAULT_ADMIN_MENU_LAYOUTS = [
  {
    production: ["suiviClients", "bons", "rendezVous", "chat", "techniciens", "clients", "vendeur", "gestionnaires"],
    boutique: ["commandes", "produits", "categories", "promotions"],
    site: ["analytics", "seo", "blogue", "services"],
    systeme: ["activite", "parametres", "utilisateurs", "menu"],
  },
];

export const DEFAULT_ADMIN_MENU_LABELS = Object.fromEntries(
  ADMIN_MENU_SECTIONS.map((section) => [section.key, section.label])
);

function sameMenuItems(a, b) {
  return ADMIN_MENU_SECTIONS.every((section) => {
    const left = Array.isArray(a?.[section.key]) ? a[section.key] : [];
    const right = Array.isArray(b?.[section.key]) ? b[section.key] : [];
    return left.length === right.length && left.every((itemKey, index) => itemKey === right[index]);
  });
}

function migrateAdminMenuLayout(saved) {
  if (!saved) return saved;
  if (LEGACY_DEFAULT_ADMIN_MENU_LAYOUTS.some((legacy) => sameMenuItems(saved, legacy))) {
    return { ...saved, ...DEFAULT_ADMIN_MENU_LAYOUT };
  }
  return saved;
}

export function normalizeAdminMenuLayout(saved) {
  const migrated = migrateAdminMenuLayout(saved);
  const result = {};
  const assigned = new Set();

  for (const section of ADMIN_MENU_SECTIONS) {
    const savedItems = Array.isArray(migrated?.[section.key]) ? migrated[section.key] : DEFAULT_ADMIN_MENU_LAYOUT[section.key];
    result[section.key] = [];
    for (const itemKey of savedItems || []) {
      if (!ADMIN_MENU_ITEMS[itemKey] || assigned.has(itemKey)) continue;
      result[section.key].push(itemKey);
      assigned.add(itemKey);
    }
  }

  for (const itemKey of Object.keys(ADMIN_MENU_ITEMS)) {
    if (assigned.has(itemKey)) continue;
    const defaultSection = ADMIN_MENU_SECTIONS.find((section) =>
      DEFAULT_ADMIN_MENU_LAYOUT[section.key]?.includes(itemKey)
    );
    result[defaultSection?.key || "systeme"].push(itemKey);
  }

  result.labels = { ...DEFAULT_ADMIN_MENU_LABELS, ...(migrated?.labels || {}) };
  result.itemLabels = migrated?.itemLabels || {};

  return result;
}

export function menuItemWithLabel(itemKey, layout) {
  const item = ADMIN_MENU_ITEMS[itemKey];
  if (!item) return null;
  return {
    key: itemKey,
    ...item,
    label: layout?.itemLabels?.[itemKey] || item.label,
  };
}
