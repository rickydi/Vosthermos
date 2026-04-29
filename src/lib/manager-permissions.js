export const MANAGER_PERMISSION_LABELS = {
  view_work_orders: "Voir bons de travail",
  view_invoices: "Voir factures",
  view_quotes: "Voir soumissions",
  request_intervention: "Demander intervention",
  approve_quotes: "Approuver soumissions",
  manage_units: "Gerer unites",
  manage_openings: "Gerer ouvertures et photos",
};

export const MANAGER_PERMISSION_KEYS = Object.keys(MANAGER_PERMISSION_LABELS);

export const DEFAULT_MANAGER_PERMISSIONS = [...MANAGER_PERMISSION_KEYS];

export const CORE_MANAGER_PERMISSIONS = [
  "request_intervention",
  "manage_units",
  "manage_openings",
];

export function hasDefaultManagerAccess(permissions = []) {
  return DEFAULT_MANAGER_PERMISSIONS.every((permission) => permissions.includes(permission));
}

export function hasCoreManagerAccess(permissions = []) {
  return CORE_MANAGER_PERMISSIONS.every((permission) => permissions.includes(permission));
}
