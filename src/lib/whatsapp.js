export const DEFAULT_WHATSAPP_CLOSE_DELAY_MS = 12000;
const WHATSAPP_WINDOW_NAME = "vosthermos_whatsapp";
const WHATSAPP_WINDOW_FEATURES = "popup=yes,width=520,height=760,menubar=no,toolbar=no,location=yes,status=no";

export function buildWhatsAppUrl(phone, text) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text || "")}`;
}

export function openWhatsAppWindow(url, closeAfterMs = DEFAULT_WHATSAPP_CLOSE_DELAY_MS) {
  if (typeof window === "undefined") return null;

  const popup = window.open(url, WHATSAPP_WINDOW_NAME, WHATSAPP_WINDOW_FEATURES);
  if (!popup) return null;

  try {
    popup.focus();
  } catch {}

  if (!closeAfterMs) return popup;

  window.setTimeout(() => {
    try {
      if (!popup.closed) popup.close();
    } catch {}
  }, closeAfterMs);

  return popup;
}
