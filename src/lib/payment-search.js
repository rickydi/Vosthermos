const MAX_SEARCH_LENGTH = 100;

const VALUE_ALIASES = {
  paid: "paye payee payes payees regle reglee acquitte acquittee",
  overdue: "en retard retard echu echue",
  receivable: "a recevoir non echu non echue unpaid outstanding due",
  deposit: "depot acompte",
  not_invoice: "non facture avant facture",
  invoiced: "facture a payer",
  sent: "envoye envoyee transmis transmise",
  quote_accepted: "soumission acceptee",
  scheduled: "job planifie travail planifie",
  in_progress: "en cours",
  completed: "job fait travail termine",
  carte: "moneris carte credit carte debit card credit card debit card",
  cheque: "check bank check",
  comptant: "cash especes",
  virement: "transfert bancaire wire transfer bank transfer",
  interac: "virement transfert e transfer etransfer wire transfer",
};

const MONTHS_FR = [
  ["janvier", "janv"],
  ["fevrier", "fevr"],
  ["mars", "mars"],
  ["avril", "avr"],
  ["mai", "mai"],
  ["juin", "juin"],
  ["juillet", "juil"],
  ["aout", "aout"],
  ["septembre", "sept"],
  ["octobre", "oct"],
  ["novembre", "nov"],
  ["decembre", "dec"],
];

const MONTHS_EN = [
  ["january", "jan"],
  ["february", "feb"],
  ["march", "mar"],
  ["april", "apr"],
  ["may", "may"],
  ["june", "jun"],
  ["july", "jul"],
  ["august", "aug"],
  ["september", "sep"],
  ["october", "oct"],
  ["november", "nov"],
  ["december", "dec"],
];

export function normalizePaymentSearch(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-CA")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function addDateVariants(value, output) {
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return;

  const [, year, month, day] = match;
  const monthNamesFr = MONTHS_FR[Number(month) - 1];
  const monthNamesEn = MONTHS_EN[Number(month) - 1];
  output.push(`${day}/${month}/${year}`, `${day}-${month}-${year}`);
  if (monthNamesFr) {
    output.push(`${day} ${monthNamesFr[0]} ${year}`, `${day} ${monthNamesFr[1]} ${year}`);
  }
  if (monthNamesEn) {
    output.push(`${monthNamesEn[0]} ${day} ${year}`, `${monthNamesEn[1]} ${day} ${year}`);
  }
}

function addPrimitive(value, output) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return;
    const iso = value.toISOString();
    output.push(iso);
    addDateVariants(iso, output);
    return;
  }

  const raw = String(value);
  output.push(raw);

  const alias = VALUE_ALIASES[normalizePaymentSearch(raw).replace(/\s+/g, "_")];
  if (alias) output.push(alias);

  if (typeof value === "number" && Number.isFinite(value)) {
    output.push(value.toFixed(2), value.toFixed(2).replace(".", ","));
  }

  addDateVariants(raw, output);
}

function collectSearchValues(value, output, seen) {
  if (value === null || value === undefined) return;

  if (value instanceof Date || ["string", "number", "bigint", "boolean"].includes(typeof value)) {
    addPrimitive(value, output);
    return;
  }

  if (typeof value !== "object" || seen.has(value)) return;
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) collectSearchValues(item, output, seen);
    return;
  }

  for (const childValue of Object.values(value)) {
    collectSearchValues(childValue, output, seen);
  }
}

