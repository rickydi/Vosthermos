"use client";

import Link from "next/link";

function Metric({ label, value, detail, accent = "admin-text" }) {
  return (
    <div className="min-w-0 border-l border-white/10 pl-4 first:border-l-0 first:pl-0">
      <p className={`text-2xl font-extrabold leading-none ${accent}`}>{value}</p>
      <p className="admin-text-muted mt-1 text-[10px] font-bold uppercase tracking-[0.16em]">{label}</p>
      {detail ? <p className="admin-text-muted mt-1 truncate text-[10px]">{detail}</p> : null}
    </div>
  );
}

function matchTypeLabel(value) {
  const labels = { e: "exact", p: "expression", b: "large" };
  return labels[String(value || "").toLowerCase()] || value || null;
}

function CampaignRows({ campaigns = [], formatDuration }) {
  if (!campaigns.length) {
    return <p className="admin-text-muted py-8 text-center text-sm">Aucune campagne attribuée pour cette période.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="admin-text-muted border-b border-white/10 text-[10px] uppercase tracking-[0.14em]">
            <th className="pb-3 text-left">Campagne</th>
            <th className="pb-3 text-right">Visiteurs</th>
            <th className="pb-3 text-right">Sessions</th>
            <th className="pb-3 text-right">Demandes</th>
            <th className="pb-3 text-right">Taux</th>
            <th className="pb-3 text-right">Temps</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {campaigns.map((campaign) => (
            <tr key={campaign.key} className="transition-colors hover:bg-white/[0.025]">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${campaign.leads ? "bg-[#34a853]" : "bg-[#1a73e8]"}`} />
                  <span className="admin-text font-bold">{campaign.name}</span>
                </div>
                <div className="admin-text-muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 pl-4 text-[10px]">
                  {campaign.campaignId ? <span className="font-mono">ID {campaign.campaignId}</span> : null}
                  {campaign.topKeyword ? (
                    <span className="max-w-[300px] truncate font-mono" title={campaign.topKeyword}>
                      mot-clé : {campaign.topKeyword}
                    </span>
                  ) : (
                    <span>mot-clé non transmis</span>
                  )}
                </div>
              </td>
              <td className="admin-text py-3 text-right font-bold">{campaign.visitors}</td>
              <td className="admin-text-muted py-3 text-right">{campaign.sessions}</td>
              <td className="py-3 text-right font-extrabold text-[#34a853]">{campaign.leads}</td>
              <td className="admin-text py-3 text-right font-bold">{campaign.conversionRate}%</td>
              <td className="admin-text-muted py-3 text-right text-xs">{formatDuration(campaign.avgDuration || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentAdClicks({ clicks = [], formatDuration }) {
  if (!clicks.length) {
    return <p className="admin-text-muted py-8 text-center text-sm">Aucun clic Google Ads détecté.</p>;
  }

  return (
    <div className="space-y-2">
      {clicks.slice(0, 6).map((click) => {
        const matchType = matchTypeLabel(click.matchType);
        return (
          <Link
            key={`${click.visitorId}-${click.startedAt}`}
            href={`/admin/analytics/visitor/${click.visitorId}`}
            className="group block rounded-lg border border-white/5 bg-white/[0.018] p-3 transition-colors hover:border-[#1a73e8]/40 hover:bg-[#1a73e8]/[0.045]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1.5 text-xs">
                  <span className="max-w-[190px] truncate font-bold text-[#8ab4f8]">{click.campaignName}</span>
                  <i className="fas fa-chevron-right admin-text-muted text-[8px]" />
                  <span className="admin-text max-w-[180px] truncate font-mono">
                    {click.keyword || "mot-clé inconnu"}
                  </span>
                </div>
                <div className="admin-text-muted mt-1 flex flex-wrap gap-x-2 text-[10px]">
                  {matchType ? <span>{matchType}</span> : null}
                  {click.city ? <span>{click.city}{click.region ? `, ${click.region}` : ""}</span> : null}
                  <span>{click.pages} page{click.pages > 1 ? "s" : ""}</span>
                  <span>{formatDuration(click.duration || 0)}</span>
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider ${
                click.lead
                  ? "bg-[#34a853]/15 text-[#81c995]"
                  : "bg-white/5 admin-text-muted"
              }`}>
                {click.lead ? "Demande" : "Visite"}
              </span>
            </div>
            <div className="admin-text-muted mt-2 flex items-center justify-between gap-3 text-[10px]">
              <span className="truncate font-mono">{click.landingPage || "page inconnue"}</span>
              <span className="shrink-0">
                {new Date(click.startedAt).toLocaleDateString("fr-CA", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <i className="fas fa-arrow-right ml-2 text-[#1a73e8] opacity-60 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function GoogleAdsAttribution({ data = {}, formatDuration }) {
  const sessions = data.sessions || 0;
  const coverage = data.coverage || 0;

  return (
    <section className="admin-card mb-6 overflow-hidden rounded-xl border border-[#1a73e8]/25">
      <div className="h-1 bg-[#1a73e8]" />
      <div className="p-5 lg:p-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1a73e8]/15 text-[#8ab4f8]">
              <i className="fas fa-bullseye" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="admin-text text-base font-extrabold">Attribution Google Ads</h2>
                <span className="rounded-full border border-[#1a73e8]/25 bg-[#1a73e8]/10 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#8ab4f8]">
                  Dernier clic
                </span>
              </div>
              <p className="admin-text-muted mt-1 max-w-2xl text-xs">
                Le trajet publicitaire complet : campagne, groupe, mot-clé, visite et demande envoyée.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 lg:min-w-[470px]">
            <Metric label="Visiteurs" value={data.visitors || 0} detail="Google payant" accent="text-[#8ab4f8]" />
            <Metric label="Sessions" value={sessions} detail="clics détectés" />
            <Metric label="Demandes" value={data.leads || 0} detail="formulaires" accent="text-[#81c995]" />
            <Metric label="Taux" value={`${data.conversionRate || 0}%`} detail="visite → demande" />
          </div>
        </div>

        {sessions > 0 && coverage < 100 ? (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#f9ab00]/20 bg-[#f9ab00]/[0.07] px-3 py-2.5 text-xs text-[#fdd663]">
            <i className="fas fa-satellite-dish mt-0.5" />
            <p>
              Attribution détaillée : <b>{coverage}%</b>. Les anciens clics restent classés « campagne non identifiée »;
              les prochains clics suivis rempliront automatiquement campagne, groupe et mot-clé.
            </p>
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="admin-text-muted text-[10px] font-bold uppercase tracking-[0.16em]">Rendement par campagne</p>
              <span className="admin-text-muted text-[10px]">{data.detailedSessions || 0}/{sessions} sessions identifiées</span>
            </div>
            <CampaignRows campaigns={data.campaigns} formatDuration={formatDuration} />
          </div>

          <div className="min-w-0 border-t border-white/10 pt-5 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="admin-text-muted text-[10px] font-bold uppercase tracking-[0.16em]">Derniers clics attribués</p>
              <span className="h-2 w-2 rounded-full bg-[#34a853] shadow-[0_0_0_4px_rgba(52,168,83,0.12)]" title="Suivi actif" />
            </div>
            <RecentAdClicks clicks={data.recentClicks} formatDuration={formatDuration} />
          </div>
        </div>
      </div>
    </section>
  );
}
