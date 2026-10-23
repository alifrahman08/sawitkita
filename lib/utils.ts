import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number to Indonesian Rupiah (IDR)
 * Example: 1500000 -> "Rp 1.500.000"
 */
export function formatRupiah(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "Rp 0";
  }
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
}

/**
 * Format weight in kilograms
 * Example: 1250.5 -> "1.250,5 kg"
 */
export function formatKg(weight: number | string | null | undefined, precision = 2): string {
  if (weight === null || weight === undefined || isNaN(Number(weight))) {
    return "0 kg";
  }
  const numeric = typeof weight === "string" ? parseFloat(weight) : weight;
  return (
    new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: precision,
    }).format(numeric) + " kg"
  );
}

/**
 * Format date to Indonesian standard format
 * Example: "23 Oktober 2026, 14:30 WIB"
 */
export function formatDateIndo(
  dateInput: Date | string | null | undefined,
  includeTime = false
): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  };

  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  const formatted = new Intl.DateTimeFormat("id-ID", options).format(date);
  return includeTime ? `${formatted} WIB` : formatted;
}

/**
 * Format short date (DD/MM/YYYY)
 */
export function formatShortDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

/**
 * Generate unique business numbers with prefix and timestamp
 * e.g. TR-20261023-8942
 */
export function generateReferenceNumber(prefix: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}${month}${day}-${random}`;
}
