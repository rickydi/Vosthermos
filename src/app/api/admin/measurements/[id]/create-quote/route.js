import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";
import { publishAdminEvent } from "@/lib/event-bus";
import {
  calculateThermosQuote,
  measurementPaneToThermosLine,
  THERMOS_PRICING_DEFAULTS,
  THERMOS_PRICING_KEYS,
} from "@/lib/thermos-pricing";
import { flattenThermos, formatSixteenths, clientMeasurementCompletenessErrors } from "@/lib/thermos-layout";
import {
  createMeasurementCalculationHash,
  createMeasurementQuoteSnapshotHash,
  extractMeasurementQuoteSnapshot,
  MEASUREMENT_QUOTE_SNAPSHOT_VERSION,
  withMeasurementQuoteSnapshot,
} from "@/lib/measurement-quote-snapshot";
import { generateWorkOrderNumber, getWorkOrderSettings, withWorkOrderNumberRetry } from "@/lib/work-order-utils";
import { getMeasurementById, measurementErrorResponse } from "@/lib/thermos-measurements";

const MEASUREMENT_THERMOS_ITEM_TYPE = "measurement_thermos";
const MEASUREMENT_TRIP_ITEM_TYPE = "measurement_trip";
const VALID_SPACER_COLORS = new Set(["noir", "gris", "blanc", "inox"]);

function money(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

async function readThermosPricingSettings() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: THERMOS_PRICING_KEYS } },
    select: { key: true, value: true },
  });
  const settings = { ...THERMOS_PRICING_DEFAULTS };
  rows.forEach((row) => { settings[row.key] = row.value; });
  return settings;
}

function normalizedChoice(value) {
  return String(value ?? "").trim().toLowerCase();
}

function isMissingRequiredChoice(value) {
  const normalized = normalizedChoice(value);
  return !normalized || normalized === "unknown";
}

function isMissingRequiredSpacer(value) {
  return !VALID_SPACER_COLORS.has(normalizedChoice(value));
}

function isMissingRequiredAccess(value) {
  return !["without_ladder", "with_ladder", "easy", "medium", "hard"].includes(normalizedChoice(value));
}

function missingThermosOptions(thermos) {
  return thermos.flatMap((pane) => {
    const fields = [];
    if (isMissingRequiredChoice(pane.options?.glassType)) fields.push("glassType");
    if (isMissingRequiredSpacer(pane.options?.spacerColor)) fields.push("spacerColor");
    if (isMissingRequiredAccess(pane.options?.access)) fields.push("access");
    if (!fields.length) return [];
    return [{
      windowNumber: pane.windowNumber,
      windowLabel: pane.windowLabel,
      thermosNumber: pane.thermosNumber,
      fields,
    }];
  });
}

function readableOptions(pane) {
  const options = pane.options || {};
  const labels = [];
  const glassType = normalizedChoice(options.glassType);
  if (glassType === "triple") labels.push("triple vitrage");
  else if (glassType === "simple") labels.push("verre simple");
  else if (glassType === "double") labels.push("double vitrage");
  else labels.push("vitrage inconnu");
  if (options.lowE) labels.push("Low-E");
  if (options.argon) labels.push("argon");
  if (options.tempered) labels.push("verre trempé");
  if (options.laminated) labels.push("verre laminé");
  if (pane.grille?.enabled) labels.push("carrelage décoratif");
  const spacerColor = normalizedChoice(options.spacerColor);
  labels.push(isMissingRequiredChoice(spacerColor) ? "intercalaire inconnu" : `intercalaire ${spacerColor}`);
  const access = normalizedChoice(options.access);
  if (access === "without_ladder") labels.push("accès sans échelle");
  else if (access === "with_ladder") labels.push("accès avec échelle");
  else if (access === "easy") labels.push("accès facile");
  else if (access === "medium") labels.push("accès moyen");
  else if (access === "hard") labels.push("accès difficile");
  else if (access === "unknown") labels.push("accès inconnu");
  return labels.join(", ");
}

