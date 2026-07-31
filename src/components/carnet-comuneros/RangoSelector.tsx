import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CommonerLicensesService } from "@/services/commoner-licenses.service";
import type { CarnetComunero } from "@/types/carnet-comunero";

interface RangoSelectorProps {
  onApply: (selection: {
    field: "licenseNumber" | "dni";
    from: string;
    to: string;
    ids: number[];
    items: CarnetComunero[];
  }) => void;
}

export function RangoSelector({ onApply }: RangoSelectorProps) {
  const [field, setField] = useState<"licenseNumber" | "dni">("licenseNumber");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    const f = from.trim();
    const t = to.trim();

    if (!f || !t) {
      toast.error("Ingresa el rango inicial y final.");
      return;
    }

    setLoading(true);

    try {
      const result = await CommonerLicensesService.list({
        rangeField: field,
        rangeFrom: f,
        rangeTo: t,
      });

      if (result.data.length === 0) {
        toast.error("Ningún carnet coincide con ese rango.");
        return;
      }

      onApply({
        field,
        from: f,
        to: t,
        ids: result.data.map((i) => i.id),
        items: result.data,
      });
      setFrom("");
      setTo("");
    } catch {
      toast.error("No se pudo buscar el rango.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <Label className="text-xs">Seleccionar por rango</Label>
          <Select
            value={field}
            onValueChange={(v) => setField(v as "licenseNumber" | "dni")}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="licenseNumber">N° Carnet</SelectItem>
              <SelectItem value="dni">DNI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-1.5">
          <Label htmlFor="rango-desde" className="text-xs">
            Desde
          </Label>
          <Input
            id="rango-desde"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder={field === "licenseNumber" ? "4780" : "12345678"}
          />
        </div>

        <div className="flex-1 space-y-1.5">
          <Label htmlFor="rango-hasta" className="text-xs">
            Hasta
          </Label>
          <Input
            id="rango-hasta"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={field === "licenseNumber" ? "4820" : "87654321"}
          />
        </div>

        <Button type="button" variant="outline" onClick={handleApply} disabled={loading}>
          {loading ? "Buscando..." : "Añadir a selección"}
        </Button>
      </div>
    </Card>
  );
}
