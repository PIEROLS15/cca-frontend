"use client";

import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User, Role } from "@/types/user";

interface UserFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  user: User | null;
  roles: Role[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>, mode: "create" | "edit") => void;
}

export function UserFormDialog({
  open,
  mode,
  user,
  roles,
  submitting,
  onClose,
  onSubmit,
}: UserFormDialogProps) {
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && user) {
      setForm({
        fullName: user.fullName,
        username: user.username,
        email: user.email ?? "",
        dni: user.dni ?? "",
        roleId: String(user.role.id),
        password: "",
      });
    } else {
      setForm({ fullName: "", username: "", email: "", dni: "", roleId: "", password: "" });
    }
  }, [mode, user, open]);

  const isValid =
    form.fullName?.trim() &&
    form.username?.trim() &&
    form.email?.trim() &&
    form.dni?.trim() &&
    form.roleId &&
    (mode === "edit" || form.password?.trim());

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifica los campos y guarda los cambios."
              : "Completa los campos para crear un nuevo usuario."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs">Nombre completo</Label>
            <Input
              id="fullName"
              value={form.fullName ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs">Usuario</Label>
            <Input
              id="username"
              value={form.username ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
              placeholder="Ej: jperez"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              placeholder="Ej: juan@correo.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dni" className="text-xs">DNI</Label>
            <Input
              id="dni"
              value={form.dni ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, dni: e.target.value }))}
              placeholder="Ej: 12345678"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-xs">Rol</Label>
            <Select
              value={form.roleId ?? ""}
              onValueChange={(v) => setForm((s) => ({ ...s, roleId: v }))}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">
              {mode === "edit" ? "Contraseña (dejar vacío para mantener)" : "Contraseña"}
            </Label>
            <Input
              id="password"
              type="password"
              value={form.password ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              placeholder={mode === "edit" ? "••••••••" : "Mínimo 6 caracteres"}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => onSubmit(form, mode)} disabled={!isValid || submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "edit" ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
