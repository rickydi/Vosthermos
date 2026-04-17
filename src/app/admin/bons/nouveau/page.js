"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CatalogPicker from "@/components/admin/CatalogPicker";
import ClientPicker from "@/components/admin/ClientPicker";

export default function NouveauBonAdmin() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const clientTimer = useRef(null);

  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState("");

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [heureArrivee, setHeureArrivee] = useState("");
  const [heureDepart, setHeureDepart] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [statut, setStatut] = useState("draft");
  const [interventionAddress, setInterventionAddress] = useState("");
  const [interventionCity, setInterventionCity] = useState("");
  const [interventionPostalCode, setInterventionPostalCode] = useState("");
  const [visibleAuClient, setVisibleAuClient] = useState(true);

  const [items, setItems] = useState([]);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const [laborHours, setLaborHours] = useState(0);
  const [settings, setSettings] = useState({ labor_rate_per_hour: 85, tps_rate: 0.05, tvq_rate: 0.09975 });

  useEffect(() => {
    fetch("/api/admin/technicians")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTechnicians(data.filter((t) => t.isActive)); })
      .catch(() => {});
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setSettings({
            labor_rate_per_hour: parseFloat(data.labor_rate_per_hour || 85),
            tps_rate: parseFloat(data.tps_rate || 0.05),
            tvq_rate: parseFloat(data.tvq_rate || 0.09975),
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (clientSearch.length < 2 || selectedClient) { setClientResults([]); return; }
    clearTimeout(clientTimer.current);
    clientTimer.current = setTimeout(() => {
      fetch(`/api/admin/clients?q=${encodeURIComponent(clientSearch)}`)
        .then((r) => r.json())
        .then((data) => setClientResults(data.clients || []))
        .catch(() => {});
    }, 300);
  }, [clientSearch, selectedClient]);

  function addProduct(p) {
    setItems((prev) => [...prev, {
      productId: p.id,
      description: `${p.sku} — ${p.name}`,
      quantity: 1,
      unitPrice: Number(p.price),
      itemType: "piece",
    }]);
    setCatalogOpen(false);
  }

  function addCustomItem() {
    setItems((prev) => [...prev, { productId: null, description: "", quantity: 1, unitPrice: 0, itemType: "piece" }]);
  }

  function addDiscount(mode) {
    setItems((prev) => [...prev, {
      productId: null,
      description: mode === "percent" ? "Escompte" : "Reduction",
      quantity: 1,
      unitPrice: 0,
      itemType: "discount",
      discountMode: mode, // "percent" or "amount"
      discountPercent: mode === "percent" ? 10 : 0,
      discountAmount: mode === "amount" ? 0 : 0,
    }]);
  }

  function updateItem(idx, field, value) {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }

  function removeItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  // Base subtotal = pieces only (no labor, no discounts) — used as the denominator for % discounts
  const piecesSubtotalBase = items
    .filter((it) => it.itemType !== "discount")
    .reduce((s, it) => s + Number(it.quantity) * Number(it.unitPrice), 0);

  // Compute effective unitPrice for each discount line based on current base
  const itemsComputed = items.map((it) => {
    if (it.itemType !== "discount") return it;
    let amount = 0;
    if (it.discountMode === "percent") {
      amount = -((Number(it.discountPercent) || 0) / 100) * piecesSubtotalBase;
    } else {
      amount = -Math.abs(Number(it.discountAmount) || 0);
    }
    return { ...it, unitPrice: Math.round(amount * 100) / 100 };
  });

  const totalPieces = itemsComputed.reduce((s, it) => s + Number(it.quantity) * Number(it.unitPrice), 0);
  const totalLabor = Number(laborHours) * settings.labor_rate_per_hour;
  const subtotal = totalPieces + totalLabor;
  const tps = subtotal * settings.tps_rate;
  const tvq = subtotal * settings.tvq_rate;
  const total = subtotal + tps + tvq;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedClient) { setError("Client requis"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          technicianId: technicianId || null,
          date,
          heureArrivee: heureArrivee || null,
          heureDepart: heureDepart || null,
          interventionAddress: interventionAddress || null,
          interventionCity: interventionCity || null,
          interventionPostalCode: interventionPostalCode || null,
          visibleAuClient,
          description: description || null,
          notes: notes || null,
          statut,
          laborHours,
          items: itemsComputed.map((it) => ({
            productId: it.productId,
            description: it.description,
            quantity: Number(it.quantity),
            unitPrice: Number(it.unitPrice),
            itemType: it.itemType,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la creation");
      }
      const wo = await res.json();
      router.push(`/admin/bons/${wo.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/bons" className="admin-text-muted text-sm hover:admin-text">
            <i className="fas fa-arrow-left mr-2"></i>Retour aux bons
          </Link>
          <h1 className="admin-text text-2xl font-bold mt-2">Nouveau bon de travail</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
        {/* Client */}
        <div className="admin-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="admin-text font-bold">Client</h2>
            {!selectedClient && (
              <button type="button" onClick={() => setClientPickerOpen(true)}
                className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium">
                <i className="fas fa-address-book mr-2"></i>Parcourir les clients
              </button>
            )}
          </div>
          {!selectedClient ? (
            <>
              <input
                type="text"
                placeholder="Rechercher par nom, telephone, email..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="admin-input border rounded-lg px-4 py-2.5 text-sm w-full"
                autoFocus
              />
              {clientResults.length > 0 && (
                <div className="mt-3 border rounded-lg overflow-hidden admin-border max-h-64 overflow-y-auto">
                  {clientResults.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => { setSelectedClient(c); setClientSearch(""); setClientResults([]); }}
                      className="w-full text-left px-4 py-3 border-b admin-border admin-hover last:border-b-0"
                    >
                      <p className="admin-text font-medium text-sm">{c.name}</p>
                      <p className="admin-text-muted text-xs">{c.phone || "—"} {c.city ? `• ${c.city}` : ""}</p>
                    </button>
                  ))}
                </div>
              )}
              <Link href="/admin/clients" className="inline-block mt-3 text-xs text-[var(--color-red)]">
                <i className="fas fa-plus mr-1"></i>Creer un nouveau client
              </Link>
            </>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <p className="admin-text font-medium">{selectedClient.name}</p>
                <p className="admin-text-muted text-sm">{selectedClient.phone || "—"}</p>
                {selectedClient.address && <p className="admin-text-muted text-sm">{selectedClient.address}{selectedClient.city ? `, ${selectedClient.city}` : ""}</p>}
              </div>
              <button type="button" onClick={() => setSelectedClient(null)} className="text-xs text-[var(--color-red)]">
                Changer
              </button>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="admin-card border rounded-xl p-6 space-y-4">
          <h2 className="admin-text font-bold">Details</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="admin-text-muted text-xs mb-1 block">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block">Heure arrivee</label>
              <input type="time" value={heureArrivee} onChange={(e) => setHeureArrivee(e.target.value)}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
            </div>
            <div>
              <label className="admin-text-muted text-xs mb-1 block">Heure depart</label>
              <input type="time" value={heureDepart} onChange={(e) => setHeureDepart(e.target.value)}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
            </div>
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block">Technicien</label>
            <select value={technicianId} onChange={(e) => setTechnicianId(e.target.value)}
              className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full">
              <option value="">Aucun</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block">
              Adresse d&apos;intervention <span className="opacity-60">(si differente du client)</span>
            </label>
            <div className="grid md:grid-cols-3 gap-3">
              <input type="text" placeholder="Adresse" value={interventionAddress}
                onChange={(e) => setInterventionAddress(e.target.value)}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full md:col-span-2" />
              <input type="text" placeholder="Ville" value={interventionCity}
                onChange={(e) => setInterventionCity(e.target.value)}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
            </div>
            <input type="text" placeholder="Code postal" value={interventionPostalCode}
              onChange={(e) => setInterventionPostalCode(e.target.value)}
              className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full mt-3 md:w-48" />
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block">Description du travail</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block">Notes internes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
          </div>
          <label className="flex items-center gap-2 text-sm admin-text cursor-pointer">
            <input type="checkbox" checked={visibleAuClient}
              onChange={(e) => setVisibleAuClient(e.target.checked)}
              className="rounded" />
            Visible dans le portail client
          </label>
        </div>

        {/* Items */}
        <div className="admin-card border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="admin-text font-bold">Pieces utilisees</h2>
            <button type="button" onClick={() => setCatalogOpen(true)}
              className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium">
              <i className="fas fa-book-open mr-2"></i>Parcourir le catalogue
            </button>
          </div>

          {items.map((it, i) => {
            if (it.itemType === "discount") {
              const computed = itemsComputed[i];
              return (
                <div key={i} className="border border-green-500/30 bg-green-500/5 rounded-lg p-3">
                  <div className="flex items-start gap-3 mb-2">
                    <i className="fas fa-tag text-green-500 mt-1.5"></i>
                    <input
                      value={it.description}
                      onChange={(e) => updateItem(i, "description", e.target.value)}
                      placeholder="Description de l'escompte..."
                      className="admin-input border rounded px-2 py-1.5 text-sm flex-1"
                    />
                    <button type="button" onClick={() => removeItem(i)} className="text-red-500 text-sm">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <select
                      value={it.discountMode}
                      onChange={(e) => updateItem(i, "discountMode", e.target.value)}
                      className="admin-input border rounded px-2 py-1 text-xs"
                    >
                      <option value="percent">Pourcentage</option>
                      <option value="amount">Montant fixe</option>
                    </select>
                    {it.discountMode === "percent" ? (
                      <>
                        <input
                          type="number" value={it.discountPercent} min="0" max="100" step="0.5"
                          onChange={(e) => updateItem(i, "discountPercent", parseFloat(e.target.value) || 0)}
                          className="admin-input border rounded px-2 py-1 text-sm w-20 text-center"
                        />
                        <span className="admin-text-muted text-xs">%</span>
                        <span className="admin-text-muted text-xs">sur {piecesSubtotalBase.toFixed(2)}$</span>
                      </>
                    ) : (
                      <>
                        <input
                          type="number" value={it.discountAmount} min="0" step="0.01"
                          onChange={(e) => updateItem(i, "discountAmount", parseFloat(e.target.value) || 0)}
                          className="admin-input border rounded px-2 py-1 text-sm w-24 text-right"
                        />
                        <span className="admin-text-muted text-xs">$</span>
                      </>
                    )}
                    <span className="ml-auto font-bold text-green-600">
                      {computed.unitPrice.toFixed(2)}$
                    </span>
                  </div>
                </div>
              );
            }
            return (
              <div key={i} className="border admin-border rounded-lg p-3">
                <div className="flex items-start gap-3 mb-2">
                  <input
                    value={it.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    placeholder="Description..."
                    className="admin-input border rounded px-2 py-1.5 text-sm flex-1"
                  />
                  <button type="button" onClick={() => removeItem(i)} className="text-red-500 text-sm">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <label className="admin-text-muted text-xs">Qte</label>
                  <input type="number" value={it.quantity} min="0" step="1"
                    onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)}
                    className="admin-input border rounded px-2 py-1 text-sm w-20 text-center" />
                  <label className="admin-text-muted text-xs ml-2">Prix</label>
                  <input type="number" value={it.unitPrice} min="0" step="0.01"
                    onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="admin-input border rounded px-2 py-1 text-sm w-24 text-right" />
                  <span className="admin-text-muted text-xs">$</span>
                  <span className="ml-auto font-bold text-[var(--color-red)]">
                    {(Number(it.quantity) * Number(it.unitPrice)).toFixed(2)}$
                  </span>
                </div>
              </div>
            );
          })}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button type="button" onClick={addCustomItem}
              className="py-2.5 border-2 border-dashed admin-border rounded-lg admin-text-muted text-sm admin-hover">
              <i className="fas fa-plus mr-2"></i>Ligne personnalisee
            </button>
            <button type="button" onClick={() => addDiscount("percent")}
              className="py-2.5 border-2 border-dashed border-green-500/30 rounded-lg text-green-600 text-sm hover:bg-green-500/5">
              <i className="fas fa-percent mr-2"></i>Escompte %
            </button>
            <button type="button" onClick={() => addDiscount("amount")}
              className="py-2.5 border-2 border-dashed border-green-500/30 rounded-lg text-green-600 text-sm hover:bg-green-500/5">
              <i className="fas fa-dollar-sign mr-2"></i>Reduction $
            </button>
          </div>
        </div>

        {/* Labor + Totals */}
        <div className="admin-card border rounded-xl p-6 space-y-4">
          <h2 className="admin-text font-bold">Main d&apos;oeuvre</h2>
          <div className="flex items-center gap-3">
            <input type="number" value={laborHours} min="0" step="0.25"
              onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
              className="admin-input border rounded-lg px-3 py-2 text-sm w-24 text-center" />
            <span className="admin-text-muted text-sm">heures × {settings.labor_rate_per_hour.toFixed(2)}$/h</span>
            <span className="ml-auto font-bold text-[var(--color-red)]">{totalLabor.toFixed(2)}$</span>
          </div>

          <div className="border-t admin-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="admin-text-muted">Pieces</span><span className="admin-text">{totalPieces.toFixed(2)}$</span></div>
            <div className="flex justify-between"><span className="admin-text-muted">Main d&apos;oeuvre</span><span className="admin-text">{totalLabor.toFixed(2)}$</span></div>
            <div className="flex justify-between border-t admin-border pt-2"><span className="admin-text-muted">Sous-total</span><span className="admin-text">{subtotal.toFixed(2)}$</span></div>
            <div className="flex justify-between text-xs"><span className="admin-text-muted">TPS ({(settings.tps_rate*100).toFixed(1)}%)</span><span className="admin-text-muted">{tps.toFixed(2)}$</span></div>
            <div className="flex justify-between text-xs"><span className="admin-text-muted">TVQ ({(settings.tvq_rate*100).toFixed(3)}%)</span><span className="admin-text-muted">{tvq.toFixed(2)}$</span></div>
            <div className="flex justify-between text-lg font-bold border-t admin-border pt-2">
              <span className="admin-text">Total</span>
              <span className="text-[var(--color-red)]">{total.toFixed(2)}$</span>
            </div>
          </div>
        </div>

        {/* Statut + Submit */}
        <div className="admin-card border rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div>
              <label className="admin-text-muted text-xs mb-1 block">Statut</label>
              <select value={statut} onChange={(e) => setStatut(e.target.value)}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm">
                <option value="draft">Brouillon</option>
                <option value="completed">Complete</option>
                <option value="sent">Envoye</option>
              </select>
            </div>
            {error && <p className="text-sm text-red-500 md:ml-auto">{error}</p>}
            <button type="submit" disabled={saving || !selectedClient}
              className="md:ml-auto px-6 py-3 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? "Creation..." : "Creer le bon"}
            </button>
          </div>
        </div>
      </form>

      <CatalogPicker open={catalogOpen} onClose={() => setCatalogOpen(false)} onPick={addProduct} />
      <ClientPicker
        open={clientPickerOpen}
        onClose={() => setClientPickerOpen(false)}
        onPick={(c) => { setSelectedClient(c); setClientPickerOpen(false); }}
      />
    </div>
  );
}
