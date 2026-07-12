"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CertificateRequestStatusBadge } from "@/components/solicitudes-certificados/CertificateRequestStatusBadge";
import type { CertificateRequest, CertificateRequestStatus } from "@/types/certificate-request";

const STATUS_OPTIONS: CertificateRequestStatus[] = ["Recepcionado", "Por Firmar", "Por Recoger", "Entregado", "Observado"];

interface CertificateRequestStatusDialogProps {
  open: boolean;
  request: CertificateRequest | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (payload: { status: CertificateRequestStatus; note?: string }) => void;
}

export function CertificateRequestStatusDialog({ open, request, submitting, onClose, onConfirm }: CertificateRequestStatusDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <CertificateRequestStatusDialogBody
        key={`${request?.id ?? "none"}-${open ? "open" : "closed"}`}
        request={request}
        submitting={submitting}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </Dialog>
  );
}

function CertificateRequestStatusDialogBody({
  request,
  submitting,
  onClose,
  onConfirm,
}: Omit<CertificateRequestStatusDialogProps, "open">) {
  const [newStatus, setNewStatus] = useState<CertificateRequestStatus>(request?.status ?? "Recepcionado");
  const [note, setNote] = useState(request?.statusNote ?? "");
  const isObserved = newStatus === "Observado";
  const canConfirm = !submitting && (!isObserved || note.trim().length > 0);

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Cambiar estado</DialogTitle>
        <DialogDescription>
          Actualiza únicamente el estado de la solicitud{request ? ` ${request.requestNumber}` : ""}.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 py-2">
        {request && (
          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
            <div className="font-medium">{request.client.fullName}</div>
            <div className="text-xs text-muted-foreground">{request.client.documentNumber} · {request.destination || "—"}</div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Estado actual:</span>
              <CertificateRequestStatusBadge status={request.status} />
            </div>
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="new-status" className="text-xs">Nuevo estado</Label>
          <Select value={newStatus} onValueChange={(value) => setNewStatus(value as CertificateRequestStatus)}>
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
        {isObserved && (
          <div className="space-y-1.5">
            <Label htmlFor="status-note" className="text-xs">Razón</Label>
            <Textarea
              id="status-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe por qué se observó la solicitud"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">Este campo es obligatorio al marcar como observado.</p>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onConfirm({ status: newStatus, note: isObserved ? note.trim() : undefined })} disabled={!canConfirm}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar estado
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
