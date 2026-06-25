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
  onChange: (field: keyof ClientPayload, value: string) => void;
  onClientTypeChange: (value: ClientType) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function ClientFormDialog({
  open,
  mode,
  values,
  submitting,
  onChange,
  onClientTypeChange,
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
                disabled={submitting}
              />
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
