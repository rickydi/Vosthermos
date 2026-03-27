"use client";

export default function TopPages({ topPages, totalPageViews, formatDuration }) {
  return (
    <div className="admin-card rounded-xl p-6 border">
      <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-4">TOP PAGES</h2>
      <div className="space-y-3">
        {topPages.map((p) => {
          const pct = totalPageViews > 0 ? (p.count / totalPageViews) * 100 : 0;
          return (
            <div key={p.page} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="admin-text text-sm font-mono truncate">{p.page}</span>
                  <div className="flex items-center gap-3 text-xs admin-text-muted flex-shrink-0 ml-2">
                    <span className="font-bold">{p.count}</span>
                    <span>{formatDuration(p.avgDuration)}</span>
                  </div>
                </div>
                <div className="w-full bg-blue-500/10 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {topPages.length === 0 && (
          <p className="admin-text-muted text-sm text-center py-4">Aucune donnee</p>
        )}
      </div>
    </div>
  );
}
