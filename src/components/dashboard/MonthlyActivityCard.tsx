"use client";

import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DateRange } from "react-day-picker";
import type { PresetKey } from "@/lib/dashboard-utils";
import type { MonthlyActivityItem } from "@/types/dashboard";
import { RangeFilter } from "@/components/dashboard/RangeFilter";

interface MonthlyActivityCardProps {
  data: MonthlyActivityItem[];
  loading: boolean;
  preset: PresetKey;
  range: DateRange;
  onFilterChange: (preset: PresetKey, range: DateRange) => void;
}

export function MonthlyActivityCard({ data, loading, preset, range, onFilterChange }: MonthlyActivityCardProps) {
  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="font-semibold">Actividad de certificados y solicitudes</h3>
          <p className="text-xs text-muted-foreground">Historial mensual en el período seleccionado</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs w-full sm:w-auto">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" /> Certificados
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" /> Solicitud certificados
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warning" /> Solicitud Acta de Asamblea
            </div>
          </div>
          <RangeFilter preset={preset} range={range} onChange={onFilterChange} />
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-72">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.76 0.14 118)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.76 0.14 118)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.65 0.16 155)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.65 0.16 155)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.16 75)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.78 0.16 75)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" vertical={false} />
              <XAxis dataKey="mes" stroke="oklch(0.52 0.02 260)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.52 0.02 260)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" name="Certificados" dataKey="certificados" stroke="oklch(0.76 0.14 118)" strokeWidth={2} fill="url(#g1)" />
              <Area type="monotone" name="Solicitud certificados" dataKey="solicitudesCert" stroke="oklch(0.65 0.16 155)" strokeWidth={2} fill="url(#g2)" />
              <Area type="monotone" name="Solicitud Acta de Asamblea" dataKey="solicitudesActa" stroke="oklch(0.78 0.16 75)" strokeWidth={2} fill="url(#g3)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
