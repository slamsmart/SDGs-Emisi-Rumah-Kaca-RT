import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKg(value: number) {
  return `${value.toFixed(2)} kg CO2e`;
}

export function formatPoint(value: number) {
  return `${new Intl.NumberFormat("id-ID").format(value)} poin`;
}

export function formatDate(value: Date | string) {
  return format(new Date(value), "dd MMM yyyy", { locale: id });
}

export function formatDateTime(value: Date | string) {
  return format(new Date(value), "dd MMM yyyy HH:mm", { locale: id });
}

export function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
