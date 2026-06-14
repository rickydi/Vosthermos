// Conversion Google Ads (lead). Déclenchée quand un visiteur envoie une demande
// (formulaire de devis / prise de RDV). Utilise le gtag.js déjà chargé dans le
// layout (config AW-18237535998).
//
// LABEL = identifiant de l'action de conversion « Soumission formulaire (Lead) »
// créée dans Google Ads (Outils → Conversions). Tant qu'il est vide, le helper
// ne fait rien (aucune erreur) — le site reste sain même sans label configuré.
const CONVERSION_ID = "AW-18237535998";
const LEAD_LABEL = ""; // ex. "abCdEfGhIj-1234" — à coller après création dans Google Ads

const LEAD_SEND_TO = LEAD_LABEL ? `${CONVERSION_ID}/${LEAD_LABEL}` : "";

export function reportLeadConversion() {
  if (!LEAD_SEND_TO) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", "conversion", { send_to: LEAD_SEND_TO });
  } catch {
    /* no-op : ne jamais casser l'envoi du formulaire à cause du tracking */
  }
}
