// Fusion de fiches clients en double (issues du bug de correspondance
// telephonique corrige le 2026-08-04 : le rapprochement comparait les chiffres
// au numero FORMATE, donc un client sans courriel n'etait presque jamais
// retrouve et chaque appel recreait une fiche).
//
// Usage (depuis /home/vosthermo/vosthermos_app) :
//   node scripts/fusion-doublons-clients.mjs --dry          apercu des fusions AUTO (meme nom + memes chiffres)
//   node scripts/fusion-doublons-clients.mjs --apply        applique les fusions AUTO
//   node scripts/fusion-doublons-clients.mjs --pair 423 424 --dry|--apply
//                                                           fusionne le doublon 424 DANS le survivant 423
//
// Regles :
// - survivant = la fiche avec le plus de bons de travail, sinon la plus ancienne ;
// - toutes les references (11 tables) passent au survivant ;
// - les champs vides du survivant se remplissent depuis le doublon (jamais l'inverse) ;
// - le suivi du doublon, s'il est VIDE (aucun jalon, aucun montant, aucun bon lie,
//   notes purement automatiques), fond ses notes dans le suivi ouvert du survivant
//   et disparait ; sinon il est conserve tel quel, re-parente ;
// - une transaction par paire : tout passe ou rien ne passe.
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "node:fs";

const url = fs.readFileSync(".env", "utf8").match(/DATABASE_URL="([^"]+)"/)[1];
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

const APPLY = process.argv.includes("--apply");
const pairIndex = process.argv.indexOf("--pair");
const explicitPair = pairIndex !== -1
  ? [Number(process.argv[pairIndex + 1]), Number(process.argv[pairIndex + 2])]
  : null;

// Les 11 tables qui referencent clients(id), verifiees dans pg_constraint.
// manager_clients est traitee a part (contrainte unique managerId+clientId).
const CHILD_TABLES = [
  ["appointments", "clientId"],
  ["buildings", "clientId"],
  ["chat_conversations", "clientId"],
  ["client_follow_ups", "clientId"],
  ["client_photos", "clientId"],
  ["client_units", "clientId"],
  ["credit_notes", "clientId"],
  ["thermos_measurements", "clientId"],
  ["thermos_orders", "clientId"],
  ["work_orders", "clientId"],
];

const FILL_FIELDS = ["email", "company", "contactName", "address", "city", "postalCode", "secondaryPhone"];

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

