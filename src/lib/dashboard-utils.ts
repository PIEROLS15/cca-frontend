import { startOfDay, endOfDay, subDays, startOfYear, format } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

export type PresetKey = "today" | "7d" | "30d" | "90d" | "12m" | "ytd" | "all" | "custom";

export const presets: { value: PresetKey; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "90d", label: "Últimos 90 días" },
  { value: "12m", label: "Últimos 12 meses" },
  { value: "ytd", label: "Este año" },
  { value: "all", label: "Todo el período" },
  { value: "custom", label: "Personalizado" },
];

export function presetRange(p: PresetKey): DateRange {
  const now = new Date();
  const end = endOfDay(now);
  switch (p) {
    case "today": return { from: startOfDay(now), to: end };
    case "7d": return { from: startOfDay(subDays(now, 6)), to: end };
    case "30d": return { from: startOfDay(subDays(now, 29)), to: end };
    case "90d": return { from: startOfDay(subDays(now, 89)), to: end };
    case "12m": return { from: startOfDay(subDays(now, 364)), to: end };
    case "ytd": return { from: startOfYear(now), to: end };
    case "all":
    case "custom":
    default: return { from: startOfDay(subDays(now, 729)), to: end };
  }
}

export function rangeLabel(r: DateRange): string {
  if (!r.from) return "Seleccionar";
  if (!r.to || r.from.toDateString() === r.to.toDateString()) {
    return format(r.from, "dd MMM yyyy", { locale: es });
  }
  return `${format(r.from, "dd MMM", { locale: es })} – ${format(r.to, "dd MMM yyyy", { locale: es })}`;
}

export function toDateParam(d: Date | undefined): string | undefined {
  return d ? d.toISOString().split("T")[0] : undefined;
}
