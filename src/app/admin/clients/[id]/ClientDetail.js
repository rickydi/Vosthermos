"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddressAutocomplete from "@/components/AddressAutocomplete";

const OPENING_TYPES = [
  { value: "fenetre", label: "Fenêtre" },
  { value: "porte", label: "Porte" },
  { value: "porte-patio", label: "Porte-patio" },
  { value: "porte-francaise", label: "Porte française" },
  { value: "mur-rideau", label: "Mur-rideau" },
];

export default function ClientDetail({ client }) {
  const router = useRouter();
  const [tab, setTab] = useState("infos");
  const isB2B = client.type === "gestionnaire";
  const tabs = [
    { id: "infos", label: "Infos", icon: "fa-id-card" },
    ...(isB2B
      ? [
          { id: "batiments", label: "Bâtiments", icon: "fa-building" },
          { id: "unites", label: "Unités", icon: "fa-door-open" },
        ]
      : []),
  ];

  // State local pour bâtiments et unités
  const [buildings, setBuildings] = useState(client.buildings);
  const [units, setUnits] = useState(client.units);

  // Infos client éditables
  const [infoForm, setInfoForm] = useState({
    name: client.name || "",
    address: client.address || "",
    city: client.city || "",
    postalCode: client.postalCode || "",
    phone: client.phone || "",
    secondaryPhone: client.secondaryPhone || "",
    email: client.email || "",
    paymentTermsDays: client.paymentTermsDays ?? 30,
  });
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  async function saveClientInfo() {
    setSavingInfo(true);
    setInfoMsg("");
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(infoForm),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erreur"); }
      setInfoMsg("Enregistré ✓");
      setTimeout(() => setInfoMsg(""), 2500);
      router.refresh();
    } catch (err) {
      setInfoMsg(err.message);
    }
    setSavingInfo(false);
  }

  // Modaux
  const [buildingModal, setBuildingModal] = useState(null); // null | {isNew:true} | {id, code, name, address}
  const [unitModal, setUnitModal] = useState(null);
  const [openingsUnit, setOpeningsUnit] = useState(null);
  const [openingModal, setOpeningModal] = useState(null);

  async function refresh() {
    router.refresh();
    const res = await fetch(`/api/admin/buildings?clientId=${client.id}`);
    if (res.ok) setBuildings(await res.json());
  }

  async function saveBuilding(form) {
    const isNew = !form.id;
    const url = isNew ? "/api/admin/buildings" : `/api/admin/buildings/${form.id}`;
    const method = isNew ? "POST" : "PUT";
    const body = isNew ? { ...form, clientId: client.id } : form;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) { const d = await res.json(); alert(d.error || "Erreur"); return; }
    setBuildingModal(null);
    router.refresh();
  }

  async function deleteBuilding(id) {
    if (!confirm("Supprimer ce bâtiment? Les unités seront détachées (pas supprimées).")) return;
    const res = await fetch(`/api/admin/buildings/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Erreur"); return; }
    router.refresh();
  }

  async function saveUnit(form) {
    const isNew = !form.id;
    const url = isNew ? "/api/admin/units" : `/api/admin/units/${form.id}`;
    const method = isNew ? "POST" : "PUT";
    const body = isNew ? { ...form, clientId: client.id } : form;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) { const d = await res.json(); alert(d.error || "Erreur"); return; }
    setUnitModal(null);
    router.refresh();
  }

  async function deleteUnit(id) {
    if (!confirm("Désactiver cette unité? (elle disparaît du portail mais reste dans les historiques)")) return;
    await fetch(`/api/admin/units/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function saveOpening(form, file, removePhoto) {
    const isNew = !form.id;
    const url = isNew ? "/api/admin/openings" : `/api/admin/openings/${form.id}`;
    const method = isNew ? "POST" : "PUT";

    const fd = new FormData();
    if (isNew) fd.set("unitId", openingsUnit.id);
    for (const k of ["type", "location", "description", "year", "brand", "status"]) {
      if (form[k] !== undefined && form[k] !== null) fd.set(k, form[k]);
    }
    if (file) fd.set("photo", file);
    if (removePhoto) fd.set("removePhoto", "true");

    const res = await fetch(url, { method, body: fd });
    if (!res.ok) { const d = await res.json(); alert(d.error || "Erreur"); return; }
    setOpeningModal(null);
    router.refresh();
  }

  async function deleteOpening(id) {
    if (!confirm("Supprimer cette ouverture?")) return;
    await fetch(`/api/admin/openings/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const unitsByBuilding = {};
  for (const b of buildings) unitsByBuilding[b.id] = [];
  const orphans = [];
  for (const u of units) {
    if (u.buildingId && unitsByBuilding[u.buildingId]) unitsByBuilding[u.buildingId].push(u);
    else orphans.push(u);
  }

  return (
    <div className="p-6 lg:p-8">
      <Link href="/admin/clients" className="admin-text-muted hover:admin-text text-sm mb-3 inline-block">
        <i className="fas fa-arrow-left mr-1"></i>Retour aux clients
      </Link>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="admin-text text-2xl font-extrabold">{client.name}</h1>
          <p className="admin-text-muted text-sm mt-1">
            {isB2B ? "Copropriété / gestionnaire" : "Client particulier"}
            {client.city && ` · ${client.city}`}
            {client.phone && ` · ${client.phone}`}
            {client.secondaryPhone && ` · ${client.secondaryPhone}`}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b admin-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-bold transition-colors ${tab === t.id ? "admin-text border-b-2 border-[var(--color-red)]" : "admin-text-muted hover:admin-text"}`}
          >
            <i className={`fas ${t.icon} mr-2`}></i>{t.label}
          </button>
        ))}
      </div>

      {tab === "infos" && (
        <div className="admin-card border rounded-xl p-6 max-w-3xl">
          <h2 className="admin-text font-bold mb-4">{isB2B ? "Informations de la copropriété" : "Informations du client"}</h2>
          <p className="admin-text-muted text-xs mb-4">
            {isB2B
              ? "Ces infos apparaissent sur les factures et documents envoyés à la copropriété."
              : "Ces infos apparaissent sur les bons, factures et documents envoyés au client."}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="admin-text-muted text-xs mb-1 block font-medium">Nom</label>
              <input value={infoForm.name} onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div className="md:col-span-2">
              <label className="admin-text-muted text-xs mb-1 block font-medium">Adresse</label>
              <AddressAutocomplete
                value={infoForm.address}
                onChange={(address) => setInfoForm((prev) => ({ ...prev, address }))}
                onSelect={(address) => setInfoForm((prev) => ({ ...prev, ...address }))}
                placeholder="1500 Montée Monette"
                inputClassName="admin-input border rounded-lg px-3 py-2 text-sm w-full"
              />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block font-medium">Ville</label>
              <input value={infoForm.city} onChange={(e) => setInfoForm({ ...infoForm, city: e.target.value })}
                placeholder="Laval"
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block font-medium">Code postal</label>
              <input value={infoForm.postalCode} onChange={(e) => setInfoForm({ ...infoForm, postalCode: e.target.value })}
                placeholder="H7N 5K3"
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block font-medium">Téléphone</label>
              <input value={infoForm.phone} onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block font-medium">Autre téléphone</label>
              <input value={infoForm.secondaryPhone} onChange={(e) => setInfoForm({ ...infoForm, secondaryPhone: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block font-medium">Email</label>
              <input type="email" value={infoForm.email} onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block font-medium">Termes de paiement</label>
              <select value={infoForm.paymentTermsDays} onChange={(e) => setInfoForm({ ...infoForm, paymentTermsDays: Number(e.target.value) })}
                className="admin-input border rounded-lg px-3 py-2 text-sm w-full">
                <option value="15">Net 15 jours</option>
                <option value="30">Net 30 jours</option>
                <option value="45">Net 45 jours</option>
                <option value="60">Net 60 jours</option>
              </select>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t admin-border flex items-center gap-3">
            <button onClick={saveClientInfo} disabled={savingInfo}
              className="px-5 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold disabled:opacity-50">
              {savingInfo ? "Enregistrement..." : "Enregistrer"}
            </button>
            {infoMsg && <span className={`text-sm ${infoMsg.includes("✓") ? "text-green-500" : "text-red-500"}`}>{infoMsg}</span>}
          </div>
        </div>
      )}

      {isB2B && tab === "batiments" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="admin-text-muted text-sm">{buildings.length} bâtiment{buildings.length > 1 ? "s" : ""}</p>
            <button onClick={() => setBuildingModal({ code: "", name: "", address: "", position: buildings.length })}
              className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold">
              <i className="fas fa-plus mr-2"></i>Ajouter bâtiment
            </button>
          </div>

          {buildings.length === 0 ? (
            <div className="admin-card border rounded-xl p-12 text-center admin-text-muted">
              Aucun bâtiment. Ajoutez-en un pour commencer à organiser les unités.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {buildings.map((b) => (
                <div key={b.id} className="admin-card border rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--color-teal-dark)] text-white rounded-lg flex items-center justify-center font-bold">{b.code}</div>
                      <div>
                        <div className="admin-text font-bold">{b.name}</div>
                        <div className="admin-text-muted text-xs">{b._count.units} unité{b._count.units > 1 ? "s" : ""} {b.address && `· ${b.address}`}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setBuildingModal(b)} className="w-8 h-8 rounded admin-bg border admin-border hover:bg-white/5 inline-flex items-center justify-center">
                        <i className="fas fa-edit text-xs admin-text-muted"></i>
                      </button>
                      <button onClick={() => deleteBuilding(b.id)} className="w-8 h-8 rounded admin-bg border admin-border hover:bg-red-500/10 inline-flex items-center justify-center">
                        <i className="fas fa-trash text-xs text-red-400"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isB2B && tab === "unites" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="admin-text-muted text-sm">{units.length} unité{units.length > 1 ? "s" : ""}</p>
            <button onClick={() => setUnitModal({ code: "", buildingId: buildings[0]?.id || null, description: "" })}
              className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold">
              <i className="fas fa-plus mr-2"></i>Ajouter unité
            </button>
          </div>

          {buildings.map((b) => {
            const list = unitsByBuilding[b.id] || [];
            return (
              <div key={b.id} className="mb-6">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b admin-border">
                  <div className="w-8 h-8 bg-[var(--color-teal-dark)] text-white rounded flex items-center justify-center text-sm font-bold">{b.code}</div>
                  <h3 className="admin-text font-bold">{b.name}</h3>
                  <span className="admin-text-muted text-xs ml-auto">{list.length} unité{list.length > 1 ? "s" : ""}</span>
                </div>
                {list.length === 0 ? (
                  <p className="admin-text-muted text-sm italic p-3">Aucune unité dans ce bâtiment</p>
                ) : (
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {list.map((u) => (
                      <div key={u.id} className="admin-card border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="admin-text font-bold">{u.code}</div>
                            {u.description && <div className="admin-text-muted text-xs mt-1">{u.description}</div>}
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => setUnitModal(u)} title="Modifier" className="w-7 h-7 rounded admin-bg border admin-border hover:bg-white/5 inline-flex items-center justify-center">
                              <i className="fas fa-edit text-[10px] admin-text-muted"></i>
                            </button>
                            <button onClick={() => deleteUnit(u.id)} title="Supprimer" className="w-7 h-7 rounded admin-bg border admin-border hover:bg-red-500/10 inline-flex items-center justify-center">
                              <i className="fas fa-trash text-[10px] text-red-400"></i>
                            </button>
                          </div>
                        </div>
                        <button onClick={() => setOpeningsUnit(u)} className="w-full mt-2 text-xs admin-text-muted hover:admin-text py-1.5 bg-white/5 rounded">
                          <i className="fas fa-door-open mr-1"></i>{u.openings.length} ouverture{u.openings.length !== 1 ? "s" : ""}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {orphans.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b admin-border">
                <div className="w-8 h-8 bg-gray-500 text-white rounded flex items-center justify-center text-sm font-bold">?</div>
                <h3 className="admin-text font-bold">Unités sans bâtiment</h3>
                <span className="admin-text-muted text-xs ml-auto">{orphans.length}</span>
              </div>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                {orphans.map((u) => (
                  <div key={u.id} className="admin-card border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="admin-text font-bold">{u.code}</div>
                      <div className="flex gap-1">
                        <button onClick={() => setUnitModal(u)} className="w-7 h-7 rounded admin-bg border admin-border hover:bg-white/5 inline-flex items-center justify-center">
                          <i className="fas fa-edit text-[10px] admin-text-muted"></i>
                        </button>
                        <button onClick={() => deleteUnit(u.id)} className="w-7 h-7 rounded admin-bg border admin-border hover:bg-red-500/10 inline-flex items-center justify-center">
                          <i className="fas fa-trash text-[10px] text-red-400"></i>
                        </button>
                      </div>
                    </div>
                    <button onClick={() => setOpeningsUnit(u)} className="w-full mt-2 text-xs admin-text-muted hover:admin-text py-1.5 bg-white/5 rounded">
                      <i className="fas fa-door-open mr-1"></i>{u.openings.length} ouverture{u.openings.length !== 1 ? "s" : ""}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal bâtiment */}
      {isB2B && buildingModal && (
        <BuildingModal
          initial={buildingModal}
          onSave={saveBuilding}
          onClose={() => setBuildingModal(null)}
        />
      )}

      {/* Modal unité */}
      {isB2B && unitModal && (
        <UnitModal
          initial={unitModal}
          buildings={buildings}
          onSave={saveUnit}
          onClose={() => setUnitModal(null)}
        />
      )}

      {/* Liste ouvertures d'une unité */}
      {openingsUnit && !openingModal && (
        <OpeningsListModal
          unit={openingsUnit}
          onClose={() => setOpeningsUnit(null)}
          onAdd={() => setOpeningModal({ type: "fenetre", location: "", status: "ok" })}
          onEdit={(o) => setOpeningModal(o)}
          onDelete={deleteOpening}
        />
      )}

      {/* Modal ouverture */}
      {openingModal && openingsUnit && (
        <OpeningModal
          initial={openingModal}
          unitCode={openingsUnit.code}
          onSave={saveOpening}
          onClose={() => setOpeningModal(null)}
        />
      )}
    </div>
  );
}

function Modal({ children, onClose, title, size = "md" }) {
  const maxW = size === "lg" ? "max-w-3xl" : "max-w-xl";
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`admin-bg border admin-border rounded-xl w-full ${maxW} shadow-2xl my-8`}>
        <div className="flex items-center justify-between p-5 border-b admin-border">
          <h2 className="admin-text font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded admin-card border admin-border hover:bg-white/5 inline-flex items-center justify-center">
            <i className="fas fa-times admin-text-muted"></i>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BuildingModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial });
  return (
    <Modal title={form.id ? "Modifier bâtiment" : "Nouveau bâtiment"} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="p-5 space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Code</label>
            <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="A" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          </div>
          <div className="md:col-span-2">
            <label className="admin-text-muted text-xs mb-1 block font-medium">Nom</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Bâtiment A" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          </div>
        </div>
        <div>
          <label className="admin-text-muted text-xs mb-1 block font-medium">Adresse (optionnel)</label>
          <AddressAutocomplete
            value={form.address || ""}
            onChange={(address) => setForm((prev) => ({ ...prev, address }))}
            onSelect={(address) => setForm((prev) => ({ ...prev, address: address.address }))}
            inputClassName="admin-input border rounded-lg px-3 py-2 text-sm w-full"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm">Annuler</button>
          <button type="submit" className="px-5 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold">Enregistrer</button>
        </div>
      </form>
    </Modal>
  );
}

function UnitModal({ initial, buildings, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial });
  return (
    <Modal title={form.id ? "Modifier unité" : "Nouvelle unité"} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Code</label>
            <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="A-101" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Bâtiment</label>
            <select value={form.buildingId || ""} onChange={(e) => setForm({ ...form, buildingId: e.target.value || null })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full">
              <option value="">Aucun</option>
              {buildings.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="admin-text-muted text-xs mb-1 block font-medium">Description (optionnel)</label>
          <input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: 3 chambres" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
        </div>
        <div>
          <label className="admin-text-muted text-xs mb-1 block font-medium">Notes internes</label>
          <textarea rows={2} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm">Annuler</button>
          <button type="submit" className="px-5 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold">Enregistrer</button>
        </div>
      </form>
    </Modal>
  );
}

function OpeningsListModal({ unit, onClose, onAdd, onEdit, onDelete }) {
  return (
    <Modal title={`Ouvertures · Unité ${unit.code}`} onClose={onClose} size="lg">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="admin-text-muted text-sm">{unit.openings.length} ouverture{unit.openings.length !== 1 ? "s" : ""}</p>
          <button onClick={onAdd} className="px-3 py-1.5 bg-[var(--color-red)] text-white rounded-lg text-xs font-bold">
            <i className="fas fa-plus mr-1"></i>Ajouter ouverture
          </button>
        </div>
        {unit.openings.length === 0 ? (
          <p className="admin-text-muted text-sm italic text-center py-8">Aucune ouverture enregistrée</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unit.openings.map((o) => (
              <div key={o.id} className="admin-card border rounded-lg overflow-hidden">
                <div className="aspect-video bg-white/5 relative">
                  {o.photoUrl ? (
                    <img src={o.photoUrl} alt={o.location} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center admin-text-muted">
                      <i className="fas fa-camera text-2xl opacity-30"></i>
                    </div>
                  )}
                  {o.status === "active" && <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-500 text-white rounded-full">Actif</span>}
                  {o.status === "done" && <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-green-500 text-white rounded-full">Fait</span>}
                </div>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-[var(--color-red)] uppercase tracking-wider">{o.type.replace("-", " ")}</div>
                  <div className="admin-text font-bold text-sm">{o.location}</div>
                  {o.description && <div className="admin-text-muted text-xs mt-1 line-clamp-2">{o.description}</div>}
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => onEdit(o)} className="flex-1 px-2 py-1.5 admin-bg border admin-border rounded text-xs admin-text-muted hover:admin-text">
                      <i className="fas fa-edit mr-1"></i>Modifier
                    </button>
                    <button onClick={() => onDelete(o.id)} className="px-2 py-1.5 admin-bg border admin-border rounded text-xs text-red-400">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

function OpeningModal({ initial, unitCode, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial });
  const [file, setFile] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [preview, setPreview] = useState(initial.photoUrl || null);

  function handleFile(f) {
    setFile(f);
    setRemovePhoto(false);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    }
  }

  return (
    <Modal title={form.id ? `Modifier ouverture · ${unitCode}` : `Nouvelle ouverture · ${unitCode}`} onClose={onClose} size="lg">
      <form onSubmit={(e) => { e.preventDefault(); onSave(form, file, removePhoto); }} className="p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Type</label>
            <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full">
              {OPENING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Localisation</label>
            <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Salon · nord" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          </div>
        </div>

        <div>
          <label className="admin-text-muted text-xs mb-1 block font-medium">Description</label>
          <textarea rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Détails ou notes" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Année</label>
            <input type="number" value={form.year || ""} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2014" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Marque</label>
            <input value={form.brand || ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Novatech" className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block font-medium">Statut</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full">
              <option value="ok">OK</option>
              <option value="active">Bon actif</option>
              <option value="done">Terminé récemment</option>
            </select>
          </div>
        </div>

        <div>
          <label className="admin-text-muted text-xs mb-1 block font-medium">Photo</label>
          {preview && !removePhoto ? (
            <div className="relative inline-block">
              <img src={preview} alt="Aperçu" className="max-h-40 rounded-lg" />
              <button type="button" onClick={() => { setPreview(null); setFile(null); setRemovePhoto(true); }} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs">
                <i className="fas fa-times"></i>
              </button>
            </div>
          ) : (
            <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])}
              className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
          )}
          <p className="admin-text-muted text-xs mt-1">JPEG, PNG, WebP ou GIF · max 8 MB</p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm">Annuler</button>
          <button type="submit" className="px-5 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold">Enregistrer</button>
        </div>
      </form>
    </Modal>
  );
}
