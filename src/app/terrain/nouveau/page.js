"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SignaturePad from "@/components/terrain/SignaturePad";

const STEPS = ["Client", "Travail", "Pieces", "Signature"];
const CATEGORY_LABELS = {
  thermo: "Thermo",
  installation: "Installation",
  ajustement: "Ajustement",
  quincaillerie: "Quincaillerie",
  vitre: "Vitre",
  autre: "Autre",
};

export default function NouveauBon() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1: Client
  const [clientId, setClientId] = useState(null);
  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState([]);
  const [clientData, setClientData] = useState({ name: "", phone: "", email: "", address: "", city: "" });
  const [clientType, setClientType] = useState("particulier");
  const [isNewClient, setIsNewClient] = useState(false);

  // Step 2: Travail
  const [heureArrivee, setHeureArrivee] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });
  const [heureDepart, setHeureDepart] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Step 3: Pieces (particulier flow)
  const [items, setItems] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [laborHours, setLaborHours] = useState(0);

  // Step 3: Sections (gestionnaire flow)
  const [sections, setSections] = useState([]); // [{unitCode, items:[]}]
  const [editingIdx, setEditingIdx] = useState(null); // index in sections
  const [newUnitCode, setNewUnitCode] = useState("");
  const [showCategory, setShowCategory] = useState(null); // category key for picker

  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState({ labor_rate_per_hour: 85, tps_rate: 0.05, tvq_rate: 0.09975 });

  // Known units for the current gestionnaire client
  const [knownUnits, setKnownUnits] = useState([]); // [{id, code, description}]

  // Step 4: Signature
  const [signatureData, setSignatureData] = useState(null);

  const isB2B = clientType === "gestionnaire";

  // Load settings + services
  useEffect(() => {
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
    fetch("/api/technician/services")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setServices(d); })
      .catch(() => {});
  }, []);

  // Client search
  const searchTimer = useRef(null);
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (clientSearch.length < 2) { setClientResults([]); return; }
      fetch(`/api/technician/clients?q=${encodeURIComponent(clientSearch)}`)
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setClientResults(data); })
        .catch(() => {});
    }, 300);
  }, [clientSearch]);

  // Product search
  const prodTimer = useRef(null);
  useEffect(() => {
    clearTimeout(prodTimer.current);
    prodTimer.current = setTimeout(() => {
      if (productSearch.length < 2) { setProductResults([]); return; }
      fetch(`/api/technician/products?q=${encodeURIComponent(productSearch)}`)
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setProductResults(data); })
        .catch(() => {});
    }, 300);
  }, [productSearch]);

  function selectClient(client) {
    setClientId(client.id);
    setClientData({
      name: client.name,
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
      city: client.city || "",
    });
    setClientType(client.type || "particulier");
    setClientSearch("");
    setClientResults([]);
    setIsNewClient(false);
    if (client.type === "gestionnaire") {
      fetch(`/api/technician/clients/${client.id}/units`)
        .then(async (r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((data) => {
          console.log(`[units] ${Array.isArray(data) ? data.length : 0} unites pour client ${client.id}`);
          setKnownUnits(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error("[units] fetch failed:", err);
          setKnownUnits([]);
        });
    } else {
      setKnownUnits([]);
    }
  }

  // ─── Flat items (particulier) ─────────────────────────────────
  function addProduct(product, targetItems = items, setTargetItems = setItems) {
    setTargetItems([...targetItems, {
      productId: product.id,
      description: `${product.sku} — ${product.name}`,
      quantity: 1,
      unitPrice: product.price,
      itemType: "piece",
    }]);
    setProductSearch("");
    setProductResults([]);
  }
  function addCustomItem(targetItems = items, setTargetItems = setItems) {
    setTargetItems([...targetItems, { productId: null, description: "", quantity: 1, unitPrice: 0, itemType: "piece" }]);
  }
  function updateItem(idx, field, value, targetItems = items, setTargetItems = setItems) {
    setTargetItems(targetItems.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }
  function removeItem(idx, targetItems = items, setTargetItems = setItems) {
    setTargetItems(targetItems.filter((_, i) => i !== idx));
  }

  // ─── Sections (gestionnaire) ──────────────────────────────────
  function addSection() {
    const code = newUnitCode.trim().toUpperCase();
    if (!code) return;

    // Deja dans la visite courante ? -> focus sur la section existante
    const existingIdx = sections.findIndex((s) => s.unitCode === code);
    if (existingIdx !== -1) {
      setEditingIdx(existingIdx);
      setNewUnitCode("");
      return;
    }

    // Deja connue chez le client ? -> utiliser la version canonique + description
    const known = knownUnits.find((u) => u.code === code);
    if (known) {
      addSectionFromKnown(known);
      setNewUnitCode("");
      return;
    }

    // Nouveau code -> ajoute la section (la ClientUnit sera upsert au submit)
    const newSec = { unitCode: code, items: [] };
    setSections((prev) => [...prev, newSec]);
    setNewUnitCode("");
    setEditingIdx(sections.length);
  }
  function addSectionFromKnown(unit) {
    // Skip if already in current visit
    if (sections.some((s) => s.unitCode === unit.code)) {
      const idx = sections.findIndex((s) => s.unitCode === unit.code);
      setEditingIdx(idx);
      return;
    }
    const newSec = { unitCode: unit.code, items: [] };
    setSections((prev) => [...prev, newSec]);
    setEditingIdx(sections.length);
  }
  function removeSection(idx) {
    if (!confirm("Retirer cette unite ?")) return;
    setSections((prev) => prev.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  }

  const currentSection = editingIdx !== null ? sections[editingIdx] : null;
  function updateCurrentItems(nextItems) {
    setSections((prev) => prev.map((s, i) => i === editingIdx ? { ...s, items: nextItems } : s));
  }
  function addServiceToCurrent(service) {
    if (!currentSection) return;
    updateCurrentItems([...currentSection.items, {
      serviceId: service.id,
      description: service.name,
      quantity: 1,
      unitPrice: Number(service.price),
      itemType: "piece",
    }]);
  }
  function addProductToCurrent(p) {
    if (!currentSection) return;
    updateCurrentItems([...currentSection.items, {
      productId: p.id,
      description: `${p.sku} — ${p.name}`,
      quantity: 1,
      unitPrice: Number(p.price),
      itemType: "piece",
    }]);
    setProductSearch("");
    setProductResults([]);
  }
  function addCustomToCurrent() {
    if (!currentSection) return;
    updateCurrentItems([...currentSection.items, {
      productId: null, description: "", quantity: 1, unitPrice: 0, itemType: "piece",
    }]);
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/technician/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        setPhotos((prev) => [...prev, url]);
      }
    } catch {}
    setUploading(false);
  }

  // ─── Totals ───────────────────────────────────────────────────
  const allItems = isB2B ? sections.flatMap((s) => s.items) : items;
  const totalPieces = allItems.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unitPrice), 0);
  const totalLabor = Number(laborHours) * settings.labor_rate_per_hour;
  const subtotal = totalPieces + totalLabor;
  const tps = subtotal * settings.tps_rate;
  const tvq = subtotal * settings.tvq_rate;
  const total = subtotal + tps + tvq;

  const presets = services.filter((s) => s.isPreset);
  const servicesByCategory = services.reduce((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  async function handleSubmit(statut = "completed") {
    setSaving(true);
    try {
      let finalClientId = clientId;
      if (isNewClient && !clientId) {
        const cRes = await fetch("/api/technician/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...clientData, type: clientType }),
        });
        const newClient = await cRes.json();
        finalClientId = newClient.id;
      }

      let signatureUrl = null;
      if (signatureData) {
        const blob = await (await fetch(signatureData)).blob();
        const formData = new FormData();
        formData.append("file", blob, "signature.png");
        const sRes = await fetch("/api/technician/upload", { method: "POST", body: formData });
        if (sRes.ok) {
          const { url } = await sRes.json();
          signatureUrl = url;
        }
      }

      const payload = {
        clientId: finalClientId,
        date: new Date().toISOString(),
        heureArrivee,
        heureDepart,
        description,
        photos,
        signatureUrl,
        laborHours,
        statut,
      };

      if (isB2B) {
        payload.sections = sections.map((s) => ({
          unitCode: s.unitCode,
          items: s.items.map((i) => ({
            productId: i.productId,
            serviceId: i.serviceId,
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            itemType: i.itemType,
          })),
        }));
      } else {
        payload.items = items.map((i) => ({
          productId: i.productId,
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          itemType: i.itemType,
        }));
      }

      const res = await fetch("/api/technician/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) router.push("/terrain");
    } catch {}
    setSaving(false);
  }

  const inputClass = "w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[var(--color-red)] transition-colors";

  return (
    <div className="min-h-dvh bg-[#0a0f1a] text-white">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-white/10">
        <button onClick={() => step > 0 ? setStep(step - 1) : router.push("/terrain")} className="text-white/60 text-sm">
          <i className="fas fa-arrow-left mr-2"></i>
          {step > 0 ? "Retour" : "Annuler"}
        </button>
        <h1 className="text-sm font-bold">Nouveau bon</h1>
        <button
          onClick={() => handleSubmit("draft")}
          disabled={saving || (!clientId && !isNewClient)}
          className="text-[var(--color-red)] text-sm font-medium disabled:opacity-30"
        >
          Brouillon
        </button>
      </div>

      {/* Step indicators */}
      <div className="px-4 py-3 flex gap-2">
        {STEPS.map((label, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              i === step ? "bg-[var(--color-red)] text-white" : i < step ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/30"
            }`}>
            {i < step ? <i className="fas fa-check mr-1"></i> : null}
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* STEP 0: Client */}
        {step === 0 && (
          <div className="space-y-4">
            {!isNewClient && !clientId && (
              <>
                <input type="text" placeholder="Rechercher un client (nom, tel, email)..."
                  value={clientSearch} onChange={(e) => setClientSearch(e.target.value)}
                  className={inputClass} autoFocus />
                {clientResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {clientResults.map((c) => (
                      <button key={c.id} onClick={() => selectClient(c)}
                        className="w-full text-left bg-white/5 rounded-xl p-3 border border-white/10 active:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{c.name}</p>
                          {c.type === "gestionnaire" && (
                            <span className="text-[9px] uppercase bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">B2B</span>
                          )}
                        </div>
                        <p className="text-white/40 text-xs">{c.phone} {c.address ? `• ${c.address}` : ""}</p>
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => setIsNewClient(true)}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-white/20 text-white/50 text-sm font-medium active:bg-white/5">
                  <i className="fas fa-plus mr-2"></i>Nouveau client
                </button>
              </>
            )}

            {(isNewClient || clientId) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-white/70">
                    {clientId ? "Client selectionne" : "Nouveau client"}
                  </h2>
                  <button onClick={() => {
                    setClientId(null); setIsNewClient(false); setClientType("particulier");
                    setClientData({ name: "", phone: "", email: "", address: "", city: "" });
                    setSections([]);
                  }} className="text-xs text-[var(--color-red)]">Changer</button>
                </div>

                {isNewClient && (
                  <div className="flex gap-2">
                    <button onClick={() => setClientType("particulier")}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium ${
                        clientType === "particulier" ? "bg-[var(--color-red)] text-white" : "bg-white/5 text-white/50 border border-white/10"
                      }`}>
                      <i className="fas fa-user mr-1"></i>Particulier
                    </button>
                    <button onClick={() => setClientType("gestionnaire")}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium ${
                        clientType === "gestionnaire" ? "bg-[var(--color-red)] text-white" : "bg-white/5 text-white/50 border border-white/10"
                      }`}>
                      <i className="fas fa-building mr-1"></i>Gestionnaire
                    </button>
                  </div>
                )}
                {!isNewClient && clientType === "gestionnaire" && (
                  <div className="space-y-2">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 text-xs text-blue-300 flex items-center justify-between">
                      <span><i className="fas fa-building mr-1"></i>Client B2B — travaux par unite</span>
                      <span className="font-bold">{knownUnits.length} unite{knownUnits.length !== 1 ? "s" : ""}</span>
                    </div>
                    {knownUnits.length > 0 && (
                      <div>
                        <p className="text-white/40 text-xs mb-2">Tape une unite pour commencer, ou continue a l&apos;etape suivante</p>
                        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                          {knownUnits.map((u) => {
                            const already = sections.some((s) => s.unitCode === u.code);
                            return (
                              <button key={u.id}
                                onClick={() => { addSectionFromKnown(u); setStep(2); }}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                                  already
                                    ? "bg-green-500/20 text-green-400 border border-green-500/40"
                                    : "bg-white/5 text-white border border-white/10 active:bg-white/10"
                                }`}
                                title={u.description || ""}>
                                {already && <i className="fas fa-check text-[9px] mr-1"></i>}
                                {u.code}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {knownUnits.length === 0 && (
                      <p className="text-white/40 text-xs italic">
                        Aucune unite pre-enregistree. Tu pourras en ajouter a l&apos;etape Pieces.
                      </p>
                    )}
                  </div>
                )}

                <input placeholder="Nom complet *" value={clientData.name}
                  onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                  className={inputClass} readOnly={!!clientId} />
                <input placeholder="Telephone" value={clientData.phone}
                  onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                  className={inputClass} readOnly={!!clientId} />
                <input placeholder="Email" value={clientData.email}
                  onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                  className={inputClass} readOnly={!!clientId} />
                <input placeholder="Adresse" value={clientData.address}
                  onChange={(e) => setClientData({ ...clientData, address: e.target.value })}
                  className={inputClass} />
                <input placeholder="Ville" value={clientData.city}
                  onChange={(e) => setClientData({ ...clientData, city: e.target.value })}
                  className={inputClass} />
              </div>
            )}

            {(clientId || (isNewClient && clientData.name)) && (
              <button onClick={() => setStep(1)}
                className="w-full py-4 rounded-xl bg-[var(--color-red)] text-white font-bold text-sm mt-4 active:bg-[var(--color-red-dark)] transition-colors">
                Suivant <i className="fas fa-arrow-right ml-2"></i>
              </button>
            )}
          </div>
        )}

        {/* STEP 1: Travail + Temps + Photos */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs mb-1 block">Heure arrivee</label>
                <input type="time" value={heureArrivee} onChange={(e) => setHeureArrivee(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">Heure depart</label>
                <input type="time" value={heureDepart} onChange={(e) => setHeureDepart(e.target.value)} className={inputClass} />
              </div>
            </div>

            {heureArrivee && heureDepart && (
              <p className="text-white/50 text-xs">
                Duree: {(() => {
                  const [ah, am] = heureArrivee.split(":").map(Number);
                  const [dh, dm] = heureDepart.split(":").map(Number);
                  const mins = (dh * 60 + dm) - (ah * 60 + am);
                  if (mins <= 0) return "—";
                  const h = Math.floor(mins / 60); const m = mins % 60;
                  return `${h}h${m > 0 ? String(m).padStart(2, "0") : ""}`;
                })()}
              </p>
            )}

            <div>
              <label className="text-white/40 text-xs mb-1 block">Description du travail</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Decrivez le travail effectue..." rows={4} className={`${inputClass} resize-none`} />
            </div>

            <div>
              <label className="text-white/40 text-xs mb-2 block">Photos ({photos.length}/10)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {photos.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
              {photos.length < 10 && (
                <label className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-white/20 text-white/50 text-sm active:bg-white/5 cursor-pointer">
                  <i className={`fas ${uploading ? "fa-spinner fa-spin" : "fa-camera"}`}></i>
                  {uploading ? "Upload..." : "Prendre une photo"}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              )}
            </div>

            <button onClick={() => setStep(2)} className="w-full py-4 rounded-xl bg-[var(--color-red)] text-white font-bold text-sm active:bg-[var(--color-red-dark)] transition-colors">
              Suivant <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        )}

        {/* STEP 2: Pieces */}
        {step === 2 && !isB2B && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white/70">Pieces utilisees</h2>

            {/* Presets quick-add */}
            {presets.length > 0 && (
              <div>
                <p className="text-white/40 text-xs mb-2">Raccourcis</p>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((s) => (
                    <button key={s.id}
                      onClick={() => setItems([...items, {
                        serviceId: s.id, description: s.name, quantity: 1,
                        unitPrice: Number(s.price), itemType: "piece",
                      }])}
                      className="text-left bg-white/5 border border-white/10 rounded-xl p-3 active:bg-white/10">
                      <p className="text-xs font-medium">{s.name}</p>
                      <p className="text-[10px] text-[var(--color-red)] font-bold mt-1">{Number(s.price).toFixed(2)}$</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input type="text" placeholder="Rechercher une piece (nom ou SKU)..."
              value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className={inputClass} />
            {productResults.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {productResults.map((p) => (
                  <button key={p.id} onClick={() => addProduct(p)}
                    className="w-full text-left bg-white/5 rounded-lg px-3 py-2 text-sm active:bg-white/10 flex justify-between">
                    <span className="truncate">{p.sku} — {p.name}</span>
                    <span className="text-[var(--color-red)] font-bold shrink-0 ml-2">{p.price.toFixed(2)}$</span>
                  </button>
                ))}
              </div>
            )}

            {items.map((item, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex items-start justify-between mb-2">
                  {item.productId || item.serviceId ? (
                    <p className="text-sm flex-1">{item.description}</p>
                  ) : (
                    <input value={item.description}
                      onChange={(e) => updateItem(i, "description", e.target.value)}
                      placeholder="Description..."
                      className="bg-transparent text-sm text-white flex-1 focus:outline-none" />
                  )}
                  <button onClick={() => removeItem(i)} className="text-red-400 text-xs ml-2 shrink-0">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="flex items-center gap-1">
                    <label className="text-white/30 text-xs">Qte:</label>
                    <input type="number" value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)}
                      className="w-16 bg-white/10 rounded-lg px-2 py-1 text-sm text-center" min="0" step="1" />
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="text-white/30 text-xs">Prix:</label>
                    <input type="number" value={item.unitPrice}
                      onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="w-24 bg-white/10 rounded-lg px-2 py-1 text-sm text-right" min="0" step="0.01" />
                    <span className="text-white/30 text-xs">$</span>
                  </div>
                  <span className="text-[var(--color-red)] font-bold text-sm ml-auto">
                    {(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}$
                  </span>
                </div>
              </div>
            ))}

            <button onClick={() => addCustomItem()} className="w-full py-3 rounded-xl border-2 border-dashed border-white/20 text-white/50 text-sm active:bg-white/5">
              <i className="fas fa-plus mr-2"></i>Ligne personnalisee
            </button>

            <div className="border-t border-white/10 pt-4">
              <h2 className="text-sm font-bold text-white/70 mb-3">Main d&apos;oeuvre</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <input type="number" value={laborHours}
                    onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-white/10 rounded-lg px-3 py-2 text-sm text-center" min="0" step="0.25" />
                  <span className="text-white/40 text-sm">h x {settings.labor_rate_per_hour.toFixed(2)}$/h</span>
                </div>
                <span className="text-[var(--color-red)] font-bold">{totalLabor.toFixed(2)}$</span>
              </div>
            </div>

            <TotalsBox totalPieces={totalPieces} totalLabor={totalLabor} subtotal={subtotal} tps={tps} tvq={tvq} total={total} />

            <button onClick={() => setStep(3)} className="w-full py-4 rounded-xl bg-[var(--color-red)] text-white font-bold text-sm active:bg-[var(--color-red-dark)] transition-colors">
              Suivant — Signature <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        )}

        {/* STEP 2 B2B: Sections */}
        {step === 2 && isB2B && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white/70">Unites visitees ({sections.length})</h2>
            </div>

            {sections.length === 0 && (
              <p className="text-white/40 text-xs">Ajoute les unites ou des travaux ont ete effectues.</p>
            )}

            {sections.map((s, idx) => {
              const subtot = s.items.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unitPrice), 0);
              return (
                <div key={idx}
                  onClick={() => setEditingIdx(idx)}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 active:bg-white/10 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-base font-mono">{s.unitCode}</p>
                      <p className="text-white/40 text-xs">{s.items.length} item{s.items.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[var(--color-red)] font-bold">{subtot.toFixed(2)}$</p>
                      <button onClick={(e) => { e.stopPropagation(); removeSection(idx); }}
                        className="text-red-400 text-xs mt-1">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Known units for this client */}
            {knownUnits.length > 0 && (
              <div>
                <p className="text-white/40 text-xs mb-2">
                  Unites connues ({knownUnits.length}) — tape pour ajouter
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {knownUnits.map((u) => {
                    const already = sections.some((s) => s.unitCode === u.code);
                    return (
                      <button key={u.id}
                        onClick={() => addSectionFromKnown(u)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                          already
                            ? "bg-green-500/20 text-green-400 border border-green-500/40"
                            : "bg-white/5 text-white border border-white/10 active:bg-white/10"
                        }`}
                        title={u.description || ""}>
                        {already && <i className="fas fa-check text-[9px] mr-1"></i>}
                        {u.code}
                        {u.description && <span className="opacity-50 ml-1 font-sans">· {u.description.slice(0, 15)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <input type="text" placeholder="Nouveau code (ex: F-0411)"
                value={newUnitCode}
                onChange={(e) => setNewUnitCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && addSection()}
                className={inputClass} />
              <button onClick={addSection} disabled={!newUnitCode.trim()}
                className="px-5 rounded-xl bg-[var(--color-red)] text-white font-bold text-sm disabled:opacity-30">
                <i className="fas fa-plus"></i>
              </button>
            </div>
            {knownUnits.length === 0 && sections.length === 0 && (
              <p className="text-white/40 text-xs italic">
                Aucune unite enregistree pour ce client. Celle que tu saisis sera memorisee pour les prochaines visites.
              </p>
            )}

            <div className="border-t border-white/10 pt-4">
              <h2 className="text-sm font-bold text-white/70 mb-3">Main d&apos;oeuvre (visite)</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <input type="number" value={laborHours}
                    onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-white/10 rounded-lg px-3 py-2 text-sm text-center" min="0" step="0.25" />
                  <span className="text-white/40 text-sm">h x {settings.labor_rate_per_hour.toFixed(2)}$/h</span>
                </div>
                <span className="text-[var(--color-red)] font-bold">{totalLabor.toFixed(2)}$</span>
              </div>
            </div>

            <TotalsBox totalPieces={totalPieces} totalLabor={totalLabor} subtotal={subtotal} tps={tps} tvq={tvq} total={total} />

            <button onClick={() => setStep(3)} disabled={sections.length === 0}
              className="w-full py-4 rounded-xl bg-[var(--color-red)] text-white font-bold text-sm active:bg-[var(--color-red-dark)] transition-colors disabled:opacity-30">
              Suivant — Signature <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        )}

        {/* STEP 3: Recap + Signature */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="font-bold mb-2">{clientData.name}</h3>
              <p className="text-white/40 text-sm">{clientData.address}{clientData.city ? `, ${clientData.city}` : ""}</p>
              <p className="text-white/40 text-sm">{clientData.phone}</p>
              <div className="border-t border-white/10 mt-3 pt-3">
                <p className="text-sm text-white/50">{heureArrivee} - {heureDepart}</p>
                {description && <p className="text-sm text-white/70 mt-1">{description}</p>}
              </div>

              {isB2B && sections.length > 0 && (
                <div className="border-t border-white/10 mt-3 pt-3 space-y-2">
                  {sections.map((s, idx) => {
                    const subtot = s.items.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unitPrice), 0);
                    return (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="font-mono text-white/60">{s.unitCode}</span>
                        <span className="text-white/80">{subtot.toFixed(2)}$</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-white/10 mt-3 pt-3 flex justify-between">
                <span className="text-sm">
                  {isB2B
                    ? `${sections.length} unite${sections.length > 1 ? "s" : ""} + ${laborHours}h`
                    : `${items.length} item${items.length !== 1 ? "s" : ""} + ${laborHours}h`}
                </span>
                <span className="text-[var(--color-red)] font-bold text-lg">{total.toFixed(2)}$</span>
              </div>
            </div>

            <h2 className="text-sm font-bold text-white/70">Signature du client</h2>
            {signatureData ? (
              <div className="text-center">
                <img src={signatureData} alt="Signature" className="max-h-32 mx-auto rounded-lg border border-white/10 mb-3" />
                <button onClick={() => setSignatureData(null)} className="text-[var(--color-red)] text-sm">Refaire la signature</button>
              </div>
            ) : (
              <SignaturePad onSave={setSignatureData} />
            )}

            <button onClick={() => handleSubmit("completed")} disabled={saving || !signatureData}
              className="w-full py-5 rounded-xl bg-green-600 text-white font-bold text-lg disabled:opacity-30 active:bg-green-700 transition-colors mt-4">
              {saving ? (<><i className="fas fa-spinner fa-spin mr-2"></i>Envoi en cours...</>) : (<><i className="fas fa-check-circle mr-2"></i>Completer le bon</>)}
            </button>
          </div>
        )}
      </div>

      {/* Section detail overlay */}
      {editingIdx !== null && currentSection && (
        <div className="fixed inset-0 z-50 bg-[#0a0f1a] overflow-y-auto">
          <div className="px-4 py-4 flex items-center justify-between border-b border-white/10 sticky top-0 bg-[#0a0f1a] z-10">
            <button onClick={() => { setEditingIdx(null); setShowCategory(null); setProductSearch(""); setProductResults([]); }}
              className="text-white/60 text-sm">
              <i className="fas fa-arrow-left mr-2"></i>Retour
            </button>
            <h1 className="text-sm font-bold font-mono">{currentSection.unitCode}</h1>
            <span className="text-[var(--color-red)] font-bold text-sm">
              {currentSection.items.reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0).toFixed(2)}$
            </span>
          </div>

          <div className="px-4 py-4 space-y-4">
            {/* Presets */}
            {!showCategory && presets.length > 0 && (
              <div>
                <p className="text-white/40 text-xs mb-2">Raccourcis</p>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((s) => (
                    <button key={s.id} onClick={() => addServiceToCurrent(s)}
                      className="text-left bg-white/5 border border-white/10 rounded-xl p-3 active:bg-white/10">
                      <p className="text-xs font-medium">{s.name}</p>
                      <p className="text-[10px] text-[var(--color-red)] font-bold mt-1">{Number(s.price).toFixed(2)}$</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category picker */}
            {!showCategory && (
              <div>
                <p className="text-white/40 text-xs mb-2">Par categorie</p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(servicesByCategory).map((cat) => (
                    <button key={cat} onClick={() => setShowCategory(cat)}
                      className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium active:bg-white/10">
                      {CATEGORY_LABELS[cat] || cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category services list */}
            {showCategory && (
              <div>
                <button onClick={() => setShowCategory(null)} className="text-white/60 text-xs mb-3">
                  <i className="fas fa-arrow-left mr-1"></i>{CATEGORY_LABELS[showCategory] || showCategory}
                </button>
                <div className="space-y-1">
                  {(servicesByCategory[showCategory] || []).map((s) => (
                    <button key={s.id} onClick={() => { addServiceToCurrent(s); setShowCategory(null); }}
                      className="w-full text-left bg-white/5 rounded-lg px-3 py-2 text-sm active:bg-white/10 flex justify-between">
                      <span className="truncate">{s.name}</span>
                      <span className="text-[var(--color-red)] font-bold shrink-0 ml-2">{Number(s.price).toFixed(2)}$</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product search */}
            {!showCategory && (
              <>
                <input type="text" placeholder="Chercher dans le catalogue..."
                  value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className={inputClass} />
                {productResults.length > 0 && (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {productResults.map((p) => (
                      <button key={p.id} onClick={() => addProductToCurrent(p)}
                        className="w-full text-left bg-white/5 rounded-lg px-3 py-2 text-sm active:bg-white/10 flex justify-between">
                        <span className="truncate">{p.sku} — {p.name}</span>
                        <span className="text-[var(--color-red)] font-bold shrink-0 ml-2">{p.price.toFixed(2)}$</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Current items */}
            {currentSection.items.length > 0 && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <p className="text-white/40 text-xs">Items ({currentSection.items.length})</p>
                {currentSection.items.map((item, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      {item.productId || item.serviceId ? (
                        <p className="text-sm flex-1">{item.description}</p>
                      ) : (
                        <input value={item.description}
                          onChange={(e) => updateCurrentItems(currentSection.items.map((it, j) => j === i ? { ...it, description: e.target.value } : it))}
                          placeholder="Description..." className="bg-transparent text-sm text-white flex-1 focus:outline-none" />
                      )}
                      <button onClick={() => updateCurrentItems(currentSection.items.filter((_, j) => j !== i))}
                        className="text-red-400 text-xs ml-2 shrink-0">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="flex items-center gap-1">
                        <label className="text-white/30 text-xs">Qte:</label>
                        <input type="number" value={item.quantity}
                          onChange={(e) => updateCurrentItems(currentSection.items.map((it, j) => j === i ? { ...it, quantity: parseFloat(e.target.value) || 0 } : it))}
                          className="w-16 bg-white/10 rounded-lg px-2 py-1 text-sm text-center" min="0" step="1" />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="text-white/30 text-xs">Prix:</label>
                        <input type="number" value={item.unitPrice}
                          onChange={(e) => updateCurrentItems(currentSection.items.map((it, j) => j === i ? { ...it, unitPrice: parseFloat(e.target.value) || 0 } : it))}
                          className="w-24 bg-white/10 rounded-lg px-2 py-1 text-sm text-right" min="0" step="0.01" />
                        <span className="text-white/30 text-xs">$</span>
                      </div>
                      <span className="text-[var(--color-red)] font-bold text-sm ml-auto">
                        {(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}$
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!showCategory && (
              <button onClick={addCustomToCurrent}
                className="w-full py-3 rounded-xl border-2 border-dashed border-white/20 text-white/50 text-sm active:bg-white/5">
                <i className="fas fa-plus mr-2"></i>Ligne personnalisee
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TotalsBox({ totalPieces, totalLabor, subtotal, tps, tvq, total }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-white/50">Pieces/services</span>
        <span>{totalPieces.toFixed(2)}$</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-white/50">Main d&apos;oeuvre</span>
        <span>{totalLabor.toFixed(2)}$</span>
      </div>
      <div className="flex justify-between text-sm border-t border-white/10 pt-2">
        <span className="text-white/50">Sous-total</span>
        <span>{subtotal.toFixed(2)}$</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-white/30">TPS (5%)</span>
        <span className="text-white/50">{tps.toFixed(2)}$</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-white/30">TVQ (9.975%)</span>
        <span className="text-white/50">{tvq.toFixed(2)}$</span>
      </div>
      <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-2">
        <span>Total</span>
        <span className="text-[var(--color-red)]">{total.toFixed(2)}$</span>
      </div>
    </div>
  );
}
