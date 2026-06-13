"use client";

import { useEffect, useState } from "react";
import { PublicHome } from "@/components/home/PublicHome";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageLoader } from "@/components/ui/PageLoader";
import { StatCards } from "@/components/dashboard/StatCards";
import { StatusBreakdownCard } from "@/components/dashboard/StatusBreakdownCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { MonthlyActivityCard } from "@/components/dashboard/MonthlyActivityCard";
import { useSession } from "@/context/session-context";
import { DashboardService } from "@/services/dashboard.service";
import type { DashboardSummary, StatusBreakdownItem, MonthlyActivityItem, RecentActivityItem } from "@/types/dashboard";
import type { PresetKey } from "@/lib/dashboard-utils";
import { presetRange, toDateParam } from "@/lib/dashboard-utils";
import type { DateRange } from "react-day-picker";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useSession();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdownItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyActivityItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [estadoLoaded, setEstadoLoaded] = useState(false);
  const [actividadLoaded, setActividadLoaded] = useState(false);

  const [estadoPreset, setEstadoPreset] = useState<PresetKey>("12m");
  const [estadoRange, setEstadoRange] = useState<DateRange>(() => presetRange("12m"));
  const [actividadPreset, setActividadPreset] = useState<PresetKey>("12m");
  const [actividadRange, setActividadRange] = useState<DateRange>(() => presetRange("12m"));

  useEffect(() => {
    if (!isAuthenticated) return;
    DashboardService.getSummary().then(setSummary).catch(() => {});
    DashboardService.getRecentActivity().then(setRecentActivity).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    DashboardService.getStatusBreakdown(toDateParam(estadoRange.from), toDateParam(estadoRange.to))
      .then(setStatusBreakdown)
      .catch(() => {})
      .finally(() => setEstadoLoaded(true));
  }, [isAuthenticated, estadoRange]);

  useEffect(() => {
    if (!isAuthenticated) return;
    DashboardService.getMonthlyActivity(toDateParam(actividadRange.from), toDateParam(actividadRange.to))
      .then(setMonthlyData)
      .catch(() => {})
      .finally(() => setActividadLoaded(true));
  }, [isAuthenticated, actividadRange]);

  if (loading) return <PageLoader />;

  if (!isAuthenticated || !user) {
    return <PublicHome />;
  }

  return (
    <AppLayout>
      <PageContainer title="Panel general" description="Resumen de actividad y métricas clave de la comunidad.">
        <StatCards summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StatusBreakdownCard
            data={statusBreakdown}
            loading={!estadoLoaded}
            preset={estadoPreset}
            range={estadoRange}
            onFilterChange={(p, r) => { setEstadoPreset(p); setEstadoRange(r); }}
          />
          <RecentActivityCard data={recentActivity} />
        </div>

        <MonthlyActivityCard
          data={monthlyData}
          loading={!actividadLoaded}
          preset={actividadPreset}
          range={actividadRange}
          onFilterChange={(p, r) => { setActividadPreset(p); setActividadRange(r); }}
        />
      </PageContainer>
    </AppLayout>
  );
}