function buildQuoteItems(thermos, quote) {
  const computedLines = quote.lines;
  const piecesSubtotal = money(quote.totals.piecesSubtotal);
  const margin = money(quote.totals.margin);
  let allocatedMargin = 0;

  const items = thermos.map((pane, index) => {
    let marginShare = 0;
    if (margin && piecesSubtotal > 0) {
      marginShare = index === thermos.length - 1
        ? money(margin - allocatedMargin)
        : money(margin * (computedLines[index].lineSubtotal / piecesSubtotal));
      allocatedMargin = money(allocatedMargin + marginShare);
    }
    const line = computedLines[index];
    const dimensions = `${formatSixteenths(pane.widthSixteenths)} × ${formatSixteenths(pane.heightSixteenths)}`;
    const location = pane.location ? ` — ${pane.location}` : "";
    const options = readableOptions(pane);
    const note = String(pane.options?.notes || "").trim();
    return {
      description: `${pane.windowLabel} — Thermos ${pane.thermosNumber}${location} — ${dimensions}${options ? ` — ${options}` : ""}${note ? ` — Note: ${note}` : ""}`,
      quantity: 1,
      unitPrice: money(line.unitSubtotal + marginShare),
      itemType: MEASUREMENT_THERMOS_ITEM_TYPE,
      position: index,
    };
  });

  if (quote.totals.tripFee > 0) {
    items.push({
      description: "Déplacement et préparation du chantier",
      quantity: 1,
      unitPrice: money(quote.totals.tripFee),
      itemType: MEASUREMENT_TRIP_ITEM_TYPE,
      position: items.length,
    });
  }
  return items;
}

function buildStoredQuoteItems(items) {
  return items.map((item) => ({
    ...item,
    productId: null,
    serviceId: null,
    sectionId: null,
    totalPrice: money(item.quantity * item.unitPrice),
  }));
}

function generatedQuoteNotes(measurementId, isFinal) {
  return isFinal
    ? `Mesures finales actualisées depuis la fiche thermos #${measurementId}.`
    : `Présoumission créée à partir de la fiche de mesures thermos #${measurementId}.`;
}

function snapshotConflict(message, code, snapshotState, workOrder, snapshot = null) {
  return Object.assign(new Error(message), {
    status: 409,
    code,
    details: {
      snapshotState,
      snapshotVersion: snapshot?.version || null,
      workOrderId: workOrder?.id || null,
      workOrderNumber: workOrder?.number || null,
    },
  });
}

function publicWorkOrderSummary(workOrder, reused, refreshed = false, snapshotState = "current") {
  return {
    workOrderId: workOrder.id,
    reused,
    refreshed,
    snapshot: { state: snapshotState, version: MEASUREMENT_QUOTE_SNAPSHOT_VERSION },
    workOrder: {
      id: workOrder.id,
      number: workOrder.number,
      statut: workOrder.statut,
      total: Number(workOrder.total || 0),
    },
  };
}

