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

interface NameFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  entityLabel: string;
  value: string;
  submitting: boolean;
  placeholder?: string;
  inputId?: string;
  fieldLabel?: string;
  onValueChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function NameFormDialog({
  open,
  mode,
  entityLabel,
  value,
  submitting,
  placeholder,
  inputId = "entity-name",
  fieldLabel = "Nombre",
  onValueChange,
  onClose,
  onSubmit,
}: NameFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? `Editar ${entityLabel}` : `Nuevo ${entityLabel}`}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? `Modifica el nombre del ${entityLabel} y guarda los cambios.`
              : `Completa el campo para registrar un nuevo ${entityLabel}.`}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor={inputId}>{fieldLabel}</Label>
            <Input
              id={inputId}
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              placeholder={placeholder}
              disabled={submitting}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "edit" ? "Guardar cambios" : `Crear ${entityLabel}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
