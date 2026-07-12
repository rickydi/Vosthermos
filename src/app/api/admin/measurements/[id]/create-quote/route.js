import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminActivity } from "@/lib/admin-activity";
import { publishAdminEvent } from "@/lib/event-bus";
import { calculateThermosQuote, THERMOS_PRICING_DEFAULTS, THERMOS_PRICING_KEYS } from "@/lib/thermos-pricing";
import { flattenThermos, formatSixteenths, clientMeasurementCompletenessErrors } from "@/lib/thermos-layout";
import { generateWorkOrderNumber, getWorkOrderSettings, withWorkOrderNumberRetry } from "@/lib/work-order-utils";
import { getMeasurementById, measurementErrorResponse } from "@/lib/thermos-measurements";

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

function readableOptions(pane) {
  const options = pane.options || {};
  const labels = [];
  if (options.glassType === "triple") labels.push("triple vitrage");
  else if (options.glassType === "simple") labels.push("verre simple");
  else labels.push("double vitrage");
  if (options.lowE) labels.push("Low-E");
  if (options.argon) labels.push("argon");
  if (options.tempered) labels.push("verre trempé");
  if (options.laminated) labels.push("verre laminé");
  if (pane.grille?.enabled) labels.push("carrelage décoratif");
  if (options.spacerColor) labels.push(`intercalaire ${options.spacerColor}`);
  if (options.access === "medium") labels.push("accès moyen");
  if (options.access === "hard") labels.push("accès difficile");
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
      itemType: "piece",
      position: index,
    };
  });

  if (quote.totals.tripFee > 0) {
    items.push({
      description: "Déplacement et préparation du chantier",
      quantity: 1,
      unitPrice: money(quote.totals.tripFee),
      itemType: "piece",
      position: items.length,
    });
  }
  return items;
}

