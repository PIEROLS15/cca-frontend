"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientsService } from "@/services/clients.service";
import type { PersonaData } from "@/types/client";

interface AgregarClienteDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onAccept: (data: PersonaData) => void;
}

interface ClienteForm {
  fullName: string;
  documentNumber: string;
  address: string;
  phone: string;
  clientType: string;
}

const emptyForm: ClienteForm = {
  fullName: "",
  documentNumber: "",
  address: "",
  phone: "",
  clientType: "Tercero",
};

export function AgregarClienteDialog({ open, title, onClose, onAccept }: AgregarClienteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <AgregarClienteDialogBody key={open ? "open" : "closed"} title={title} onClose={onClose} onAccept={onAccept} />
    </Dialog>
  );
}

function AgregarClienteDialogBody({ title, onClose, onAccept }: Omit<AgregarClienteDialogProps, "open">) {
  const [form, setForm] = useState<ClienteForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof ClienteForm, value: string) {
    setForm((current) => ({ ...current, [field]: field === "documentNumber" ? value.replace(/\D/g, "") : value }));
  }

  function isValid() {
    return form.fullName.trim() && form.documentNumber.trim() && form.clientType;
  }

  async function handleSubmit() {
    if (!isValid()) return;

    setSubmitting(true);

    try {
      const client = await ClientsService.create({
        fullName: form.fullName.trim(),
        documentNumber: form.documentNumber.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        clientType: form.clientType as "Comunero" | "Tercero",
      });

      onAccept({
        fullName: client.fullName,
        documentNumber: client.documentNumber,
        address: client.address || "",
      });

      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear el cliente";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Nuevo {title}</DialogTitle>
        <DialogDescription>
          Completa los campos para crear un nuevo registro.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="agregar-fullName" className="text-xs">Nombres y Apellidos</Label>
          <Input
            id="agregar-fullName"
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            placeholder="Nombre completo"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="agregar-documentNumber" className="text-xs">DNI / RUC</Label>
          <Input
            id="agregar-documentNumber"
            value={form.documentNumber}
            onChange={(e) => updateField("documentNumber", e.target.value)}
            placeholder="Documento"
            maxLength={11}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="agregar-clientType" className="text-xs">Tipo de cliente</Label>
          <Select key={form.clientType || "Tercero"} value={form.clientType || "Tercero"} onValueChange={(v) => updateField("clientType", v)}>
            <SelectTrigger id="agregar-clientType">
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tercero">Tercero</SelectItem>
              <SelectItem value="Comunero">Comunero</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="agregar-address" className="text-xs">Dirección</Label>
          <Textarea
            id="agregar-address"
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Ingrese domicilio"
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="agregar-phone" className="text-xs">Teléfono</Label>
          <Input
            id="agregar-phone"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="Opcional"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={submitting || !isValid()}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Crear registro
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
