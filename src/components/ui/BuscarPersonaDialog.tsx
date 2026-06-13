"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientsService } from "@/services/clients.service";
import type { PersonaData } from "@/types/client";

interface BuscarPersonaDialogProps {
  open: boolean;
  source: "reniec" | "comunidad" | null;
  onClose: () => void;
  onAccept: (data: PersonaData) => void;
}

export function BuscarPersonaDialog({ open, source, onClose, onAccept }: BuscarPersonaDialogProps) {
  const title = source === "comunidad" ? "Buscar en Comunidad" : "Buscar en SUNAT / RENIEC";
  const placeholder = source === "comunidad" ? "Buscar por DNI / RUC..." : "Ej. 12345678";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <BuscarPersonaDialogBody
        key={`${source ?? "none"}-${open ? "open" : "closed"}`}
        source={source}
        title={title}
        placeholder={placeholder}
        onClose={onClose}
        onAccept={onAccept}
      />
    </Dialog>
  );
}

function BuscarPersonaDialogBody({
  source,
  title,
  placeholder,
  onClose,
  onAccept,
}: Omit<BuscarPersonaDialogProps, "open"> & { title: string; placeholder: string }) {
  const [doc, setDoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PersonaData | null>(null);

  async function handleSearch() {
    const value = doc.trim();
    if (!value) return;

    setLoading(true);
    setResult(null);

    try {
      const data = source === "comunidad"
        ? await ClientsService.searchByDocument(value)
        : await ClientsService.searchReniec(value);

      setResult(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se encontraron datos";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          Ingrese el DNI / RUC para consultar los datos.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="search-doc" className="text-xs">DNI / RUC</Label>
          <div className="flex gap-2">
            <Input
              id="search-doc"
              placeholder={placeholder}
              value={doc}
              onChange={(e) => setDoc(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              maxLength={source === "comunidad" ? 11 : 8}
              autoFocus
            />
            <Button onClick={handleSearch} disabled={loading || !doc.trim()} className="gap-1.5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Buscar
            </Button>
          </div>
        </div>

        {result && (
          <div className="rounded-md border border-input bg-muted/40 p-4 space-y-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Nombres y Apellidos</div>
              <div className="font-medium">{result.fullName}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">DNI / RUC</div>
              <div className="font-mono">{result.documentNumber}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Domicilio</div>
              <div>{result.address || "—"}</div>
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          disabled={!result}
          onClick={() => {
            if (result) {
              onAccept(result);
              onClose();
            }
          }}
        >
          Aceptar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
