import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { serializeCreditNote } from "@/lib/credit-note";
import { creditNoteFilename, generateCreditNotePdf } from "@/lib/credit-note-pdf";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const creditNote = await prisma.creditNote.findUnique({ where: { id: Number(id) } });
    if (!creditNote) {
      return NextResponse.json({ error: "Note de credit introuvable" }, { status: 404 });
    }

    const serialized = serializeCreditNote(creditNote);
    const pdf = await generateCreditNotePdf(serialized);
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${creditNoteFilename(serialized)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("GET /api/admin/credit-notes/[id]/pdf:", err);
    return NextResponse.json({ error: "Erreur de generation du PDF" }, { status: 500 });
  }
}
