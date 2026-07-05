import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function currentYearMonth() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value || "0000";
  const month = parts.find((part) => part.type === "month")?.value || "00";
  return `${year}-${month}`;
}

function cleanMonth(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}$/.test(text) ? text : currentYearMonth();
}

function skippedMessage(skipped) {
  if (skipped === "no_accountant_email") return "Aucun courriel de comptable configure dans les parametres.";
  if (skipped === "empty") return "Aucune facture pour ce mois.";
  if (skipped === "already_sent") return "Rapport deja envoye pour ce mois.";
  return "Rapport non envoye.";
}

export async function GET(req) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const month = cleanMonth(url.searchParams.get("month"));
    const format = String(url.searchParams.get("format") || "pdf").toLowerCase();

    if (format === "summary" || format === "json") {
      const {
        getMonthlyInvoiceReportSummary,
      } = await import("@/lib/monthly-invoice-report");
      const {
        getAccountantEmail,
      } = await import("@/lib/monthly-invoice-report-email");
      const [summary, accountantEmail] = await Promise.all([
        getMonthlyInvoiceReportSummary(month),
        getAccountantEmail(),
      ]);
      return NextResponse.json({
        ...summary,
        accountantEmail,
        accountantConfigured: Boolean(accountantEmail),
      });
    }

    const {
      buildMonthlyInvoiceCsv,
      getMonthlyInvoiceWorkOrders,
      getMonthlyReportExtras,
      renderMonthlyInvoiceReportPdf,
    } = await import("@/lib/monthly-invoice-report");
    const [workOrders, extras] = await Promise.all([
      getMonthlyInvoiceWorkOrders(month),
      getMonthlyReportExtras(month),
    ]);
    if (format === "csv") {
      const csv = buildMonthlyInvoiceCsv(workOrders, extras.creditNotes);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="rapport-factures-vosthermos-${month}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const pdf = await renderMonthlyInvoiceReportPdf(month, workOrders, extras);
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="rapport-factures-vosthermos-${month}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const month = cleanMonth(body.month);
    const {
      sendMonthlyInvoiceReportEmail,
    } = await import("@/lib/monthly-invoice-report-email");
    const result = await sendMonthlyInvoiceReportEmail(month, { force: true });

    if (!result.sent) {
      return NextResponse.json({ sent: false, error: skippedMessage(result.skipped) }, { status: 400 });
    }

    const { logAdminActivity } = await import("@/lib/admin-activity");
    await logAdminActivity(req, session, {
      action: "monthly_invoice_report.send",
      entityType: "Report",
      entityId: month,
      label: `Rapport factures ${month}`,
      metadata: { to: result.to, count: result.count, drive: result.drive },
    });

    return NextResponse.json({ sent: true, to: result.to, count: result.count, month, drive: result.drive });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Erreur serveur" }, { status: 500 });
  }
}
