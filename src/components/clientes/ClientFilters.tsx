import { Input } from "@/components/ui/input";
import { SearchFilters } from "@/components/ui/SearchFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClientType } from "@/types/client";

interface ClientFiltersProps {
  search: string;
  documentNumber: string;
  clientType: ClientType | "";
  onSearchChange: (value: string) => void;
  onDocumentNumberChange: (value: string) => void;
  onClientTypeChange: (value: ClientType | "") => void;
  onClear: () => void;
}

export function ClientFilters({
  search,
  documentNumber,
  clientType,
  onSearchChange,
  onDocumentNumberChange,
  onClientTypeChange,
  onClear,
}: ClientFiltersProps) {
  return (
    <SearchFilters
      search={search}
      onSearchChange={onSearchChange}
      onClear={onClear}
      placeholder="Nombre del cliente..."
    >
      <Input
        placeholder="DNI / RUC / código"
        value={documentNumber}
        onChange={(event) => onDocumentNumberChange(event.target.value)}
        className="lg:w-44"
      />
      <Select value={clientType || "all"} onValueChange={(value) => onClientTypeChange(value === "all" ? "" : value as ClientType)}>
        <SelectTrigger className="lg:w-52">
          <SelectValue placeholder="Tipo de cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          <SelectItem value="Comunero">Comunero</SelectItem>
          <SelectItem value="Tercero">Tercero</SelectItem>
        </SelectContent>
      </Select>
    </SearchFilters>
  );
}
