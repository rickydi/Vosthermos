"use client";

import { useState, useEffect } from "react";
import StatsCards from "@/components/admin/analytics/StatsCards";
import DailyChart from "@/components/admin/analytics/DailyChart";
import TopPages from "@/components/admin/analytics/TopPages";
import RecentVisitors from "@/components/admin/analytics/RecentVisitors";
import FlowDiagram from "@/components/admin/analytics/FlowDiagram";
import FormAbandonment from "@/components/admin/analytics/FormAbandonment";
import FormTimeline from "@/components/admin/analytics/FormTimeline";
import BreakdownCards from "@/components/admin/analytics/BreakdownCards";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(0);
  const [customDate, setCustomDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const periodQuery = customDate ? `date=${encodeURIComponent(customDate)}` : `days=${days}`;

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/analytics?${periodQuery}`, { cache: "no-store" });
        const d = await res.json().catch(() => ({}));
        if (!res.ok || d.error) {
          throw new Error(d.error || "Erreur analytics");
        }
        if (!cancelled) setData(d);
      } catch (err) {
        if (!cancelled) {
          setData(null);
          setError(err.message || "Erreur analytics");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [periodQuery]);

  function formatDuration(seconds) {
    if (!seconds || seconds <= 0) return "0s";
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m${s.toString().padStart(2, "0")}s`;
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <p className="admin-text-muted text-center py-20">
          <i className="fas fa-spinner fa-spin mr-2"></i>Chargement des analytics...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 lg:p-8">
        <div className="admin-card rounded-xl p-6 border">
          <h1 className="text-2xl font-extrabold admin-text mb-2">Analytics</h1>
          <p className="admin-text-muted text-sm">
            Impossible de charger les donnees analytics.
          </p>
          {error && <p className="text-orange-400 text-sm font-bold mt-3">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header + Period selector */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold admin-text">Analytics</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCustomDate("");
              setDays(0);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              !customDate && days === 0
                ? "bg-[var(--color-red)] text-white"
                : "admin-card admin-text-muted border"
            }`}
          >
            Aujourd&apos;hui
          </button>
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => {
                setCustomDate("");
                setDays(d);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                !customDate && days === d
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
        <FlowDiagram query={periodQuery} />
      </div>

      {/* Recent visitors */}
      <div className="mb-8">
        <RecentVisitors initialVisitors={data.recentVisitors} formatDuration={formatDuration} />
      </div>

      {/* Form abandonment */}
      <div className="mb-8">
        <FormAbandonment query={periodQuery} />
      </div>

      {/* Form timeline simulation */}
      <div className="mb-8">
        <FormTimeline query={periodQuery} />
      </div>

      {/* Breakdown cards */}
      <BreakdownCards devices={data.devices} browsers={data.browsers} topReferrers={data.topReferrers} />
    </div>
  );
}
