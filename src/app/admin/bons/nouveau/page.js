"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import CatalogPicker from "@/components/admin/CatalogPicker";
import ClientPicker from "@/components/admin/ClientPicker";
import ThermosQuoteInline from "@/components/admin/ThermosQuoteInline";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { dateOnlyString, todayDateInput } from "@/lib/date-only";
import {
  DEFAULT_FOLLOW_UP_COLUMNS,
  FOLLOW_UP_COLUMNS_SETTINGS_KEY,
  followUpStatusFromWorkOrderStatut,
  normalizeFollowUpColumns,
  workOrderStatutFromFollowUpStatus,
} from "@/lib/follow-up-columns";
import {
  adminDocumentDetailHref,
  adminDocumentEditHref,
  adminDocumentListHref,
  adminDocumentTypeFromPathname,
} from "@/lib/admin-document-routes";
import { isInvoiceStatus, isQuoteStatus } from "@/lib/work-order-document";

import AiImportPanel from "./AiImportPanel";
import {
  DRAFT_KEY,
  AI_IMAGE_MAX_COUNT,
  AI_IMAGE_TOTAL_MAX_BYTES,
  formatBytes,
  readAiImageFile,
  readAiPdfFile,
  defaultQuotePaymentTexts,
  resizeQuotePaymentTexts,
  quotePaymentUiLabel,
  parseQuotePaymentScheduleInput,
  quotePaymentEditorFromWorkOrder,
  aiImageSrc,
  aiImagesTotalSize,
  saveAiImagesSession,
  loadAiImagesSession,
  clearAiImagesSession,
  saveAiAnalysisSession,
  loadAiAnalysisSession,
  clearAiAnalysisSession,
  shouldRestoreNewBonDraft,
  normalizeTimeInput,
  formatLaborHours,
  normalizeWorkItem,
  onlyDigits,
  hasMeaningfulText,
  looksLikeProvinceOnly,
  looksLikeBusinessName,
  draftBusinessName,
  formatDraftClientLine,
  resolveAiEmailDraft,
  formatEmailDraftNote,
  appendUniqueNoteBlocks,
  draftItemsToWorkItems,
  draftSectionsToWorkSections,
  descriptionFromAiDraft,
  emailDraftStorageKey,
  followUpDateLabel,
  findClientCandidatesForAiDraft,
} from "./editor-utils";
import { LaborHoursSelect, LaborRateInput, HelpBubble, MoneyLine } from "./editor-widgets";


export default function NouveauBonPage(props = {}) {
  return (
    <Suspense fallback={<div className="p-6 lg:p-8 admin-text-muted"><i className="fas fa-spinner fa-spin mr-2"></i>Chargement...</div>}>
      <NouveauBonAdmin {...props} />
    </Suspense>
  );
}

