import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CarnetComunero } from "@/types/carnet-comunero";

interface EliminarCarnetDialogProps {
  open: boolean;
  item: CarnetComunero | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function EliminarCarnetDialog({
  open,
  item,
  submitting,
  onClose,
  onConfirm,
}: EliminarCarnetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>¿Eliminar registro?</DialogTitle>
          <DialogDescription>
            Se eliminará el DNI {item?.dni} con N° de carnet {item?.nroCarnet}. Esta
            acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
