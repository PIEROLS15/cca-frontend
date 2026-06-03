import { Badge } from "@/components/ui/badge";

const roleBadgeStyles: Record<string, string> = {
  Admin: "bg-primary/10 text-primary border-primary/20",
  Presidente: "bg-info/10 text-info border-info/20",
  "Atención": "bg-warning/15 text-warning-foreground border-warning/30 dark:text-warning",
  Secretario: "bg-muted text-muted-foreground border-border",
};

export function UserRoleBadge({ name }: { name: string }) {
  const cls = roleBadgeStyles[name] ?? "bg-muted text-muted-foreground border-border";

  return (
    <Badge variant="outline" className={`${cls} font-medium`}>
      {name}
    </Badge>
  );
}