function parseMoneyQuery(query) {
  let raw = String(query || "")
    .toLocaleLowerCase("fr-CA")
    .replace(/\bcad\b/g, "")
    .replace(/\$/g, "")
    .trim();
  if (!raw || !/^[+\-\d\s.,]+$/.test(raw) || !/\d/.test(raw)) return null;

  raw = raw.replace(/\s+/g, "");
  const comma = raw.lastIndexOf(",");
  const dot = raw.lastIndexOf(".");
  const separator = Math.max(comma, dot);

  if (separator >= 0) {
    const decimals = raw.length - separator - 1;
    if (decimals <= 2) {
      const integer = raw.slice(0, separator).replace(/[.,]/g, "");
      const fraction = raw.slice(separator + 1).replace(/[.,]/g, "");
      raw = `${integer}.${fraction}`;
    } else {
      raw = raw.replace(/[.,]/g, "");
    }
  }

  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function moneyValues(payment) {
  const values = [
    payment?.totalPieces,
    payment?.totalLabor,
    payment?.laborRate,
    payment?.subtotal,
    payment?.tps,
    payment?.tvq,
    payment?.total,
    payment?.paymentsTotal,
    payment?.balanceDue,
  ];

  for (const entry of payment?.payments || []) values.push(entry?.amount);
  for (const note of payment?.creditNotes || []) {
    values.push(note?.subtotal, note?.tps, note?.tvq, note?.total);
  }

  return values.map(Number).filter(Number.isFinite);
}

function moneyMatchScore(payment, query) {
  const queryAmount = parseMoneyQuery(query);
  if (queryAmount === null) return 0;

  const compactQuery = normalizePaymentSearch(query).replace(/\s+/g, "");
  const queryIsInteger = Number.isInteger(queryAmount) && !/[.,]/.test(String(query));
  let best = 0;

  for (const amount of moneyValues(payment)) {
    if (Math.abs(amount - queryAmount) < 0.005) best = Math.max(best, 1400);

    const fixed = Math.abs(amount).toFixed(2);
    const compactAmount = fixed.replace(/\D/g, "");
    const wholeAmount = fixed.split(".")[0];
    const unsignedQuery = compactQuery.replace(/^0+/, "") || "0";

    if (queryIsInteger && wholeAmount === String(Math.abs(queryAmount))) {
      best = Math.max(best, 1300);
    } else if (compactAmount.startsWith(unsignedQuery)) {
      best = Math.max(best, 1200);
    } else if (compactAmount.includes(unsignedQuery)) {
      best = Math.max(best, 1100);
    }
  }

  return best;
}

export function paymentSearchScore(payment, query) {
  const safeQuery = String(query || "").trim().slice(0, MAX_SEARCH_LENGTH);
  const normalizedQuery = normalizePaymentSearch(safeQuery);
  if (!normalizedQuery) return 1;

  const values = [];
  collectSearchValues(payment, values, new Set());
  const normalizedValues = values.map(normalizePaymentSearch).filter(Boolean);
  const compactQuery = normalizedQuery.replace(/\s+/g, "");
  let textScore = 0;

  for (const value of normalizedValues) {
    const compactValue = value.replace(/\s+/g, "");
    if (value === normalizedQuery) textScore = Math.max(textScore, 800);
    else if (compactValue === compactQuery) textScore = Math.max(textScore, 780);
    else if (value.startsWith(normalizedQuery) || compactValue.startsWith(compactQuery)) textScore = Math.max(textScore, 650);
    else if (value.includes(normalizedQuery) || compactValue.includes(compactQuery)) textScore = Math.max(textScore, 500);
  }

  if (!textScore) {
    const tokens = normalizedQuery.split(" ").filter(Boolean);
    const allTokensMatch = tokens.every((token) => normalizedValues.some((value) => (
      value.includes(token) || value.replace(/\s+/g, "").includes(token)
    )));
    if (allTokensMatch) textScore = 300;
  }

  return Math.max(textScore, moneyMatchScore(payment, safeQuery));
}

export function paymentMatchesSearch(payment, query) {
  return paymentSearchScore(payment, query) > 0;
}

export function filterPaymentsBySearch(payments, query) {
  const safeQuery = String(query || "").trim().slice(0, MAX_SEARCH_LENGTH);
  if (!safeQuery) return payments;
  return payments.filter((payment) => paymentMatchesSearch(payment, safeQuery));
}

export function rankPaymentsBySearch(payments, query) {
  const safeQuery = String(query || "").trim().slice(0, MAX_SEARCH_LENGTH);
  if (!safeQuery) return payments;
  return payments
    .map((payment, index) => ({ payment, index, score: paymentSearchScore(payment, safeQuery) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ payment }) => payment);
}
