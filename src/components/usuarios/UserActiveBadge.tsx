import { Badge } from "@/components/ui/badge";

export function UserActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={`font-medium ${
        isActive
          ? "bg-success/10 text-success border-success/20"
          : "bg-destructive/10 text-destructive border-destructive/20"
      }`}
    >
      {isActive ? "Activo" : "Inactivo"}
    </Badge>
  );
}
