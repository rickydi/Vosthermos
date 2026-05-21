export const QUOTE_STATUSES = new Set(["quote", "quote_sent", "quote_accepted"]);
export const INVOICE_STATUSES = new Set(["invoiced", "sent", "paid"]);

export function isQuoteStatus(statut) {
  return QUOTE_STATUSES.has(statut);
}

export function isInvoiceStatus(statut) {
  return INVOICE_STATUSES.has(statut);
}

export function normalizeDocumentType(type) {
  const value = String(type || "").trim().toLowerCase();
  if (["quote", "soumission", "estimate", "devis"].includes(value)) return "quote";
  if (["invoice", "facture"].includes(value)) return "invoice";
  if (["work_order", "work-order", "bon", "bon_travail", "bon de travail"].includes(value)) return "work_order";
  return null;
}

export function getWorkOrderDocumentType(statut, overrideType) {
  const explicit = normalizeDocumentType(overrideType);
  if (explicit) return explicit;
  if (isQuoteStatus(statut)) return "quote";
  if (isInvoiceStatus(statut)) return "invoice";
  return "work_order";
}

export function getWorkOrderDocumentMeta(statut, overrideType) {
  const type = getWorkOrderDocumentType(statut, overrideType);

  if (type === "quote") {
    return {
      type,
      label: "Soumission",
      labelUpper: "SOUMISSION",
      recipientLabel: "Client",
      attachmentPrefix: "Soumission",
      subjectPrefix: "Soumission",
      sentStatus: "quote_sent",
      sentFollowUpStatus: "estimate_sent",
      sentLabel: "Soumission envoyee",
      numberLabel: "No de soumission",
      dateTargetLabel: "Valide jusqu'au",
      descriptionHeading: "DESCRIPTION DU PROJET",
      totalLabel: "TOTAL",
      totalHint: "Valide 30 jours",
      compactPrefix: "Suite de la soumission",
      emailIntro: "Vous trouverez ci-joint votre soumission complete au format PDF.",
      emailQuestion: "Des questions sur cette soumission? Repondez simplement a ce courriel, nous sommes la pour vous aider.",
      emailAttachmentDetail: "detail complet des pieces et services estimes",
    };
  }

  if (type === "invoice") {
    return {
      type,
      label: "Facture",
      labelUpper: "FACTURE",
      recipientLabel: "Client",
      attachmentPrefix: "Facture",
      subjectPrefix: "Facture",
      sentStatus: "sent",
      sentFollowUpStatus: null,
      sentLabel: "Facture envoyee",
      numberLabel: "No de facture",
      dateTargetLabel: "Echeance",
      descriptionHeading: "DESCRIPTION DES TRAVAUX EFFECTUES",
      totalLabel: "TOTAL",
      totalHint: "A payer",
      compactPrefix: "Suite de la facture",
      emailIntro: "Vous trouverez ci-joint votre facture complete au format PDF.",
      emailQuestion: "Des questions sur cette facture? Repondez simplement a ce courriel, nous sommes la pour vous aider.",
      emailAttachmentDetail: "detail complet des pieces et services",
    };
  }

  return {
    type: "work_order",
    label: "Bon de travail",
    labelUpper: "BON DE TRAVAIL",
    recipientLabel: "Client",
    attachmentPrefix: "Bon-de-travail",
    subjectPrefix: "Bon de travail",
    sentStatus: null,
    sentFollowUpStatus: null,
    sentLabel: "Bon de travail envoye",
    numberLabel: "No de bon",
    dateTargetLabel: "",
    descriptionHeading: "DESCRIPTION DES TRAVAUX",
    totalLabel: "TOTAL",
    totalHint: "",
    compactPrefix: "Suite du bon de travail",
    emailIntro: "Vous trouverez ci-joint votre bon de travail au format PDF.",
    emailQuestion: "Des questions sur ce bon de travail? Repondez simplement a ce courriel, nous sommes la pour vous aider.",
    emailAttachmentDetail: "detail complet des pieces et services",
  };
}
