import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface SearchFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export function SearchFilters({
  search,
  onSearchChange,
  onClear,
  placeholder = "Buscar por nombre...",
}: SearchFiltersProps) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={placeholder}
            className="pl-9"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onClear}
          className="gap-1.5 border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive"
        >
          <X className="h-4 w-4" /> Limpiar
        </Button>
      </div>
    </Card>
  );
}
