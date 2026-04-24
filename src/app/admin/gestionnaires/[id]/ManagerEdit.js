"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ALL_PERMISSIONS = [
  { key: "view_work_orders", label: "Voir bons de travail" },
  { key: "view_invoices", label: "Voir factures" },
  { key: "view_quotes", label: "Voir soumissions" },
  { key: "request_intervention", label: "Demander intervention" },
  { key: "approve_quotes", label: "Approuver soumissions" },
  { key: "manage_units", label: "Gérer unités" },
  { key: "manage_openings", label: "Gérer ouvertures (fenêtres/portes + photos)" },
];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-CA");
}

export default function ManagerEdit({ manager, allClients }) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: manager.firstName,
    lastName: manager.lastName,
    phone: manager.phone || "",
    isActive: manager.isActive,
  });
  const [links, setLinks] = useState(
    manager.clients.map((c) => ({
      clientId: c.clientId,
      clientName: c.clientName,
      clientAddress: c.clientAddress || "",
      clientCity: c.clientCity || "",
      clientPostalCode: c.clientPostalCode || "",
      clientPhone: c.clientPhone || "",
      clientEmail: c.clientEmail || "",
      permissions: [...c.permissions],
      paymentTermsDays: c.paymentTermsDays ?? 30,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const availableClients = allClients.filter((c) => !links.some((l) => l.clientId === c.id));

  function togglePerm(clientId, perm) {
    setLinks((ls) => ls.map((l) => {
      if (l.clientId !== clientId) return l;
      const has = l.permissions.includes(perm);
      return { ...l, permissions: has ? l.permissions.filter((p) => p !== perm) : [...l.permissions, perm] };
    }));
  }

  function addClient(clientId) {
    const c = allClients.find((x) => x.id === Number(clientId));
    setLinks((ls) => [...ls, {
      clientId: Number(clientId),
      clientName: c?.name || "",
      clientAddress: c?.address || "",
      clientCity: c?.city || "",
      clientPostalCode: c?.postalCode || "",
      clientPhone: "",
      clientEmail: "",
      permissions: ["view_work_orders", "view_invoices", "request_intervention"],
      paymentTermsDays: c?.paymentTermsDays ?? 30,
    }]);
  }

  function setTerms(clientId, days) {
    setLinks((ls) => ls.map((l) => l.clientId === clientId ? { ...l, paymentTermsDays: Number(days) } : l));
  }

  function setField(clientId, field, value) {
    setLinks((ls) => ls.map((l) => l.clientId === clientId ? { ...l, [field]: value } : l));
  }

  function removeClient(clientId) {
    if (!confirm("Retirer l'acces a cette copropriete?")) return;
    setLinks((ls) => ls.filter((l) => l.clientId !== clientId));
  }

  async function save() {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/managers/${manager.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, clients: links }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erreur");
      }
      // Update client infos per link (address + terms stored on Client model)
      await Promise.all(links.map((l) => fetch(`/api/admin/clients/${l.clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: l.clientAddress ?? "",
          city: l.clientCity ?? "",
          postalCode: l.clientPostalCode ?? "",
          phone: l.clientPhone ?? "",
          email: l.clientEmail ?? "",
          paymentTermsDays: l.paymentTermsDays ?? 30,
        }),
      })));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    } catch (e) {
      setErr(e.message);
    }
    setSaving(false);
  }

  async function sendLink() {
    if (!confirm("Envoyer un nouveau lien d'acces par email?")) return;
    const res = await fetch(`/api/admin/managers/${manager.id}?action=send-link`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) alert("Erreur: " + data.error);
    else alert(data.devLink ? "Lien dev: " + data.devLink : "Lien envoye par email.");
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/gestionnaires" className="admin-text-muted hover:admin-text text-sm">
          <i className="fas fa-arrow-left mr-1"></i>Retour
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="admin-text text-2xl font-extrabold">{manager.firstName} {manager.lastName}</h1>
          <p className="admin-text-muted text-sm mt-1">{manager.email}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              const res = await fetch(`/api/admin/managers/${manager.id}?action=impersonate`, { method: "POST" });
              const d = await res.json();
              if (res.ok && d.redirect) window.open(d.redirect, "_blank");
              else alert("Erreur: " + (d.error || "?"));
            }}
            className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm font-medium"
          >
            <i className="fas fa-eye mr-2"></i>Voir le portail
          </button>
          <button onClick={sendLink} className="px-4 py-2 admin-card border admin-border admin-text rounded-lg text-sm font-medium">
            <i className="fas fa-envelope mr-2"></i>Envoyer lien magique
          </button>
          <button onClick={save} disabled={saving} className="px-6 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-bold disabled:opacity-50">
            {saving ? "..." : saved ? "✓ Sauvegardé" : "Enregistrer"}
          </button>
        </div>
      </div>

      {err && <p className="text-red-400 text-sm mb-4">{err}</p>}

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="admin-card border rounded-xl p-6">
          <h2 className="admin-text font-bold mb-4">Profil</h2>
          <div className="space-y-3">
            <div>
              <label className="admin-text-muted text-xs block mb-1 font-medium">Prenom</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs block mb-1 font-medium">Nom</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs block mb-1 font-medium">Telephone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="admin-input border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <span className="admin-text text-sm">Compte actif</span>
              </label>
            </div>
          </div>
        </div>

        <div className="admin-card border rounded-xl p-6">
          <h2 className="admin-text font-bold mb-4">Infos</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="admin-text-muted">Email</span><span className="admin-text font-medium">{manager.email}</span></div>
            <div className="flex justify-between"><span className="admin-text-muted">Derniere connexion</span><span className="admin-text">{formatDate(manager.lastLoginAt)}</span></div>
            <div className="flex justify-between"><span className="admin-text-muted">Membre depuis</span><span className="admin-text">{formatDate(manager.createdAt)}</span></div>
            <div className="flex justify-between"><span className="admin-text-muted">Sessions actives</span><span className="admin-text">{manager.sessions.length}</span></div>
          </div>
        </div>
      </div>

      <div className="admin-card border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="admin-text font-bold">Copropriétés et permissions</h2>
          {availableClients.length > 0 && (
            <select
              onChange={(e) => { if (e.target.value) { addClient(e.target.value); e.target.value = ""; } }}
              className="admin-input border rounded-lg px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="">+ Ajouter copropriété</option>
              {availableClients.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.city || "—"}</option>)}
            </select>
          )}
        </div>

        {links.length === 0 && (
          <p className="admin-text-muted text-sm italic">
            Aucune copropriete liee. Ajoutez-en une pour que le gestionnaire puisse acceder au portail.
          </p>
        )}

        <div className="space-y-4">
          {links.map((link) => {
            const c = allClients.find((x) => x.id === link.clientId);
            return (
              <div key={link.clientId} className="admin-bg border admin-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="admin-text font-bold">{c?.name || "Copropriete #" + link.clientId}</div>
                    <div className="admin-text-muted text-xs">{c?.city || "—"}</div>
                  </div>
                  <button onClick={() => removeClient(link.clientId)} className="text-red-400 text-xs hover:text-red-300">
                    <i className="fas fa-times"></i> Retirer
                  </button>
                </div>
                <div className="mb-4 pb-4 border-b admin-border">
                  <div className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-2">Adresse de facturation</div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="admin-text-muted text-xs mb-1 block">Adresse</label>
                      <input
                        value={link.clientAddress || ""}
                        onChange={(e) => setField(link.clientId, "clientAddress", e.target.value)}
                        placeholder="1500 Montée Monette"
                        className="admin-input border rounded-lg px-3 py-2 text-sm w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-text-muted text-xs mb-1 block">Ville</label>
                      <input
                        value={link.clientCity || ""}
                        onChange={(e) => setField(link.clientId, "clientCity", e.target.value)}
                        placeholder="Laval"
                        className="admin-input border rounded-lg px-3 py-2 text-sm w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-text-muted text-xs mb-1 block">Code postal</label>
                      <input
                        value={link.clientPostalCode || ""}
                        onChange={(e) => setField(link.clientId, "clientPostalCode", e.target.value)}
                        placeholder="H7N 5K3"
                        className="admin-input border rounded-lg px-3 py-2 text-sm w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-text-muted text-xs mb-1 block">Téléphone copropriété</label>
                      <input
                        value={link.clientPhone || ""}
                        onChange={(e) => setField(link.clientId, "clientPhone", e.target.value)}
                        placeholder="450-555-0100"
                        className="admin-input border rounded-lg px-3 py-2 text-sm w-full"
                      />
                    </div>
                    <div>
                      <label className="admin-text-muted text-xs mb-1 block">Email copropriété</label>
                      <input
                        type="email"
                        value={link.clientEmail || ""}
                        onChange={(e) => setField(link.clientId, "clientEmail", e.target.value)}
                        placeholder="info@copro.ca"
                        className="admin-input border rounded-lg px-3 py-2 text-sm w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-text-muted text-xs font-bold uppercase tracking-wider mb-2">Permissions portail gestionnaire</div>
                <div className="grid md:grid-cols-2 gap-2">
                  {ALL_PERMISSIONS.map((p) => (
                    <label key={p.key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={link.permissions.includes(p.key)}
                        onChange={() => togglePerm(link.clientId, p.key)}
                      />
                      <span className="admin-text">{p.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t admin-border flex items-center gap-3 flex-wrap">
                  <label className="admin-text-muted text-xs font-bold uppercase tracking-wider">Termes de paiement :</label>
                  <select
                    value={link.paymentTermsDays ?? 30}
                    onChange={(e) => setTerms(link.clientId, e.target.value)}
                    className="admin-input border rounded-lg px-3 py-1.5 text-sm"
                  >
                    <option value="15">Net 15 jours</option>
                    <option value="30">Net 30 jours</option>
                    <option value="45">Net 45 jours</option>
                    <option value="60">Net 60 jours</option>
                  </select>
                  <span className="admin-text-muted text-xs">s&apos;applique aux factures de cette copropriété</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {manager.sessions.length > 0 && (
        <div className="admin-card border rounded-xl p-6">
          <h2 className="admin-text font-bold mb-4">Sessions recentes</h2>
          <table className="w-full text-sm">
            <thead className="admin-text-muted">
              <tr>
                <th className="text-left py-2 text-xs font-bold uppercase tracking-wider">Token</th>
                <th className="text-left py-2 text-xs font-bold uppercase tracking-wider">Connexion</th>
                <th className="text-left py-2 text-xs font-bold uppercase tracking-wider">Expire</th>
                <th className="text-left py-2 text-xs font-bold uppercase tracking-wider">IP</th>
                <th className="text-left py-2 text-xs font-bold uppercase tracking-wider">Agent</th>
              </tr>
            </thead>
            <tbody className="admin-text">
              {manager.sessions.map((s, i) => (
                <tr key={i} className="border-t admin-border">
                  <td className="py-2 font-mono text-xs">{s.token}</td>
                  <td className="py-2 text-xs">{formatDate(s.createdAt)}</td>
                  <td className="py-2 text-xs">{formatDate(s.expiresAt)}</td>
                  <td className="py-2 text-xs">{s.ip || "—"}</td>
                  <td className="py-2 text-xs truncate max-w-[200px]">{s.userAgent || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
