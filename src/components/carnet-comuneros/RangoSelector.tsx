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
import type { CarnetComunero } from "@/types/carnet-comunero";

interface RangoSelectorProps {
  items: CarnetComunero[];
  onApply: (selection: {
    field: "licenseNumber" | "dni";
    from: string;
    to: string;
    ids: number[];
  }) => void;
}

export function RangoSelector({ items, onApply }: RangoSelectorProps) {
  const [field, setField] = useState<"licenseNumber" | "dni">("licenseNumber");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function handleApply() {
    const f = from.trim();
    const t = to.trim();

    if (!f || !t) {
      toast.error("Ingresa el rango inicial y final.");
      return;
    }

    const isNum = /^\d+$/.test(f) && /^\d+$/.test(t);

    let matched: CarnetComunero[] = [];

    if (isNum) {
      const min = Math.min(Number(f), Number(t));
      const max = Math.max(Number(f), Number(t));
      matched = items.filter((i) => {
        const val = field === "licenseNumber" ? i.nroCarnet : i.dni;
        if (!/^\d+$/.test(val)) return false;
        const n = Number(val);
        return n >= min && n <= max;
      });
    } else {
      const [lo, hi] = [f, t].sort();
      matched = items.filter((i) => {
        const val = field === "licenseNumber" ? i.nroCarnet : i.dni;
        return val >= lo && val <= hi;
      });
    }

    if (matched.length === 0) {
      toast.error("Ningún carnet coincide con ese rango.");
      return;
    }

    onApply({
      field,
      from: f,
      to: t,
      ids: matched.map((i) => i.id),
    });
    setFrom("");
    setTo("");
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

        <Button type="button" variant="outline" onClick={handleApply}>
          Añadir a selección
        </Button>
      </div>
    </Card>
  );
}
