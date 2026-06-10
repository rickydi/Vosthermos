#!/usr/bin/env node
// Backfill Phase 0 refonte suivi. Idempotent. Lancer le DRY-RUN d'abord :
//   node scripts/backfill-suivi-phase0.mjs --dry-run
//   node scripts/backfill-suivi-phase0.mjs
//
// 1) Chaque ClientFollowUp est rattaché à un Client (match tél/email sur un client
//    existant ; sinon création d'une fiche client légère). -> "tout pend d'une fiche".
// 2) outcome dérivé du status (won/lost/open). contactedAt/invoicedAt best-effort.
// 3) Appointment.clientId et ChatConversation.clientId remplis par match tél/email.
// Anti-doublon : on cherche TOUJOURS un client existant avant d'en créer un, et les
// fiches créées sont réinjectées dans les index en mémoire pour les lignes suivantes.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";

const DRY = process.argv.includes("--dry-run");

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z_0-9]*)=(.*)$/);
    if (m && !process.env[m[1]]) { let v = m[2].trim(); if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1); process.env[m[1]] = v; }
  }
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const normPhone = (p) => { if (!p) return null; const d = String(p).replace(/\D/g, "").slice(-10); return d.length >= 7 ? d : null; };
const lowEmail = (e) => (e ? String(e).trim().toLowerCase() || null : null);
const WON = new Set(["won", "scheduled", "completed", "a_payer"]);

const stats = {
  followUps: 0, fuLinkedExisting: 0, fuCreatedClient: 0, fuAmbiguous: 0, fuAlreadyLinked: 0,
  outcomeSet: 0, contactedSet: 0, invoicedSet: 0,
  apptTotal: 0, apptMatched: 0, apptAmbiguous: 0,
  chatTotal: 0, chatMatched: 0, chatAmbiguous: 0,
};

// Index clients en mémoire : phone/email -> Set(clientId)
const byPhone = new Map();
const byEmail = new Map();
function indexClient(c) {
  for (const p of [normPhone(c.phone), normPhone(c.secondaryPhone)]) {
    if (!p) continue;
    if (!byPhone.has(p)) byPhone.set(p, new Set());
    byPhone.get(p).add(c.id);
  }
  const e = lowEmail(c.email);
  if (e) { if (!byEmail.has(e)) byEmail.set(e, new Set()); byEmail.get(e).add(c.id); }
}
function matchClientIds(phone, email) {
  const ids = new Set();
  const p = normPhone(phone);
  if (p && byPhone.has(p)) for (const id of byPhone.get(p)) ids.add(id);
  const e = lowEmail(email);
  if (e && byEmail.has(e)) for (const id of byEmail.get(e)) ids.add(id);
  return [...ids];
}

