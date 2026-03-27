"use client";

import { useState, useEffect } from "react";
import StatsCards from "@/components/admin/analytics/StatsCards";
import DailyChart from "@/components/admin/analytics/DailyChart";
import TopPages from "@/components/admin/analytics/TopPages";
import RecentVisitors from "@/components/admin/analytics/RecentVisitors";
import FlowDiagram from "@/components/admin/analytics/FlowDiagram";
import FormAbandonment from "@/components/admin/analytics/FormAbandonment";
import BreakdownCards from "@/components/admin/analytics/BreakdownCards";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(7);
  const [customDate, setCustomDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics?days=${days}`);
      const d = await res.json();
      setData(d);
      setLoading(false);
    }
    fetchData();
  }, [days]);

  function formatDuration(seconds) {
    if (!seconds || seconds <= 0) return "0s";
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m${s.toString().padStart(2, "0")}s`;
  }

  if (loading || !data) {
    return (
      <div className="p-6 lg:p-8">
        <p className="admin-text-muted text-center py-20">
          <i className="fas fa-spinner fa-spin mr-2"></i>Chargement des analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header + Period selector */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold admin-text">Analytics</h1>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                days === d
                  ? "bg-[var(--color-red)] text-white"
                  : "admin-card admin-text-muted border"
              }`}
            >
              {d}j
            </button>
          ))}
          <input
            type="date"
            value={customDate}
            onChange={(e) => {
              setCustomDate(e.target.value);
              if (e.target.value) setDays(1);
            }}
            className="admin-input rounded-lg text-sm px-3 py-2 border"
          />
        </div>
      </div>

      {/* Stats cards */}
      <StatsCards data={data} formatDuration={formatDuration} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DailyChart daily={data.daily} />
        <TopPages topPages={data.topPages} totalPageViews={data.totalPageViews} formatDuration={formatDuration} />
      </div>

      {/* Flow diagram */}
      <div className="mb-8">
        <FlowDiagram days={days} />
      </div>

      {/* Recent visitors */}
      <div className="mb-8">
        <RecentVisitors initialVisitors={data.recentVisitors} formatDuration={formatDuration} />
      </div>

      {/* Form abandonment */}
      <div className="mb-8">
        <FormAbandonment days={days} />
      </div>

      {/* Breakdown cards */}
      <BreakdownCards devices={data.devices} browsers={data.browsers} topReferrers={data.topReferrers} />
    </div>
  );
}
