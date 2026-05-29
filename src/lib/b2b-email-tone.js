export function isFriendlyBusinessClient(client) {
  return client?.type === "gestionnaire" && client?.friendlyEmail === true;
}

export function emailGreetingName(client) {
  const fallback = client?.type === "gestionnaire" ? "" : client?.name;
  return String(client?.contactName || fallback || "").trim().replace(/\s{2,}/g, " ");
}

function documentNoun(documentMeta) {
  if (documentMeta?.type === "quote") return "la soumission";
  if (documentMeta?.type === "invoice") return "la facture";
  if (documentMeta?.type === "work_order") return "le bon de travail";
  return "le document";
}

function businessReference(wo) {
  const clientName = String(wo?.client?.name || "").trim();
  if (clientName) return clientName;

  return [
    wo?.interventionAddress || wo?.client?.address,
    wo?.interventionCity || wo?.client?.city,
  ].filter(Boolean).join(", ");
}

export function buildFriendlyDocumentEmailBody(wo, documentMeta) {
  const name = emailGreetingName(wo?.client);
  const noun = documentNoun(documentMeta);
  const reference = businessReference(wo);
  const documentText = reference ? `${noun} pour ${reference}` : noun;
  const decisionLine = documentMeta?.type === "quote"
    ? "Le PDF est attache a ce courriel. Quand tu auras eu le temps de regarder le tout, tu peux simplement me repondre ici et on pourra confirmer la suite."
    : "Le PDF est attache a ce courriel pour tes dossiers.";

  return [
    `Bonjour${name ? ` ${name}` : ""},`,
    "",
    "J'espere que tu vas bien.",
    "",
    `Je te joins ${documentText}. ${decisionLine}`,
    "",
    "Si tu as une autre unite, une fenetre difficile a ouvrir ou une piece a remplacer, tu peux simplement me repondre ici et on gardera le dossier au meme endroit.",
    "",
    "Bonne journee,",
    "",
    "Vosthermos",
  ].join("\n");
}

function replaceGreeting(message, client) {
  const name = emailGreetingName(client);
  if (!message || !name) return message;

  const english = /^hello\b/i.test(message);
  const greeting = `${english ? "Hello" : "Bonjour"} ${name},`;
  if (/^(bonjour|hello)\b[^\n]*(\n|$)/i.test(message)) {
    return message.replace(/^(bonjour|hello)\b[^\n]*(\n|$)/i, `${greeting}\n`).trim();
  }
  return `${greeting}\n\n${message}`.trim();
}

function insertAfterGreeting(message, sentence) {
  if (!message || !sentence) return message;
  const match = message.match(/^(bonjour|hello)\b[^\n]*(\n|$)/i);
  if (!match) return `${sentence}\n\n${message}`.trim();
  const rest = message.slice(match[0].length).replace(/^\n+/, "");
  return `${match[0].trim()}\n\n${sentence}${rest ? `\n\n${rest}` : ""}`.trim();
}

function insertBeforeSignoff(message, paragraph) {
  if (!message || !paragraph) return message;
  const signoffPattern = /\n{2,}(merci|bonne journee|cordialement|vosthermos|thank you|thanks|best regards)\b/i;
  const match = message.match(signoffPattern);
  if (!match) return `${message}\n\n${paragraph}`.trim();

  const index = match.index;
  return `${message.slice(0, index).trim()}\n\n${paragraph}${message.slice(index)}`.trim();
}

function applyFriendlyTone(message) {
  const english = /^hello\b/i.test(message);
  const normalized = message.toLowerCase();
  let next = message;

  if (english) {
    if (!/\bhope you(?:'| a)re doing well\b/i.test(next)) {
      next = insertAfterGreeting(next, "Hope you're doing well.");
    }
    if (!/\breply (here|to this email)\b/i.test(next)) {
      next = insertBeforeSignoff(next, "If another unit, window or hardware part needs attention, you can simply reply here and we will keep everything in the same file.");
    }
    return next;
  }

  if (!normalized.includes("j'espere") && !normalized.includes("j espere")) {
    next = insertAfterGreeting(next, "J'espere que tu vas bien.");
  }
  if (!normalized.includes("autre unite") && !normalized.includes("repondre ici") && !normalized.includes("reponds ici")) {
    next = insertBeforeSignoff(next, "Si tu as une autre unite, une fenetre difficile a ouvrir ou une piece a remplacer, tu peux simplement me repondre ici et on gardera le dossier au meme endroit.");
  }
  return next;
}

export function personalizeDocumentEmailText(body, client) {
  const message = String(body || "").replace(/\r\n/g, "\n").trim();
  const personalized = replaceGreeting(message, client);
  if (!personalized || !isFriendlyBusinessClient(client)) return personalized;
  return applyFriendlyTone(personalized);
}
