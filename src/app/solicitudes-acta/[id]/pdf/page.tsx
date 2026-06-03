"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssemblyRecordRequestsService } from "@/services/assembly-record-requests.service";
import type { AssemblyRecordRequest } from "@/types/assembly-record-request";
import { formatDateTime } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SolicitudActaPdfPage({ params }: PageProps) {
  const { id } = use(params);
  const [request, setRequest] = useState<AssemblyRecordRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRequest() {
      try {
        const data = await AssemblyRecordRequestsService.getById(Number(id));

        if (!cancelled) {
          setRequest(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar la solicitud");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRequest();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando solicitud...</span>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Solicitud no encontrada</h1>
          <p className="text-muted-foreground mt-2">{error || `No existe una solicitud con el ID ${id}.`}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4 print:hidden">
          <Button onClick={() => window.print()} className="gap-1.5">
            <Printer className="h-4 w-4" /> Imprimir / Guardar PDF
          </Button>
        </div>

        <div className="bg-white text-slate-900 shadow-sm rounded-lg p-12 print:shadow-none print:rounded-none print:p-8">
          <header className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight">COMUNIDAD CAMPESINA DE ASIA</h1>
                <p className="text-xs uppercase tracking-wider text-slate-600 mt-1">
                  Solicitud de Acta de Asamblea
                </p>
              </div>
              <div className="text-right text-xs text-slate-600">
                <div>Código</div>
                <div className="font-mono text-slate-900">{request.code}</div>
              </div>
            </div>
          </header>

          <section className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Datos de la solicitud
            </h2>
            <dl className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">Descripción</dt>
                <dd className="font-medium">{request.description || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Certificado</dt>
                <dd className="font-mono">{request.certificate.certificateNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Fecha de registro</dt>
                <dd className="font-mono">{formatDateTime(request.createdAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Datos del cliente
            </h2>
            <dl className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Nombre</dt>
                <dd className="font-medium">{request.client.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Documento</dt>
                <dd className="font-mono">{request.client.documentNumber}</dd>
              </div>
            </dl>
          </section>

          <footer className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 text-xs text-slate-600">
            <div className="text-center">
              <div className="border-t border-slate-400 pt-2">Firma del solicitante</div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-400 pt-2">Sello y firma autorizada</div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
