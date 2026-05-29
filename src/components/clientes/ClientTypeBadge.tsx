import { Badge } from "@/components/ui/badge";
import type { ClientType } from "@/types/client";

interface ClientTypeBadgeProps {
  type: ClientType;
}

export function ClientTypeBadge({ type }: ClientTypeBadgeProps) {
  const className = type === "Comunero"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300";

  return <Badge variant="outline" className={className}>{type}</Badge>;
}
