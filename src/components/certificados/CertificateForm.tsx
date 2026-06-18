"use client";

import type { FormEvent } from "react";
import { Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import type { Sector } from "@/types/sector";
import type { TerrainType } from "@/types/terrain-type";
import type { CertificateFormState, OwnerFormState } from "@/hooks/use-certificate-form";

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
  onOwnerChange: <Key extends keyof OwnerFormState>(index: number, field: Key, value: OwnerFormState[Key]) => void;
  onAddOwner: () => void;
  onRemoveOwner: (index: number) => void;
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
  onOwnerChange,
  onAddOwner,
  onRemoveOwner,
  onSearchRequest,
  onSubmit,
}: CertificateFormProps) {
  const terrainTypeOptions = terrainTypes.map((terrainType) => ({
    label: terrainType.name,
    value: String(terrainType.id),
  }));
  const sectorOptions = sectors.map((sector) => ({
    label: sector.name,
    value: String(sector.id),
  }));
  const selectedTerrainType = terrainTypes.find((terrainType) => String(terrainType.id) === form.terrainTypeId) || null;
  const config = selectedTerrainType?.config || null;
  const isAreaPerimeterMode = form.measurementModeUsed === "AREA_PERIMETER";
  const isManualTotalAreaMode = form.measurementModeUsed === "MANUAL_TOTAL_AREA";
  const showMzLot = config?.showMzLot !== false;
  const showAdditionalMeasureToggle = config?.allowAdditionalMeasure === true;
  const showAreaPerimeterToggle = config?.allowAreaPerimeterToggle === true;
  const showAdditionalMeasureFields = showAdditionalMeasureToggle && form.additionalMeasureEnabled;

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
            Opcional. Si lo ingresas, se completarán automáticamente los datos de los titulares.
          </p>
        </div>

        <hr className="border-t" />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            {sectionTitle("Dueños")}
            <Button type="button" variant="outline" size="sm" onClick={onAddOwner} className="gap-1.5">
              Agregar dueño
            </Button>
          </div>

          <div className="space-y-3">
            {form.owners.map((owner, index) => (
              <div key={owner.uid} className="rounded-md border p-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Dueño {index + 1}
                  </span>
                  {form.owners.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveOwner(index)}
                      className="h-8 px-2 text-destructive hover:text-destructive"
                    >
                      Quitar
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nombres y Apellidos</Label>
                    <Input
                      value={owner.fullName}
                      onChange={(event) => onOwnerChange(index, "fullName", event.target.value)}
                      placeholder="Ingrese"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">DNI</Label>
                    <Input
                      value={owner.documentNumber}
                      onChange={(event) => onOwnerChange(index, "documentNumber", event.target.value.replace(/\D/g, ""))}
                      placeholder="Ingrese"
                      className="font-mono"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={8}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-t" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-1">
            <Label className="text-xs font-semibold">Tipo de Terreno</Label>
            <SearchableSelect
              value={form.terrainTypeId}
              options={terrainTypeOptions}
              placeholder="Selecciona.."
              searchPlaceholder="Buscar tipo de terreno..."
              onValueChange={(value) => onFieldChange("terrainTypeId", value)}
            />
          </div>

          {(showAdditionalMeasureToggle || showAreaPerimeterToggle) && (
            <div className="space-y-2 sm:col-span-3">
              <Label className="text-xs font-semibold">Opciones</Label>
              <div className="flex flex-wrap gap-3 rounded-md border border-input px-3 py-2">
                {showAdditionalMeasureToggle && (
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={form.additionalMeasureEnabled}
                      onCheckedChange={(checked) => onFieldChange("additionalMeasureEnabled", checked === true)}
                    />
                    Agregar una medida adicional
                  </label>
                )}
                {showAreaPerimeterToggle && (
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={isAreaPerimeterMode}
                      onCheckedChange={(checked) => onFieldChange("measurementModeUsed", checked === true ? "AREA_PERIMETER" : "RECTANGULAR_AUTO")}
                    />
                    Agregar sólo Área total y Perímetro
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        {isAreaPerimeterMode ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Área</Label>
              <Input placeholder="Ingrese" value={form.area} onChange={(event) => onFieldChange("area", event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Perímetro</Label>
              <Input placeholder="Ingrese" value={form.perimeter} onChange={(event) => onFieldChange("perimeter", event.target.value)} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Ancho</Label>
              <Input
                type="number"
                step="any"
                placeholder="Ingrese"
                value={form.width}
                onChange={(event) => onFieldChange("width", event.target.value)}
                disabled={isManualTotalAreaMode}
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
                disabled={isManualTotalAreaMode}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Área Total</Label>
              <Input
                placeholder={isManualTotalAreaMode ? "Ingrese" : "Calculado automáticamente"}
                value={form.totalArea}
                onChange={(event) => onFieldChange("totalArea", event.target.value)}
                readOnly={!isManualTotalAreaMode}
                disabled={!isManualTotalAreaMode}
                className={!isManualTotalAreaMode ? "bg-muted" : undefined}
              />
            </div>
          </div>
        )}

        {showAdditionalMeasureFields && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Ancho adicional</Label>
              <Input
                type="number"
                step="any"
                placeholder="Ingrese"
                value={form.additionalWidth}
                onChange={(event) => onFieldChange("additionalWidth", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Largo adicional</Label>
              <Input
                type="number"
                step="any"
                placeholder="Ingrese"
                value={form.additionalLength}
                onChange={(event) => onFieldChange("additionalLength", event.target.value)}
              />
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 gap-4 ${showMzLot ? "sm:grid-cols-3" : "sm:grid-cols-1"}`}>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Sector</Label>
            <SearchableSelect
              value={form.sectorId}
              options={sectorOptions}
              placeholder="Selecciona.."
              searchPlaceholder="Buscar sector..."
              onValueChange={(value) => onFieldChange("sectorId", value)}
            />
          </div>
          {showMzLot && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">MZ</Label>
                <Input placeholder="Ingrese" value={form.mz} onChange={(event) => onFieldChange("mz", event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Lote</Label>
                <Input placeholder="Ingrese" value={form.lot} onChange={(event) => onFieldChange("lot", event.target.value)} />
              </div>
            </>
          )}
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
