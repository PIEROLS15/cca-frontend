"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CarnetComuneroStatusBadge } from "@/components/carnet-comuneros/CarnetComuneroStatusBadge";
import type { CarnetComunero, CarnetComuneroStatus } from "@/types/carnet-comunero";

const STATUS_OPTIONS: CarnetComuneroStatus[] = ["Sin entregar", "Entregado"];

interface CarnetComuneroStatusDialogProps {
  open: boolean;
  carnet: CarnetComunero | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (status: CarnetComuneroStatus) => void;
}

export function CarnetComuneroStatusDialog({ open, carnet, submitting, onClose, onConfirm }: CarnetComuneroStatusDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <CarnetComuneroStatusDialogBody
        key={`${carnet?.id ?? "none"}-${open ? "open" : "closed"}`}
        carnet={carnet}
        submitting={submitting}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </Dialog>
  );
}

function CarnetComuneroStatusDialogBody({
  carnet,
  submitting,
  onClose,
  onConfirm,
}: Omit<CarnetComuneroStatusDialogProps, "open">) {
  const [newStatus, setNewStatus] = useState<CarnetComuneroStatus>(carnet?.status ?? "Sin entregar");

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Cambiar estado</DialogTitle>
        <DialogDescription>
          Actualiza el estado del carnet{carnet ? ` N° ${carnet.nroCarnet}` : ""}.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 py-2">
        {carnet && (
          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
            <div className="font-medium">{carnet.nombre || "Sin nombre"}</div>
            <div className="text-xs text-muted-foreground">DNI: {carnet.dni} · N° Carnet: {carnet.nroCarnet}</div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Estado actual:</span>
              <CarnetComuneroStatusBadge status={carnet.status} />
            </div>
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="new-status" className="text-xs">Nuevo estado</Label>
          <Select value={newStatus} onValueChange={(value) => setNewStatus(value as CarnetComuneroStatus)}>
            <SelectTrigger id="new-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onConfirm(newStatus)} disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar estado
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
