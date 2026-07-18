"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MeasurementEditor from "@/components/measurements/MeasurementEditor";
import { COMPANY_INFO } from "@/lib/company-info";
import { formatSixteenths } from "@/lib/thermos-layout";
import {
  THERMOS_SPACER_COLORS,
  measurementPaneToThermosLine,
} from "@/lib/thermos-estimate-input";
import styles from "./thermos-calculator.module.css";

const ClientPicker = dynamic(() => import("@/components/admin/ClientPicker"), { ssr: false });

const MONEY = new Intl.NumberFormat("fr-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
});
const PUBLIC_MAX_LINES = 20;

function money(value) {
  return MONEY.format(Number(value) || 0);
}

function emptyQuote() {
  return {
    settings: {},
    lines: [],
    totals: {
      quantity: 0,
      sqft: 0,
      piecesSubtotal: 0,
      tripFee: 0,
      margin: 0,
      subtotal: 0,
      tps: 0,
      tvq: 0,
      total: 0,
      totalMinWithTaxes: 0,
      totalMaxWithTaxes: 0,
    },
  };
}

function createInitialMeasurement(revision = 0, source = "admin") {
  return {
    id: `calculator-${revision}`,
    source,
    accuracy: "approximate",
    status: "in_progress",
    data: {
      version: 1,
      locale: "fr",
      displayUnit: "in",
      notes: "",
      windows: [{
        id: `calculator-window-${revision}`,
        number: 1,
        label: "Fenêtre 1",
        location: "",
        photoUrl: null,
        viewSide: "inside",
        layoutPreset: "1x1",
        frame: { widthSixteenths: null, heightSixteenths: null },
        panes: [{
          id: `calculator-pane-${revision}`,
          number: 1,
          x: 0,
          y: 0,
          width: 10000,
          height: 10000,
          widthSixteenths: null,
          heightSixteenths: null,
          thicknessSixteenths: null,
          options: {},
          grille: {},
        }],
      }],
    },
  };
}

function glassLabel(value) {
  return {
    simple: "Simple",
    double: "Double",
    triple: "Triple",
  }[value] || "Vitrage à choisir";
}

function accessLabel(value) {
  return {
    without_ladder: "Sans échelle",
    with_ladder: "Avec échelle",
    easy: "Accès facile",
    medium: "Accès moyen",
    hard: "Accès difficile",
  }[value] || "Accès à choisir";
}

function optionLabels(line) {
  return [
    glassLabel(line.glassType),
    line.thicknessSixteenths ? `Épaisseur ${formatSixteenths(line.thicknessSixteenths)}` : null,
    line.lowE ? "Low-E" : null,
    line.argon ? "Argon" : null,
    line.tempered ? "Trempé" : null,
    line.laminated ? "Laminé" : null,
    line.grill ? "Carreaux décoratifs" : null,
    line.spacerColor ? `Intercalaire ${line.spacerColor}` : null,
    accessLabel(line.originalAccess),
  ].filter(Boolean);
}

function panePricingIsComplete(pane) {
  return Boolean(
    pane?.widthSixteenths > 0
    && pane?.heightSixteenths > 0
    && pane?.thicknessSixteenths >= 4
    && ["simple", "double", "triple"].includes(pane?.options?.glassType)
    && THERMOS_SPACER_COLORS.includes(String(pane?.options?.spacerColor || "").toLowerCase())
    && ["with_ladder", "without_ladder", "easy", "medium", "hard"].includes(pane?.options?.access),
  );
}

function buildPaneEntries(data) {
  return (data?.windows || []).flatMap((windowValue, windowIndex) => (
    (windowValue.panes || []).map((pane, paneIndex) => ({
      pane,
      paneId: pane.id,
      paneIndex,
      thermosNumber: paneIndex + 1,
      windowId: windowValue.id,
      windowIndex,
      windowNumber: windowIndex + 1,
      windowLabel: windowValue.label,
      windowCode: `F${String(windowIndex + 1).padStart(2, "0")}`,
      thermosCode: `T${paneIndex + 1}`,
      complete: panePricingIsComplete(pane),
    }))
  ));
}

