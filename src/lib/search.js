import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

// Recherche admin (clients + suivi). Remplace les `contains` de Prisma, qui
// posaient trois problèmes mesurés sur la base de prod :
//   1. `mode: "insensitive"` = ILIKE : gère la casse mais PAS les accents.
//      « seguin » ne trouvait pas « Marilou Séguin » (66 clients sur 519 ont un
//      accent dans leur nom).
//   2. Le téléphone était comparé en texte brut alors que 9 formats coexistent
//      en base : « (514)224-2692 » n'était trouvable qu'en tapant la ponctuation
//      exacte. Taper les 10 chiffres ne donnait rien.
//   3. Aucun tri par pertinence : le dossier cherché se perdait au milieu des
//      résultats trouvés par leurs notes.
//
// On délègue donc à SQL via vt_unaccent()/vt_digits() (migration
// 20260731120000_search_unaccent_and_phone) et on renvoie des IDs déjà classés,
// que l'appelant réinjecte dans sa requête Prisma habituelle (les include, la
// pagination et les droits restent inchangés).

const MAX_TERMS = 6;

// Prisma n'échappe pas les métacaractères LIKE : sans ça, taper « _ » ou « % »
// renvoie toute la base.
function escapeLike(value) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export function parseSearchQuery(input) {
  const raw = String(input ?? "").trim().replace(/\s+/g, " ");
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return {
    raw,
    like: `%${escapeLike(raw)}%`,
    prefix: `${escapeLike(raw)}%`,
    // Chaque mot doit se retrouver quelque part dans la fiche, peu importe
    // l'ordre : « tremblay jean » trouve « Jean Tremblay », et « dube laval »
    // croise le nom et la ville.
    terms: raw.split(" ").filter(Boolean).slice(0, MAX_TERMS).map((t) => `%${escapeLike(t)}%`),
    // 3 chiffres = le plus petit fragment qui veut dire quelque chose
    // (indicatif régional, début de numéro).
    digits: digits.length >= 3 ? `%${digits}%` : null,
  };
}

// Tous les termes doivent être présents dans le champ concaténé (AND).
function everyTermMatches(haystack, terms) {
  return Prisma.join(
    terms.map((term) => Prisma.sql`${haystack} ILIKE vt_unaccent(${term})`),
    " AND ",
  );
}

const CLIENT_HAYSTACK = Prisma.sql`vt_unaccent(
  coalesce(c.name, '') || ' ' || coalesce(c.company, '') || ' ' || coalesce(c.contact_name, '') || ' ' ||
  coalesce(c.city, '') || ' ' || coalesce(c.address, '') || ' ' || coalesce(c.email, '')
)`;

// Deux conditions séparées plutôt qu'une concaténation : chacune peut utiliser
// son index trigram, et un match ne peut pas chevaucher les deux numéros.
function clientPhoneMatch(digits) {
  if (!digits) return Prisma.sql`false`;
  return Prisma.sql`(
    vt_digits(coalesce(c.phone, '')) LIKE ${digits}
    OR vt_digits(coalesce(c.secondary_phone, '')) LIKE ${digits}
  )`;
}

/**
 * IDs de clients correspondant à la recherche, classés par pertinence
 * (nom qui commence par la requête, puis nom, puis téléphone, puis le reste).
 * Renvoie null quand il n'y a pas de recherche — l'appelant ne filtre alors rien.
 */
export async function searchClientIds(input, { limit = 2000 } = {}) {
  const q = parseSearchQuery(input);
  if (!q) return null;

  const phone = clientPhoneMatch(q.digits);
  const rows = await prisma.$queryRaw`
    SELECT c.id
    FROM clients c
    WHERE (${everyTermMatches(CLIENT_HAYSTACK, q.terms)}) OR ${phone}
    ORDER BY
      CASE
        WHEN vt_unaccent(c.name) ILIKE vt_unaccent(${q.prefix}) THEN 0
        WHEN vt_unaccent(c.name) ILIKE vt_unaccent(${q.like}) THEN 1
        WHEN ${phone} THEN 2
        ELSE 3
      END,
      c."updatedAt" DESC
    LIMIT ${limit}
  `;
  return rows.map((row) => Number(row.id));
}

// Identité du dossier : ce par quoi on cherche réellement un suivi.
const FOLLOW_UP_HAYSTACK = Prisma.sql`vt_unaccent(
  coalesce(f.title, '') || ' ' || coalesce(f."contactName", '') || ' ' || coalesce(f.service, '') || ' ' ||
  coalesce(f.email, '') || ' ' ||
  coalesce(c.name, '') || ' ' || coalesce(c.company, '') || ' ' || coalesce(c.contact_name, '') || ' ' ||
  coalesce(c.city, '') || ' ' || coalesce(c.email, '')
)`;

// Les notes restent cherchables (elles contiennent des vraies infos : « 1 porte
// balcon 350$ ») mais amputées des marqueurs automatiques [auto: ...] /
// [import: ...] : 520 des 522 suivis en portent, si bien que taper « 2026 »
// renvoyait 484 dossiers. Nettoyées, il en reste 2.
const FOLLOW_UP_NOTES = Prisma.sql`vt_unaccent(
  regexp_replace(coalesce(f.notes, ''), '\\[(auto|import):[^\\]]*\\]', '', 'g')
)`;

function followUpPhoneMatch(digits) {
  if (!digits) return Prisma.sql`false`;
  return Prisma.sql`(
    vt_digits(coalesce(f.phone, '')) LIKE ${digits}
    OR vt_digits(coalesce(c.phone, '')) LIKE ${digits}
    OR vt_digits(coalesce(c.secondary_phone, '')) LIKE ${digits}
  )`;
}

/**
 * IDs de suivis correspondant à la recherche, classés par pertinence. Un dossier
 * trouvé par son nom passe toujours devant un dossier trouvé par ses notes.
 */
export async function searchFollowUpIds(input, { limit = 1000 } = {}) {
  const q = parseSearchQuery(input);
  if (!q) return null;

  const phone = followUpPhoneMatch(q.digits);
  const identity = everyTermMatches(FOLLOW_UP_HAYSTACK, q.terms);
  const notes = everyTermMatches(FOLLOW_UP_NOTES, q.terms);

  const rows = await prisma.$queryRaw`
    SELECT f.id
    FROM client_follow_ups f
    LEFT JOIN clients c ON c.id = f."clientId"
    WHERE (${identity}) OR ${phone} OR (${notes})
    ORDER BY
      CASE
        WHEN vt_unaccent(coalesce(c.name, f.title)) ILIKE vt_unaccent(${q.prefix}) THEN 0
        WHEN ${identity} THEN 1
        WHEN ${phone} THEN 2
        ELSE 3
      END,
      f."createdAt" DESC
    LIMIT ${limit}
  `;
  return rows.map((row) => Number(row.id));
}

/** Remet une liste Prisma dans l'ordre de pertinence renvoyé par la recherche. */
export function orderByIds(rows, ids) {
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}
