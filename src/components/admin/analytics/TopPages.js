"use client";

// Top pages avec badge par type de page, barres lisibles et colonnes alignées.

function pageType(p) {
  if (p === "/" || p === "/en") return { label: "Accueil", cls: "bg-white/10 admin-text" };
  if (p.startsWith("/services/")) return { label: "Service", cls: "bg-sky-500/15 text-sky-300" };
  if (p.startsWith("/reparation-portes-et-fenetres")) return { label: "Ville", cls: "bg-emerald-500/15 text-emerald-300" };
  if (p.startsWith("/blogue")) return { label: "Blogue", cls: "bg-violet-500/15 text-violet-300" };
  if (p.startsWith("/guides") || p.startsWith("/problemes") || p.startsWith("/glossaire")) return { label: "Guide", cls: "bg-amber-500/15 text-amber-300" };
  if (p.startsWith("/outils") || p.startsWith("/diagnostic") || p.startsWith("/calculateur")) return { label: "Outil", cls: "bg-amber-500/15 text-amber-300" };
  if (p.startsWith("/prix")) return { label: "Prix", cls: "bg-amber-500/15 text-amber-300" };
  if (p.startsWith("/produit") || p.startsWith("/boutique") || p.startsWith("/panier") || p.startsWith("/checkout")) return { label: "Boutique", cls: "bg-pink-500/15 text-pink-300" };
  if (p.startsWith("/contact") || p.startsWith("/rendez-vous")) return { label: "Contact", cls: "bg-[var(--color-red)]/15 text-[var(--color-red)]" };
  if (p.startsWith("/en/")) return { label: "EN", cls: "bg-white/10 admin-text-muted" };
  return { label: "Page", cls: "bg-white/10 admin-text-muted" };
}

export default function TopPages({ topPages = [], totalPageViews = 0, formatDuration }) {
  const maxCount = Math.max(...topPages.map((p) => p.count), 1);

  return (
    <div className="admin-card rounded-xl p-6 border h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider">Top pages</h2>
        {totalPageViews > 0 && (
          <span className="admin-text-muted text-[11px]">{totalPageViews} vues au total</span>
        )}
      </div>
      <div className="space-y-3.5">
        {topPages.map((p) => {
          const pct = totalPageViews > 0 ? Math.round((p.count / totalPageViews) * 100) : 0;
          const barPct = (p.count / maxCount) * 100;
          const t = pageType(p.page);
          return (
            <div key={p.page} className="group">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${t.cls}`}>{t.label}</span>
                  <a
                    href={p.page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-text text-[13px] font-mono truncate group-hover:text-[var(--color-red)] transition-colors"
                    title={p.page}
                  >
                    {p.page}
                  </a>
                </div>
                <div className="flex items-baseline gap-2.5 text-xs flex-shrink-0">
                  <span className="admin-text font-bold w-7 text-right">{p.count}</span>
                  <span className="admin-text-muted w-9 text-right">{pct}%</span>
                  <span className={`w-12 text-right ${p.avgDuration > 0 ? "admin-text-muted" : "opacity-30 admin-text-muted"}`}>
                    {p.avgDuration > 0 ? formatDuration(p.avgDuration) : "—"}
                  </span>
                </div>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-2">
                <div
                  className="bg-[var(--color-red)]/80 group-hover:bg-[var(--color-red)] h-2 rounded-full transition-all"
                  style={{ width: `${Math.max(barPct, 3)}%` }}
                />
              </div>
            </div>
          );
        })}
        {topPages.length === 0 && (
          <p className="admin-text-muted text-sm text-center py-8">Aucune donnée</p>
        )}
      </div>
    </div>
  );
}
