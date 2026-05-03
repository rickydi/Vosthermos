"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import CatalogPicker from "@/components/admin/CatalogPicker";
import ClientPicker from "@/components/admin/ClientPicker";
import { dateOnlyString, todayDateInput } from "@/lib/date-only";

const DRAFT_KEY = "vosthermos:nouveau-bon:draft";

function pad2(value) {
  return String(value).padStart(2, "0");
}

function normalizeTimeInput(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/[h.,]/g, ":");

  if (!raw) return "";

  let hours;
  let minutes;
  const compact = raw.match(/^(\d{3,4})$/);
  const separated = raw.match(/^(\d{1,2})(?::(\d{0,2}))?$/);

  if (compact) {
    const digits = compact[1];
    hours = Number(digits.slice(0, -2));
    minutes = Number(digits.slice(-2));
  } else if (separated) {
    hours = Number(separated[1]);
    minutes = separated[2] === "" || separated[2] === undefined ? 0 : Number(separated[2]);
  } else {
    return "";
  }

  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours > 23 || minutes > 59) return "";
  return `${pad2(hours)}:${pad2(minutes)}`;
}

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, index) => {
  const totalMinutes = index * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const value = `${pad2(hours)}:${pad2(minutes)}`;
  const suffix = hours < 12 ? "AM" : "PM";
  const hour12 = hours % 12 || 12;
  return {
    value,
    label: `${hour12}:${pad2(minutes)} ${suffix} (${pad2(hours)}h${pad2(minutes)})`,
  };
});

const LABOR_HOUR_OPTIONS = Array.from({ length: 16 * 4 + 1 }, (_, index) => {
  const value = index / 4;
  return { value, label: formatLaborHours(value) };
});

function formatLaborHours(value) {
  const totalMinutes = Math.round(Number(value || 0) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0 && minutes === 0) return "0h";
  return `${hours > 0 ? `${hours}h` : ""}${minutes > 0 ? pad2(minutes) : ""}`;
}

function timeLabel(value) {
  const normalized = normalizeTimeInput(value);
  const found = TIME_OPTIONS.find((option) => option.value === normalized);
  if (found) return found.label;
  return normalized ? `${normalized} (heure existante)` : "";
}

function normalizeWorkItem(it) {
  const unitPrice = Number(it.unitPrice);
  if ((it.itemType || "piece") === "discount") {
    return {
      productId: it.productId,
      serviceId: it.serviceId,
      description: it.description,
      quantity: Number(it.quantity) || 1,
      unitPrice,
      itemType: "discount",
      discountMode: "amount",
      discountPercent: 0,
      discountAmount: Math.abs(unitPrice || 0),
    };
  }
  return {
    productId: it.productId,
    serviceId: it.serviceId,
    description: it.description,
    quantity: Number(it.quantity),
    unitPrice,
    itemType: it.itemType || "piece",
  };
}

