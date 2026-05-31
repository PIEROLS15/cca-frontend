"use client";

import type { FormEvent } from "react";
import { Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Sector } from "@/types/sector";
import type { TerrainType } from "@/types/terrain-type";
import type { CertificateFormState } from "@/hooks/use-certificate-form";

function sectionTitle(text: string) {
  return <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{text}</h3>;
}

interface CertificateFormProps {
  mode: "create" | "edit";
  form: CertificateFormState;
  loading: boolean;
  submitting: boolean;
  searching: boolean;
  terrainTypes: TerrainType[];
  sectors: Sector[];
  onFieldChange: <Key extends keyof CertificateFormState>(field: Key, value: CertificateFormState[Key]) => void;
  onSearchRequest: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function CertificateForm({
  mode,
  form,
  loading,
  submitting,
  searching,
  terrainTypes,
  sectors,
  onFieldChange,
  onSearchRequest,
  onSubmit,
}: CertificateFormProps) {
  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando certificado...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-1.5 max-w-md">
          <Label htmlFor="requestNumber" className="text-xs font-semibold">
            Código de solicitud
          </Label>
          <div className="flex gap-2">
            <Input
              id="requestNumber"
              placeholder="Ej: 3210-26"
              value={form.requestNumber}
              onChange={(event) => onFieldChange("requestNumber", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onSearchRequest();
                }
              }}
            />
            <Button type="button" onClick={onSearchRequest} disabled={searching} className="gap-1.5 shrink-0">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Buscar
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Al buscar el código se completarán automáticamente los datos de los titulares.
          </p>
        </div>

        <hr className="border-t" />

        <div className="space-y-2">
          {sectionTitle("Titular")}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nombres y Apellidos</Label>
              <Input value={form.owner1.fullName} disabled placeholder="—" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">DNI</Label>
              <Input value={form.owner1.documentNumber} disabled placeholder="—" className="font-mono" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {sectionTitle("Cónyuge / Conviviente")}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nombres y Apellidos</Label>
              <Input value={form.owner2.fullName} disabled placeholder="—" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">DNI</Label>
              <Input value={form.owner2.documentNumber} disabled placeholder="—" className="font-mono" />
            </div>
          </div>
        </div>

        <hr className="border-t" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Tipo de Terreno</Label>
            <Select value={form.terrainTypeId} onValueChange={(value) => onFieldChange("terrainTypeId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona.." />
              </SelectTrigger>
              <SelectContent>
                {terrainTypes.map((terrainType) => (
                  <SelectItem key={terrainType.id} value={String(terrainType.id)}>{terrainType.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Ancho</Label>
            <Input
              type="number"
              step="any"
              placeholder="Ingrese"
              value={form.width}
              onChange={(event) => onFieldChange("width", event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Largo</Label>
            <Input
              type="number"
              step="any"
              placeholder="Ingrese"
              value={form.length}
              onChange={(event) => onFieldChange("length", event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Área Total</Label>
            <Input
              placeholder="Calculado automáticamente"
              value={form.totalArea}
              readOnly
              disabled
              className="bg-muted"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Sector</Label>
            <Select value={form.sectorId} onValueChange={(value) => onFieldChange("sectorId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona.." />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector.id} value={String(sector.id)}>{sector.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">MZ</Label>
            <Input placeholder="Ingrese" value={form.mz} onChange={(event) => onFieldChange("mz", event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Lote</Label>
            <Input placeholder="Ingrese" value={form.lot} onChange={(event) => onFieldChange("lot", event.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Colindancias por el Norte</Label>
            <Input placeholder="Ingrese" value={form.north} onChange={(event) => onFieldChange("north", event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Colindancias por el Sur</Label>
            <Input placeholder="Ingrese" value={form.south} onChange={(event) => onFieldChange("south", event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Colindancias por el Este</Label>
            <Input placeholder="Ingrese" value={form.east} onChange={(event) => onFieldChange("east", event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Colindancias por el Oeste</Label>
            <Input placeholder="Ingrese" value={form.west} onChange={(event) => onFieldChange("west", event.target.value)} />
          </div>
        </div>

        <hr className="border-t" />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "edit" ? "Guardar cambios" : "Guardar"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
