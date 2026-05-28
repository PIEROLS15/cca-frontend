import { FileText, Users, Building2, Map } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DashboardSummary } from "@/types/dashboard";

interface StatCardsProps {
  summary: DashboardSummary | null;
}

const cards = [
  { label: "Certificados Activos", key: "certificates" as const, icon: FileText, accent: "from-primary/20 to-primary/0 text-primary" },
  { label: "Clientes", key: "clients" as const, icon: Users, accent: "from-info/20 to-info/0 text-info" },
  { label: "Sectores", key: "sectors" as const, icon: Building2, accent: "from-success/20 to-success/0 text-success" },
  { label: "Tipos de Terreno", key: "terrainTypes" as const, icon: Map, accent: "from-warning/20 to-warning/0 text-warning" },
];

export function StatCards({ summary }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const value = summary?.[c.key] ?? 0;
        return (
          <div key={c.key}>
            <Card className="p-5 relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-linear-to-br ${c.accent} opacity-60`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl bg-linear-to-br ${c.accent} bg-opacity-20 flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{c.label}</div>
                <div className="text-3xl font-semibold tracking-tight mt-1 tabular-nums">
                  {value.toLocaleString()}
                </div>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
