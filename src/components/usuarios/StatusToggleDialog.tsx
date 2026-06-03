"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";

interface StatusToggleDialogProps {
  open: boolean;
  user: User | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (user: User) => void;
}

export function StatusToggleDialog({
  open,
  user,
  submitting,
  onClose,
  onConfirm,
}: StatusToggleDialogProps) {
  const isActive = user?.isActive;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">Confirmar acción</DialogTitle>
          <DialogDescription className="text-center">
            ¿Estás seguro de {isActive ? "desactivar" : "activar"} al usuario{" "}
            <strong>{user?.fullName}</strong>? Esta acción cambiará su estado en el sistema.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant={isActive ? "destructive" : "default"}
            onClick={() => user && onConfirm(user)}
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isActive ? "Sí, desactivar" : "Sí, activar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
