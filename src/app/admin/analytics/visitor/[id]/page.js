"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import JourneyTimeline from "@/components/admin/analytics/JourneyTimeline";
import { formatDuration } from "@/lib/format-duration";

export default function VisitorDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const res = await fetch(`/api/admin/analytics/visitor/${id}`);
        const d = await res.json();
        setData(d);
      } catch {
        setLoadError("Erreur reseau, impossible de charger le visiteur.");
      }
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
        <p className="admin-text-muted text-center py-20">{loadError || "Visiteur non trouve"}</p>
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

      {data.googleAds && (
        <div className="mb-6 overflow-hidden rounded-xl border border-[#1a73e8]/25 bg-[#1a73e8]/[0.045]">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1a73e8]/15 text-[#8ab4f8]">
                <i className="fas fa-bullhorn text-sm" />
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8ab4f8]">Origine Google Ads</p>
                <p className="admin-text mt-1 font-bold">
                  {data.googleAds.campaignName || (data.googleAds.campaignId ? `Campagne ${data.googleAds.campaignId}` : "Campagne non identifiée")}
                </p>
                <p className="admin-text-muted mt-1 font-mono text-xs">
                  {data.googleAds.keyword || "Mot-clé non transmis"}
                </p>
              </div>
            </div>
            <div className="admin-text-muted flex flex-wrap gap-2 text-[10px]">
              {data.googleAds.campaignId && <span className="rounded-md bg-white/5 px-2 py-1 font-mono">campagne {data.googleAds.campaignId}</span>}
              {data.googleAds.adGroupId && <span className="rounded-md bg-white/5 px-2 py-1 font-mono">groupe {data.googleAds.adGroupId}</span>}
              {data.googleAds.matchType && <span className="rounded-md bg-white/5 px-2 py-1">match {data.googleAds.matchType}</span>}
              {data.googleAds.adsDevice && <span className="rounded-md bg-white/5 px-2 py-1">{data.googleAds.adsDevice}</span>}
              {data.googleAds.clickIdCaptured && <span className="rounded-md bg-[#34a853]/10 px-2 py-1 text-[#81c995]">clic confirmé</span>}
            </div>
          </div>
        </div>
      )}

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
