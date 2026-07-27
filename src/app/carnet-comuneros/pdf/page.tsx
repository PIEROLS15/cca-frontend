"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CommonerLicensesService } from "@/services/commoner-licenses.service";

function CarnetComunerosPdfContent() {
  const searchParams = useSearchParams();
  const pdfUrl = CommonerLicensesService.getBulkPdfUrl({
    mode: (searchParams.get("mode") as "single" | "range" | "list" | "all") || "all",
    id: searchParams.get("id") ? Number(searchParams.get("id")) : undefined,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
    field: (searchParams.get("field") as "dni" | "licenseNumber") || undefined,
    values: searchParams.get("values") || undefined,
    search: searchParams.get("search") || undefined,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <div className="border-b bg-background px-4 py-3">
        <Button asChild className="gap-1.5">
          <Link href="/carnet-comuneros">Volver</Link>
        </Button>
      </div>

      <div className="relative flex-1 min-h-0 bg-zinc-900">
        <iframe
          src={pdfUrl}
          title="Carnets comuneros"
          className="absolute inset-0 block h-full w-full border-0"
        />
      </div>
    </div>
  );
}

export default function CarnetComunerosPdfPage() {
  return (
    <Suspense
      fallback={(
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Cargando PDF...</span>
          </div>
        </div>
      )}
    >
      <CarnetComunerosPdfContent />
    </Suspense>
  );
}
