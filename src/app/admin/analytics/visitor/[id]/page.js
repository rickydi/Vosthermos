"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import JourneyTimeline from "@/components/admin/analytics/JourneyTimeline";

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m${s.toString().padStart(2, "0")}s`;
}

export default function VisitorDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics/visitor/${id}`);
        const d = await res.json();
        setData(d);
      } catch {}
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <p className="admin-text-muted text-center py-20">
          <i className="fas fa-spinner fa-spin mr-2"></i>Chargement...
        </p>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="p-6 lg:p-8">
        <p className="admin-text-muted text-center py-20">Visiteur non trouve</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/analytics"
          className="admin-text-muted hover:text-white transition-colors"
        >
          <i className="fas fa-arrow-left"></i>
        </Link>
        <div>
          <h1 className="text-xl font-extrabold admin-text">
            Visiteur <span className="font-mono text-blue-400">{data.visitorId.substring(0, 12)}...</span>
          </h1>
          <p className="admin-text-muted text-sm">
            {data.sessionCount} session{data.sessionCount > 1 ? "s" : ""} &middot;{" "}
            {data.totalPages} page{data.totalPages > 1 ? "s" : ""} &middot;{" "}
            {formatDuration(data.totalDuration)} total
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="admin-card rounded-xl p-5 border text-center">
          <p className="text-2xl font-extrabold text-blue-400">{data.sessionCount}</p>
          <p className="admin-text-muted text-xs uppercase tracking-wider mt-1">Sessions</p>
        </div>
        <div className="admin-card rounded-xl p-5 border text-center">
          <p className="text-2xl font-extrabold text-green-400">{data.totalPages}</p>
          <p className="admin-text-muted text-xs uppercase tracking-wider mt-1">Pages</p>
        </div>
        <div className="admin-card rounded-xl p-5 border text-center">
          <p className="text-2xl font-extrabold text-purple-400">{formatDuration(data.totalDuration)}</p>
          <p className="admin-text-muted text-xs uppercase tracking-wider mt-1">Duree totale</p>
        </div>
      </div>

      {/* Journey timeline */}
      <h2 className="admin-text font-bold text-lg mb-4">Parcours</h2>
      <JourneyTimeline sessions={data.sessions} />
    </div>
  );
}
