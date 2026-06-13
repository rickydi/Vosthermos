"use client";

// Appareils / Navigateurs / Sources : 3 colonnes égales avec barres
// proportionnelles (avant : listes plates + une colonne fantôme vide).

function BarList({ title, rows, icon }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="admin-card rounded-xl p-6 border">
      <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-4">{title}</h2>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="admin-text text-[13px] truncate flex items-center gap-2">
                {icon && <i className={`fas ${icon(r.label)} admin-text-muted text-xs w-4 text-center`}></i>}
                {r.label}
              </span>
              <span className="admin-text text-xs font-bold ml-3 flex-shrink-0">{r.count}</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-1.5">
              <div
                className="bg-[var(--color-red)]/70 h-1.5 rounded-full"
                style={{ width: `${Math.max((r.count / max) * 100, 3)}%` }}
              />
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="admin-text-muted text-sm text-center py-4">Aucune donnée</p>}
      </div>
    </div>
  );
}

export default function BreakdownCards({ devices = {}, browsers = {}, topReferrers = [] }) {
  const deviceIcon = (d) =>
    d === "Mobile" ? "fa-mobile-alt" : d === "Tablette" ? "fa-tablet-alt" : "fa-desktop";

  const deviceRows = Object.entries(devices)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));
  const browserRows = Object.entries(browsers)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));

  const sourceRows = topReferrers.slice(0, 8).map((r) => ({
    label: r.source === "Direct / Aucun referrer" ? "Direct" : r.source.replace(/^www\./, ""),
    count: r.count,
  }));
  const hiddenSources = topReferrers.length - sourceRows.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <BarList title="Appareils" rows={deviceRows} icon={deviceIcon} />
      <BarList title="Navigateurs" rows={browserRows} />
      <div>
        <BarList title="Sources de trafic" rows={sourceRows} />
        {hiddenSources > 0 && (
          <p className="admin-text-muted text-[11px] text-center mt-2">+ {hiddenSources} autre{hiddenSources > 1 ? "s" : ""} source{hiddenSources > 1 ? "s" : ""}</p>
        )}
      </div>
    </div>
  );
}
