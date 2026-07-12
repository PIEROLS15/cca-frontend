import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  Recepcionado: "bg-primary/10 text-primary border-primary/20",
  "Por Firmar": "bg-destructive/10 text-destructive border-destructive/20",
  "Por Recoger": "bg-warning/15 text-warning-foreground border-warning/30 dark:text-warning",
  Entregado: "bg-success/10 text-success border-success/20",
  Observado: "bg-destructive/10 text-destructive border-destructive/20",
};

export function CertificateRequestStatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? "bg-muted text-muted-foreground border-border";

  return (
    <Badge variant="outline" className={`${color} font-medium`}>
      {status}
    </Badge>
  );
}
