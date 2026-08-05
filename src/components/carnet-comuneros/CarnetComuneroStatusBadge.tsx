import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  "Sin entregar": "bg-muted text-muted-foreground border-border",
  Entregado: "bg-success/10 text-success border-success/20",
};

export function CarnetComuneroStatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "bg-muted text-muted-foreground border-border";

  return (
    <Badge variant="outline" className={`${color} font-medium`}>
      {status}
    </Badge>
  );
}
