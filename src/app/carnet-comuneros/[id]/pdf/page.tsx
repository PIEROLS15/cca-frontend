"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CommonerLicensesService } from "@/services/commoner-licenses.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CarnetComuneroPdfPage({ params }: PageProps) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCommonerLicense() {
      try {
        await CommonerLicensesService.getById(Number(id));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el carnet");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCommonerLicense();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const pdfUrl = CommonerLicensesService.getPdfUrl(Number(id));

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <div className="border-b bg-background px-4 py-3">
        <Button asChild className="gap-1.5">
          <Link href="/carnet-comuneros">Volver</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center bg-muted/40 p-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Cargando PDF...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center bg-muted/40 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">No se pudo mostrar el PDF</h1>
            <p className="mt-2 text-muted-foreground">{error}</p>
          </div>
        </div>
      ) : (
        <div className="relative flex-1 min-h-0 bg-zinc-900">
          <iframe
            src={pdfUrl}
            title={`Carnet comunero ${id}`}
            className="absolute inset-0 block h-full w-full border-0"
          />
        </div>
      )}
    </div>
  );
}