export async function POST(req, { params }) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorisé" }, { status: 401 }); }
  const { id } = await params;
  const measurement = await getMeasurementById(id);
  if (!measurement) return NextResponse.json({ error: "Mesure introuvable" }, { status: 404 });
  if (measurement.status === "cancelled") return NextResponse.json({ error: "Cette fiche de mesures est annulée" }, { status: 409 });

  try {
    const incomplete = clientMeasurementCompletenessErrors(measurement.data);
    if (incomplete.length) {
      return NextResponse.json({ error: "Les largeurs et hauteurs doivent être complètes avant de créer la soumission.", details: incomplete }, { status: 400 });
    }

    const [pricingSettings, workOrderSettings] = await Promise.all([
      readThermosPricingSettings(),
      getWorkOrderSettings(),
    ]);
    const thermos = flattenThermos(measurement.data, measurement.clientId, measurement.client?.name || "Client");
    const missingOptions = missingThermosOptions(thermos);
    if (missingOptions.length) {
      return NextResponse.json({
        error: "Choisissez le type de vitrage, l'intercalaire et l'accès de chaque thermos avant de créer la soumission.",
        code: "INCOMPLETE_THERMOS_OPTIONS",
        details: { missing: missingOptions },
      }, { status: 400 });
    }
    if (thermos.some((pane) => pane.options?.glassType === "triple") && !(Number(pricingSettings.thermos_triple_percent) > 0)) {
      return NextResponse.json({ error: "Configurez la majoration du triple vitrage dans Paramètres avant de calculer cette soumission." }, { status: 400 });
    }
    if (thermos.some((pane) => pane.options?.glassType === "simple") && !(Number(pricingSettings.thermos_simple_discount_percent) > 0)) {
      return NextResponse.json({ error: "Configurez la réduction du verre simple dans Paramètres avant de calculer cette soumission." }, { status: 400 });
    }
    if (thermos.some((pane) => pane.options?.laminated) && !(Number(pricingSettings.thermos_laminated_percent) > 0)) {
      return NextResponse.json({ error: "Configurez la majoration du verre laminé dans Paramètres avant de calculer cette soumission." }, { status: 400 });
    }
    const quoteLines = thermos.map((pane) => measurementPaneToThermosLine(pane));
    const quote = calculateThermosQuote(quoteLines, pricingSettings);
    const items = buildQuoteItems(thermos, quote);
    const storedItems = buildStoredQuoteItems(items);
    const isFinal = measurement.source === "technician" && measurement.accuracy === "final" && measurement.status === "validated";
    const description = isFinal
      ? `Remplacement de ${thermos.length} thermos — mesures finales prises par un technicien.`
      : `Présoumission pour ${thermos.length} thermos — dimensions à confirmer par un technicien avant la commande.`;
    const photoUrls = Array.from(new Set(measurement.data.windows.map((windowValue) => windowValue.photoUrl).filter(Boolean)));
    const measurementCalculationHash = createMeasurementCalculationHash(measurement);

    const result = await withWorkOrderNumberRetry(() => prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "thermos_measurements" WHERE "id" = ${measurement.id} FOR UPDATE`;
      const freshMeasurement = await tx.thermosMeasurement.findUnique({
        where: { id: measurement.id },
        select: {
          id: true,
          workOrderId: true,
          updatedAt: true,
          status: true,
          source: true,
          accuracy: true,
          revision: true,
          data: true,
        },
      });
      if (!freshMeasurement || createMeasurementCalculationHash(freshMeasurement) !== measurementCalculationHash) {
        throw Object.assign(new Error("La fiche de mesures a changé pendant le calcul. Rechargez-la avant de créer ou d'actualiser la soumission."), {
          status: 409,
          code: "MEASUREMENT_CHANGED_DURING_QUOTE",
          details: { snapshotState: "measurement_changed", measurementId: measurement.id },
        });
      }
      if (freshMeasurement?.workOrderId) {
        await tx.$queryRaw`SELECT "id" FROM "work_orders" WHERE "id" = ${freshMeasurement.workOrderId} FOR UPDATE`;
        const linked = await tx.workOrder.findUnique({
          where: { id: freshMeasurement.workOrderId },
          include: {
            items: {
              orderBy: [{ position: "asc" }, { id: "asc" }],
              select: {
                productId: true,
                serviceId: true,
                sectionId: true,
                description: true,
                quantity: true,
                unitPrice: true,
                totalPrice: true,
                itemType: true,
                position: true,
              },
            },
            sections: {
              orderBy: [{ position: "asc" }, { id: "asc" }],
              select: { unitCode: true, notes: true, position: true },
            },
            _count: { select: { payments: true, creditNotes: true } },
          },
        });
        if (!linked) throw Object.assign(new Error("La soumission liée est introuvable"), { status: 404 });

        const snapshot = extractMeasurementQuoteSnapshot(linked.notes);
        if (!snapshot || snapshot.measurementId !== measurement.id) {
          throw snapshotConflict(
            "La soumission liée ne possède pas d'empreinte vérifiable. Elle n'a pas été actualisée pour protéger son contenu; ouvrez-la et mettez-la à jour manuellement.",
            "MEASUREMENT_QUOTE_SNAPSHOT_MISSING",
            "legacy_unverified",
            linked,
            snapshot,
          );
        }
        const currentHash = createMeasurementQuoteSnapshotHash(linked, measurement.id);
        if (currentHash !== snapshot.hash) {
          throw snapshotConflict(
            "La soumission liée a été modifiée depuis sa génération. Elle n'a pas été écrasée; mettez-la à jour manuellement.",
            "MEASUREMENT_QUOTE_MANUALLY_MODIFIED",
            "modified",
            linked,
            snapshot,
          );
        }

        const nextPlainNotes = generatedQuoteNotes(measurement.id, isFinal);
        const updateData = {
          technicianId: measurement.technicianId || linked.technicianId,
          description,
          photos: photoUrls,
          notes: nextPlainNotes,
          totalPieces: quote.totals.subtotal,
          totalLabor: 0,
          subtotal: quote.totals.subtotal,
          tps: quote.totals.tps,
          tvq: quote.totals.tvq,
          total: quote.totals.total,
        };
        const nextSnapshotState = {
          ...linked,
          ...updateData,
          items: storedItems,
        };
        const nextHash = createMeasurementQuoteSnapshotHash(nextSnapshotState, measurement.id);
        if (nextHash === currentHash) {
          return { workOrder: linked, reused: true, refreshed: false, snapshotState: "current" };
        }
        updateData.notes = withMeasurementQuoteSnapshot(nextPlainNotes, measurement.id, nextHash);

        await tx.workOrderItem.deleteMany({ where: { workOrderId: linked.id } });
        await tx.workOrderItem.createMany({
          data: storedItems.map((item) => ({ ...item, workOrderId: linked.id })),
        });
        const refreshed = await tx.workOrder.update({
          where: { id: linked.id },
          data: updateData,
        });
        return { workOrder: refreshed, reused: true, refreshed: true, snapshotState: "refreshed" };
      }

      const number = await generateWorkOrderNumber(tx);
      const createdDate = new Date();
      const initialPlainNotes = generatedQuoteNotes(measurement.id, isFinal);
      const initialData = {
        number,
        clientId: measurement.clientId,
        followUpId: measurement.followUpId || null,
        technicianId: measurement.technicianId || null,
        date: createdDate,
        interventionAddress: measurement.client?.address || null,
        interventionCity: measurement.client?.city || null,
        interventionPostalCode: measurement.client?.postalCode || null,
        description,
        photos: photoUrls,
        notes: initialPlainNotes,
        statut: "draft",
        visibleAuClient: true,
        laborRate: Number(workOrderSettings.labor_rate_per_hour || 85),
        totalPieces: quote.totals.subtotal,
        totalLabor: 0,
        subtotal: quote.totals.subtotal,
        tps: quote.totals.tps,
        tvq: quote.totals.tvq,
        total: quote.totals.total,
      };
      const initialHash = createMeasurementQuoteSnapshotHash({
        ...initialData,
        items: storedItems,
        sections: [],
        _count: { payments: 0, creditNotes: 0 },
      }, measurement.id);
      initialData.notes = withMeasurementQuoteSnapshot(initialPlainNotes, measurement.id, initialHash);
      const workOrder = await tx.workOrder.create({
        data: initialData,
      });

      const claimed = await tx.thermosMeasurement.updateMany({
        where: { id: measurement.id, workOrderId: null, updatedAt: freshMeasurement.updatedAt },
        data: { workOrderId: workOrder.id },
      });
      if (!claimed.count) {
        const raced = await tx.thermosMeasurement.findUnique({ where: { id: measurement.id }, select: { workOrderId: true } });
        await tx.workOrder.delete({ where: { id: workOrder.id } });
        if (!raced?.workOrderId) {
          throw Object.assign(new Error("La fiche de mesures a changé avant sa liaison à la soumission. Rien n'a été créé; rechargez puis réessayez."), {
            status: 409,
            code: "MEASUREMENT_CHANGED_DURING_QUOTE",
            details: { snapshotState: "measurement_changed", measurementId: measurement.id },
          });
        }
        const linked = raced?.workOrderId ? await tx.workOrder.findUnique({ where: { id: raced.workOrderId } }) : null;
        if (!linked) throw new Error("Impossible de lier la soumission à la fiche de mesures");
        return { workOrder: linked, reused: true, refreshed: false, snapshotState: "concurrent" };
      }

      await tx.workOrderItem.createMany({
        data: storedItems.map((item) => ({ ...item, workOrderId: workOrder.id })),
      });
      return { workOrder, reused: false, refreshed: false, snapshotState: "created" };
    }, { isolationLevel: "Serializable" }));

    const actor = `admin:${session.id}`;
    publishAdminEvent({ type: "work_order.changed", entityType: "work_order", entityId: result.workOrder.id, clientId: measurement.clientId, actor });
    publishAdminEvent({ type: "thermos_measurement.changed", entityType: "thermos_measurement", entityId: measurement.id, clientId: measurement.clientId, actor });
    await logAdminActivity(req, session, {
      action: result.reused ? "open" : "create",
      entityType: "work_order",
      entityId: result.workOrder.id,
      label: result.refreshed
        ? `${isFinal ? "Soumission actualisée avec les mesures finales" : "Présoumission actualisée avec les mesures reçues"}: ${result.workOrder.number}`
        : result.reused
          ? `Soumission existante ouverte: ${result.workOrder.number}`
          : `Brouillon de soumission créé: ${result.workOrder.number}`,
      metadata: { measurementId: measurement.id, followUpId: measurement.followUpId, paneCount: thermos.length, statut: "draft" },
    });
    return NextResponse.json(publicWorkOrderSummary(result.workOrder, result.reused, result.refreshed, result.snapshotState), { status: result.reused ? 200 : 201 });
  } catch (error) {
    if (error?.code === "P2034") {
      return NextResponse.json({
        error: "La fiche ou la soumission a changé pendant l'opération. Rien n'a été écrasé; rechargez puis réessayez.",
        code: "QUOTE_CONCURRENT_CHANGE",
        details: { snapshotState: "concurrent_change", measurementId: measurement.id },
      }, { status: 409 });
    }
    const failure = measurementErrorResponse(error);
    console.error("[measurement create quote]", error?.message || error);
    return NextResponse.json({
      error: failure.message,
      ...(error?.code ? { code: error.code } : {}),
      ...(error?.details ? { details: error.details } : failure.details ? { details: failure.details } : {}),
    }, { status: failure.status });
  }
}
