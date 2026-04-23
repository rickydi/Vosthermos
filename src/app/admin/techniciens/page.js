"use client";

import { useState, useEffect, useRef } from "react";

export default function TechniciensPage() {
  const [techs, setTechs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", pin: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editPhotoUrl, setEditPhotoUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  async function load() {
    const res = await fetch("/api/admin/technicians", { cache: "no-store" });
    const data = await res.json();
    if (Array.isArray(data)) setTechs(data);
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setForm({ name: "", email: "", phone: "", pin: "" });
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditPhotoUrl(null);
    setEditId(null);
    setShowForm(false);
  }

  async function uploadPhoto(techId) {
    if (!photoFile) return;
    const fd = new FormData();
    fd.append("photo", photoFile);
    await fetch(`/api/admin/technicians/${techId}/photo`, { method: "POST", body: fd });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editId ? `/api/admin/technicians/${editId}` : "/api/admin/technicians";
      const method = editId ? "PUT" : "POST";
      const body = { ...form };
      if (editId && !body.pin) delete body.pin;

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const tech = await res.json();
      if (tech?.id && photoFile) {
        await uploadPhoto(tech.id);
      }
    } finally {
      setSaving(false);
      resetForm();
      load();
    }
  }

  async function removePhoto(tech) {
    if (!confirm(`Supprimer la photo de ${tech.name} ?`)) return;
    await fetch(`/api/admin/technicians/${tech.id}/photo`, { method: "DELETE" });
    load();
  }

  function startEdit(tech) {
    setForm({ name: tech.name, email: tech.email || "", phone: tech.phone || "", pin: "" });
    setEditId(tech.id);
    setEditPhotoUrl(tech.photoUrl || null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowForm(true);
  }

  function onPhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Fichier image requis");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function toggleActive(tech) {
    await fetch(`/api/admin/technicians/${tech.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...tech, isActive: !tech.isActive }),
    });
    load();
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-text text-2xl font-bold">Techniciens</h1>
        <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium">
          <i className="fas fa-plus mr-2"></i>Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card border rounded-xl p-6 mb-6 space-y-4">
          <h2 className="admin-text font-bold">{editId ? "Modifier technicien" : "Nouveau technicien"}</h2>

          {/* Photo */}
          <div className="flex items-center gap-4">
            <div
              className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 border-2 border-dashed admin-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-[var(--color-red)]"
              onClick={() => fileInputRef.current?.click()}
              title="Cliquer pour choisir une photo"
            >
              {photoPreview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : editPhotoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={editPhotoUrl} alt="Photo actuelle" className="w-full h-full object-cover" />
              ) : (
                <i className="fas fa-camera text-2xl admin-text-muted"></i>
              )}
            </div>
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onPhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 admin-card border admin-border admin-text rounded text-xs font-medium"
              >
                <i className="fas fa-upload mr-2"></i>Choisir photo
              </button>
              {(photoFile || editPhotoUrl) && (
                <button
                  type="button"
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); setEditPhotoUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="ml-2 px-3 py-1.5 text-red-500 hover:text-red-600 text-xs"
                >
                  <i className="fas fa-times mr-1"></i>Retirer
                </button>
              )}
              <p className="admin-text-muted text-xs mt-2">JPEG, PNG ou WebP · max 8 MB</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input required placeholder="Nom complet *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="admin-input border rounded-lg px-4 py-2.5 text-sm" />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="admin-input border rounded-lg px-4 py-2.5 text-sm" />
            <input placeholder="Telephone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="admin-input border rounded-lg px-4 py-2.5 text-sm" />
            <input placeholder={editId ? "Nouveau PIN (laisser vide pour garder)" : "PIN 4 chiffres *"}
              value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              required={!editId} maxLength={4} pattern="\d{4}" inputMode="numeric"
              className="admin-input border rounded-lg px-4 py-2.5 text-sm font-mono tracking-widest" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? "..." : editId ? "Modifier" : "Creer"}
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-2.5 admin-text-muted admin-hover rounded-lg text-sm">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="admin-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b admin-border admin-text-muted text-xs text-left">
              <th className="px-4 py-3 w-16">Photo</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Telephone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {techs.map((tech) => (
              <tr key={tech.id} className="border-b admin-border">
                <td className="px-4 py-3">
                  {tech.photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={tech.photoUrl} alt={tech.name} className="w-10 h-10 rounded-full object-cover border admin-border" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center admin-text-muted">
                      <i className="fas fa-user text-sm"></i>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 admin-text font-medium">{tech.name}</td>
                <td className="px-4 py-3 admin-text-muted">{tech.phone || "—"}</td>
                <td className="px-4 py-3 admin-text-muted">{tech.email || "—"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(tech)}
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${tech.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {tech.isActive ? "Actif" : "Inactif"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => startEdit(tech)} className="text-blue-400 hover:text-blue-300 text-xs mr-3">Modifier</button>
                  {tech.photoUrl && (
                    <button onClick={() => removePhoto(tech)} className="text-red-500 hover:text-red-600 text-xs">Retirer photo</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
