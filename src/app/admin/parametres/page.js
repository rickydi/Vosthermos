"use client";

import { useEffect, useState } from "react";
import NotifyMembersSection from "@/components/admin/NotifyMembersSection";
import BlogNotifyMembersSection from "@/components/admin/BlogNotifyMembersSection";
import ApiKeysSection from "@/components/admin/ApiKeysSection";
import CompanyInfoSection from "@/components/admin/CompanyInfoSection";

export default function AdminSettingsPage() {
  const [laborRate, setLaborRate] = useState("85.00");
  const [laborRateSaved, setLaborRateSaved] = useState(false);
  const [laborRateSaving, setLaborRateSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings?key=labor_rate_per_hour")
      .then((r) => r.json())
      .then((data) => {
        if (data?.value) setLaborRate(String(data.value));
      })
      .catch(() => {});
  }, []);

  async function saveLaborRate(e) {
    e.preventDefault();
    const value = Number(laborRate);
    if (!Number.isFinite(value) || value <= 0) return;

    setLaborRateSaving(true);
    setLaborRateSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "labor_rate_per_hour", value: value.toFixed(2) }),
      });
      if (res.ok) {
        setLaborRate(value.toFixed(2));
        setLaborRateSaved(true);
        setTimeout(() => setLaborRateSaved(false), 3000);
      }
    } finally {
      setLaborRateSaving(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <CompanyInfoSection />
      </div>

      <form id="bons-travail" onSubmit={saveLaborRate} className="mb-8 admin-card rounded-xl p-6 border admin-border">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h2 className="admin-text font-bold text-lg">Bons de travail</h2>
            <p className="admin-text-muted text-sm mt-1">
              Ce taux est utilise pour les nouveaux bons seulement. Les anciens bons gardent leur taux sauvegarde.
            </p>
          </div>
          {laborRateSaved && <span className="text-green-400 text-sm font-bold">Sauvegarde</span>}
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block admin-text-muted text-sm mb-1">Taux main d&apos;oeuvre</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={laborRate}
                onChange={(e) => setLaborRate(e.target.value)}
                className="admin-input w-32 border rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-red)]"
              />
              <span className="admin-text-muted text-sm">$/h</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={laborRateSaving}
            className="bg-[var(--color-red)] text-white px-5 py-3 rounded-xl font-bold hover:bg-[var(--color-red-dark)] transition-all disabled:opacity-50"
          >
            {laborRateSaving ? "Sauvegarde..." : "Sauvegarder le taux"}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <NotifyMembersSection />
      </div>

      <div className="mt-8">
        <BlogNotifyMembersSection />
      </div>

      <div className="mt-8">
        <ApiKeysSection />
      </div>
    </div>
  );
}
