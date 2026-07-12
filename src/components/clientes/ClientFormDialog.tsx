import { Loader2 } from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClientPayload, ClientType } from "@/types/client";

interface ClientFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  values: ClientPayload;
  submitting: boolean;
  canEditLicenseSequence: boolean;
  licenseSequenceLocked: boolean;
  onChange: (field: keyof ClientPayload, value: string) => void;
  onClientTypeChange: (value: ClientType) => void;
  onNoDocumentChange: (value: boolean) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function ClientFormDialog({
  open,
  mode,
  values,
  submitting,
  canEditLicenseSequence,
  licenseSequenceLocked,
  onChange,
  onClientTypeChange,
  onNoDocumentChange,
  onClose,
  onSubmit,
}: ClientFormDialogProps) {
  const clientTypeValue = values.clientType || "Tercero";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifica los datos del cliente y guarda los cambios."
              : "Completa los campos para registrar un nuevo cliente."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto py-2 pr-1 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="client-full-name">Nombre</Label>
              <Input
                id="client-full-name"
                value={values.fullName}
                onChange={(event) => onChange("fullName", event.target.value)}
                placeholder="Nombres y apellidos"
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="client-document">DNI / RUC</Label>
              <Input
                id="client-document"
                value={values.documentNumber}
                onChange={(event) => onChange("documentNumber", event.target.value)}
                placeholder="Ej. 12345678"
                disabled={submitting || values.noDocument}
              />
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  checked={values.noDocument}
                  onCheckedChange={(checked) => onNoDocumentChange(checked === true)}
                  disabled={submitting}
                />
                <span className="text-xs text-muted-foreground">No es persona/empresa</span>
              </div>
              {values.noDocument && (
                <p className="text-[11px] text-muted-foreground">
                  Se generará automáticamente un código de cliente.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="client-phone">Teléfono</Label>
              <Input
                id="client-phone"
                value={values.phone}
                onChange={(event) => onChange("phone", event.target.value)}
                placeholder="Ej. 987654321"
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="client-type">Tipo de cliente</Label>
              <Select
                key={`${mode}-${clientTypeValue}`}
                value={clientTypeValue}
                onValueChange={(value) => onClientTypeChange(value as ClientType)}
              >
                <SelectTrigger id="client-type" disabled={submitting}>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tercero">Tercero</SelectItem>
                  <SelectItem value="Comunero">Comunero</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === "edit" && canEditLicenseSequence && clientTypeValue === "Comunero" && (
              <div className="space-y-1.5">
                <Label htmlFor="client-license-sequence">N° carnet</Label>
                <Input
                  id="client-license-sequence"
                  value={values.licenseSequence ?? ""}
                  onChange={(event) => onChange("licenseSequence", event.target.value.replace(/\D/g, ""))}
                  placeholder="Se asignará el siguiente consecutivo"
                  disabled={submitting || licenseSequenceLocked}
                />
                <p className="text-[11px] text-muted-foreground">
                  {licenseSequenceLocked
                    ? "Este carnet ya está asignado y no se puede modificar desde aquí."
                    : "Solo grupo 1 puede completarlo. Si lo dejas vacío, se asignará el siguiente consecutivo disponible."}
                </p>
              </div>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="client-address">Dirección</Label>
              <Input
                id="client-address"
                value={values.address}
                onChange={(event) => onChange("address", event.target.value)}
                placeholder="Dirección del cliente"
                disabled={submitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "edit" ? "Guardar cambios" : "Crear cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