function TimeSelect({ label, value, onChange }) {
  const normalizedValue = normalizeTimeInput(value);
  const hasCustomValue = normalizedValue && !TIME_OPTIONS.some((option) => option.value === normalizedValue);

  return (
    <div>
      <label className="admin-text-muted text-xs mb-1 block">{label}</label>
      <select
        value={normalizedValue}
        onChange={(e) => onChange(e.target.value)}
        className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full"
      >
        <option value="">Aucune heure</option>
        {hasCustomValue && <option value={normalizedValue}>{timeLabel(normalizedValue)}</option>}
        {TIME_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

function LaborHoursSelect({ value, onChange }) {
  const normalized = Math.round(Number(value || 0) * 4) / 4;
  const hasCustomValue = normalized > 0 && !LABOR_HOUR_OPTIONS.some((option) => option.value === normalized);

  return (
    <select
      value={String(normalized)}
      onChange={(e) => onChange(Number(e.target.value))}
      className="admin-input border rounded-lg px-3 py-2.5 text-sm w-36"
    >
      {hasCustomValue && <option value={String(normalized)}>{formatLaborHours(normalized)}</option>}
      {LABOR_HOUR_OPTIONS.map((option) => (
        <option key={option.value} value={String(option.value)}>{option.label}</option>
      ))}
    </select>
  );
}

function LaborRateInput({ value, onChange, onBlur }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="labor-rate" className="admin-text-muted text-xs font-bold whitespace-nowrap">Taux</label>
      <div className="relative">
        <input
          id="labor-rate"
          type="text"
          inputMode="decimal"
          value={value}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          className="admin-input border rounded-lg pl-3 pr-10 py-2.5 text-sm w-28"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 admin-text-muted text-xs">$/h</span>
      </div>
    </div>
  );
}

function HelpBubble({ text }) {
  return (
    <span className="relative inline-flex items-center">
      <i className="fas fa-circle-question text-[11px] opacity-70"></i>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-64 -translate-x-1/2 rounded-lg border admin-border bg-neutral-950 px-3 py-2 text-left text-[11px] font-normal leading-snug text-white shadow-xl group-hover:block group-focus-visible:block">
        {text}
      </span>
    </span>
  );
}

export default function NouveauBonPage() {
  return (
    <Suspense fallback={<div className="p-6 lg:p-8 admin-text-muted"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement...</div>}>
      <NouveauBonAdmin />
    </Suspense>
  );
}

function NouveauBonAdmin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const invoiceMode = searchParams.get("mode") === "invoice";
  const [saving, setSaving] = useState(false);
  const [savingAction, setSavingAction] = useState(null);
  const [error, setError] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(!!editId);

  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [quickClient, setQuickClient] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    type: "particulier",
  });
  const clientTimer = useRef(null);
  const draftReady = useRef(false);

  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState("");

  const [date, setDate] = useState(() => todayDateInput());
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
  const [catalogTarget, setCatalogTarget] = useState(null); // null = flat, number = section index

  const [services, setServices] = useState([]);
  const [knownUnits, setKnownUnits] = useState([]);
  const [sections, setSections] = useState([]); // [{unitCode, items:[]}]
  const [newUnitCode, setNewUnitCode] = useState("");

  const [laborHours, setLaborHours] = useState(0);
  const [laborRate, setLaborRate] = useState(85);
  const [laborRateText, setLaborRateText] = useState("85.00");
  const [settings, setSettings] = useState({ labor_rate_per_hour: 85, tps_rate: 0.05, tvq_rate: 0.09975 });

  const isB2B = selectedClient?.type === "gestionnaire";

  function setLaborRateValue(value) {
    const parsedRate = Number(value);
    const nextRate = Number.isFinite(parsedRate) && parsedRate > 0 ? parsedRate : 85;
    setLaborRate(nextRate);
    setLaborRateText(nextRate.toFixed(2));
  }

  function handleLaborRateInput(rawValue) {
    const raw = rawValue.replace(/[^0-9.,]/g, "");
    setLaborRateText(raw);
    const nextRate = Number(raw.replace(",", "."));
    if (raw !== "" && Number.isFinite(nextRate) && nextRate > 0) {
      setLaborRate(nextRate);
    }
  }

  function commitLaborRateInput() {
    const nextRate = Number(String(laborRateText).replace(",", "."));
    setLaborRateValue(Number.isFinite(nextRate) && nextRate > 0 ? nextRate : laborRate);
  }

  useEffect(() => {
    fetch("/api/admin/technicians")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTechnicians(data.filter((t) => t.isActive)); })
      .catch(() => {});
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          const nextLaborRate = parseFloat(data.labor_rate_per_hour || 85);
          let shouldUseSettingsRate = !editId;
          if (!editId) {
            try {
              const draft = JSON.parse(window.localStorage.getItem(DRAFT_KEY) || "{}");
              if (draft.laborRate !== undefined) shouldUseSettingsRate = false;
            } catch {}
          }
          if (shouldUseSettingsRate) setLaborRateValue(nextLaborRate);
          setSettings({
            labor_rate_per_hour: nextLaborRate,
            tps_rate: parseFloat(data.tps_rate || 0.05),
            tvq_rate: parseFloat(data.tvq_rate || 0.09975),
          });
        }
      })
      .catch(() => {});
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setServices(d); })
      .catch(() => {});
  }, [editId]);

  useEffect(() => {
    if (editId) {
      draftReady.current = true;
      return;
    }

    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.selectedClient) setSelectedClient(draft.selectedClient);
      if (draft.technicianId !== undefined) setTechnicianId(draft.technicianId);
      if (draft.date) setDate(draft.date);
      if (draft.heureArrivee !== undefined) setHeureArrivee(draft.heureArrivee);
      if (draft.heureDepart !== undefined) setHeureDepart(draft.heureDepart);
      if (draft.description !== undefined) setDescription(draft.description);
      if (draft.notes !== undefined) setNotes(draft.notes);
      if (draft.statut) setStatut(draft.statut);
      if (draft.interventionAddress !== undefined) setInterventionAddress(draft.interventionAddress);
      if (draft.interventionCity !== undefined) setInterventionCity(draft.interventionCity);
      if (draft.interventionPostalCode !== undefined) setInterventionPostalCode(draft.interventionPostalCode);
      if (draft.visibleAuClient !== undefined) setVisibleAuClient(draft.visibleAuClient);
      if (Array.isArray(draft.items)) setItems(draft.items);
      if (Array.isArray(draft.sections)) setSections(draft.sections);
      if (draft.laborHours !== undefined) setLaborHours(draft.laborHours);
      if (draft.laborRate !== undefined) setLaborRateValue(Number(draft.laborRate) || 85);
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    } finally {
      draftReady.current = true;
    }
  }, [editId]);

  useEffect(() => {
    if (editId || !draftReady.current) return;
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify({
          selectedClient,
          technicianId,
          date,
          heureArrivee,
          heureDepart,
          description,
          notes,
          statut,
          interventionAddress,
          interventionCity,
          interventionPostalCode,
          visibleAuClient,
          items,
          sections,
          laborHours,
          laborRate,
        }));
      } catch {}
    }, 400);
    return () => clearTimeout(timer);
  }, [
    editId,
    selectedClient,
    technicianId,
    date,
    heureArrivee,
    heureDepart,
    description,
    notes,
    statut,
    interventionAddress,
    interventionCity,
    interventionPostalCode,
    visibleAuClient,
    items,
    sections,
    laborHours,
    laborRate,
  ]);

  // Fetch known units when a gestionnaire client is selected
  useEffect(() => {
    if (!selectedClient?.id || selectedClient.type !== "gestionnaire") {
      setKnownUnits([]);
      if (!editId) setSections([]);
      return;
    }
    fetch(`/api/admin/clients/${selectedClient.id}/units`)
      .then((r) => r.json())
      .then((d) => setKnownUnits(Array.isArray(d) ? d.filter((u) => u.isActive) : []))
      .catch(() => setKnownUnits([]));
  }, [selectedClient, editId]);

  // Load existing bon when ?edit=<id>
  useEffect(() => {
    if (!editId) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/work-orders/${editId}`);
        if (!res.ok) throw new Error("Bon introuvable");
        const wo = await res.json();
        setSelectedClient(wo.client);
        setTechnicianId(wo.technicianId ? String(wo.technicianId) : "");
        setDate(dateOnlyString(wo.date) || todayDateInput());
        const fmtHM = (dt) => {
          if (!dt) return "";
          const d = new Date(dt);
          return isNaN(d.getTime()) ? "" : `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        };
        setHeureArrivee(fmtHM(wo.arrivalAt));
        setHeureDepart(fmtHM(wo.departureAt));
        setDescription(wo.description || "");
        setNotes(wo.notes || "");
        setStatut(wo.statut || "draft");
        setInterventionAddress(wo.interventionAddress || "");
        setInterventionCity(wo.interventionCity || "");
        setInterventionPostalCode(wo.interventionPostalCode || "");
        setVisibleAuClient(wo.visibleAuClient ?? true);
        setItems(Array.isArray(wo.items) ? wo.items.map(normalizeWorkItem) : []);
        setSections(Array.isArray(wo.sections) ? wo.sections.map((s) => ({
          unitCode: s.unitCode,
          items: (s.items || []).map(normalizeWorkItem),
        })) : []);
        // Reverse-compute laborHours from the rate frozen on this work order.
        const rate = Number(wo.laborRate) || settings.labor_rate_per_hour || 85;
        setLaborRateValue(rate);
        setLaborHours(rate > 0 ? Math.round((Number(wo.totalLabor) / rate) * 100) / 100 : 0);
      } catch (err) {
        setError(err.message || "Erreur chargement");
      } finally {
        setLoadingEdit(false);
      }
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

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
    const item = {
      productId: p.id,
      description: `${p.sku} — ${p.name}`,
      quantity: 1,
      unitPrice: Number(p.price),
      itemType: "piece",
    };
    if (catalogTarget !== null) {
      setSections((prev) => prev.map((s, i) => i === catalogTarget ? { ...s, items: [...s.items, item] } : s));
    } else {
      setItems((prev) => [...prev, item]);
    }
    setCatalogOpen(false);
    setCatalogTarget(null);
  }

  function addCustomItem() {
    setItems((prev) => [...prev, { productId: null, description: "", quantity: 1, unitPrice: 0, itemType: "piece" }]);
  }

  // ─── Sections (B2B) ─────────────────────────────────────────
  function addSection() {
    const code = newUnitCode.trim().toUpperCase();
    if (!code || !selectedClient) return;

    // 1. Deja dans le bon courant ?
    if (sections.some((s) => s.unitCode === code)) {
      setError(`Unite ${code} deja ajoutee a ce bon.`);
      return;
    }

    // 2. Deja connue chez le client ? -> utiliser la version canonique
    const existing = knownUnits.find((u) => u.code === code);
    if (existing) {
      setSections((prev) => [...prev, { unitCode: existing.code, items: [] }]);
      setNewUnitCode("");
      setError("");
      return;
    }

    // Nouvelle unite: on l'ajoute seulement au bon. Elle sera creee en DB au moment d'enregistrer.
    setSections((prev) => [...prev, { unitCode: code, items: [] }]);
    setNewUnitCode("");
    setError("");
  }
  function addSectionFromKnown(u) {
    if (sections.some((s) => s.unitCode === u.code)) return;
    setSections((prev) => [...prev, { unitCode: u.code, items: [] }]);
  }
  function removeSection(idx) {
    if (!confirm("Retirer cette unite et ses items?")) return;
    setSections((prev) => prev.filter((_, i) => i !== idx));
  }
  function addServiceToSection(sectionIdx, service) {
    const item = {
      serviceId: service.id,
      description: service.name,
      quantity: 1,
      unitPrice: Number(service.price),
      itemType: "piece",
    };
    setSections((prev) => prev.map((s, i) => i === sectionIdx ? { ...s, items: [...s.items, item] } : s));
  }
  function addCustomToSection(sectionIdx) {
    setSections((prev) => prev.map((s, i) => i === sectionIdx ? {
      ...s, items: [...s.items, { productId: null, serviceId: null, description: "", quantity: 1, unitPrice: 0, itemType: "piece" }],
    } : s));
  }
  function updateSectionItem(sectionIdx, itemIdx, field, value) {
    setSections((prev) => prev.map((s, i) => i === sectionIdx ? {
      ...s, items: s.items.map((it, j) => j === itemIdx ? { ...it, [field]: value } : it),
    } : s));
  }
  function removeSectionItem(sectionIdx, itemIdx) {
    setSections((prev) => prev.map((s, i) => i === sectionIdx ? {
      ...s, items: s.items.filter((_, j) => j !== itemIdx),
    } : s));
  }
  function openCatalogForSection(sectionIdx) {
    setCatalogTarget(sectionIdx);
    setCatalogOpen(true);
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
  const flatPiecesSubtotalBase = items
    .filter((it) => it.itemType !== "discount")
    .reduce((s, it) => s + Number(it.quantity) * Number(it.unitPrice), 0);
  const sectionPiecesSubtotalBase = sections.reduce((s, sec) => (
    s + sec.items
      .filter((it) => it.itemType !== "discount")
      .reduce((ss, it) => ss + Number(it.quantity) * Number(it.unitPrice), 0)
  ), 0);
  const piecesSubtotalBase = flatPiecesSubtotalBase + sectionPiecesSubtotalBase;

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

  const flatPieces = itemsComputed.reduce((s, it) => s + Number(it.quantity) * Number(it.unitPrice), 0);
  const sectionsPieces = sections.reduce((s, sec) => s + sec.items.reduce((ss, it) => ss + Number(it.quantity) * Number(it.unitPrice), 0), 0);
  const totalPieces = flatPieces + sectionsPieces;
  const totalLabor = Number(laborHours) * laborRate;
  const subtotal = totalPieces + totalLabor;
  const tps = subtotal * settings.tps_rate;
  const tvq = subtotal * settings.tvq_rate;
  const total = subtotal + tps + tvq;

  function fillInterventionFromClient(client, previousClient = null, force = false) {
    if (!client) return;
    const nextAddress = client.address || "";
    const nextCity = client.city || "";
    const nextPostal = client.postalCode || "";
    const previousAddress = previousClient?.address || "";
    const previousCity = previousClient?.city || "";
    const previousPostal = previousClient?.postalCode || "";

    setInterventionAddress((current) => (
      force || !current || (previousClient && current === previousAddress) ? nextAddress : current
    ));
    setInterventionCity((current) => (
      force || !current || (previousClient && current === previousCity) ? nextCity : current
    ));
    setInterventionPostalCode((current) => (
      force || !current || (previousClient && current === previousPostal) ? nextPostal : current
    ));
  }

  function selectClient(client) {
    const previousClient = selectedClient;
    setSelectedClient(client);
    fillInterventionFromClient(client, previousClient);
  }

  function clearSelectedClient() {
    const previousClient = selectedClient;
    if (previousClient) {
      setInterventionAddress((current) => current === (previousClient.address || "") ? "" : current);
      setInterventionCity((current) => current === (previousClient.city || "") ? "" : current);
      setInterventionPostalCode((current) => current === (previousClient.postalCode || "") ? "" : current);
    }
    setSelectedClient(null);
  }

  async function createQuickClient() {
    if (!quickClient.name.trim()) {
      setError("Nom du client requis");
      return;
    }

    setCreatingClient(true);
    setError("");
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...quickClient,
          name: quickClient.name.trim(),
          phone: quickClient.phone.trim() || null,
          email: quickClient.email.trim() || null,
          address: quickClient.address.trim() || null,
          city: quickClient.city.trim() || null,
          postalCode: quickClient.postalCode.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur creation client");
      }
      const client = await res.json();
      selectClient(client);
      setClientSearch("");
      setClientResults([]);
      setQuickClientOpen(false);
      setQuickClient({
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        postalCode: "",
        type: "particulier",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingClient(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedClient) { setError("Client requis"); return; }
    const submitAction = e.nativeEvent?.submitter?.value || "save";
    const normalizedArrival = normalizeTimeInput(heureArrivee);
    const normalizedDeparture = normalizeTimeInput(heureDepart);
    if (heureArrivee && !normalizedArrival) { setError("Heure d'arrivee invalide"); return; }
    if (heureDepart && !normalizedDeparture) { setError("Heure de depart invalide"); return; }

    setSaving(true);
    setSavingAction(submitAction);
    setError("");
    try {
      const payload = {
        clientId: selectedClient.id,
        technicianId: technicianId || null,
        date,
        heureArrivee: normalizedArrival || null,
        heureDepart: normalizedDeparture || null,
        interventionAddress: interventionAddress || null,
        interventionCity: interventionCity || null,
        interventionPostalCode: interventionPostalCode || null,
        visibleAuClient,
        description: description || null,
        notes: notes || null,
        statut: submitAction === "invoice" ? "invoiced" : statut,
        laborHours,
        laborRate,
        // Flat items: always included. For B2B, only discount lines stay flat.
        items: itemsComputed.map((it) => ({
          productId: it.productId,
          serviceId: it.serviceId,
          description: it.description,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          itemType: it.itemType,
        })),
      };
      if (isB2B) {
        payload.sections = sections.map((s) => ({
          unitCode: s.unitCode,
          items: s.items.map((it) => ({
            productId: it.productId,
            serviceId: it.serviceId,
            description: it.description,
            quantity: Number(it.quantity),
            unitPrice: Number(it.unitPrice),
            itemType: it.itemType,
          })),
        }));
      }
      const url = editId ? `/api/admin/work-orders/${editId}` : "/api/admin/work-orders";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la creation");
      }
      const wo = await res.json();
      if (!editId) {
        try { window.localStorage.removeItem(DRAFT_KEY); } catch {}
      }
      router.push(submitAction === "invoice" ? `/admin/bons/${wo.id}` : `/admin/bons/nouveau?edit=${wo.id}`);
      if (submitAction !== "invoice") {
        setSaving(false);
        setSavingAction(null);
      }
    } catch (err) {
      setError(err.message);
      setSaving(false);
      setSavingAction(null);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/bons" className="admin-text-muted text-sm hover:admin-text">
            <i className="fas fa-arrow-left mr-2"></i>Retour aux bons
          </Link>
          <h1 className="admin-text text-2xl font-bold mt-2">
            {invoiceMode ? "Facturer le bon de travail" : (editId ? "Modifier le bon de travail" : "Nouveau bon de travail")}
          </h1>
        </div>
      </div>

      {invoiceMode && (
        <div className="border border-orange-500/40 bg-orange-500/10 rounded-xl p-4 mb-6 max-w-5xl">
          <div className="flex items-start gap-3">
            <i className="fas fa-file-invoice-dollar text-orange-500 text-xl mt-0.5"></i>
            <div className="flex-1">
              <h3 className="font-bold text-orange-500 mb-1">Mode facturation</h3>
              <p className="text-sm admin-text-muted">
                Ajoutez les heures travaillées (champ <strong>Heures</strong> plus bas) et les pièces installées par unité (bouton <strong>+ Ajouter pièce</strong> dans chaque section). Cliquez <strong>Facturer ce bon</strong> pour générer la facture, ou <strong>Enregistrer (sans facturer)</strong> pour revenir plus tard.
              </p>
            </div>
          </div>
        </div>
      )}

      {loadingEdit && (
        <div className="admin-card border rounded-xl p-6 mb-6 max-w-5xl">
          <p className="admin-text-muted text-sm text-center">
            <i className="fas fa-spinner fa-spin mr-2"></i>Chargement du bon #{editId}...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`space-y-6 max-w-5xl ${loadingEdit ? "opacity-40 pointer-events-none" : ""}`}>
        {/* Client */}
        <div className="admin-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="admin-text font-bold">Client</h2>
            {!selectedClient && (
              <div className="flex gap-2 flex-wrap justify-end">
                <button type="button" onClick={() => setQuickClientOpen((v) => !v)}
                  className="px-4 py-2 border admin-border rounded-lg text-sm font-medium admin-text admin-hover">
                  <i className="fas fa-user-plus mr-2"></i>Client rapide
                </button>
                <button type="button" onClick={() => setClientPickerOpen(true)}
                  className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium">
                  <i className="fas fa-address-book mr-2"></i>Parcourir les clients
                </button>
              </div>
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
                      onClick={() => { selectClient(c); setClientSearch(""); setClientResults([]); setQuickClientOpen(false); }}
                      className="w-full text-left px-4 py-3 border-b admin-border admin-hover last:border-b-0"
                    >
                      <p className="admin-text font-medium text-sm">{c.name}</p>
                      <p className="admin-text-muted text-xs">{c.phone || "—"} {c.city ? `• ${c.city}` : ""}</p>
                    </button>
                  ))}
                </div>
              )}
              {quickClientOpen && (
                <div className="mt-4 border admin-border rounded-xl p-4 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="admin-text text-sm font-bold">Creation rapide</p>
                    <Link href="/admin/clients" className="text-xs admin-text-muted hover:admin-text">
                      Fiche complete
                    </Link>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input type="text" placeholder="Nom du client *" value={quickClient.name}
                      onChange={(e) => setQuickClient((p) => ({ ...p, name: e.target.value }))}
                      className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
                    <input type="tel" placeholder="Telephone" value={quickClient.phone}
                      onChange={(e) => setQuickClient((p) => ({ ...p, phone: e.target.value }))}
                      className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
                    <input type="email" placeholder="Email" value={quickClient.email}
                      onChange={(e) => setQuickClient((p) => ({ ...p, email: e.target.value }))}
                      className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
                    <select value={quickClient.type}
                      onChange={(e) => setQuickClient((p) => ({ ...p, type: e.target.value }))}
                      className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full">
                      <option value="particulier">Particulier</option>
                      <option value="gestionnaire">Gestionnaire / B2B</option>
                    </select>
                    <input type="text" placeholder="Adresse" value={quickClient.address}
                      onChange={(e) => setQuickClient((p) => ({ ...p, address: e.target.value }))}
                      className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Ville" value={quickClient.city}
                        onChange={(e) => setQuickClient((p) => ({ ...p, city: e.target.value }))}
                        className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
                      <input type="text" placeholder="Postal" value={quickClient.postalCode}
                        onChange={(e) => setQuickClient((p) => ({ ...p, postalCode: e.target.value }))}
                        className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button type="button" onClick={createQuickClient} disabled={creatingClient || !quickClient.name.trim()}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold disabled:opacity-40">
                      {creatingClient ? "Creation..." : "Creer et utiliser"}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <p className="admin-text font-medium">{selectedClient.name}</p>
                <p className="admin-text-muted text-sm">{selectedClient.phone || "—"}</p>
                {selectedClient.address && <p className="admin-text-muted text-sm">{selectedClient.address}{selectedClient.city ? `, ${selectedClient.city}` : ""}</p>}
              </div>
              <button type="button" onClick={clearSelectedClient} className="text-xs text-[var(--color-red)]">
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
            <TimeSelect label="Heure arrivee" value={heureArrivee} onChange={setHeureArrivee} />
            <TimeSelect label="Heure depart" value={heureDepart} onChange={setHeureDepart} />
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
            <div className="flex items-center justify-between gap-3 mb-1">
              <label className="admin-text-muted text-xs block">
                Adresse d&apos;intervention <span className="opacity-60">(si differente du client)</span>
              </label>
              {selectedClient && (selectedClient.address || selectedClient.city || selectedClient.postalCode) && (
                <button type="button" onClick={() => fillInterventionFromClient(selectedClient, null, true)}
                  className="text-[11px] admin-text-muted hover:admin-text">
                  Utiliser fiche client
                </button>
              )}
            </div>
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

        {/* Sections par unite (B2B only) */}
        {isB2B && (
          <div className="admin-card border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="admin-text font-bold">
                <i className="fas fa-building mr-2 text-blue-400"></i>Unites visitees ({sections.length})
              </h2>
              <p className="admin-text-muted text-xs">Client B2B — organiser par unite</p>
            </div>

            {/* Known units quick-add */}
            {knownUnits.length > 0 && (
              <div>
                <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-2">
                  Unites connues ({knownUnits.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {knownUnits.map((u) => {
                    const already = sections.some((s) => s.unitCode === u.code);
                    return (
                      <button type="button" key={u.id}
                        onClick={() => addSectionFromKnown(u)}
                        disabled={already}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                          already
                            ? "bg-green-500/20 text-green-500 border border-green-500/40 cursor-default"
                            : "admin-card border admin-border admin-text hover:bg-white/5"
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

            {/* Add unit input */}
            <div className="flex gap-2">
              <input type="text" placeholder="Nouveau code d'unite (ex: F-0411)"
                value={newUnitCode}
                onChange={(e) => setNewUnitCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSection(); } }}
                className="admin-input border rounded-lg px-3 py-2 text-sm flex-1 font-mono" />
              <button type="button" onClick={addSection} disabled={!newUnitCode.trim()}
                className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium disabled:opacity-30">
                <i className="fas fa-plus mr-1"></i>Ajouter
              </button>
            </div>
            <p className="admin-text-muted text-[11px]">
              Une nouvelle unite est ajoutee au bon seulement. Elle sera enregistree dans la fiche client quand le bon sera sauvegarde.
            </p>

            {/* Sections list */}
            {sections.map((sec, sIdx) => {
              const secSubtotal = sec.items.reduce((s, it) => s + Number(it.quantity) * Number(it.unitPrice), 0);
              return (
                <div key={sIdx} className="border admin-border rounded-xl p-4 space-y-3 bg-white/[0.02]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-base admin-text bg-blue-500/10 px-3 py-1 rounded">{sec.unitCode}</span>
                      <span className="admin-text-muted text-xs">{sec.items.length} item{sec.items.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[var(--color-red)]">{secSubtotal.toFixed(2)}$</span>
                      <button type="button" onClick={() => removeSection(sIdx)} className="text-red-500 text-sm">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  {/* Services presets for this section */}
                  {services.filter((s) => s.isPreset).length > 0 && (
                    <div>
                      <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider mb-1.5">Raccourcis services</p>
                      <div className="flex flex-wrap gap-1.5">
                        {services.filter((s) => s.isPreset).map((svc) => (
                          <button type="button" key={svc.id}
                            onClick={() => addServiceToSection(sIdx, svc)}
                            className="px-2.5 py-1 rounded text-xs admin-card border admin-border admin-text hover:bg-white/5">
                            {svc.name} <span className="text-[var(--color-red)] font-bold ml-1">{Number(svc.price).toFixed(0)}$</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Items in this section */}
                  {sec.items.map((it, iIdx) => {
                    const isLastSectionPiece = !sec.items.slice(iIdx + 1).some((next) => next.itemType !== "discount");
                    return (
                      <div key={iIdx} className="border admin-border rounded-lg p-2.5 bg-white/[0.02]">
                        <div className="flex items-start gap-2 mb-1.5">
                          <input
                            value={it.description}
                            onChange={(e) => updateSectionItem(sIdx, iIdx, "description", e.target.value)}
                            placeholder="Description..."
                            className="admin-input border rounded px-2 py-1 text-sm flex-1" />
                          <button type="button" onClick={() => removeSectionItem(sIdx, iIdx)} className="text-red-500 text-sm">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <label className="admin-text-muted text-xs">Qte</label>
                          <input type="number" value={it.quantity} min="0" step="1"
                            onChange={(e) => updateSectionItem(sIdx, iIdx, "quantity", parseFloat(e.target.value) || 0)}
                            className="admin-input border rounded px-2 py-0.5 text-sm w-16 text-center" />
                          <label className="admin-text-muted text-xs ml-1">Prix</label>
                          <input type="number" value={it.unitPrice} min="0" step="0.01"
                            onChange={(e) => updateSectionItem(sIdx, iIdx, "unitPrice", parseFloat(e.target.value) || 0)}
                            className="admin-input border rounded px-2 py-0.5 text-sm w-20 text-right" />
                          <span className="admin-text-muted text-xs">$</span>
                          <span className="ml-auto font-bold text-[var(--color-red)] text-sm">
                            {(Number(it.quantity) * Number(it.unitPrice)).toFixed(2)}$
                          </span>
                        </div>
                        {isLastSectionPiece && (
                          <div className="mt-3 flex justify-end">
                            <button type="button" onClick={() => addCustomToSection(sIdx)}
                              className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold">
                              <i className="fas fa-plus mr-1"></i>Rajouter une piece
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="flex gap-2">
                    <button type="button" onClick={() => openCatalogForSection(sIdx)}
                      className="flex-1 py-2 border-2 border-dashed admin-border rounded-lg admin-text-muted text-xs admin-hover">
                      <i className="fas fa-book-open mr-1"></i>Catalogue
                    </button>
                    <button type="button" onClick={() => addCustomToSection(sIdx)}
                      className="flex-1 py-2 border-2 border-dashed admin-border rounded-lg admin-text-muted text-xs admin-hover">
                      <i className="fas fa-plus mr-1"></i>Ajouter une piece
                    </button>
                  </div>
                </div>
              );
            })}

            {sections.length === 0 && (
              <p className="admin-text-muted text-xs italic text-center py-4">
                Aucune unite ajoutee. Tape sur une unite connue ci-dessus ou saisis un nouveau code.
              </p>
            )}
          </div>
        )}

        {/* Items (flat — for particulier OR discounts-only B2B) */}
        <div className="admin-card border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="admin-text font-bold">
              {isB2B ? "Escomptes / lignes globales" : "Pieces utilisees"}
            </h2>
            {!isB2B && (
              <button type="button" onClick={() => { setCatalogTarget(null); setCatalogOpen(true); }}
                className="px-4 py-2 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium">
                <i className="fas fa-book-open mr-2"></i>Parcourir le catalogue
              </button>
            )}
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
            const isLastPiece = !items.slice(i + 1).some((next) => next.itemType !== "discount");
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
                {!isB2B && isLastPiece && (
                  <div className="mt-3 flex justify-end">
                    <button type="button" onClick={addCustomItem}
                      className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold">
                      <i className="fas fa-plus mr-1"></i>Rajouter une piece
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <div className={`grid gap-2 ${isB2B ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
            {!isB2B && (
              <button type="button" onClick={addCustomItem}
                className="py-2.5 border-2 border-dashed admin-border rounded-lg admin-text-muted text-sm admin-hover">
                <i className="fas fa-plus mr-2"></i>Ajouter une piece
              </button>
            )}
            <button type="button" onClick={() => addDiscount("percent")}
              title="Enleve un pourcentage du total des pieces. Exemple: 10% sur 500$ enleve 50$."
              className="group relative py-2.5 border-2 border-dashed border-green-500/30 rounded-lg text-green-600 text-sm hover:bg-green-500/5">
              <span className="inline-flex items-center justify-center gap-2">
                <i className="fas fa-percent"></i>
                <span>Escompte %</span>
                <HelpBubble text="Enleve un pourcentage du total des pieces. Exemple: 10% sur 500$ enleve 50$." />
              </span>
            </button>
            <button type="button" onClick={() => addDiscount("amount")}
              title="Enleve un montant fixe. Exemple: 25$ enleve exactement 25$."
              className="group relative py-2.5 border-2 border-dashed border-green-500/30 rounded-lg text-green-600 text-sm hover:bg-green-500/5">
              <span className="inline-flex items-center justify-center gap-2">
                <i className="fas fa-dollar-sign"></i>
                <span>Reduction $</span>
                <HelpBubble text="Enleve un montant fixe. Exemple: 25$ enleve exactement 25$." />
              </span>
            </button>
          </div>
        </div>

        {/* Labor + Totals */}
        <div className="admin-card border rounded-xl p-6 space-y-4">
          <div>
            <h2 className="admin-text font-bold">Main d&apos;oeuvre</h2>
            <p className="admin-text-muted text-xs mt-1">
              Changer les parametres n&apos;affecte pas les anciens bons.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <LaborHoursSelect value={laborHours} onChange={setLaborHours} />
            <span className="admin-text-muted text-sm">x</span>
            <LaborRateInput value={laborRateText} onChange={handleLaborRateInput} onBlur={commitLaborRateInput} />
            <Link href="/admin/parametres#bons-travail"
              className="px-3 py-2 border admin-border rounded-lg admin-text-muted text-xs admin-hover inline-flex items-center">
              <i className="fas fa-gear mr-1"></i>Ajuster le taux
            </Link>
            <span className="admin-text-muted text-sm">{formatLaborHours(laborHours)} x {laborRate.toFixed(2)}$/h</span>
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
                <option value="scheduled">Planifié</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Complété</option>
                <option value="invoiced">Facturé</option>
                <option value="paid">Payé</option>
              </select>
            </div>
            {error && <p className="text-sm text-red-500 md:ml-auto">{error}</p>}
            {invoiceMode ? (
              <div className="md:ml-auto flex gap-3 flex-wrap">
                <button
                  type="submit"
                  value="save"
                  disabled={saving || !selectedClient}
                  className="px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium admin-text hover:bg-white/5 disabled:opacity-50"
                >
                  {saving && savingAction === "save" ? "Enregistrement..." : "Enregistrer (sans facturer)"}
                </button>
                <button
                  type="submit"
                  value="invoice"
                  disabled={saving || !selectedClient}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  <i className="fas fa-file-invoice-dollar mr-2"></i>
                  {saving && savingAction === "invoice" ? "Facturation..." : "Facturer ce bon"}
                </button>
              </div>
            ) : (
              <button type="submit" disabled={saving || !selectedClient}
                value="save"
                className="md:ml-auto px-6 py-3 bg-[var(--color-red)] text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? (editId ? "Enregistrement..." : "Creation...") : (editId ? "Enregistrer les modifications" : "Creer le bon")}
              </button>
            )}
          </div>
        </div>
      </form>

      <CatalogPicker open={catalogOpen} onClose={() => setCatalogOpen(false)} onPick={addProduct} />
      <ClientPicker
        open={clientPickerOpen}
        onClose={() => setClientPickerOpen(false)}
        onPick={(c) => { selectClient(c); setClientPickerOpen(false); setQuickClientOpen(false); }}
      />
    </div>
  );
}
