// Lecture des montants saisis a la main, cote client comme cote serveur.
//
// Mesure dans le navigateur (locale fr-FR) avant correction :
//   * un <input type="number"> qui recoit « 20,00 » rend value === "" : la
//     virgule est purement et simplement rejetee.
//   * parseFloat("20,50") vaut 20 — les cents disparaissent en silence.
//   * parseFloat("1 250,75") vaut 1.
// D'ou cette lecture unique, tolerante a ce qu'un humain tape reellement :
// « 20 », « 20.00 », « 20,00 », « 1 250,75 », « 20,00 $ », « 1,250.75 ».
//
// Regle de separation : le DERNIER separateur rencontre (virgule ou point) est
// le separateur decimal, tous les autres sont des separateurs de milliers.
// C'est le seul choix qui reste previsible pendant la frappe — decider d'apres
// le nombre de chiffres ferait sauter le total en cours de saisie (« 1,25 »
// vaut 1,25 puis « 1,250 » basculerait a 1250).

const CLEAN = /[^\d.,-]/g;

/** Montant saisi -> nombre. Renvoie 0 pour tout ce qui n'est pas lisible. */
export function parseMoney(input) {
  if (typeof input === "number") return Number.isFinite(input) ? input : 0;
  const text = String(input ?? "").replace(CLEAN, "");
  if (!text) return 0;
  const lastSeparator = Math.max(text.lastIndexOf(","), text.lastIndexOf("."));
  const normalized = lastSeparator === -1
    ? text
    : `${text.slice(0, lastSeparator).replace(/[.,]/g, "")}.${text.slice(lastSeparator + 1).replace(/[.,]/g, "")}`;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

/**
 * Comme parseMoney, mais distingue « rien saisi » et « saisie illisible » de
 * « zero » : indispensable cote serveur, ou refuser un montant invalide n'a pas
 * le meme sens que recevoir 0.
 */
export function parseMoneyOrNull(input) {
  if (input === null || input === undefined) return null;
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  const text = String(input).replace(CLEAN, "");
  if (!text) return null;
  const amount = parseMoney(text);
  return Number.isFinite(amount) ? amount : null;
}

/** Arrondi comptable a deux decimales. */
export function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

/**
 * Valeur affichee dans un champ quand on ne le modifie pas. On garde le point
 * decimal : c'est ce que la personne relit ensuite, et les deux graphies sont
 * acceptees a la saisie de toute facon.
 */
export function moneyInputValue(value) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";
  return String(roundMoney(amount));
}
