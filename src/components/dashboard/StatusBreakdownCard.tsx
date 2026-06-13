"use client";

import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DateRange } from "react-day-picker";
import type { PresetKey } from "@/lib/dashboard-utils";
import type { StatusBreakdownItem } from "@/types/dashboard";
import { RangeFilter } from "@/components/dashboard/RangeFilter";

interface StatusBreakdownCardProps {
  data: StatusBreakdownItem[];
  loading: boolean;
  preset: PresetKey;
  range: DateRange;
  onFilterChange: (preset: PresetKey, range: DateRange) => void;
}

export function StatusBreakdownCard({ data, loading, preset, range, onFilterChange }: StatusBreakdownCardProps) {
  const chartData = data.filter((e) => e.value > 0);

  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="font-semibold">Estado de certificados</h3>
          <p className="text-xs text-muted-foreground">Distribución en el período seleccionado</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
          <RangeFilter preset={preset} range={range} onChange={onFilterChange} />
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </div>
      ) : (
        <>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  {chartData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {data.map((e) => (
              <div key={e.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color }} />
                  <span className="text-muted-foreground">{e.name}</span>
                </div>
                <span className="font-medium tabular-nums">{e.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
