import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { createOrTouchFollowUpFromLead } from "@/lib/follow-up-utils";
import { logAdminActivity } from "@/lib/admin-activity";
import { clampInt } from "@/lib/api-utils";
import { orderByIds, searchClientIds } from "@/lib/search";

const CLIENT_INCLUDE = { _count: { select: { workOrders: true } } };

export async function GET(req) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "updated_desc";
  const page = clampInt(searchParams.get("page"), 1, { min: 1, max: 100000 });
  const limit = clampInt(searchParams.get("limit"), 50, { min: 1, max: 200 });

  // La recherche passe par lib/search : insensible aux accents (« seguin »
  // trouve « Séguin ») et telephone compare sur les chiffres seuls, quel que
  // soit le format saisi ou stocke. Elle rend des IDs deja classes.
  const matchedIds = await searchClientIds(q);
  const where = matchedIds ? { id: { in: matchedIds } } : {};

  // Tri par pertinence : c'est l'ordre des IDs qui fait foi, on pagine donc
  // dessus avant d'aller chercher les fiches.
  if (sort === "relevance" && matchedIds) {
    const pageIds = matchedIds.slice((page - 1) * limit, page * limit);
    const rows = pageIds.length
      ? await prisma.client.findMany({ where: { id: { in: pageIds } }, include: CLIENT_INCLUDE })
      : [];
    return NextResponse.json({
      clients: orderByIds(rows, pageIds),
      total: matchedIds.length,
      page,
      pages: Math.ceil(matchedIds.length / limit),
    });
  }

  const orderByMap = {
    updated_desc: { updatedAt: "desc" },
    updated_asc: { updatedAt: "asc" },
    created_desc: { createdAt: "desc" },
    created_asc: { createdAt: "asc" },
    name_asc: { name: "asc" },
    name_desc: { name: "desc" },
    city_asc: { city: "asc" },
  };
  const orderBy = orderByMap[sort] || orderByMap.updated_desc;

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: CLIENT_INCLUDE,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.client.count({ where }),
  ]);

  return NextResponse.json({ clients, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req) {
  let session;
  try { session = await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorise" }, { status: 401 }); }

  const body = await req.json();
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }
  let client;
  const type = body.type === "gestionnaire" ? "gestionnaire" : "particulier";
  try {
    client = await prisma.client.create({
      data: {
        name: body.name,
        type,
        company: body.company || null,
        contactName: body.contactName || null,
        friendlyEmail: type === "gestionnaire" ? body.friendlyEmail !== false : false,
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
  } catch (err) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Un client utilise deja cette adresse courriel. Verifie l'adresse ou laisse le champ vide." },
        { status: 400 },
      );
    }
    throw err;
  }

  try {
    await createOrTouchFollowUpFromLead({
      client,
      source: "creation client admin",
      notes: body.notes || null,
    });
  } catch (err) {
    console.error("[admin clients] follow-up creation error:", err?.message || err);
  }

  await logAdminActivity(req, session, {
    action: "create",
    entityType: "client",
    entityId: client.id,
    label: `Client cree: ${client.name}`,
    metadata: { email: client.email, phone: client.phone, type: client.type },
  });

  return NextResponse.json(client);
}
