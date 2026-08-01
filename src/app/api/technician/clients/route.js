import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireTech } from "@/lib/technician-auth";
import { orderByIds, searchClientIds } from "@/lib/search";

// Le technicien voit une liste courte sur sa tablette; on dit combien de fiches
// correspondent au total pour qu'il sache s'il doit preciser sa recherche.
const TECH_RESULT_LIMIT = 20;

export async function GET(req) {
  try {
    await requireTech();
  } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const select = {
    id: true, name: true, type: true, phone: true, email: true,
    secondaryPhone: true,
    company: true, address: true, city: true, province: true, postalCode: true,
  };

  // Meme recherche que cote admin : insensible aux accents (« seguin » trouve
  // « Seguin ») et telephone compare sur les chiffres seuls, quel que soit le
  // format tape sur la tablette.
  const matchedIds = await searchClientIds(q);
  if (matchedIds) {
    const pageIds = matchedIds.slice(0, TECH_RESULT_LIMIT);
    const rows = pageIds.length
      ? await prisma.client.findMany({ where: { id: { in: pageIds } }, select })
      : [];
    const clients = orderByIds(rows, pageIds);
    // Tableau simple conserve pour les appelants existants, total en en-tete.
    return NextResponse.json(clients, {
      headers: { "X-Total-Count": String(matchedIds.length) },
    });
  }

  const clients = await prisma.client.findMany({
    where: {},
    orderBy: { updatedAt: "desc" },
    take: TECH_RESULT_LIMIT,
    select,
  });

  return NextResponse.json(clients);
}

export async function POST(req) {
  try {
    await requireTech();
  } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json();
  const client = await prisma.client.create({
    data: {
      name: body.name,
      type: body.type === "gestionnaire" ? "gestionnaire" : "particulier",
      company: body.company || null,
      address: body.address || null,
      city: body.city || null,
      province: body.province || "QC",
      postalCode: body.postalCode || null,
      phone: body.phone || null,
      secondaryPhone: body.secondaryPhone || null,
      email: body.email || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(client);
}
