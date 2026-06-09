import { Badge } from "@/components/ui/badge";

const normalizeRoleKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");

const roleBadgeStyles: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  superadmin: "bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-300",
  presidente: "bg-info/10 text-info border-info/20",
  secretaria: "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-300",
  asistente: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300",
  supervisor: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300",
  atencioncliente: "bg-warning/15 text-warning-foreground border-warning/30 dark:text-warning",
  ingeniero: "bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-500/20 dark:text-fuchsia-300",
};

export function UserRoleBadge({ name }: { name: string }) {
  const cls = roleBadgeStyles[normalizeRoleKey(name)] ?? "bg-muted text-muted-foreground border-border";

  return (
    <Badge variant="outline" className={`${cls} font-medium`}>
      {name}
    </Badge>
  );
}
