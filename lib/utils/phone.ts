export function normalizePhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.trim().replace(/\s+/g, "");

  if (cleaned.startsWith("+62")) {
    return cleaned.slice(1);
  }
  if (cleaned.startsWith("628")) {
    return cleaned;
  }
  if (cleaned.startsWith("08")) {
    return "62" + cleaned.slice(1);
  }
  return cleaned;
}

export function formatWhatsAppUrl(phone: string, text?: string): string {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return "#";
  const base = `https://wa.me/${normalized}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function formatTelUrl(phone: string): string {
  if (!phone) return "#";
  const cleaned = phone.trim().replace(/\s+/g, "");

  let local: string;
  if (cleaned.startsWith("+628")) {
    local = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("628")) {
    local = "0" + cleaned.slice(2);
  } else if (cleaned.startsWith("08")) {
    local = cleaned;
  } else {
    local = cleaned;
  }

  return `tel:${local}`;
}