(async () => {
  console.log(`Backfill Phase 0${DRY ? "  (DRY-RUN — aucune écriture)" : ""}\n`);

  const clients = await prisma.client.findMany({ select: { id: true, phone: true, secondaryPhone: true, email: true } });
  clients.forEach(indexClient);
  console.log(`${clients.length} clients indexés.`);

  // ── 1+2) ClientFollowUp : rattachement + jalons ──────────────────────────
  const followUps = await prisma.clientFollowUp.findMany({
    select: { id: true, clientId: true, contactName: true, title: true, phone: true, email: true, status: true, outcome: true, contactedAt: true, invoicedAt: true, createdAt: true,
      workOrders: { select: { invoiceSentAt: true, invoiceIssuedAt: true }, orderBy: { invoiceSentAt: "asc" }, take: 1 } },
    orderBy: { id: "asc" },
  });
  stats.followUps = followUps.length;

  for (const fu of followUps) {
    let clientId = fu.clientId;

    if (!clientId) {
      const candidates = matchClientIds(fu.phone, fu.email);
      if (candidates.length === 1) {
        clientId = candidates[0];
        stats.fuLinkedExisting++;
      } else if (candidates.length === 0) {
        // créer une fiche client légère
        if (DRY) { stats.fuCreatedClient++; }
        else {
          const name = (fu.contactName || fu.title || "Client").trim().slice(0, 200) || "Client";
          let created;
          try {
            created = await prisma.client.create({ data: { name, phone: fu.phone || null, email: lowEmail(fu.email) } });
          } catch (e) {
            if (e?.code === "P2002") {
              // collision email unique -> rattacher au client existant
              const existing = await prisma.client.findUnique({ where: { email: lowEmail(fu.email) }, select: { id: true } });
              if (existing) { clientId = existing.id; stats.fuLinkedExisting++; }
            } else throw e;
          }
          if (created) { indexClient({ id: created.id, phone: created.phone, secondaryPhone: null, email: created.email }); clientId = created.id; stats.fuCreatedClient++; }
        }
        if (DRY) clientId = -1; // marqueur "serait créé"
      } else {
        stats.fuAmbiguous++; // plusieurs clients distincts -> laissé null pour revue manuelle
      }
    } else {
      stats.fuAlreadyLinked++;
    }

    // jalons dérivés
    const data = {};
    const wantOutcome = fu.status === "lost" ? "lost" : WON.has(fu.status) ? "won" : "open";
    if (fu.outcome !== wantOutcome) { data.outcome = wantOutcome; stats.outcomeSet++; }
    if (!fu.contactedAt && fu.status && fu.status !== "to_call") { data.contactedAt = fu.createdAt; stats.contactedSet++; }
    const woInv = fu.workOrders?.[0]?.invoiceSentAt || fu.workOrders?.[0]?.invoiceIssuedAt || null;
    if (!fu.invoicedAt && (woInv || fu.status === "a_payer")) { data.invoicedAt = woInv || fu.createdAt; stats.invoicedSet++; }

    if (!DRY) {
      const realClientId = clientId && clientId > 0 ? clientId : undefined;
      if (realClientId && !fu.clientId) data.clientId = realClientId;
      if (Object.keys(data).length) await prisma.clientFollowUp.update({ where: { id: fu.id }, data });
    }
  }

  // ── 3) Appointment.clientId ──────────────────────────────────────────────
  const appts = await prisma.appointment.findMany({ where: { clientId: null }, select: { id: true, phone: true, email: true } });
  stats.apptTotal = appts.length;
  for (const a of appts) {
    const ids = matchClientIds(a.phone, a.email);
    if (ids.length === 1) { stats.apptMatched++; if (!DRY) await prisma.appointment.update({ where: { id: a.id }, data: { clientId: ids[0] } }); }
    else if (ids.length > 1) stats.apptAmbiguous++;
  }

  // ── 4) ChatConversation.clientId ─────────────────────────────────────────
  const chats = await prisma.chatConversation.findMany({ where: { clientId: null }, select: { id: true, clientPhone: true, clientEmail: true } });
  stats.chatTotal = chats.length;
  for (const c of chats) {
    const ids = matchClientIds(c.clientPhone, c.clientEmail);
    if (ids.length === 1) { stats.chatMatched++; if (!DRY) await prisma.chatConversation.update({ where: { id: c.id }, data: { clientId: ids[0] } }); }
    else if (ids.length > 1) stats.chatAmbiguous++;
  }

  console.log("\n=== Suivis (ClientFollowUp) ===");
  console.log(`total=${stats.followUps} déjà_liés=${stats.fuAlreadyLinked} liés_à_existant=${stats.fuLinkedExisting} fiche_créée=${stats.fuCreatedClient} ambigus_laissés=${stats.fuAmbiguous}`);
  console.log(`outcome_màj=${stats.outcomeSet} contactedAt_set=${stats.contactedSet} invoicedAt_set=${stats.invoicedSet}`);
  console.log("=== RDV (Appointment) ===");
  console.log(`sans_clientId=${stats.apptTotal} rattachés=${stats.apptMatched} ambigus=${stats.apptAmbiguous}`);
  console.log("=== Chats (ChatConversation) ===");
  console.log(`sans_clientId=${stats.chatTotal} rattachés=${stats.chatMatched} ambigus=${stats.chatAmbiguous}`);
  console.log(DRY ? "\nDRY-RUN terminé (rien écrit)." : "\nBackfill terminé.");
  await prisma.$disconnect();
})().catch(async (e) => { console.error("ERREUR:", e.message); try { await prisma.$disconnect(); } catch {} process.exit(1); });
