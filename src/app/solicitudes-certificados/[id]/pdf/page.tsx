"use client";

import { useEffect, use, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CertificateRequestsService } from "@/services/certificate-requests.service";
import type { CertificateRequest } from "@/types/certificate-request";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SolicitudCertPdfPage({ params }: PageProps) {
  const { id } = use(params);
  const [request, setRequest] = useState<CertificateRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRequest() {
      try {
        const data = await CertificateRequestsService.getById(id);

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

  let pdfUrl: string | null = null;
  let pdfError: string | null = null;

  if (request) {
    try {
      pdfUrl = CertificateRequestsService.getPdfUrl(request.id, request.requestNumber);
    } catch (err) {
      pdfError = err instanceof Error ? err.message : "No se pudo cargar el PDF";
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <div className="border-b bg-background px-4 py-3">
        <Button asChild className="gap-1.5">
          <Link href="/solicitudes-certificados">Volver</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center bg-muted/40 p-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Cargando PDF...</span>
          </div>
        </div>
      ) : error || !request || pdfError || !pdfUrl ? (
        <div className="flex flex-1 items-center justify-center bg-muted/40 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">No se pudo mostrar el PDF</h1>
            <p className="text-muted-foreground mt-2">{error || pdfError || `No existe una solicitud con el ID ${id}.`}</p>
          </div>
        </div>
      ) : (
        <div className="relative flex-1 min-h-0 bg-zinc-900">
          <iframe
            src={pdfUrl}
            title={`Solicitud de certificado ${request.requestNumber}`}
            className="absolute inset-0 block h-full w-full border-0"
          />
        </div>
      )}
    </div>
  );
}
