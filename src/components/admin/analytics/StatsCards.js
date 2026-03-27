"use client";

export default function StatsCards({ data, formatDuration }) {
  const stats = [
    { label: "VISITEURS", value: data.uniqueVisitors, icon: "fa-users", color: "text-blue-400" },
    { label: "PAGES VUES", value: data.totalPageViews, icon: "fa-eye", color: "text-green-400" },
    { label: "TEMPS MOYEN", value: formatDuration(data.avgDuration), icon: "fa-clock", color: "text-purple-400" },
    { label: "SESSIONS", value: data.totalSessions, icon: "fa-chart-line", color: "text-orange-400" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="admin-card rounded-xl p-5 border">
          <div className="flex items-center gap-2 mb-2">
            <i className={`fas ${stat.icon} ${stat.color} text-xs`}></i>
            <p className="admin-text-muted text-xs font-bold uppercase tracking-wider">{stat.label}</p>
          </div>
          <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
