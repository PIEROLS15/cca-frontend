import { apiFetch } from "./api";
import type { DashboardSummary, StatusBreakdownItem, MonthlyActivityItem, RecentActivityItem } from "@/types/dashboard";

function qs(params?: Record<string, string>) {
  if (!params) return "";
  const s = new URLSearchParams(params).toString();
  return s ? `?${s}` : "";
}

export const DashboardService = {
  getSummary: () =>
    apiFetch<DashboardSummary>("/api/dashboard/summary"),

  getStatusBreakdown: (from?: string, to?: string) =>
    apiFetch<StatusBreakdownItem[]>(`/api/dashboard/status-breakdown${qs({ ...(from ? { from } : {}), ...(to ? { to } : {}) })}`),

  getMonthlyActivity: (from?: string, to?: string) =>
    apiFetch<MonthlyActivityItem[]>(`/api/dashboard/monthly-activity${qs({ ...(from ? { from } : {}), ...(to ? { to } : {}) })}`),

  getRecentActivity: () =>
    apiFetch<RecentActivityItem[]>("/api/dashboard/recent-activity"),
};
