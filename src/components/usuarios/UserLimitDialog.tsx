"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { User } from "@/types/user";

interface UserLimitDialogProps {
  open: boolean;
  user: User | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
}

function createInitialForm(user: User | null) {
  return {
    certificateRangeStart: user?.certificateRangeStart != null ? String(user.certificateRangeStart).padStart(6, "0") : "",
    certificateRangeEnd: user?.certificateRangeEnd != null ? String(user.certificateRangeEnd).padStart(6, "0") : "",
  };
}

export function UserLimitDialog({ open, user, submitting, onClose, onSubmit }: UserLimitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <UserLimitDialogBody
        key={`${user?.id ?? "none"}-${open ? "open" : "closed"}`}
        user={user}
        submitting={submitting}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Dialog>
  );
}

function UserLimitDialogBody({
  user,
  submitting,
  onClose,
  onSubmit,
}: Omit<UserLimitDialogProps, "open">) {
  const [form, setForm] = useState<Record<string, string>>(() => createInitialForm(user));

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Editar límite de certificados</DialogTitle>
        <DialogDescription>
          {user ? `${user.fullName} (${user.username})` : "Ajusta el rango de certificados del usuario."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="limit-start" className="text-xs">Límite inicial</Label>
          <Input
            id="limit-start"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={form.certificateRangeStart ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, certificateRangeStart: e.target.value.replace(/\D/g, "") }))}
            placeholder="Ej: 000001"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="limit-end" className="text-xs">Límite final</Label>
          <Input
            id="limit-end"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={form.certificateRangeEnd ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, certificateRangeEnd: e.target.value.replace(/\D/g, "") }))}
            placeholder="Ej: 002000"
          />
        </div>

        <p className="sm:col-span-2 text-[11px] text-muted-foreground">
          Si completas solo el límite inicial, se asignará un bloque de 2000 números.
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="button" onClick={() => onSubmit(form)} disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar límite
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