function selectedBreakdown(line) {
  if (!line) return [];
  return [
    ["Verre", line.baseGlassUnit],
    ["Low-E", line.lowEUnit],
    ["Argon", line.argonUnit],
    ["Triple vitrage", line.tripleUnit],
    ["Réduction verre simple", line.simpleDiscountUnit ? -line.simpleDiscountUnit : 0],
    ["Verre laminé", line.laminatedUnit],
    ["Verre trempé", line.temperedUnit],
    ["Carreaux décoratifs", line.grillUnit],
    ["Intercalaire spécial", line.spacerUnit],
    ["Épaisseur spéciale", line.thicknessUnit],
    ["Installation", line.installUnit],
    ["Accès", line.accessUnit],
  ].filter(([, value]) => Number(value));
}

export default function ThermosCalculatorClient({ mode = "admin" }) {
  const isPublic = mode === "public";
  const editorRef = useRef(null);
  const [editorRevision, setEditorRevision] = useState(0);
  const initialMeasurement = useMemo(
    () => createInitialMeasurement(editorRevision, isPublic ? "client" : "admin"),
    [editorRevision, isPublic],
  );
  const [measurementData, setMeasurementData] = useState(initialMeasurement.data);
  const [selectedPane, setSelectedPane] = useState({
    windowId: initialMeasurement.data.windows[0].id,
    paneId: initialMeasurement.data.windows[0].panes[0].id,
  });
  const [quote, setQuote] = useState(() => emptyQuote());
  const [quoteReady, setQuoteReady] = useState(true);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [quoteLoadedAt, setQuoteLoadedAt] = useState(null);
  const [estimateRevision, setEstimateRevision] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [city, setCity] = useState("");
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    setCopied(false);
    setActionError("");
  }, [city, measurementData, selectedClient]);

  const paneEntries = useMemo(() => buildPaneEntries(measurementData), [measurementData]);
  const pricedEntries = useMemo(() => paneEntries.filter(({ pane }) => (
    pane.widthSixteenths > 0 && pane.heightSixteenths > 0
  )), [paneEntries]);
  const completeEntries = useMemo(() => paneEntries.filter((entry) => entry.complete), [paneEntries]);
  const pricingLines = useMemo(() => pricedEntries.map((entry) => measurementPaneToThermosLine(entry.pane, {
    _lineId: entry.paneId,
    paneId: entry.paneId,
    windowId: entry.windowId,
    windowNumber: entry.windowNumber,
    windowLabel: entry.windowLabel,
    windowCode: entry.windowCode,
    thermosNumber: entry.thermosNumber,
    thermosCode: entry.thermosCode,
    widthSixteenths: entry.pane.widthSixteenths,
    heightSixteenths: entry.pane.heightSixteenths,
    thicknessSixteenths: entry.pane.thicknessSixteenths,
    complete: entry.complete,
    originalAccess: entry.pane.options?.access || "",
  })), [pricedEntries]);
  useEffect(() => {
    if (!pricingLines.length) {
      setQuote(emptyQuote());
      setQuoteReady(true);
      setQuoteLoading(false);
      setQuoteError("");
      return undefined;
    }
    if (isPublic && pricingLines.length > PUBLIC_MAX_LINES) {
      setQuoteReady(false);
      setQuoteLoading(false);
      setQuoteError(`Le calculateur public accepte un maximum de ${PUBLIC_MAX_LINES} thermos par estimation.`);
      return undefined;
    }

    const controller = new AbortController();
    const endpoint = isPublic ? "/api/public/thermos-estimate" : "/api/admin/thermos-estimate";
    setQuoteLoading(true);
    setQuoteReady(false);
    setQuoteError("");

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines: pricingLines }),
          signal: controller.signal,
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || body.error) throw new Error(body.error || "Impossible de calculer cette estimation.");

        const nextQuote = isPublic ? {
          settings: {},
          lines: (body.lines || []).map((line, index) => ({ ...pricingLines[index], ...line })),
          totals: { ...emptyQuote().totals, ...(body.totals || {}) },
        } : body;
        setQuote(nextQuote);
        setQuoteReady(true);
        setQuoteLoadedAt(new Date());
      } catch (error) {
        if (error.name === "AbortError") return;
        setQuoteReady(false);
        setQuoteError(error.message || "Impossible de calculer cette estimation.");
      } finally {
        if (!controller.signal.aborted) setQuoteLoading(false);
      }
    }, isPublic ? 350 : 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [estimateRevision, isPublic, pricingLines]);

  const selectedEntry = paneEntries.find((entry) => (
    entry.windowId === selectedPane.windowId && entry.paneId === selectedPane.paneId
  ));
  const selectedLine = quote.lines.find((line) => (
    line.windowId === selectedPane.windowId && line.paneId === selectedPane.paneId
  ));
  const breakdown = selectedBreakdown(selectedLine);
  const workingCity = city || selectedClient?.city || "";
  const pricingConfigurationIssues = useMemo(() => {
    if (isPublic) return [];
    const issues = [];
    const settings = quote.settings || {};
    const numericSetting = (key) => Number(String(settings[key] ?? "0").replace(",", ".")) || 0;
    if (pricingLines.some((line) => line.glassType === "triple") && numericSetting("thermos_triple_percent") <= 0) {
      issues.push("Le tarif du triple vitrage doit être configuré dans les paramètres.");
    }
    if (pricingLines.some((line) => line.glassType === "simple") && numericSetting("thermos_simple_discount_percent") <= 0) {
      issues.push("La réduction du verre simple doit être configurée dans les paramètres.");
    }
    if (pricingLines.some((line) => line.laminated) && numericSetting("thermos_laminated_percent") <= 0) {
      issues.push("Le tarif du verre laminé doit être configuré dans les paramètres.");
    }
    return issues;
  }, [isPublic, pricingLines, quote.settings]);
  const estimateIssues = useMemo(() => {
    const issues = [];
    const missingDimensions = paneEntries.length - pricedEntries.length;
    const incompleteOptions = paneEntries.filter((entry) => !entry.complete).length;
    if (!quote.lines.length) issues.push("Mesurez au moins un thermos.");
    if (missingDimensions > 0) issues.push(`${missingDimensions} thermos sans largeur ou hauteur.`);
    if (incompleteOptions > 0) issues.push(`${incompleteOptions} thermos avec des options à compléter.`);
    issues.push(...pricingConfigurationIssues);
    return issues;
  }, [paneEntries, pricedEntries, pricingConfigurationIssues, quote.lines.length]);
  const canUseEstimate = quoteReady && estimateIssues.length === 0;
  const hasEstimate = quoteReady && quote.lines.length > 0;
  const workOrderHref = `/admin/bons/nouveau?fresh=1${selectedClient?.id ? `&clientId=${encodeURIComponent(selectedClient.id)}` : ""}`;

  const handleDataChange = useCallback((nextData) => {
    setMeasurementData(nextData);
  }, []);

  const handleSelectionChange = useCallback((nextSelection) => {
    setSelectedPane(nextSelection);
  }, []);

  function pickClient(client) {
    setSelectedClient(client);
    setCity(client.city || "");
    setClientPickerOpen(false);
  }

  function focusLine(line) {
    setSelectedPane({ windowId: line.windowId, paneId: line.paneId });
    editorRef.current?.focusPane?.(line.windowId, line.paneId);
  }

  function resetSimulation() {
    if (!window.confirm("Effacer cette simulation et recommencer avec une fenêtre vide?")) return;
    const nextRevision = editorRevision + 1;
    const nextMeasurement = createInitialMeasurement(nextRevision, isPublic ? "client" : "admin");
    setEditorRevision(nextRevision);
    setMeasurementData(nextMeasurement.data);
    setSelectedPane({
      windowId: nextMeasurement.data.windows[0].id,
      paneId: nextMeasurement.data.windows[0].panes[0].id,
    });
    setCopied(false);
  }

  function buildSummary() {
    const clientName = selectedClient?.name || "Client non sélectionné";
    const phone = selectedClient?.phone || selectedClient?.secondaryPhone || "-";
    const address = selectedClient?.address || "-";
    const lines = quote.lines.map((line) => [
      `${line.windowCode} · ${line.windowLabel} · ${line.thermosCode}`,
      `${formatSixteenths(line.widthSixteenths)} × ${formatSixteenths(line.heightSixteenths)} — ${line.sqftPerUnit} pi²`,
      optionLabels(line).join(", "),
      money(line.lineSubtotal),
    ].join("\n"));

    return [
      "Simulation thermos Vosthermos",
      `Client : ${clientName}`,
      `Téléphone : ${phone}`,
      `Adresse : ${address}`,
      `Ville : ${workingCity || "-"}`,
      "",
      ...lines.flatMap((line) => [line, ""]),
      `Sous-total : ${money(quote.totals.subtotal)}`,
      `TPS : ${money(quote.totals.tps)}`,
      `TVQ : ${money(quote.totals.tvq)}`,
      `Total : ${money(quote.totals.total)}`,
      `Fourchette taxes incluses : ${money(quote.totals.totalMinWithTaxes)} à ${money(quote.totals.totalMaxWithTaxes)}`,
      "",
      "Estimation à confirmer après validation des mesures et des options.",
    ].join("\n");
  }

  async function copySummary() {
    if (!canUseEstimate) return;
    try {
      await navigator.clipboard.writeText(buildSummary());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      setActionError("La copie automatique est bloquée par le navigateur.");
    }
  }

  return (
    <div className={`${styles.page} ${isPublic ? styles.publicPage : ""}`} data-mode={isPublic ? "public" : "admin"}>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>{isPublic ? "Estimation gratuite · sans engagement" : "Outil interne · estimation en direct"}</span>
          <h1 className={`${styles.title} ${isPublic ? "" : "admin-text"}`}>
            {isPublic ? "Dessinez votre fenêtre. Voyez son prix." : "Calculateur thermos visuel"}
          </h1>
          <p className={`${styles.intro} ${isPublic ? "" : "admin-text-muted"}`}>
            {isPublic
              ? "Reproduisez la forme de votre fenêtre, ajoutez les mesures et obtenez une estimation selon les tarifs Vosthermos en vigueur."
              : "Dessinez les fenêtres comme elles sont installées. Chaque thermos mesuré devient une ligne de prix identifiable."}
          </p>
        </div>
        <div className={styles.heroActions}>
          <button type="button" onClick={resetSimulation} className={styles.ghostAction}>
            <i className="fas fa-rotate-left" aria-hidden="true" /> Nouvelle simulation
          </button>
          {isPublic ? (
            <Link href="/rendez-vous" className={styles.priceAction}>
              <i className="fas fa-calendar-check" aria-hidden="true" /> Faire confirmer le prix
            </Link>
          ) : (
            <Link href="/admin/parametres#thermos-pricing" target="_blank" className={styles.priceAction}>
              <i className="fas fa-sliders" aria-hidden="true" /> Modifier les prix
            </Link>
          )}
        </div>
      </header>

      {!isPublic && <section className={`${styles.contextCard} admin-card admin-border`}>
        <div className={styles.clientBlock}>
          <div className={styles.contextIcon}><i className="fas fa-user" aria-hidden="true" /></div>
          <div className={styles.contextCopy}>
            <span className="admin-text-muted">Client de la simulation</span>
            <strong className="admin-text">{selectedClient?.name || "Aucun client sélectionné"}</strong>
            {selectedClient && <small className="admin-text-muted">{selectedClient.phone || selectedClient.secondaryPhone || "Téléphone non inscrit"}</small>}
          </div>
          <button type="button" className={styles.contextButton} onClick={() => setClientPickerOpen(true)}>
            {selectedClient ? "Changer" : "Choisir un client"}
          </button>
          {selectedClient && <button type="button" className={styles.removeClient} onClick={() => setSelectedClient(null)}>Retirer</button>}
        </div>
        <label className={styles.cityField}>
          <span className="admin-text-muted">Ville ou secteur</span>
          <input className="admin-input" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ex. Montréal, Verdun" />
        </label>
      </section>}

      {isPublic && (
        <section className={styles.publicGuide} aria-label="Comment utiliser le calculateur">
          <article><span>1</span><div><strong>Choisissez la forme</strong><p>Sélectionnez le modèle qui ressemble à votre fenêtre.</p></div></article>
          <article><span>2</span><div><strong>Ajoutez les mesures</strong><p>Entrez largeur, hauteur et options de chaque thermos.</p></div></article>
          <article><span>3</span><div><strong>Voyez l’estimation</strong><p>Le prix se met à jour automatiquement, jusqu’à 20 thermos.</p></div></article>
        </section>
      )}

      {quoteError && (
        <div className={styles.pricingError} role="alert">
          <div>
            <strong>Estimation non disponible</strong>
            <span>{quoteError} {isPublic ? "Vos mesures restent affichées." : "Aucun montant ne doit être transmis avant le recalcul."}</span>
          </div>
          <button type="button" onClick={() => setEstimateRevision((value) => value + 1)} disabled={quoteLoading}>
            {quoteLoading ? "Calcul…" : "Réessayer"}
          </button>
        </div>
      )}

      <div className={styles.mobileEstimate}>
        <div><span>{isPublic ? "Votre estimation" : "Total actuel"}</span><strong>{hasEstimate ? money(quote.totals.total) : "—"}</strong></div>
        <a href="#resultat-calculateur">{completeEntries.length} / {paneEntries.length} complets · Voir le détail</a>
      </div>

      <div className={styles.calculatorGrid}>
        <div className={styles.editorFrame}>
          <MeasurementEditor
            key={editorRevision}
            ref={editorRef}
            initialMeasurement={initialMeasurement}
            calculatorMode
            technicianMode
            photoEnabled={false}
            language="fr"
            onDataChange={handleDataChange}
            onSelectionChange={handleSelectionChange}
          />
        </div>

        <aside id="resultat-calculateur" className={styles.receipt} aria-label="Résultat de la simulation">
          <div className={styles.receiptTop}>
            <div>
              <span className={styles.receiptKicker}>{isPublic ? "Votre estimation actuelle" : "Estimation actuelle"}</span>
              <p className={styles.price} aria-live="polite">{hasEstimate ? money(quote.totals.total) : "—"}</p>
              <span className={styles.taxLabel}>Taxes incluses</span>
            </div>
            <div className={styles.rateState} data-ready={quoteReady}>
              <span />
              {!pricingLines.length ? "Prêt à calculer" : quoteLoading ? "Prix en calcul" : quoteReady ? (isPublic ? "Tarifs à jour" : "Prix admin chargés") : "Calcul bloqué"}
            </div>
          </div>

          {!quoteReady ? (
            <div className={styles.priceUnavailable} role="status">
              <i className={`fas ${quoteLoading ? "fa-spinner fa-spin" : "fa-triangle-exclamation"}`} aria-hidden="true" />
              <strong>{quoteLoading ? "Calcul de votre estimation" : "Prix temporairement indisponibles"}</strong>
              <p>{quoteLoading ? "Le résultat apparaîtra dès que le calcul sera prêt." : (isPublic ? "Vérifiez les mesures et réessayez." : "Relancez le calcul avant de transmettre une estimation.")}</p>
            </div>
          ) : <>
          <div className={styles.coverage}>
            <div><strong>{completeEntries.length}</strong><span>thermos complets</span></div>
            <div><strong>{paneEntries.length}</strong><span>thermos dessinés</span></div>
            <div><strong>{quote.totals.sqft}</strong><span>pi² calculés</span></div>
          </div>

          {!pricedEntries.length ? (
            <div className={styles.emptyPrice}>
              <span className={styles.emptyIcon}>↘</span>
              <strong>Commencez par T1</strong>
              <p>Entrez sa largeur et sa hauteur. Le premier prix apparaîtra immédiatement ici.</p>
            </div>
          ) : (
            <div className={styles.lineList}>
              <div className={styles.lineListHead}><span>Thermos</span><span>Prix</span></div>
              {quote.lines.map((line) => {
                const isSelected = line.windowId === selectedPane.windowId && line.paneId === selectedPane.paneId;
                return (
                  <button key={line._lineId} type="button" className={styles.priceLine} data-selected={isSelected} aria-pressed={isSelected} onClick={() => focusLine(line)}>
                    <span className={styles.lineIdentity}>
                      <strong>{line.windowCode} · {line.thermosCode}</strong>
                      <small>{formatSixteenths(line.widthSixteenths)} × {formatSixteenths(line.heightSixteenths)} · {line.sqftPerUnit} pi²</small>
                    </span>
                    <span className={styles.lineAmount}>{money(line.lineSubtotal)}</span>
                    {!line.complete && <span className={styles.provisional}>Options à compléter</span>}
                  </button>
                );
              })}
            </div>
          )}

          <section className={styles.selectedDetail}>
            <div className={styles.detailHead}>
              <div>
                <span>Détail sélectionné</span>
                <strong>{selectedEntry ? `${selectedEntry.windowCode} · ${selectedEntry.thermosCode}` : "Thermos"}</strong>
              </div>
              {selectedEntry && <span className={styles.completionBadge} data-complete={selectedEntry.complete}>{selectedEntry.complete ? "Complet" : "À compléter"}</span>}
            </div>
            {!selectedLine ? (
              <p className={styles.detailEmpty}>Ajoutez la largeur et la hauteur de ce thermos pour obtenir son détail.</p>
            ) : (
              <>
                <div className={styles.selectedMeta}>
                  <span>{formatSixteenths(selectedEntry?.pane.widthSixteenths)} × {formatSixteenths(selectedEntry?.pane.heightSixteenths)}</span>
                  <span>{optionLabels(selectedLine).join(" · ")}</span>
                </div>
                {isPublic ? (
                  <div className={styles.publicLineTotal}>
                    <span>Estimation pour ce thermos</span>
                    <strong>{money(selectedLine.lineSubtotal)}</strong>
                  </div>
                ) : (
                  <dl className={styles.breakdown}>
                    {breakdown.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{money(value)}</dd></div>)}
                    <div className={styles.breakdownTotal}><dt>Total du thermos</dt><dd>{money(selectedLine.lineSubtotal)}</dd></div>
                  </dl>
                )}
              </>
            )}
          </section>

          {!isPublic && <dl className={styles.totals}>
            <div><dt>Thermos et installation</dt><dd>{money(quote.totals.piecesSubtotal)}</dd></div>
            <div><dt>Frais fixes</dt><dd>{money(quote.totals.tripFee)}</dd></div>
            <div><dt>Marge / administration</dt><dd>{money(quote.totals.margin)}</dd></div>
            <div className={styles.subtotal}><dt>Sous-total</dt><dd>{money(quote.totals.subtotal)}</dd></div>
            <div><dt>TPS</dt><dd>{money(quote.totals.tps)}</dd></div>
            <div><dt>TVQ</dt><dd>{money(quote.totals.tvq)}</dd></div>
          </dl>}

          {hasEstimate && <div className={styles.range}>
            <span>Fourchette taxes incluses</span>
            <strong>{money(quote.totals.totalMinWithTaxes)} — {money(quote.totals.totalMaxWithTaxes)}</strong>
          </div>}

          {quoteReady && estimateIssues.length > 0 && (
            <div className={styles.estimateBlocker} role="status">
              <strong>{isPublic ? "À préciser pour affiner le prix" : "Estimation encore provisoire"}</strong>
              <ul>{estimateIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
            </div>
          )}

          {!isPublic && actionError && <p className={styles.actionError} role="alert">{actionError}</p>}

          <div className={styles.receiptActions}>
            {isPublic ? (
              <>
                <Link href="/rendez-vous" className={styles.copyButton}>
                  <i className="fas fa-calendar-check" aria-hidden="true" /> Recevoir ma soumission gratuite
                </Link>
                <a href={`tel:${COMPANY_INFO.phoneTel}`} className={styles.workOrderButton}>
                  <i className="fas fa-phone" aria-hidden="true" /> Parler à un spécialiste
                </a>
                <small className={styles.workOrderNote}>Estimation indicative. Le prix final est confirmé après validation des mesures et de l’accès.</small>
              </>
            ) : (
              <>
                <button type="button" onClick={copySummary} disabled={!canUseEstimate} className={styles.copyButton}>
                  <i className={`fas ${copied ? "fa-check" : "fa-copy"}`} aria-hidden="true" /> {copied ? "Estimation copiée" : "Copier l’estimation"}
                </button>
                {canUseEstimate ? (
                  <Link href={workOrderHref} target="_blank" rel="noopener noreferrer" className={styles.workOrderButton}>Ouvrir un bon vierge <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
                ) : (
                  <span className={`${styles.workOrderButton} ${styles.isDisabled}`} aria-disabled="true">Ouvrir un bon vierge <i className="fas fa-arrow-right" aria-hidden="true" /></span>
                )}
                <small className={styles.workOrderNote}>Le client choisi est transféré. Les lignes de thermos restent à ajouter au bon.</small>
              </>
            )}
          </div>
          </>}

          <div className={styles.pricingRefresh}>
            <button type="button" onClick={() => setEstimateRevision((value) => value + 1)} disabled={quoteLoading}>
              <i className={`fas fa-rotate ${quoteLoading ? "fa-spin" : ""}`} aria-hidden="true" /> {isPublic ? "Recalculer" : "Actualiser les prix"}
            </button>
            <span>{quoteLoadedAt ? `Calculé à ${quoteLoadedAt.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}` : "Prêt pour vos mesures"}</span>
          </div>
        </aside>
      </div>

      {!isPublic && <ClientPicker open={clientPickerOpen} onClose={() => setClientPickerOpen(false)} onPick={pickClient} />}
    </div>
  );
}
