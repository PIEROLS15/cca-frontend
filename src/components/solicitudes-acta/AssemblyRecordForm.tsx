"use client";

import { type FormEvent } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { AssemblyRecordFormState } from "@/hooks/use-assembly-record-form";

function sectionTitle(text: string) {
  return <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{text}</h3>;
}

const ADJUNTOS_OPTS = [
  { key: "certPosesion" as const, label: "Certificado de Posesión" },
  { key: "planoMemoria" as const, label: "Plano y Memoria" },
  { key: "dniCompradores" as const, label: "DNI de los adjudicadores o compradores" },
  { key: "dniVendedor" as const, label: "DNI del vendedor" },
  { key: "contratoCV" as const, label: "Contrato compra venta notariado" },
  { key: "testimonio" as const, label: "Testimonio de adjudicación" },
  { key: "observacionRegistros" as const, label: "Observación de Registros (Esquela de observación)" },
];

interface AssemblyRecordFormProps {
  mode: "create" | "edit";
  form: AssemblyRecordFormState;
  loading: boolean;
  submitting: boolean;
  searching: boolean;
  onFieldChange: <K extends keyof AssemblyRecordFormState>(field: K, value: AssemblyRecordFormState[K]) => void;
  onAdjuntoChange: (key: keyof AssemblyRecordFormState["adjuntos"], checked: boolean) => void;
  onSearchCertificate: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export function AssemblyRecordForm({
  mode,
  form,
  loading,
  submitting,
  searching,
  onFieldChange,
  onAdjuntoChange,
  onSearchCertificate,
  onSubmit,
  onCancel,
}: AssemblyRecordFormProps) {
  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando solicitud...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <form onSubmit={onSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label htmlFor="certificateNumber" className="text-xs">N° Certificado</Label>
              <div className="flex gap-2">
                <Input
                  id="certificateNumber"
                  placeholder="Ingrese número"
                  value={form.certificateNumber}
                  onChange={(e) => onFieldChange("certificateNumber", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onSearchCertificate();
                    }
                  }}
                  className="font-mono"
                />
                <Button type="button" variant="default" className="gap-1.5 shrink-0" onClick={onSearchCertificate} disabled={searching}>
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Buscar
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {sectionTitle("¿Es comunero?")}
              <RadioGroup
                value={form.esComunero}
                onValueChange={(v) => onFieldChange("esComunero", v as "si" | "no")}
                className="flex gap-6"
                disabled
              >
                <label className="flex items-center gap-2 text-sm cursor-not-allowed opacity-70">
                  <RadioGroupItem value="si" disabled /> Sí
                </label>
                <label className="flex items-center gap-2 text-sm cursor-not-allowed opacity-70">
                  <RadioGroupItem value="no" disabled /> No
                </label>
              </RadioGroup>
              <p className="text-[11px] text-muted-foreground">Se completa automáticamente con el certificado.</p>
            </div>
          </div>

          <hr className="border-t" />

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs">Descripción de la solicitud</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Ingrese una descripción..."
              value={form.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
            />
          </div>

          <hr className="border-t" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="comprador" className="text-xs">Nombres y apellidos del comprador</Label>
              <Input
                id="comprador"
                placeholder="Se completa automáticamente"
                value={form.comprador}
                readOnly
                disabled
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vendedor" className="text-xs">Nombres y apellidos del vendedor</Label>
              <Input
                id="vendedor"
                placeholder="Ingrese nombres y apellidos"
                value={form.vendedor}
                onChange={(e) => onFieldChange("vendedor", e.target.value)}
              />
            </div>
          </div>

          <hr className="border-t" />

          <div className="space-y-3">
            {sectionTitle("Datos del terreno")}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ubicacion" className="text-xs">Ubicación</Label>
                <Input id="ubicacion" placeholder="Auto" value={form.ubicacion} readOnly disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tipoTerreno" className="text-xs">Tipo de terreno</Label>
                <Input id="tipoTerreno" placeholder="Auto" value={form.tipoTerreno} readOnly disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ancho" className="text-xs">Ancho</Label>
                <Input id="ancho" placeholder="m" value={form.ancho} readOnly disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="largo" className="text-xs">Largo</Label>
                <Input id="largo" placeholder="m" value={form.largo} readOnly disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="areaTotal" className="text-xs">Área total</Label>
                <Input id="areaTotal" placeholder="m²" value={form.areaTotal} readOnly disabled />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">Estos datos se completan al buscar el N° Certificado.</p>
          </div>

          <hr className="border-t" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Fecha de adjudicación (contrato compra y venta)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.fechaAdjudicacion && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.fechaAdjudicacion ? (
                      format(new Date(form.fechaAdjudicacion), "PPP", { locale: es })
                    ) : (
                      <span>Seleccione una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    fromYear={1950}
                    toYear={new Date().getFullYear() + 5}
                    defaultMonth={form.fechaAdjudicacion ? new Date(form.fechaAdjudicacion) : new Date()}
                    selected={form.fechaAdjudicacion ? new Date(form.fechaAdjudicacion) : undefined}
                    onSelect={(date) =>
                      onFieldChange("fechaAdjudicacion", date ? format(date, "yyyy-MM-dd") : "")
                    }
                    locale={es}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tiempoPosesion" className="text-xs">Tiempo de posesión del terreno</Label>
              <Input
                id="tiempoPosesion"
                placeholder="Ej. 5 años"
                value={form.tiempoPosesion}
                onChange={(e) => onFieldChange("tiempoPosesion", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="correo" className="text-xs">Correo electrónico</Label>
              <Input
                id="correo"
                type="email"
                placeholder="ejemplo@correo.com"
                value={form.correo}
                onChange={(e) => onFieldChange("correo", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefono" className="text-xs">Teléfono</Label>
              <Input
                id="telefono"
                placeholder="999 999 999"
                value={form.telefono}
                onChange={(e) => onFieldChange("telefono", e.target.value)}
              />
            </div>
          </div>

          <hr className="border-t" />

          <div className="space-y-2">
            {sectionTitle("Adjuntos")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ADJUNTOS_OPTS.map((a) => (
                <label
                  key={a.key}
                  className="flex items-center gap-2 text-sm border border-input rounded-md px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={form.adjuntos[a.key]}
                    onCheckedChange={(v) => onAdjuntoChange(a.key, Boolean(v))}
                  />
                  {a.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={submitting || !form.selectedCertificate}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "edit" ? "Guardar cambios" : "Guardar"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