function publicWorkOrderSummary(workOrder, reused, refreshed = false) {
  return {
    workOrderId: workOrder.id,
    reused,
    refreshed,
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
    if (thermos.some((pane) => pane.options?.glassType === "triple") && !(Number(pricingSettings.thermos_triple_percent) > 0)) {
      return NextResponse.json({ error: "Configurez la majoration du triple vitrage dans Paramètres avant de calculer cette soumission." }, { status: 400 });
    }
    if (thermos.some((pane) => pane.options?.glassType === "simple") && !(Number(pricingSettings.thermos_simple_discount_percent) > 0)) {
      return NextResponse.json({ error: "Configurez la réduction du verre simple dans Paramètres avant de calculer cette soumission." }, { status: 400 });
    }
    if (thermos.some((pane) => pane.options?.laminated) && !(Number(pricingSettings.thermos_laminated_percent) > 0)) {
      return NextResponse.json({ error: "Configurez la majoration du verre laminé dans Paramètres avant de calculer cette soumission." }, { status: 400 });
    }
    const quoteLines = thermos.map((pane) => ({
      width: pane.widthSixteenths / 16,
      height: pane.heightSixteenths / 16,
      quantity: 1,
      lowE: Boolean(pane.options?.lowE),
      argon: Boolean(pane.options?.argon),
      tempered: Boolean(pane.options?.tempered),
      laminated: Boolean(pane.options?.laminated),
      glassType: pane.options?.glassType || "double",
      spacerColor: pane.options?.spacerColor || "noir",
      thicknessSixteenths: pane.thicknessSixteenths,
      grill: Boolean(pane.grille?.enabled),
      access: ["easy", "medium", "hard"].includes(pane.options?.access) ? pane.options.access : "easy",
      note: pane.options?.notes || "",
    }));
    const quote = calculateThermosQuote(quoteLines, pricingSettings);
    const items = buildQuoteItems(thermos, quote);
    const isFinal = measurement.source === "technician" && measurement.accuracy === "final" && measurement.status === "validated";
    const description = isFinal
      ? `Remplacement de ${thermos.length} thermos — mesures finales prises par un technicien.`
      : `Présoumission pour ${thermos.length} thermos — dimensions à confirmer par un technicien avant la commande.`;
    const photoUrls = Array.from(new Set(measurement.data.windows.map((windowValue) => windowValue.photoUrl).filter(Boolean)));

    const result = await withWorkOrderNumberRetry(() => prisma.$transaction(async (tx) => {
      const freshMeasurement = await tx.thermosMeasurement.findUnique({
        where: { id: measurement.id },
        select: { workOrderId: true },
      });
      if (freshMeasurement?.workOrderId) {
        const linked = await tx.workOrder.findUnique({
          where: { id: freshMeasurement.workOrderId },
          include: {
            items: { select: { description: true } },
            sections: { select: { id: true } },
          },
        });
        if (!linked) throw Object.assign(new Error("La soumission liée est introuvable"), { status: 404 });
        if (!isFinal) return { workOrder: linked, reused: true, refreshed: false };

        const generatedByMeasurements = String(linked.notes || "").includes("fiche de mesures thermos #");
        const onlyManagedItems = linked.items.every((item) => {
          const text = String(item.description || "");
          return (text.startsWith("Fen") && text.includes("Thermos")) || text === "Déplacement et préparation du chantier";
        });
        const canRefresh = ["draft", "quote"].includes(linked.statut) &&
          generatedByMeasurements &&
          onlyManagedItems &&
          linked.sections.length === 0 &&
          Number(linked.totalLabor || 0) === 0;
        if (!canRefresh) {
          throw Object.assign(new Error("La soumission liée contient déjà des modifications ou a été envoyée. Mettez-la à jour manuellement avant de commander."), { status: 409 });
        }

        await tx.workOrderItem.deleteMany({ where: { workOrderId: linked.id } });
        await tx.workOrderItem.createMany({
          data: items.map((item) => ({ ...item, workOrderId: linked.id, totalPrice: money(item.quantity * item.unitPrice) })),
        });
        const refreshed = await tx.workOrder.update({
          where: { id: linked.id },
          data: {
            technicianId: measurement.technicianId || linked.technicianId,
            description,
            photos: photoUrls,
            notes: `${linked.notes || ""}\nMesures finales actualisées depuis la fiche thermos #${measurement.id}.`.trim(),
            totalPieces: quote.totals.subtotal,
            totalLabor: 0,
            subtotal: quote.totals.subtotal,
            tps: quote.totals.tps,
            tvq: quote.totals.tvq,
            total: quote.totals.total,
          },
        });
        return { workOrder: refreshed, reused: true, refreshed: true };
      }

      const number = await generateWorkOrderNumber(tx);
      const workOrder = await tx.workOrder.create({
        data: {
          number,
          clientId: measurement.clientId,
          followUpId: measurement.followUpId || null,
          technicianId: measurement.technicianId || null,
          date: new Date(),
          interventionAddress: measurement.client?.address || null,
          interventionCity: measurement.client?.city || null,
          interventionPostalCode: measurement.client?.postalCode || null,
          description,
          photos: photoUrls,
          notes: `Créée à partir de la fiche de mesures thermos #${measurement.id}.`,
          statut: "draft",
          visibleAuClient: true,
          laborRate: Number(workOrderSettings.labor_rate_per_hour || 85),
          totalPieces: quote.totals.subtotal,
          totalLabor: 0,
          subtotal: quote.totals.subtotal,
          tps: quote.totals.tps,
          tvq: quote.totals.tvq,
          total: quote.totals.total,
        },
      });

      const claimed = await tx.thermosMeasurement.updateMany({
        where: { id: measurement.id, workOrderId: null },
        data: { workOrderId: workOrder.id },
      });
      if (!claimed.count) {
        const raced = await tx.thermosMeasurement.findUnique({ where: { id: measurement.id }, select: { workOrderId: true } });
        await tx.workOrder.delete({ where: { id: workOrder.id } });
        const linked = raced?.workOrderId ? await tx.workOrder.findUnique({ where: { id: raced.workOrderId } }) : null;
        if (!linked) throw new Error("Impossible de lier la soumission à la fiche de mesures");
        return { workOrder: linked, reused: true, refreshed: false };
      }

      await tx.workOrderItem.createMany({
        data: items.map((item) => ({ ...item, workOrderId: workOrder.id, totalPrice: money(item.quantity * item.unitPrice) })),
      });
      return { workOrder, reused: false, refreshed: false };
    }));

    const actor = `admin:${session.id}`;
    publishAdminEvent({ type: "work_order.changed", entityType: "work_order", entityId: result.workOrder.id, clientId: measurement.clientId, actor });
    publishAdminEvent({ type: "thermos_measurement.changed", entityType: "thermos_measurement", entityId: measurement.id, clientId: measurement.clientId, actor });
    await logAdminActivity(req, session, {
      action: result.reused ? "open" : "create",
      entityType: "work_order",
      entityId: result.workOrder.id,
      label: result.refreshed ? `Soumission actualisée avec les mesures finales: ${result.workOrder.number}` : result.reused ? `Soumission existante ouverte: ${result.workOrder.number}` : `Brouillon de soumission créé: ${result.workOrder.number}`,
      metadata: { measurementId: measurement.id, followUpId: measurement.followUpId, paneCount: thermos.length, statut: "draft" },
    });
    return NextResponse.json(publicWorkOrderSummary(result.workOrder, result.reused, result.refreshed), { status: result.reused ? 200 : 201 });
  } catch (error) {
    const failure = measurementErrorResponse(error);
    console.error("[measurement create quote]", error?.message || error);
    return NextResponse.json({ error: failure.message, details: failure.details }, { status: failure.status });
  }
}
