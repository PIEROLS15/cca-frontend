import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  "En Proceso": "bg-warning/15 text-warning-foreground border-warning/30 dark:text-warning",
  "Por Recoger": "bg-primary/10 text-primary border-primary/20",
  Entregado: "bg-success/10 text-success border-success/20",
};

export function AssemblyRecordRequestStatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "bg-muted text-muted-foreground border-border";

  return (
    <Badge variant="outline" className={`${color} font-medium`}>
      {status}
    </Badge>
  );
}
