export function adminDocumentTypeFromPathname(pathname) {
  const value = String(pathname || "");
  if (value.startsWith("/admin/factures")) return "invoice";
  if (value.startsWith("/admin/soumissions")) return "quote";
  return null;
}

export function adminDocumentListHref(type) {
  if (type === "invoice") return "/admin/factures";
  if (type === "quote") return "/admin/soumissions";
  return "/admin/bons";
}

export function adminDocumentNewHref(type, params = {}) {
  const base = type === "invoice"
    ? "/admin/factures/nouveau"
    : type === "quote"
      ? "/admin/soumissions/nouveau"
      : "/admin/bons/nouveau";
  const query = new URLSearchParams();
  if (params.fresh) query.set("fresh", String(params.fresh));
  if (params.edit) query.set("edit", String(params.edit));
  const suffix = query.toString();
  return suffix ? `${base}?${suffix}` : base;
}

export function adminDocumentEditHref(id, type) {
  return adminDocumentNewHref(type, { edit: id });
}

export function adminDocumentDetailHref(id, type) {
  if (type === "invoice") return `/admin/factures/${id}`;
  if (type === "quote") return `/admin/soumissions/${id}`;
  return `/admin/bons/${id}`;
}

export function adminDocumentListLabel(type) {
  if (type === "invoice") return "Toutes les factures";
  if (type === "quote") return "Toutes les soumissions";
  return "Tous les bons de travail";
}
