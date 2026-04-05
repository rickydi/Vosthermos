"use client";

export default function BreakdownCards({ devices, browsers, topReferrers }) {
  const deviceIcon = (d) =>
    d === "Mobile" ? "fa-mobile-alt" : d === "Tablette" ? "fa-tablet-alt" : "fa-desktop";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Devices */}
      <div className="admin-card rounded-xl p-6 border">
        <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-4">APPAREILS</h2>
        <div className="space-y-3">
          {Object.entries(devices)
            .sort((a, b) => b[1] - a[1])
            .map(([device, count]) => (
              <div key={device} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className={`fas ${deviceIcon(device)} admin-text-muted`}></i>
                  <span className="admin-text text-sm">{device}</span>
                </div>
                <span className="admin-text-muted text-sm font-bold">{count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Browsers */}
      <div className="admin-card rounded-xl p-6 border">
        <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-4">NAVIGATEURS</h2>
        <div className="space-y-3">
          {Object.entries(browsers)
            .sort((a, b) => b[1] - a[1])
            .map(([browser, count]) => (
              <div key={browser} className="flex items-center justify-between">
                <span className="admin-text text-sm">{browser}</span>
                <span className="admin-text-muted text-sm font-bold">{count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Referrers */}
      <div className="admin-card rounded-xl p-6 border md:col-span-3">
        <h2 className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-4">SOURCES DE TRAFIC</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
          {topReferrers.map((r) => (
            <div key={r.source} className="flex items-center justify-between">
              <span className="admin-text text-sm">{r.source}</span>
              <span className="admin-text-muted text-sm font-bold ml-3">{r.count}</span>
            </div>
          ))}
          {topReferrers.length === 0 && (
            <p className="admin-text-muted text-sm text-center">Trafic direct</p>
          )}
        </div>
      </div>
    </div>
  );
}
