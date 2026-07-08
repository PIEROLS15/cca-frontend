"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssemblyRecordRequestStatusBadge } from "@/components/solicitudes-acta/AssemblyRecordRequestStatusBadge";
import type { AssemblyRecordRequest, AssemblyRecordRequestStatus } from "@/types/assembly-record-request";

const STATUS_OPTIONS: AssemblyRecordRequestStatus[] = ["En Proceso", "Por Recoger", "Entregado"];

interface AssemblyRecordRequestStatusDialogProps {
  open: boolean;
  request: AssemblyRecordRequest | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (status: AssemblyRecordRequestStatus) => void;
}

export function AssemblyRecordRequestStatusDialog({ open, request, submitting, onClose, onConfirm }: AssemblyRecordRequestStatusDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <AssemblyRecordRequestStatusDialogBody
        key={`${request?.id ?? "none"}-${open ? "open" : "closed"}`}
        request={request}
        submitting={submitting}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </Dialog>
  );
}

function AssemblyRecordRequestStatusDialogBody({
  request,
  submitting,
  onClose,
  onConfirm,
}: Omit<AssemblyRecordRequestStatusDialogProps, "open">) {
  const [newStatus, setNewStatus] = useState<AssemblyRecordRequestStatus>(request?.status ?? "En Proceso");

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Cambiar estado</DialogTitle>
        <DialogDescription>
          Actualiza únicamente el estado de la solicitud{request ? ` ${request.code}` : ""}.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 py-2">
        {request && (
          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
            <div className="font-medium">{request.client.fullName}</div>
            <div className="text-xs text-muted-foreground">{request.certificate.certificateNumber} · {request.description || "—"}</div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Estado actual:</span>
              <AssemblyRecordRequestStatusBadge status={request.status} />
            </div>
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="new-status" className="text-xs">Nuevo estado</Label>
          <Select value={newStatus} onValueChange={(value) => setNewStatus(value as AssemblyRecordRequestStatus)}>
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
