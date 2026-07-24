import { Loader2, Plus } from "lucide-react";
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

interface RegistrarComuneroDialogProps {
  open: boolean;
  dni: string;
  nroCarnet: string;
  submitting: boolean;
  onDniChange: (value: string) => void;
  onNroCarnetChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function RegistrarComuneroDialog({
  open,
  dni,
  nroCarnet,
  submitting,
  onDniChange,
  onNroCarnetChange,
  onClose,
  onSubmit,
}: RegistrarComuneroDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar nuevo comunero</DialogTitle>
          <DialogDescription>
            Ingresa el DNI y el N° de carnet. Los datos del comunero se completan
            automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="carnet-dni">DNI</Label>
            <Input
              id="carnet-dni"
              inputMode="numeric"
              maxLength={8}
              value={dni}
              onChange={(e) => onDniChange(e.target.value.replace(/\D/g, ""))}
              placeholder="12345678"
              disabled={submitting}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="carnet-nro">N° de carnet</Label>
            <Input
              id="carnet-nro"
              value={nroCarnet}
              onChange={(e) => onNroCarnetChange(e.target.value)}
              placeholder="4780"
              disabled={submitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} className="gap-1.5">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Plus className="h-4 w-4" /> Agregar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
