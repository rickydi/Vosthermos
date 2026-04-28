"use client";

import { useState } from "react";
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

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Infos de facturation (persistees en DB, utilisees sur les factures) */}
      <div className="mb-8">
        <CompanyInfoSection />
      </div>

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
