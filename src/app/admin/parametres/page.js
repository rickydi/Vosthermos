"use client";

import { useEffect, useState } from "react";
import NotifyMembersSection from "@/components/admin/NotifyMembersSection";
import BlogNotifyMembersSection from "@/components/admin/BlogNotifyMembersSection";
import ApiKeysSection from "@/components/admin/ApiKeysSection";
import CompanyInfoSection from "@/components/admin/CompanyInfoSection";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    address: "330 Chem. Saint-François-Xavier, local 104",
    city: "Delson",
    province: "QC",
    postalCode: "",
    phone: "514-825-8411",
    email: "info@vosthermos.com",
    facebook: "https://www.facebook.com/profile.php?id=61562303553558",
    instagram: "https://instagram.com/vosthermos/",
    lundi: "08h - 17h",
    mardi: "08h - 17h",
    mercredi: "08h - 17h",
    jeudi: "08h - 17h",
    vendredi: "08h - 17h",
    samedi: "Ferme",
    dimanche: "Ferme",
    note: "",
  });
  const [saved, setSaved] = useState(false);
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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  }

  function handleSave(e) {
    e.preventDefault();
    // TODO: save to DB when SiteSetting model is added
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

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
      {/* Infos de facturation (persistees en DB, utilisees sur les factures) */}
      <div className="mb-8">
        <CompanyInfoSection />
      </div>

      <form id="bons-travail" onSubmit={saveLaborRate} className="mb-8 bg-white/5 rounded-xl p-6 border border-white/5">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h2 className="text-white font-bold text-lg">Bons de travail</h2>
            <p className="text-white/50 text-sm mt-1">
              Ce taux est utilise pour les nouveaux bons seulement. Les anciens bons gardent leur taux sauvegarde.
            </p>
          </div>
          {laborRateSaved && <span className="text-green-400 text-sm font-bold">Sauvegarde</span>}
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-white/50 text-sm mb-1">Taux main d&apos;oeuvre</label>
            <div className="flex items-center gap-2">
              <input type="number" min="0" step="0.01" value={laborRate}
                onChange={(e) => setLaborRate(e.target.value)}
                className="w-32 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
              <span className="text-white/50 text-sm">$/h</span>
            </div>
          </div>
          <button type="submit" disabled={laborRateSaving}
            className="bg-[var(--color-red)] text-white px-5 py-3 rounded-xl font-bold hover:bg-[var(--color-red-dark)] transition-all disabled:opacity-50">
            {laborRateSaving ? "Sauvegarde..." : "Sauvegarder le taux"}
          </button>
        </div>
      </form>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Address */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/5">
          <h2 className="text-white font-bold text-lg mb-4">Adresse</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-white/50 text-sm mb-1">Rue</label>
              <input name="address" value={form.address} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/50 text-sm mb-1">Ville</label>
                <input name="city" value={form.city} onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">Province</label>
                <input name="province" value={form.province} onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">Code postal</label>
                <input name="postalCode" value={form.postalCode} onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/5">
          <h2 className="text-white font-bold text-lg mb-4">Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/50 text-sm mb-1">Telephone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">Email</label>
              <input name="email" value={form.email} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/5">
          <h2 className="text-white font-bold text-lg mb-4">Reseaux sociaux</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/50 text-sm mb-1"><i className="fab fa-facebook mr-1"></i> Facebook</label>
              <input name="facebook" value={form.facebook} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1"><i className="fab fa-instagram mr-1"></i> Instagram</label>
              <input name="instagram" value={form.instagram} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/5">
          <h2 className="text-white font-bold text-lg mb-4">Heures d&apos;ouverture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"].map((day) => (
              <div key={day}>
                <label className="block text-white/50 text-sm mb-1 capitalize">{day}</label>
                <input name={day} value={form[day]} onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-red)]" />
              </div>
            ))}
            <div>
              <label className="block text-white/50 text-sm mb-1">Note</label>
              <input name="note" value={form.note} onChange={handleChange} placeholder="Ex: Ferme les jours feries"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-red)]" />
            </div>
          </div>
        </div>

        <button type="submit"
          className="bg-[var(--color-red)] text-white px-8 py-3 rounded-xl font-bold hover:bg-[var(--color-red-dark)] transition-all flex items-center gap-2">
          {saved ? (
            <><i className="fas fa-check"></i> Sauvegarde!</>
          ) : (
            <><i className="fas fa-save"></i> Sauvegarder</>
          )}
        </button>
      </form>

      {/* Notifications SMS */}
      <div className="mt-8">
        <NotifyMembersSection />
      </div>

      {/* Notifications Blog */}
      <div className="mt-8">
        <BlogNotifyMembersSection />
      </div>

      {/* Cles API */}
      <div className="mt-8">
        <ApiKeysSection />
      </div>
    </div>
  );
}
