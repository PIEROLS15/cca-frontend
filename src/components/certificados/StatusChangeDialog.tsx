"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CertificateStatusBadge } from "@/components/certificados/CertificateStatusBadge";
import type { Certificate, CertificateStatus } from "@/types/certificate";

const STATUS_OPTIONS: CertificateStatus[] = ["Por Firmar", "Por Recoger", "Entregado"];

interface StatusChangeDialogProps {
  open: boolean;
  certificate: Certificate | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (status: CertificateStatus) => void;
}

export function StatusChangeDialog({ open, certificate, submitting, onClose, onConfirm }: StatusChangeDialogProps) {
  const [newStatus, setNewStatus] = useState<CertificateStatus>("Por Firmar");

  useEffect(() => {
    if (certificate) {
      setNewStatus(certificate.status);
    }
  }, [certificate]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar estado</DialogTitle>
          <DialogDescription>
            Actualiza únicamente el estado del certificado{certificate ? ` ${certificate.certificateNumber}` : ""}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {certificate && (
            <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
              <div className="font-medium">{certificate.owners.map((o) => o.fullName).join(", ")}</div>
              <div className="text-xs text-muted-foreground">
                {certificate.location.sectors?.name ?? "—"} · Mz {certificate.location.mz ?? "—"} · Lote {certificate.location.lot ?? "—"}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Estado actual:</span>
                <CertificateStatusBadge status={certificate.status} />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="new-status" className="text-xs">Nuevo estado</Label>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as CertificateStatus)}>
              <SelectTrigger id="new-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
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
    </Dialog>
  );
}
