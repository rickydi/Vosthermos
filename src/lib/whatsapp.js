export const DEFAULT_WHATSAPP_CLOSE_DELAY_MS = 45000;

export function buildWhatsAppUrl(phone, text) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text || "")}`;
}

export function openWhatsAppWindow(url, closeAfterMs = DEFAULT_WHATSAPP_CLOSE_DELAY_MS) {
  if (typeof window === "undefined") return null;

  const popup = window.open("", "_blank");
  if (!popup) return null;

  try {
    popup.opener = null;
    popup.location.href = url;
  } catch {
    popup.location.assign(url);
  }

  if (!closeAfterMs) return popup;

  window.setTimeout(() => {
    try {
      if (!popup.closed) popup.close();
    } catch {}
  }, closeAfterMs);

  return popup;
}
