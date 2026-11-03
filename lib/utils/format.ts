const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const dateShortFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const dateLongFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
export function formatRupiah(n: number): string {
  return rupiahFormatter.format(n);
}

export function formatDateIndo(
  dateStr: string | null | undefined,
  variant: "short" | "long" = "short"
): string {
  if (!dateStr) return "-";
  try {
    const normalized = dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr;
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return "-";
    return variant === "long"
      ? dateLongFormatter.format(date)
      : dateShortFormatter.format(date);
  } catch {
    return "-";
  }
}

export function getSisaHari(deadlineStr: string | null | undefined): number | null {
  if (!deadlineStr) return null;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(`${deadlineStr}T00:00:00`);
    if (isNaN(deadline.getTime())) return null;
    const diffMs = deadline.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

export type DeadlineStatus = "lewat" | "hari-h" | "mendesak" | "normal";

export interface DeadlineInfo {
  sisaHari: number | null;
  label: string;
  status: DeadlineStatus;
}

export function formatDeadline(deadlineStr: string): DeadlineInfo {
  const sisaHari = getSisaHari(deadlineStr);

  if (sisaHari === null) {
    return { sisaHari: null, label: "Tanggal tidak valid", status: "normal" };
  }

  if (sisaHari < 0) {
    const abs = Math.abs(sisaHari);
    return {
      sisaHari,
      label: `${abs} hari lalu`,
      status: "lewat",
    };
  }

  if (sisaHari === 0) {
    return { sisaHari: 0, label: "Hari ini", status: "hari-h" };
  }

  if (sisaHari <= 3) {
    return { sisaHari, label: `${sisaHari} hari lagi`, status: "mendesak" };
  }

  return { sisaHari, label: `${sisaHari} hari lagi`, status: "normal" };
}

export function parseMeasurement(val: string): number | null {
  if (!val || val.trim() === "") return null;
  const normalized = val.replace(",", ".");
  const parsed = parseFloat(normalized);
  if (isNaN(parsed) || parsed < 0 || parsed > 300) return null;
  return parsed;
}
