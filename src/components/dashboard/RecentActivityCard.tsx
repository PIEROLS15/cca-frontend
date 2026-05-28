import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { RecentActivityItem } from "@/types/dashboard";

interface RecentActivityCardProps {
  data: RecentActivityItem[];
}

export function RecentActivityCard({ data }: RecentActivityCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Actividad reciente</h3>
      </div>
      <div className="space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Sin actividad reciente</p>
        ) : (
          data.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                {a.usuario[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-medium">{a.usuario}</span>{" "}
                  <span className="text-muted-foreground">{a.accion}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  hace {formatDistanceToNow(new Date(a.cuando), { locale: es })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