function NouveauBonAdmin({ forcedDocumentType = null } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const routeDocumentType = forcedDocumentType || adminDocumentTypeFromPathname(pathname);
  const invoiceMode = routeDocumentType === "invoice" || searchParams.get("mode") === "invoice";
  const quoteMode = !invoiceMode && (routeDocumentType === "quote" || searchParams.get("mode") === "quote");
  const freshDraft = searchParams.get("fresh") === "1";
  const resumeDraft = searchParams.get("draft") === "1";
  const presetClientId = searchParams.get("clientId");
  const [saving, setSaving] = useState(false);
  const [savingAction, setSavingAction] = useState(null);
  const [error, setError] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(!!editId);
  const [loadedUpdatedAt, setLoadedUpdatedAt] = useState(null); // verrou optimiste anti-ecrasement

  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [quickClient, setQuickClient] = useState({
    name: "",
    phone: "",
    secondaryPhone: "",
    contactName: "",
    friendlyEmail: false,
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
  const [currentStatut, setCurrentStatut] = useState(null);
  const [followUpStatus, setFollowUpStatus] = useState(() => followUpStatusFromWorkOrderStatut("draft"));
  const [selectedFollowUpId, setSelectedFollowUpId] = useState("");
  const [linkedFollowUp, setLinkedFollowUp] = useState(null);
  const [followUpOptions, setFollowUpOptions] = useState([]);
  const [loadingFollowUps, setLoadingFollowUps] = useState(false);
  const [followUpColumns, setFollowUpColumns] = useState(DEFAULT_FOLLOW_UP_COLUMNS);
  const [interventionAddress, setInterventionAddress] = useState("");
  const [interventionCity, setInterventionCity] = useState("");
  const [interventionPostalCode, setInterventionPostalCode] = useState("");
  const [visibleAuClient, setVisibleAuClient] = useState(true);
  const [quotePaymentCount, setQuotePaymentCount] = useState("auto");
  const [quotePaymentPercentTexts, setQuotePaymentPercentTexts] = useState(() => defaultQuotePaymentTexts(2));

  const [items, setItems] = useState([]);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogTarget, setCatalogTarget] = useState(null); // null = flat, number = section index
  const [thermosCalculatorActive, setThermosCalculatorActive] = useState(false);

  const [services, setServices] = useState([]);
  const [knownUnits, setKnownUnits] = useState([]);
  const [sections, setSections] = useState([]); // [{unitCode, items:[]}]
  const [newUnitCode, setNewUnitCode] = useState("");

  const [laborHours, setLaborHours] = useState(0);
  const [laborRate, setLaborRate] = useState(85);
  const [laborRateText, setLaborRateText] = useState("85.00");
  const [settings, setSettings] = useState({ labor_rate_per_hour: 85, tps_rate: 0.05, tvq_rate: 0.09975 });
  const [aiImportText, setAiImportText] = useState("");
  const [aiImportImages, setAiImportImages] = useState([]);
  const [aiImportPdf, setAiImportPdf] = useState(null);
  const [aiDraft, setAiDraft] = useState(null);
  const [aiDraftError, setAiDraftError] = useState("");
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [aiDraftProgress, setAiDraftProgress] = useState({ percent: 0, label: "" });
  const [aiDraftApplying, setAiDraftApplying] = useState(false);
  const [aiDraftMessage, setAiDraftMessage] = useState("");
  const [aiClientSuggestions, setAiClientSuggestions] = useState([]);
  const [aiClientSuggestionLoading, setAiClientSuggestionLoading] = useState(false);
  const [aiClientLookupComplete, setAiClientLookupComplete] = useState(false);
  const [aiEmailDraft, setAiEmailDraft] = useState(null);
  const [aiImagePreviewIndex, setAiImagePreviewIndex] = useState(null);
  const aiImageInputRef = useRef(null);
  const aiPdfInputRef = useRef(null);
  const aiDraftProgressTimerRef = useRef(null);
  const aiDraftProgressClearTimerRef = useRef(null);

  const isB2B = selectedClient?.type === "gestionnaire" || sections.length > 0;

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
          const shouldRestoreDraft = shouldRestoreNewBonDraft({ freshDraft, resumeDraft });
          let shouldUseSettingsRate = !editId;
          if (!editId && shouldRestoreDraft) {
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
    fetch(`/api/admin/settings?key=${FOLLOW_UP_COLUMNS_SETTINGS_KEY}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.value) return;
        setFollowUpColumns(normalizeFollowUpColumns(JSON.parse(data.value)));
      })
      .catch(() => {});
  }, [editId, freshDraft, resumeDraft]);

  useEffect(() => {
    if (editId) {
      draftReady.current = true;
      return;
    }
    if (freshDraft) {
      try {
        window.localStorage.removeItem(DRAFT_KEY);
        clearAiAnalysisSession();
      } catch {}
      draftReady.current = true;
      return;
    }
    if (!shouldRestoreNewBonDraft({ freshDraft, resumeDraft })) {
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
      if (draft.followUpStatus) setFollowUpStatus(draft.followUpStatus);
      if (draft.selectedFollowUpId !== undefined) setSelectedFollowUpId(draft.selectedFollowUpId);
      if (draft.interventionAddress !== undefined) setInterventionAddress(draft.interventionAddress);
      if (draft.interventionCity !== undefined) setInterventionCity(draft.interventionCity);
      if (draft.interventionPostalCode !== undefined) setInterventionPostalCode(draft.interventionPostalCode);
      if (draft.visibleAuClient !== undefined) setVisibleAuClient(draft.visibleAuClient);
      if (draft.quotePaymentCount !== undefined) setQuotePaymentCount(draft.quotePaymentCount);
      if (Array.isArray(draft.quotePaymentPercentTexts)) setQuotePaymentPercentTexts(draft.quotePaymentPercentTexts);
      if (draft.quotePaymentCount === undefined && draft.quoteDepositPercentText !== undefined) {
        const editor = quotePaymentEditorFromWorkOrder({ quoteDepositPercent: draft.quoteDepositPercentText });
        setQuotePaymentCount(editor.count);
        setQuotePaymentPercentTexts(editor.texts);
      }
      if (Array.isArray(draft.items)) setItems(draft.items);
      if (Array.isArray(draft.sections)) setSections(draft.sections);
      if (draft.laborHours !== undefined) setLaborHours(draft.laborHours);
      if (draft.laborRate !== undefined) setLaborRateValue(Number(draft.laborRate) || 85);
      if (draft.aiImportText !== undefined) setAiImportText(draft.aiImportText);
      if (draft.aiDraft && typeof draft.aiDraft === "object") setAiDraft(draft.aiDraft);
      if (draft.aiEmailDraft && typeof draft.aiEmailDraft === "object") setAiEmailDraft(draft.aiEmailDraft);
      const savedAi = loadAiAnalysisSession();
      if (savedAi) {
        setAiImportText(savedAi.text || "");
        if (savedAi.draft) setAiDraft(savedAi.draft);
        if (savedAi.emailDraft) setAiEmailDraft(savedAi.emailDraft);
      }
      const savedImages = loadAiImagesSession();
      if (savedImages) setAiImportImages(savedImages);
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    } finally {
      draftReady.current = true;
    }
  }, [editId, freshDraft, resumeDraft]);

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
          followUpStatus,
          selectedFollowUpId,
          interventionAddress,
          interventionCity,
          interventionPostalCode,
          visibleAuClient,
          quotePaymentCount,
          quotePaymentPercentTexts,
          items,
          sections,
          laborHours,
          laborRate,
          aiImportText,
          aiDraft,
          aiEmailDraft,
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
    followUpStatus,
    selectedFollowUpId,
    interventionAddress,
    interventionCity,
    interventionPostalCode,
    visibleAuClient,
    quotePaymentCount,
    quotePaymentPercentTexts,
    items,
    sections,
    laborHours,
    laborRate,
    aiImportText,
    aiDraft,
    aiEmailDraft,
  ]);

  useEffect(() => {
    return () => {
      if (aiDraftProgressTimerRef.current) clearInterval(aiDraftProgressTimerRef.current);
      if (aiDraftProgressClearTimerRef.current) clearTimeout(aiDraftProgressClearTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!aiDraft?.client || selectedClient) {
      setAiClientSuggestions([]);
      setAiClientSuggestionLoading(false);
      setAiClientLookupComplete(false);
      return;
    }

    let cancelled = false;
    setAiClientSuggestionLoading(true);
    setAiClientLookupComplete(false);

    findClientCandidatesForAiDraft(aiDraft.client)
      .then(({ exact, suggestions }) => {
        if (cancelled) return;
        setAiClientSuggestions(exact ? [exact, ...suggestions] : suggestions);
      })
      .catch(() => {
        if (!cancelled) setAiClientSuggestions([]);
      })
      .finally(() => {
        if (cancelled) return;
        setAiClientSuggestionLoading(false);
        setAiClientLookupComplete(true);
      });

    return () => {
      cancelled = true;
    };
  }, [aiDraft, selectedClient]);

  // Fetch known units when a gestionnaire client is selected
  useEffect(() => {
    if (!selectedClient?.id || selectedClient.type !== "gestionnaire") {
      setKnownUnits([]);
      return;
    }
    fetch(`/api/admin/clients/${selectedClient.id}/units`)
      .then((r) => r.json())
      .then((d) => setKnownUnits(Array.isArray(d) ? d.filter((u) => u.isActive) : []))
      .catch(() => setKnownUnits([]));
  }, [selectedClient, editId]);

  useEffect(() => {
    if (!selectedClient?.id) {
      setFollowUpOptions([]);
      setLoadingFollowUps(false);
      return;
    }

    let cancelled = false;
    setLoadingFollowUps(true);
    fetch(`/api/admin/follow-ups?clientId=${selectedClient.id}&status=active&activity=0&limit=100`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setFollowUpOptions(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setFollowUpOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingFollowUps(false);
      });

    return () => { cancelled = true; };
  }, [selectedClient?.id]);

  // Load existing bon when ?edit=<id>
  useEffect(() => {
    if (!editId) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/work-orders/${editId}`);
        if (!res.ok) throw new Error("Bon introuvable");
        const wo = await res.json();
        setLoadedUpdatedAt(wo.updatedAt || null);
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
        setCurrentStatut(wo.statut || null);
        setFollowUpStatus(wo.followUpStatus || followUpStatusFromWorkOrderStatut(wo.statut || "draft"));
        setLinkedFollowUp(wo.followUp || null);
        setSelectedFollowUpId(wo.followUp?.id ? String(wo.followUp.id) : "");
        setInterventionAddress(wo.interventionAddress || "");
        setInterventionCity(wo.interventionCity || "");
        setInterventionPostalCode(wo.interventionPostalCode || "");
        setVisibleAuClient(wo.visibleAuClient ?? true);
        const quotePaymentEditor = quotePaymentEditorFromWorkOrder(wo);
        setQuotePaymentCount(quotePaymentEditor.count);
        setQuotePaymentPercentTexts(quotePaymentEditor.texts);
        setItems(Array.isArray(wo.items) ? wo.items.filter((item) => !item.sectionId).map(normalizeWorkItem) : []);
        setSections(Array.isArray(wo.sections) ? wo.sections.map((s) => ({
          unitCode: s.unitCode,
          items: (s.items || []).map(normalizeWorkItem),
        })) : []);
        // Reverse-compute laborHours from the rate frozen on this work order.
        const rate = Number(wo.laborRate) || settings.labor_rate_per_hour || 85;
        setLaborRateValue(rate);
        setLaborHours(rate > 0 ? Math.round((Number(wo.totalLabor) / rate) * 100) / 100 : 0);
        const savedImages = loadAiImagesSession(editId);
        if (savedImages) setAiImportImages(savedImages);
        const savedAi = loadAiAnalysisSession(editId);
        if (savedAi) {
          setAiImportText(savedAi.text || "");
          if (savedAi.draft) setAiDraft(savedAi.draft);
          if (savedAi.emailDraft) setAiEmailDraft(savedAi.emailDraft);
        }
      } catch (err) {
        setError(err.message || "Erreur chargement");
      } finally {
        setLoadingEdit(false);
      }
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  // Pre-selection du client quand on arrive depuis la centrale (?clientId=).
  useEffect(() => {
    if (editId || !presetClientId) return;
    let cancelled = false;
    fetch(`/api/admin/clients/${presetClientId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((client) => { if (!cancelled && client?.id) setSelectedClient(client); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [presetClientId, editId]);

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
      description: `${p.sku} â€” ${p.name}`,
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

  function buildThermosItems(quote) {
    const optionLabels = {
      easy: "acces facile",
      medium: "acces moyen",
      hard: "acces difficile",
    };
    const thermosItems = quote.lines.map((line, index) => {
      const options = [
        line.lowE ? "Low-E" : null,
        line.argon ? "argon" : null,
        line.tempered ? "trempe" : null,
        line.grill ? "carrelage" : null,
        optionLabels[line.access] || null,
        line.note ? `note: ${line.note}` : null,
      ].filter(Boolean).join(", ") || "standard";

      return {
        productId: null,
        serviceId: null,
        description: `Thermos ${index + 1}: ${line.width}" x ${line.height}" (${line.sqftPerUnit} pi2/unite) - ${options}`,
        quantity: Number(line.quantity) || 1,
        unitPrice: Number(line.unitSubtotal) || 0,
        itemType: "piece",
      };
    });

    if (Number(quote.totals.tripFee) > 0) {
      thermosItems.push({
        productId: null,
        serviceId: null,
        description: "Frais deplacement thermos",
        quantity: 1,
        unitPrice: Number(quote.totals.tripFee),
        itemType: "piece",
      });
    }

    if (Number(quote.totals.margin) > 0) {
      thermosItems.push({
        productId: null,
        serviceId: null,
        description: "Marge/admin thermos",
        quantity: 1,
        unitPrice: Number(quote.totals.margin),
        itemType: "piece",
      });
    }

    return thermosItems;
  }

  function addThermosQuoteToBon(quote, destination = "flat") {
    const thermosItems = buildThermosItems(quote);
    const sectionMatch = String(destination).match(/^section:(\d+)$/);

    if (isB2B && sectionMatch) {
      const sectionIndex = Number(sectionMatch[1]);
      setSections((prev) => prev.map((section, index) => (
        index === sectionIndex ? { ...section, items: [...section.items, ...thermosItems] } : section
      )));
      return;
    }

    setItems((prev) => [...prev, ...thermosItems]);
  }

  // â”€â”€â”€ Sections (B2B) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      discountAmount: 0,
    }]);
  }

  function updateItem(idx, field, value) {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }

  function removeItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  // Base subtotal = pieces only (no labor, no discounts) â€” used as the denominator for % discounts
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
    if (previousClient?.id !== client?.id) {
      setSelectedFollowUpId("");
      setLinkedFollowUp(null);
    }
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
    setSelectedFollowUpId("");
    setLinkedFollowUp(null);
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
          secondaryPhone: quickClient.secondaryPhone.trim() || null,
          contactName: quickClient.contactName.trim() || null,
          friendlyEmail: quickClient.type === "gestionnaire" && quickClient.friendlyEmail === true,
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
        secondaryPhone: "",
        contactName: "",
        friendlyEmail: false,
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

  function selectAiClientSuggestion(client) {
    if (!client?.id) return;
    selectClient(client);
    setClientSearch("");
    setClientResults([]);
    setQuickClientOpen(false);
    setAiClientSuggestions([]);
    setAiClientLookupComplete(false);
    const scoreLabel = client.matchScore ? ` (${Math.round(client.matchScore)}%)` : "";
    setAiDraftMessage(`Client selectionne: ${client.name}${scoreLabel}. Clique sur "Appliquer au formulaire" pour remplir le document.`);
  }

  async function createClientForAiDraft(draftClient = {}, options = {}) {
    const name = String(draftClient.name || draftClient.company || draftClient.email || draftClient.phone || "Client a verifier").trim();
    const type = options.forceGestionnaire || draftClient.type === "gestionnaire" ? "gestionnaire" : "particulier";
    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        company: draftClient.company || (looksLikeBusinessName(name) ? name : null),
        phone: draftClient.phone || null,
        secondaryPhone: draftClient.secondaryPhone || null,
        contactName: draftClient.contactName || null,
        friendlyEmail: type === "gestionnaire",
        email: draftClient.email || null,
        address: draftClient.address || null,
        city: draftClient.city || null,
        postalCode: draftClient.postalCode || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Erreur creation client IA");
    return data;
  }

  async function createAiDraftClientAndSelect() {
    if (!aiDraft || aiDraftApplying) return;
    setAiDraftApplying(true);
    setAiDraftError("");
    setAiDraftMessage("");
    try {
      const draftClient = aiDraft.client || {};
      const hasDraftSections = draftSectionsToWorkSections(aiDraft.sections).length > 0;
      const client = await createClientForAiDraft(draftClient, { forceGestionnaire: hasDraftSections });
      selectClient(client);
      setClientSearch("");
      setClientResults([]);
      setQuickClientOpen(false);
      setAiClientSuggestions([]);
      setAiClientLookupComplete(false);
      setAiDraftMessage(`Nouveau client ajoute: ${client.name}. Clique sur "Appliquer au formulaire" pour remplir le document.`);
    } catch (err) {
      setAiDraftError(err.message);
    } finally {
      setAiDraftApplying(false);
    }
  }

  async function updateClientFromAiDraft(client, draftClient = {}, options = {}) {
    if (!client?.id) return { client, changed: false, error: "" };
    const data = {};
    const typeShouldBeGestionnaire = options.forceGestionnaire || draftClient.type === "gestionnaire";
    const businessName = draftBusinessName(draftClient);
    const contactName = String(draftClient.contactName || "").trim();
    const email = String(draftClient.email || "").trim();
    const phone = String(draftClient.phone || "").trim();
    const secondaryPhone = String(draftClient.secondaryPhone || "").trim();

    if (typeShouldBeGestionnaire && client.type !== "gestionnaire") {
      data.type = "gestionnaire";
      data.friendlyEmail = true;
    }
    if (businessName && (!hasMeaningfulText(client.company) || looksLikeProvinceOnly(client.company))) {
      data.company = businessName;
    }
    if (contactName && !hasMeaningfulText(client.contactName)) data.contactName = contactName;
    if (email && !hasMeaningfulText(client.email)) data.email = email;
    if (phone && !hasMeaningfulText(client.phone)) data.phone = phone;
    if (
      secondaryPhone &&
      !hasMeaningfulText(client.secondaryPhone) &&
      onlyDigits(secondaryPhone) !== onlyDigits(client.phone || phone)
    ) {
      data.secondaryPhone = secondaryPhone;
    }
    if (draftClient.address && !hasMeaningfulText(client.address)) data.address = draftClient.address;
    if (draftClient.city && !hasMeaningfulText(client.city)) data.city = draftClient.city;
    if (draftClient.postalCode && !hasMeaningfulText(client.postalCode)) data.postalCode = draftClient.postalCode;

    if (Object.keys(data).length === 0) return { client, changed: false, error: "" };
    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return { client, changed: false, error: error.error || "Fiche client non mise a jour" };
    }
    const updated = await res.json().catch(() => null);
    return { client: updated?.id ? updated : { ...client, ...data }, changed: true, error: "" };
  }

  async function attachAiImportImages(filesInput) {
    setAiDraftError("");
    setAiDraftMessage("");
    try {
      const files = Array.from(filesInput || []).filter((file) => file?.type?.startsWith("image/"));
      if (files.length === 0) return;
      if (aiImportImages.length + files.length > AI_IMAGE_MAX_COUNT) {
        throw new Error(`Maximum ${AI_IMAGE_MAX_COUNT} images par analyse.`);
      }
      const images = await Promise.all(files.map(readAiImageFile));
      const nextImages = [...aiImportImages, ...images];
      if (aiImagesTotalSize(nextImages) > AI_IMAGE_TOTAL_MAX_BYTES) {
        throw new Error(`Images trop lourdes ensemble. Maximum ${formatBytes(AI_IMAGE_TOTAL_MAX_BYTES)} au total.`);
      }
      setAiImportImages(nextImages);
      setAiDraft(null);
      setAiClientSuggestions([]);
      setAiClientLookupComplete(false);
      saveAiImagesSession(nextImages, editId);
    } catch (err) {
      setAiDraftError(err.message || "Impossible d'ajouter les images");
    }
  }

  async function attachAiImportPdf(filesInput) {
    setAiDraftError("");
    setAiDraftMessage("");
    try {
      const file = Array.from(filesInput || []).find((item) => (
        item?.type === "application/pdf" || String(item?.name || "").toLowerCase().endsWith(".pdf")
      ));
      if (!file) return;
      const pdf = await readAiPdfFile(file);
      setAiImportPdf(pdf);
      setAiDraft(null);
      setAiClientSuggestions([]);
      setAiClientLookupComplete(false);
    } catch (err) {
      setAiDraftError(err.message || "Impossible d'ajouter le PDF");
    }
  }

  function clearAiDraftProgressTimers() {
    if (aiDraftProgressTimerRef.current) {
      clearInterval(aiDraftProgressTimerRef.current);
      aiDraftProgressTimerRef.current = null;
    }
    if (aiDraftProgressClearTimerRef.current) {
      clearTimeout(aiDraftProgressClearTimerRef.current);
      aiDraftProgressClearTimerRef.current = null;
    }
  }

  function setAiDraftProgressStep(percent, label) {
    if (aiDraftProgressClearTimerRef.current) {
      clearTimeout(aiDraftProgressClearTimerRef.current);
      aiDraftProgressClearTimerRef.current = null;
    }
    setAiDraftProgress({
      percent: Math.max(0, Math.min(100, Number(percent) || 0)),
      label,
    });
  }

  function startAiDraftProgressTicker() {
    if (aiDraftProgressTimerRef.current) clearInterval(aiDraftProgressTimerRef.current);
    aiDraftProgressTimerRef.current = setInterval(() => {
      setAiDraftProgress((current) => {
        const currentPercent = Math.max(0, Math.min(88, Number(current.percent) || 0));
        if (currentPercent >= 88) return current;
        const step = currentPercent < 45 ? 5 : currentPercent < 72 ? 3 : 1;
        return {
          percent: Math.min(88, currentPercent + step),
          label: current.label || "Analyse IA en cours",
        };
      });
    }, 850);
  }

  function finishAiDraftProgress(label = "Analyse terminee") {
    if (aiDraftProgressTimerRef.current) {
      clearInterval(aiDraftProgressTimerRef.current);
      aiDraftProgressTimerRef.current = null;
    }
    setAiDraftProgress({ percent: 100, label });
    aiDraftProgressClearTimerRef.current = setTimeout(() => {
      setAiDraftProgress({ percent: 0, label: "" });
      aiDraftProgressClearTimerRef.current = null;
    }, 1200);
  }

  function handleAiPaste(event) {
    const itemsList = Array.from(event.clipboardData?.items || []);
    const files = itemsList
      .filter((item) => item.kind === "file" && item.type?.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter(Boolean);
    if (files.length === 0) return;
    event.preventDefault();
    attachAiImportImages(files);
  }

  const effectiveInvoiceMode = invoiceMode || isInvoiceStatus(currentStatut);
  const effectiveQuoteMode = quoteMode || isQuoteStatus(currentStatut);
  const currentDocumentType = effectiveInvoiceMode ? "invoice" : effectiveQuoteMode ? "quote" : "work_order";
  const currentDocumentListHref = adminDocumentListHref(currentDocumentType);
  const showDocumentAssistant = effectiveInvoiceMode || effectiveQuoteMode;
  const isExistingInvoiceDocument = Boolean(editId && !invoiceMode && isInvoiceStatus(currentStatut));
  const isExistingQuoteDocument = Boolean(editId && !quoteMode && isQuoteStatus(currentStatut));
  const isExistingInvoiceSaved = Boolean(editId && isInvoiceStatus(currentStatut));
  const isExistingQuoteSaved = Boolean(editId && isQuoteStatus(currentStatut));
  const aiImagePreviewImage = Number.isInteger(aiImagePreviewIndex) ? aiImportImages[aiImagePreviewIndex] : null;
  const aiImagePreviewSrc = aiImageSrc(aiImagePreviewImage);
  const hasAiImages = aiImportImages.length > 0;
  const hasAiPdf = Boolean(aiImportPdf);
  const hasAiImportSource = Boolean(aiImportText.trim() || hasAiImages || hasAiPdf);
  const aiProgressPercent = Math.max(0, Math.min(100, Number(aiDraftProgress.percent) || 0));

  async function analyzeAiDocumentDraft() {
    if (!hasAiImportSource || aiDraftLoading) return;
    setAiDraftLoading(true);
    setAiDraftError("");
    setAiDraftMessage("");
    setAiClientSuggestions([]);
    setAiClientLookupComplete(false);
    clearAiDraftProgressTimers();
    try {
      const documentType = effectiveQuoteMode ? "quote" : "invoice";
      // Un seul step avant le fetch : les steps intermediaires synchrones
      // etaient ecrases par le batching React avant d'etre visibles.
      setAiDraftProgressStep(10, hasAiPdf ? "Lecture du PDF et envoi a l'IA" : "Envoi a l'IA");
      startAiDraftProgressTicker();
      const res = await fetch("/api/admin/work-orders/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiImportText, images: aiImportImages, pdf: aiImportPdf, documentType }),
      });
      setAiDraftProgressStep(92, "Lecture du resultat");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur analyse IA");
      const nextDraft = data.draft ? { ...data.draft, analysisCost: data.analysisCost || null } : null;
      const nextEmailDraft = nextDraft ? resolveAiEmailDraft(nextDraft, selectedClient) : null;
      setAiDraft(nextDraft);
      setAiEmailDraft(nextEmailDraft);
      saveAiAnalysisSession({ text: aiImportText, draft: nextDraft, emailDraft: nextEmailDraft }, editId);
      finishAiDraftProgress("Brouillon pret");
    } catch (err) {
      clearAiDraftProgressTimers();
      setAiDraftProgress({ percent: 0, label: "" });
      setAiDraftError(err.message);
      setAiDraft(null);
      setAiClientSuggestions([]);
      setAiClientLookupComplete(false);
    } finally {
      setAiDraftLoading(false);
    }
  }

  async function applyAiDocumentDraft() {
    if (!aiDraft || aiDraftApplying) return;
    setAiDraftApplying(true);
    setAiDraftError("");
    setAiDraftMessage("");
    try {
      const draftClient = aiDraft.client || {};
      const draftSections = draftSectionsToWorkSections(aiDraft.sections);
      const hasDraftSections = draftSections.length > 0;
      let client = selectedClient;
      let clientAction = "Client conserve";
      if (!client) {
        const { exact, suggestions } = await findClientCandidatesForAiDraft(draftClient);
        if (exact) {
          client = exact;
          clientAction = "Client existant utilise";
        } else if (suggestions.length > 0) {
          setAiClientSuggestions(suggestions);
          setAiClientLookupComplete(true);
          setAiDraftMessage("Clients semblables trouves. Clique sur le bon client dans les choix proposes, ou cree un nouveau client si aucun ne correspond.");
          return;
        } else {
          const shouldCreateClient = window.confirm(
            `Nouveau client detecte.\n\nAucun client existant n'a ete trouve dans la base de donnees pour:\n\n${formatDraftClientLine(draftClient)}\n\nVoulez-vous l'ajouter a la base de donnees et appliquer au formulaire?`
          );
          if (!shouldCreateClient) {
            setAiDraftMessage("Application annulee. Aucun client cree.");
            return;
          }
          client = await createClientForAiDraft(draftClient, { forceGestionnaire: hasDraftSections });
          clientAction = "Nouveau client ajoute";
        }
        selectClient(client);
        setClientSearch("");
        setClientResults([]);
        setQuickClientOpen(false);
        setAiClientSuggestions([]);
        setAiClientLookupComplete(false);
      }
      const clientUpdate = await updateClientFromAiDraft(client, draftClient, { forceGestionnaire: hasDraftSections });
      let clientUpdateMessage = "";
      if (clientUpdate.changed) {
        client = clientUpdate.client;
        selectClient(client);
        clientUpdateMessage = " Fiche client enrichie.";
      } else if (clientUpdate.error) {
        clientUpdateMessage = ` Fiche client a verifier: ${clientUpdate.error}`;
      }

      setInterventionAddress(aiDraft.intervention?.address || draftClient.address || "");
      setInterventionCity(aiDraft.intervention?.city || draftClient.city || "");
      setInterventionPostalCode(aiDraft.intervention?.postalCode || draftClient.postalCode || "");
      const nextDescription = descriptionFromAiDraft(aiDraft);
      setDescription(nextDescription || description);
      setItems(draftItemsToWorkItems(aiDraft.items));
      setSections(draftSections);
      setLaborHours(0);

      const emailDraft = resolveAiEmailDraft(aiDraft, client);
      setAiEmailDraft(emailDraft);
      saveAiAnalysisSession({ text: aiImportText, draft: aiDraft, emailDraft }, editId);

      const noteParts = [];
      if (aiImportText.trim()) noteParts.push(`Texte analyse client:\n${aiImportText.trim()}`);
      if (emailDraft?.body) noteParts.push(formatEmailDraftNote(emailDraft));
      if (Array.isArray(aiDraft.warnings) && aiDraft.warnings.length > 0) {
        noteParts.push(`A verifier:\n- ${aiDraft.warnings.join("\n- ")}`);
      }
      if (noteParts.length > 0) {
        setNotes((current) => appendUniqueNoteBlocks(current, noteParts));
      }

      const sectionMessage = hasDraftSections ? ` ${draftSections.length} unite${draftSections.length > 1 ? "s" : ""} ajoutee${draftSections.length > 1 ? "s" : ""}.` : "";
      setAiDraftMessage(`${clientAction}.${clientUpdateMessage} Brouillon applique au formulaire.${sectionMessage}`);
    } catch (err) {
      setAiDraftError(err.message);
    } finally {
      setAiDraftApplying(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedClient) { setError("Client requis"); return; }
    const submitAction = e.nativeEvent?.submitter?.value || (invoiceMode ? "invoice" : quoteMode ? "quote" : "save");
    const normalizedArrival = normalizeTimeInput(heureArrivee);
    const normalizedDeparture = normalizeTimeInput(heureDepart);
    if (heureArrivee && !normalizedArrival) { setError("Heure d'arrivee invalide"); return; }
    if (heureDepart && !normalizedDeparture) { setError("Heure de depart invalide"); return; }

    setSaving(true);
    setSavingAction(submitAction);
    setError("");
    try {
      const quotePaymentSchedule = parseQuotePaymentScheduleInput(quotePaymentCount, quotePaymentPercentTexts);
      if (quotePaymentSchedule === undefined) {
        setError("Les paiements de la soumission doivent etre entre 0 et 100 %, et le total doit faire 100 %.");
        setSaving(false);
        setSavingAction(null);
        return;
      }
      const quoteDepositPercent = Array.isArray(quotePaymentSchedule) && quotePaymentSchedule.length > 0
        ? quotePaymentSchedule[0].percent
        : null;
      const saveOnlyAction = submitAction === "save" || submitAction === "preview";
      const isExistingQuote = ["quote", "quote_sent", "quote_accepted"].includes(currentStatut);
      const isExistingInvoice = ["invoiced", "sent", "paid"].includes(currentStatut);
      const selectedFollowUpStatus = submitAction === "invoice"
        ? followUpStatusFromWorkOrderStatut("invoiced", followUpColumns)
        : submitAction === "quote"
          ? followUpStatusFromWorkOrderStatut("quote", followUpColumns)
          : (saveOnlyAction && (isExistingQuote || isExistingInvoice))
            ? followUpStatusFromWorkOrderStatut(currentStatut, followUpColumns)
        : followUpStatus;
      const finalStatut = submitAction === "quote"
        ? "quote"
        : (saveOnlyAction && (isExistingQuote || isExistingInvoice))
          ? currentStatut
        : workOrderStatutFromFollowUpStatus(selectedFollowUpStatus, followUpColumns);
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
        quoteDepositPercent,
        quotePaymentSchedule,
        description: description || null,
        notes: notes || null,
        statut: finalStatut,
        followUpStatus: selectedFollowUpStatus,
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
      if (selectedFollowUpId) payload.followUpId = Number(selectedFollowUpId);
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
        body: JSON.stringify(editId ? { ...payload, expectedUpdatedAt: loadedUpdatedAt } : payload),
      });
      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Ce bon a ete modifie par un collegue pendant ton edition. Recharge la page (F5) avant de sauvegarder, sinon tu ecrases ses changements.");
        setSaving(false);
        setSavingAction(null);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la creation");
      }
      const wo = await res.json();
      if (hasAiImages) {
        saveAiImagesSession(aiImportImages, wo.id);
      }
      if (aiImportText.trim() || aiDraft || aiEmailDraft) {
        saveAiAnalysisSession({
          text: aiImportText,
          draft: aiDraft,
          emailDraft: aiEmailDraft,
        }, wo.id);
      }
      if (!editId) {
        try {
          window.localStorage.removeItem(DRAFT_KEY);
          clearAiAnalysisSession();
          if (hasAiImages) clearAiImagesSession();
        } catch {}
      }
      if ((submitAction === "invoice" || submitAction === "quote") && aiEmailDraft?.body) {
        try {
          window.localStorage.setItem(emailDraftStorageKey(wo.id), JSON.stringify({
            to: aiEmailDraft.to || selectedClient?.email || "",
            subject: aiEmailDraft.subject || "",
            body: aiEmailDraft.body,
          }));
        } catch {}
      }
      const targetDocumentType = submitAction === "invoice"
        ? "invoice"
        : submitAction === "quote"
          ? "quote"
          : isInvoiceStatus(finalStatut)
            ? "invoice"
            : isQuoteStatus(finalStatut)
              ? "quote"
              : "work_order";
      const shouldPreview = submitAction === "invoice" || submitAction === "quote" || submitAction === "preview";
      router.push(shouldPreview ? adminDocumentDetailHref(wo.id, targetDocumentType) : adminDocumentEditHref(wo.id, targetDocumentType));
      if (!shouldPreview) {
        setSaving(false);
        setSavingAction(null);
      }
    } catch (err) {
      setError(err.message);
      setSaving(false);
      setSavingAction(null);
    }
  }

  const visibleFollowUpColumns = followUpColumns.filter((column) => column.visible);
  const selectedStatusLabel = visibleFollowUpColumns.find((column) => column.key === followUpStatus)?.label || followUpStatus;
  const followUpSelectOptions = [...followUpOptions];
  if (linkedFollowUp?.id && !followUpSelectOptions.some((followUp) => followUp.id === linkedFollowUp.id)) {
    followUpSelectOptions.unshift(linkedFollowUp);
  }
  const selectedFollowUp = followUpSelectOptions.find((followUp) => String(followUp.id) === selectedFollowUpId);
  const flatPieceCount = items.filter((it) => it.itemType !== "discount").length;
  const sectionPieceCount = sections.reduce((sum, sec) => sum + sec.items.filter((it) => it.itemType !== "discount").length, 0);
  const discountCount = items.filter((it) => it.itemType === "discount").length;
  const pieceCount = flatPieceCount + sectionPieceCount;
  const isDirectInvoiceMode = invoiceMode && !editId;
  const documentFollowUpStatut = currentStatut || (effectiveInvoiceMode ? "invoiced" : effectiveQuoteMode ? "quote" : "draft");
  const documentFollowUpStatus = followUpStatusFromWorkOrderStatut(documentFollowUpStatut, followUpColumns);
  const documentFollowUpStatusLabel = visibleFollowUpColumns.find((column) => column.key === documentFollowUpStatus)?.label || documentFollowUpStatus;
  const currentModeLabel = effectiveInvoiceMode
    ? (isDirectInvoiceMode ? "Facture directe" : "Facturation")
    : effectiveQuoteMode
      ? "Soumission"
      : editId
        ? "Modification"
        : "Creation";
  const showModePill = !effectiveQuoteMode;
  const pageTitle = effectiveInvoiceMode
    ? (isDirectInvoiceMode ? "Nouvelle facture" : isExistingInvoiceDocument ? "Modifier la facture" : "Facturer le bon de travail")
    : effectiveQuoteMode
      ? (editId || isExistingQuoteDocument ? "Modifier la soumission" : "Nouvelle soumission")
      : (editId ? "Modifier le bon de travail" : "Nouveau bon de travail");
  const dateLabel = effectiveInvoiceMode ? "Date de facture" : effectiveQuoteMode ? "Date de soumission" : "Date prevue";
  const descriptionLabel = effectiveInvoiceMode
    ? "Description des travaux / frais"
    : effectiveQuoteMode
      ? "Description du projet"
      : "Description du travail";
  const summaryTitle = effectiveInvoiceMode ? "Resume de la facture" : effectiveQuoteMode ? "Resume de la soumission" : "Resume du bon";
  const totalTitle = effectiveInvoiceMode ? "Total de la facture" : effectiveQuoteMode ? "Total de la soumission" : "Total a facturer";
  const showAiClientSuggestionPanel = Boolean(
    aiDraft?.client &&
    !selectedClient &&
    (aiClientSuggestionLoading || aiClientLookupComplete || aiClientSuggestions.length > 0)
  );

  return (
    <div className="px-4 py-5 lg:px-8 lg:py-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link href={currentDocumentListHref} className="admin-text-muted text-sm hover:admin-text">
            <i className="fas fa-arrow-left mr-2"></i>Retour aux documents
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="admin-text text-2xl font-bold">
              {pageTitle}
            </h1>
            {showModePill && (
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-600">
                {currentModeLabel}
              </span>
            )}
            {editId && (
              <span className="rounded-full border admin-border px-3 py-1 text-xs font-medium admin-text-muted">
                {selectedStatusLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {invoiceMode && (
        <div className={`mb-5 max-w-[1500px] rounded-lg border p-4 ${
          "border-orange-500/40 bg-orange-500/10"
        }`}>
          <div className="flex items-start gap-3">
            <i className="fas fa-file-invoice-dollar text-orange-500 text-xl mt-0.5"></i>
            <div className="flex-1">
              <h3 className="font-bold mb-1 text-orange-500">
                {isDirectInvoiceMode ? "Facture directe" : "Mode facturation"}
              </h3>
              <p className="text-sm admin-text-muted">
                {isDirectInvoiceMode
                  ? "Choisissez un client normal ou gestionnaire, ajoutez les lignes, puis creez la facture sans passer par un bon de travail."
                  : "Ajoutez les heures et les pieces, puis utilisez le panneau de droite pour facturer ou enregistrer sans facturer."}
              </p>
            </div>
          </div>
        </div>
      )}

      {showDocumentAssistant && (
        <AiImportPanel
          editId={editId}
          effectiveInvoiceMode={effectiveInvoiceMode}
          selectedClient={selectedClient}
          state={{
            aiImportText, aiImportPdf, aiImportImages, aiDraft, aiDraftLoading, aiDraftApplying,
            aiDraftError, aiDraftMessage, aiDraftProgress, aiProgressPercent, hasAiImportSource,
            hasAiPdf, hasAiImages, aiClientSuggestions, aiClientSuggestionLoading, showAiClientSuggestionPanel,
          }}
          setters={{
            setAiImportText, setAiImportPdf, setAiImportImages, setAiDraft,
            setAiClientSuggestions, setAiClientLookupComplete, setAiImagePreviewIndex,
          }}
          actions={{
            analyzeAiDocumentDraft, applyAiDocumentDraft, handleAiPaste,
            attachAiImportPdf, attachAiImportImages, selectAiClientSuggestion, createAiDraftClientAndSelect,
          }}
          inputRefs={{ aiPdfInputRef, aiImageInputRef }}
        />
      )}

      {loadingEdit && (
        <div className="admin-card mb-5 max-w-[1500px] rounded-lg border p-5">
          <p className="admin-text-muted text-sm text-center">
            <i className="fas fa-spinner fa-spin mr-2"></i>Chargement du bon #{editId}...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`grid max-w-[1500px] gap-5 xl:grid-cols-[minmax(0,1fr)_360px] ${loadingEdit ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="min-w-0 space-y-4">
        {/* Client */}
        <div className="admin-card border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="admin-text font-bold">Client</h2>
            {!selectedClient && (
              <div className="flex gap-2 flex-wrap justify-end">
                <button type="button" onClick={() => setQuickClientOpen((v) => !v)}
                  className="px-4 py-2 border admin-border rounded-lg text-sm font-medium admin-text admin-hover">
                  <i className="fas fa-user-plus mr-2"></i>Client rapide
                </button>
                <button type="button" onClick={() => setClientPickerOpen(true)}
                  className="px-4 py-2 bg-cyan-700 text-white rounded-lg text-sm font-medium hover:bg-cyan-600">
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
                      <p className="admin-text-muted text-xs">{c.phone || "-"} {c.city ? `| ${c.city}` : ""}</p>
                      {c.secondaryPhone && <p className="admin-text-muted text-xs">{c.secondaryPhone}</p>}
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
                    <input type="tel" placeholder="Autre telephone" value={quickClient.secondaryPhone}
                      onChange={(e) => setQuickClient((p) => ({ ...p, secondaryPhone: e.target.value }))}
                      className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
                    <input type="email" placeholder="Email" value={quickClient.email}
                      onChange={(e) => setQuickClient((p) => ({ ...p, email: e.target.value }))}
                      className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
                    <select value={quickClient.type}
                      onChange={(e) => {
                        const type = e.target.value;
                        setQuickClient((p) => ({
                          ...p,
                          type,
                          friendlyEmail: type === "gestionnaire" ? (p.type === "gestionnaire" ? p.friendlyEmail : true) : false,
                        }));
                      }}
                      className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full">
                      <option value="particulier">Particulier</option>
                      <option value="gestionnaire">Gestionnaire / B2B</option>
                    </select>
                    {quickClient.type === "gestionnaire" && (
                      <>
                        <input type="text" placeholder="Nom du contact courriel" value={quickClient.contactName}
                          onChange={(e) => setQuickClient((p) => ({ ...p, contactName: e.target.value }))}
                          className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
                        <label className="admin-card border admin-border rounded-lg px-3 py-2.5 flex items-center justify-between gap-3 cursor-pointer">
                          <span className="admin-text text-sm font-medium">Courriel amical</span>
                          <input
                            type="checkbox"
                            checked={quickClient.friendlyEmail}
                            onChange={(e) => setQuickClient((p) => ({ ...p, friendlyEmail: e.target.checked }))}
                            className="h-5 w-5 accent-[var(--color-red)]"
                          />
                        </label>
                      </>
                    )}
                    <AddressAutocomplete
                      value={quickClient.address}
                      onChange={(address) => setQuickClient((p) => ({ ...p, address }))}
                      onSelect={(address) => setQuickClient((p) => ({ ...p, ...address }))}
                      placeholder="Adresse"
                      inputClassName="admin-input border rounded-lg px-3 py-2.5 text-sm w-full"
                    />
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
                {selectedClient.company && <p className="admin-text-muted text-sm">Compagnie: {selectedClient.company}</p>}
                {selectedClient.contactName && <p className="admin-text-muted text-sm">Contact: {selectedClient.contactName}</p>}
                {selectedClient.email && <p className="admin-text-muted text-sm">{selectedClient.email}</p>}
                <p className="admin-text-muted text-sm">{selectedClient.phone || "-"}</p>
                {selectedClient.secondaryPhone && <p className="admin-text-muted text-sm">{selectedClient.secondaryPhone}</p>}
                {selectedClient.address && <p className="admin-text-muted text-sm">{selectedClient.address}{selectedClient.city ? `, ${selectedClient.city}` : ""}</p>}
              </div>
              <button type="button" onClick={clearSelectedClient} className="text-xs font-medium text-cyan-600 hover:text-cyan-500">
                Changer
              </button>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="admin-card border rounded-xl p-4 space-y-4">
          <h2 className="admin-text font-bold">Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="admin-text-muted text-xs mb-1 block">{dateLabel}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
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
            <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(150px,1fr)_150px]">
              <AddressAutocomplete
                value={interventionAddress}
                onChange={setInterventionAddress}
                onSelect={(address) => {
                  setInterventionAddress(address.address || interventionAddress || "");
                  setInterventionCity(address.city || interventionCity || "");
                  setInterventionPostalCode(address.postalCode || interventionPostalCode || "");
                }}
                placeholder="Adresse"
                className="min-w-0"
                inputClassName="admin-input border rounded-lg px-3 py-2.5 text-sm w-full"
              />
              <input type="text" placeholder="Ville" value={interventionCity}
                onChange={(e) => setInterventionCity(e.target.value)}
                className="admin-input min-w-0 border rounded-lg px-3 py-2.5 text-sm w-full" />
              <input type="text" placeholder="Code postal" value={interventionPostalCode}
                onChange={(e) => setInterventionPostalCode(e.target.value)}
                className="admin-input min-w-0 border rounded-lg px-3 py-2.5 text-sm w-full" />
            </div>
          </div>
          <div>
            <label className="admin-text-muted text-xs mb-1 block">{descriptionLabel}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full" />
          </div>
          {effectiveQuoteMode && (
            <div className="rounded-lg border admin-border bg-white/[0.02] p-3">
              <div className="grid gap-3 md:grid-cols-[minmax(0,220px)_1fr] md:items-end">
                <div>
                  <label className="admin-text-muted text-xs mb-1 block">Paiements soumission</label>
                  <select
                    value={quotePaymentCount}
                    onChange={(e) => {
                      const nextCount = e.target.value;
                      setQuotePaymentCount(nextCount);
                      if (nextCount !== "auto") {
                        setQuotePaymentPercentTexts((current) => resizeQuotePaymentTexts(current, Number(nextCount)));
                      }
                    }}
                    className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full"
                  >
                    <option value="auto">Auto</option>
                    <option value="1">1 paiement</option>
                    <option value="2">2 paiements</option>
                    <option value="3">3 paiements</option>
                    <option value="4">4 paiements</option>
                    <option value="5">5 paiements</option>
                    <option value="6">6 paiements</option>
                  </select>
                </div>
                <p className="admin-text-muted text-xs leading-relaxed">
                  Auto: moins de 1 000 $ aucun acompte; 1 000 $ et plus 50 % a l&apos;acceptation et 50 % a la fin.
                </p>
              </div>
              {quotePaymentCount !== "auto" && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: Number(quotePaymentCount) || 0 }).map((_, index) => (
                    <div key={index}>
                      <label className="admin-text-muted text-[11px] mb-1 block">
                        {quotePaymentUiLabel(index, Number(quotePaymentCount))}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={quotePaymentPercentTexts[index] || ""}
                          onChange={(e) => {
                            const next = [...quotePaymentPercentTexts];
                            next[index] = e.target.value.replace(/[^0-9.,]/g, "");
                            setQuotePaymentPercentTexts(next);
                          }}
                          className="admin-input border rounded-lg px-3 py-2.5 pr-8 text-sm w-full"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 admin-text-muted text-xs">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <details className="rounded-lg border admin-border bg-white/[0.02] p-3">
            <summary className="cursor-pointer text-sm font-medium admin-text">
              Options avancees
            </summary>
            <div className="mt-3 space-y-3">
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
          </details>
        </div>

        <ThermosQuoteInline
          active={thermosCalculatorActive}
          onActiveChange={setThermosCalculatorActive}
          city={interventionCity || selectedClient?.city || ""}
          isB2B={isB2B}
          sections={sections}
          onAddToBon={addThermosQuoteToBon}
        />

        {/* Sections par unite (B2B only) */}
        {isB2B && (
          <div className="admin-card border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="admin-text font-bold">
                <i className="fas fa-building mr-2 text-blue-400"></i>Unites visitees ({sections.length})
              </h2>
              <p className="admin-text-muted text-xs">Client B2B â€” organiser par unite</p>
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
                className="px-4 py-2 bg-cyan-700 text-white rounded-lg text-sm font-medium hover:bg-cyan-600 disabled:opacity-30">
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
                      <span className="font-bold text-cyan-600">{secSubtotal.toFixed(2)}$</span>
                      <button type="button" onClick={() => removeSection(sIdx)} aria-label="Retirer l'unite" className="text-amber-500 text-sm hover:text-amber-400">
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
                            {svc.name} <span className="text-cyan-600 font-bold ml-1">{Number(svc.price).toFixed(0)}$</span>
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
                          <button type="button" onClick={() => removeSectionItem(sIdx, iIdx)} aria-label="Retirer l'item" className="text-amber-500 text-sm hover:text-amber-400">
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
                          <span className="ml-auto font-bold text-cyan-600 text-sm">
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

        {/* Items (flat â€” for particulier OR discounts-only B2B) */}
        <div className="admin-card border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="admin-text font-bold">
              {isB2B ? "Escomptes / lignes globales" : "Pieces utilisees"}
            </h2>
            {!isB2B && (
              <button type="button" onClick={() => { setCatalogTarget(null); setCatalogOpen(true); }}
                className="px-4 py-2 bg-cyan-700 text-white rounded-lg text-sm font-medium hover:bg-cyan-600">
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
                    <button type="button" onClick={() => removeItem(i)} aria-label="Retirer l'escompte" className="text-amber-500 text-sm hover:text-amber-400">
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
                  <button type="button" onClick={() => removeItem(i)} aria-label="Retirer la piece" className="text-amber-500 text-sm hover:text-amber-400">
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
                  <span className="ml-auto font-bold text-cyan-600">
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
        <div className="admin-card border rounded-xl p-4 space-y-4">
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
            <span className="ml-auto font-bold text-cyan-600">{totalLabor.toFixed(2)}$</span>
          </div>

          <p className="admin-text-muted border-t admin-border pt-3 text-xs">
            Le taux inscrit ici est conserve sur ce document. Les changements dans Parametres ne modifient pas les anciens documents.
          </p>
        </div>

        </div>

        {/* Resume + actions */}
        <aside className="admin-card border rounded-xl p-5 xl:sticky xl:top-5 xl:self-start">
          <div className="space-y-5">
            <div>
              <p className="admin-text-muted text-[11px] font-bold uppercase tracking-wider">{summaryTitle}</p>
              <div className="mt-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">{totalTitle}</p>
                <p className="mt-1 text-3xl font-black text-cyan-700">{total.toFixed(2)}$</p>
                <p className="admin-text-muted mt-1 text-xs">
                  {pieceCount} piece{pieceCount !== 1 ? "s" : ""} | {formatLaborHours(laborHours)} main d&apos;oeuvre
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t admin-border pt-4">
              <MoneyLine label="Pieces" value={`${totalPieces.toFixed(2)}$`} />
              <MoneyLine label="Main d'oeuvre" value={`${totalLabor.toFixed(2)}$`} />
              <MoneyLine label="Sous-total" value={`${subtotal.toFixed(2)}$`} />
              <MoneyLine label={`TPS (${(settings.tps_rate * 100).toFixed(1)}%)`} value={`${tps.toFixed(2)}$`} muted />
              <MoneyLine label={`TVQ (${(settings.tvq_rate * 100).toFixed(3)}%)`} value={`${tvq.toFixed(2)}$`} muted />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border admin-border p-2">
                <p className="text-lg font-bold admin-text">{pieceCount}</p>
                <p className="admin-text-muted text-[10px] uppercase">Pieces</p>
              </div>
              <div className="rounded-lg border admin-border p-2">
                <p className="text-lg font-bold admin-text">{sections.length}</p>
                <p className="admin-text-muted text-[10px] uppercase">Unites</p>
              </div>
              <div className="rounded-lg border admin-border p-2">
                <p className="text-lg font-bold admin-text">{discountCount}</p>
                <p className="admin-text-muted text-[10px] uppercase">Rabais</p>
              </div>
            </div>

            <div className="space-y-4 border-t admin-border pt-4">
            {selectedClient && !effectiveInvoiceMode && !effectiveQuoteMode && (
              <div>
                <label className="admin-text-muted text-xs mb-1 block">Rattacher au suivi client</label>
                <select
                  value={selectedFollowUpId}
                  onChange={(e) => setSelectedFollowUpId(e.target.value)}
                  className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full"
                >
                  <option value="">
                    {loadingFollowUps ? "Chargement des suivis..." : "Aucun rattachement manuel"}
                  </option>
                  {followUpSelectOptions.map((followUp) => {
                    const statusLabel = visibleFollowUpColumns.find((column) => column.key === followUp.status)?.label || followUp.status;
                    return (
                      <option key={followUp.id} value={followUp.id}>
                        {followUp.title || followUp.contactName || `Suivi #${followUp.id}`} | {statusLabel}{followUpDateLabel(followUp.nextActionDate || followUp.updatedAt)}
                      </option>
                    );
                  })}
                </select>
                <p className="admin-text-muted text-[10px] mt-1">
                  {selectedFollowUp
                    ? `Lie a: ${selectedFollowUp.title || `suivi #${selectedFollowUp.id}`}`
                    : followUpSelectOptions.length > 1
                      ? "Plusieurs dossiers actifs: choisis le bon suivi pour eviter les doublons."
                      : "Si aucun suivi n'est choisi, le systeme lie seulement quand c'est evident."}
                </p>
              </div>
            )}
            {selectedClient && (effectiveInvoiceMode || effectiveQuoteMode) && (
              <div className={`rounded-lg border px-3 py-2.5 ${
                effectiveInvoiceMode ? "border-orange-500/25 bg-orange-500/10" : "border-sky-500/25 bg-sky-500/10"
              }`}>
                <p className="admin-text-muted text-[10px] font-bold uppercase tracking-wider">
                  Suivi clients
                </p>
                <p className="admin-text mt-1 text-sm font-bold">
                  {effectiveInvoiceMode ? "Facture" : "Soumission"} | {documentFollowUpStatusLabel}
                </p>
                <p className="admin-text-muted mt-1 text-[10px]">
                  Le suivi est mis a jour automatiquement avec ce document.
                </p>
                {selectedFollowUp && (
                  <p className="admin-text-muted mt-1 truncate text-[10px]">
                    Lie a: {selectedFollowUp.title || `suivi #${selectedFollowUp.id}`}
                  </p>
                )}
              </div>
            )}
            {!effectiveInvoiceMode && !effectiveQuoteMode && (
            <div>
              <label className="admin-text-muted text-xs mb-1 block">Statut</label>
              <select value={followUpStatus} onChange={(e) => setFollowUpStatus(e.target.value)}
                className="admin-input border rounded-lg px-3 py-2.5 text-sm w-full">
                {visibleFollowUpColumns.map((column) => (
                  <option key={column.key} value={column.key}>{column.label}</option>
                ))}
              </select>
              <p className="admin-text-muted text-[10px] mt-1">MÃªme statut que dans Suivi clients.</p>
            </div>
            )}
            {error && <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600">{error}</p>}
            {effectiveInvoiceMode ? (
              <div className="flex flex-col gap-2">
                {editId && !isExistingInvoiceSaved && (
                  <button
                    type="submit"
                    value="save"
                    disabled={saving || !selectedClient}
                    className="w-full rounded-lg border admin-border px-5 py-3 text-sm font-medium admin-text hover:bg-white/5 disabled:opacity-50"
                  >
                    {saving && savingAction === "save" ? "Enregistrement..." : "Enregistrer les modifications"}
                  </button>
                )}
                <button
                  type="submit"
                  value={isExistingInvoiceSaved ? "save" : "invoice"}
                  disabled={saving || !selectedClient}
                  className="w-full rounded-lg bg-orange-600 px-6 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  <i className="fas fa-file-invoice-dollar mr-2"></i>
                  {saving && ["invoice", "save"].includes(savingAction)
                    ? "Enregistrement..."
                    : isExistingInvoiceSaved
                      ? "Enregistrer la facture"
                      : isDirectInvoiceMode
                        ? "Creer la facture"
                        : "Facturer ce bon"}
                </button>
              </div>
            ) : effectiveQuoteMode ? (
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  value={isExistingQuoteSaved ? "save" : "quote"}
                  disabled={saving || !selectedClient}
                  className="w-full rounded-lg border border-sky-500/40 px-5 py-3 text-sm font-bold text-sky-600 hover:bg-sky-500/10 disabled:opacity-50"
                >
                  <i className="fas fa-file-signature mr-2"></i>
                  {saving && ["quote", "save"].includes(savingAction)
                    ? "Enregistrement..."
                    : isExistingQuoteSaved
                      ? "Enregistrer la soumission"
                      : "Creer la soumission"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button type="submit" disabled={saving || !selectedClient}
                  value="save"
                  className="w-full rounded-lg bg-cyan-700 px-6 py-3 text-sm font-bold text-white hover:bg-cyan-600 disabled:opacity-50">
                  {saving ? (editId ? "Enregistrement..." : "Creation...") : (editId ? "Enregistrer les modifications" : "Creer le bon")}
                </button>
                <button type="submit" disabled={saving || !selectedClient}
                  value="quote"
                  className="w-full rounded-lg border border-sky-500/40 px-4 py-2.5 text-sm font-bold text-sky-600 hover:bg-sky-500/10 disabled:opacity-50">
                  <i className="fas fa-file-signature mr-2"></i>
                  {saving && savingAction === "quote" ? "Creation..." : (editId ? "Enregistrer comme soumission" : "Creer une soumission")}
                </button>
                {editId && (
                  <Link
                    href={adminDocumentEditHref(editId, "invoice")}
                    className="flex w-full items-center justify-center rounded-lg border border-orange-500/40 px-4 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-500/10"
                  >
                    <i className="fas fa-file-invoice-dollar mr-2"></i>Passer en facturation
                  </Link>
                )}
              </div>
            )}
            {editId && (
              <button
                type="submit"
                value="preview"
                disabled={saving || !selectedClient}
                className="flex w-full items-center justify-center rounded-lg border admin-border px-4 py-2.5 text-sm font-medium admin-text hover:bg-white/5 disabled:opacity-50"
              >
                <i className="fas fa-file-lines mr-2"></i>
                {saving && savingAction === "preview" ? "Enregistrement..." : "Apercu / envoyer"}
              </button>
            )}
            </div>
          </div>
        </aside>
      </form>

      {Number.isInteger(aiImagePreviewIndex) && aiImagePreviewSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setAiImagePreviewIndex(null)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border admin-border bg-slate-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b admin-border px-4 py-3">
              <div className="min-w-0">
                <p className="admin-text truncate text-sm font-bold">{aiImagePreviewImage?.name || "Image importee"}</p>
                <p className="admin-text-muted text-xs">
                  Image {(aiImagePreviewIndex || 0) + 1} sur {aiImportImages.length} | {formatBytes(aiImagePreviewImage?.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAiImagePreviewIndex(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 admin-text hover:bg-white/15"
                aria-label="Fermer"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="flex min-h-0 justify-center overflow-auto bg-black p-3">
              <Image
                src={aiImagePreviewSrc}
                alt="Image importee pour l'analyse IA"
                width={1400}
                height={1000}
                unoptimized
                className="h-auto max-h-[78vh] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      <CatalogPicker open={catalogOpen} onClose={() => setCatalogOpen(false)} onPick={addProduct} />
      <ClientPicker
        open={clientPickerOpen}
        onClose={() => setClientPickerOpen(false)}
        onPick={(c) => { selectClient(c); setClientPickerOpen(false); setQuickClientOpen(false); }}
      />
    </div>
  );
}
