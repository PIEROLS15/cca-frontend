"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch } from "@/services/api";
import type { DeletionPreview } from "@/types/deletion-preview";

interface DeleteConfirmDialogProps {
  open: boolean;
  entityLabel: string;
  itemName?: string;
  previewEndpoint?: string;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function ImpactSection({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "destructive" | "warning" | "muted";
  items: DeletionPreview["willDelete"];
}) {
  if (!items.length) return null;

  const toneClasses = {
    destructive: "border-destructive/20 bg-destructive/5 text-destructive",
    warning: "border-warning/20 bg-warning/5 text-warning-foreground",
    muted: "border-border bg-muted/40 text-foreground",
  }[tone];

  return (
    <div className={`rounded-md border p-3 ${toneClasses}`}>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide">{title}</div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={`${title}-${item.label}`} className="flex items-start justify-between gap-3 text-sm">
            <div className="min-w-0">
              <div className="font-medium leading-tight">{item.label}</div>
              {item.note ? <div className="text-xs opacity-80">{item.note}</div> : null}
            </div>
            <Badge variant="outline" className="shrink-0 font-medium">
              {item.count}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeleteConfirmDialog({
  open,
  entityLabel,
  itemName,
  previewEndpoint,
  submitting,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DeleteConfirmDialogBody
        key={`${open ? "open" : "closed"}-${previewEndpoint ?? "none"}`}
        open={open}
        entityLabel={entityLabel}
        itemName={itemName}
        previewEndpoint={previewEndpoint}
        submitting={submitting}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </Dialog>
  );
}

function DeleteConfirmDialogBody({
  open,
  entityLabel,
  itemName,
  previewEndpoint,
  submitting,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [preview, setPreview] = useState<DeletionPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(Boolean(open && previewEndpoint));
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !previewEndpoint) {
      return;
    }

    let active = true;

    apiFetch<DeletionPreview>(previewEndpoint)
      .then((data) => {
        if (active) {
          setPreview(data);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;

        setPreviewError(error instanceof Error ? error.message : "No se pudo cargar la previsualización.");
      })
      .finally(() => {
        if (active) {
          setPreviewLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [open, previewEndpoint]);

  const canConfirm = !submitting && !previewLoading && !(preview && !preview.canDelete);

  const effectiveItemName = itemName || preview?.itemName;

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <DialogTitle className="text-center">{`Eliminar ${entityLabel}`}</DialogTitle>
        <DialogDescription className="text-center">
          {effectiveItemName
            ? `¿Estás seguro de eliminar ${effectiveItemName}? Esta acción no se puede deshacer.`
            : "Esta acción no se puede deshacer."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        {previewLoading && (
          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            Cargando impacto de eliminación...
          </div>
        )}

        {previewError && (
          <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning-foreground">
            {previewError}
          </div>
        )}

        {preview && (
          <div className="space-y-3 rounded-md border border-border bg-muted/20 p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Impacto estimado</div>
            <ImpactSection title="Se eliminará" tone="destructive" items={preview.willDelete} />
            <ImpactSection title="Se desenganchará" tone="warning" items={preview.willSetNull} />
            <ImpactSection title="Bloquea la eliminación" tone="muted" items={preview.willBlock} />

            {!preview.willDelete.length && !preview.willSetNull.length && !preview.willBlock.length && (
              <div className="text-sm text-muted-foreground">No hay relaciones asociadas que mostrar.</div>
            )}

            {!preview.canDelete && (
              <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                No se puede eliminar mientras existan dependencias bloqueantes.
              </div>
            )}
          </div>
        )}
      </div>

      <DialogFooter className="sm:justify-center">
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="button" variant="destructive" onClick={onConfirm} disabled={!canConfirm}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Sí, eliminar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