async function childCounts(clientId) {
  const counts = {};
  for (const [table, column] of CHILD_TABLES) {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT count(*)::int AS n FROM "${table}" WHERE "${column}" = $1`,
      clientId,
    );
    if (rows[0].n > 0) counts[table] = rows[0].n;
  }
  return counts;
}

/** Le suivi est-il un artefact vide cree par le bug ? */
function isEmptyAutoFollowUp(fu, linkedWorkOrders) {
  if (fu.outcome !== "open") return false;
  if (linkedWorkOrders > 0) return false;
  if (fu.estimateAmount !== null) return false;
  for (const key of ["visitDoneAt", "estimateSentAt", "acceptedAt", "jobCompletedAt", "invoicedAt", "visitScheduledAt"]) {
    if (fu[key]) return false;
  }
  return true;
}

async function mergePair(survivorId, duplicateId) {
  const survivor = await prisma.client.findUnique({ where: { id: survivorId } });
  const duplicate = await prisma.client.findUnique({ where: { id: duplicateId } });
  if (!survivor || !duplicate) throw new Error(`fiche introuvable (${survivorId} ou ${duplicateId})`);

  const moves = await childCounts(duplicateId);
  console.log(`\n→ FUSION #${duplicateId} « ${duplicate.name} » DANS #${survivorId} « ${survivor.name} »`);
  console.log(`  a deplacer : ${Object.entries(moves).map(([t, n]) => `${t}=${n}`).join(", ") || "rien"}`);

  const fills = {};
  for (const field of FILL_FIELDS) {
    if (isBlank(survivor[field]) && !isBlank(duplicate[field])) fills[field] = duplicate[field];
  }
  // Ne jamais dupliquer le meme numero en secondaire.
  if (fills.secondaryPhone) {
    const digits = (v) => String(v || "").replace(/\D/g, "").slice(-10);
    if (digits(fills.secondaryPhone) === digits(survivor.phone)) delete fills.secondaryPhone;
  }
  if (Object.keys(fills).length) {
    console.log(`  champs completes sur le survivant : ${Object.keys(fills).join(", ")}`);
  }

  if (!APPLY) { console.log("  [dry] rien d'ecrit"); return; }

  await prisma.$transaction(async (tx) => {
    // 1. Re-parenter toutes les references.
    for (const [table, column] of CHILD_TABLES) {
      await tx.$executeRawUnsafe(
        `UPDATE "${table}" SET "${column}" = $1 WHERE "${column}" = $2`,
        survivorId,
        duplicateId,
      );
    }
    // manager_clients : deplacer sauf si le lien existe deja chez le survivant.
    await tx.$executeRawUnsafe(
      `DELETE FROM manager_clients d WHERE d."clientId" = $1
         AND EXISTS (SELECT 1 FROM manager_clients s WHERE s."clientId" = $2 AND s."managerId" = d."managerId")`,
      duplicateId,
      survivorId,
    );
    await tx.$executeRawUnsafe(
      `UPDATE manager_clients SET "clientId" = $1 WHERE "clientId" = $2`,
      survivorId,
      duplicateId,
    );

    // 2. Completer le survivant + tracer la fusion dans ses notes.
    const marker = `[fusion doublon #${duplicateId} « ${duplicate.name} » ${new Date().toISOString().slice(0, 10)}]`;
    const mergedNotes = [survivor.notes, marker, isBlank(survivor.notes) ? duplicate.notes : null]
      .filter(Boolean)
      .join("\n");
    await tx.client.update({
      where: { id: survivorId },
      data: { ...fills, notes: mergedNotes },
    });

    // 3. Suivis : fondre les artefacts vides dans le suivi ouvert du survivant.
    const followUps = await tx.clientFollowUp.findMany({
      where: { clientId: survivorId },
      orderBy: { createdAt: "asc" },
    });
    const open = followUps.filter((fu) => fu.outcome === "open");
    if (open.length > 1) {
      // Le plus ancien ouvert = le vrai dossier ; les artefacts vides fusionnent dedans.
      const keeper = open[0];
      for (const candidate of open.slice(1)) {
        const linked = await tx.workOrder.count({ where: { followUpId: candidate.id } });
        if (!isEmptyAutoFollowUp(candidate, linked)) continue;
        const extraNotes = [keeper.notes, candidate.notes].filter(Boolean).join("\n");
        await tx.clientFollowUp.update({
          where: { id: keeper.id },
          data: {
            notes: extraNotes || null,
            // Le contact fait sur l'artefact vaut pour le vrai dossier.
            contactedAt: keeper.contactedAt || candidate.contactedAt,
            ...(keeper.nextAction === "Appeler le client" && candidate.contactedAt
              ? { nextAction: null }
              : {}),
          },
        });
        await tx.clientFollowUp.delete({ where: { id: candidate.id } });
        console.log(`  suivi artefact #${candidate.id} fondu dans #${keeper.id}`);
      }
    }

    // 4. La fiche en double disparait.
    await tx.client.delete({ where: { id: duplicateId } });
  });
  console.log("  ✔ fusionne");
}

async function main() {
  if (explicitPair) {
    const [survivorId, duplicateId] = explicitPair;
    if (!survivorId || !duplicateId || survivorId === duplicateId) {
      throw new Error("--pair exige deux ids distincts : survivant puis doublon");
    }
    await mergePair(survivorId, duplicateId);
    return;
  }

  // Mode AUTO : memes 10 chiffres ET meme nom normalise = doublon certain.
  const groups = await prisma.$queryRaw`
    SELECT vt_digits(phone) AS digits,
           lower(regexp_replace(trim(name), '\\s+', ' ', 'g')) AS norm_name,
           array_agg(id ORDER BY id) AS ids
    FROM clients
    WHERE phone IS NOT NULL AND length(vt_digits(phone)) = 10
    GROUP BY 1, 2
    HAVING count(*) > 1
    ORDER BY 1
  `;
  if (!groups.length) { console.log("Aucun doublon meme-nom restant."); return; }

  console.log(`${groups.length} groupe(s) meme nom + memes chiffres :`);
  for (const group of groups) {
    const ids = group.ids.map(Number);
    // Survivant : le plus de bons, sinon le plus ancien (id le plus bas).
    const ranked = [];
    for (const id of ids) {
      const orders = await prisma.workOrder.count({ where: { clientId: id } });
      ranked.push({ id, orders });
    }
    ranked.sort((a, b) => b.orders - a.orders || a.id - b.id);
    const survivorId = ranked[0].id;
    for (const { id } of ranked.slice(1)) {
      await mergePair(survivorId, id);
    }
  }
}

main()
  .catch((err) => { console.error("ERREUR:", err.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
