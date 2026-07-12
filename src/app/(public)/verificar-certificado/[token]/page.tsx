"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { displayTerrainMeasure, formatCertificateDate } from "@/lib/certificate-verification";
import { useCertificateVerification } from "@/hooks/use-certificate-verification";

export default function VerifyCertificatePage() {
  const params = useParams<{ token: string }>();
  const tokenParam = String(params?.token || "").trim();

  const { loading, error, verification } = useCertificateVerification(tokenParam);

  const current = verification?.certificate;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 px-4 py-6 sm:px-6 lg:px-8">
      <ThemeToggle />

      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center py-10">
        <div className="w-full space-y-6">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <Image
                src="/images/logo.png"
                alt="Comunidad Campesina de Asia"
                width={120}
                height={120}
                priority
                className="h-auto w-20 sm:w-24"
              />
            </div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Verificación de certificado</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Comunidad Campesina de Asia</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Escaneaste el QR de un certificado. Aquí puedes validar si el documento coincide con su emisión original.
            </p>
          </div>

          <Card className="border-border/60 shadow-xl shadow-black/5">
            <CardHeader className="space-y-2">
              <div>
                <CardTitle className="text-xl">Estado del documento</CardTitle>
                <CardDescription>Datos verificados desde el QR del certificado.</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {loading && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verificando certificado...
                </div>
              )}

              {error && !loading && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    No se pudo verificar
                  </div>
                  <p className="mt-1">{error}</p>
                </div>
              )}

              {!loading && verification && current && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Datos del certificado</div>
                  <dl className="grid gap-3 text-sm">
                    <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Código certificado</dt><dd className="font-mono font-medium text-right">{current.certificateNumber}</dd></div>
                    <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Nombre cliente</dt><dd className="text-right font-medium">{current.clientName || "—"}</dd></div>
                    <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">DNI/RUC</dt><dd className="text-right font-medium">{current.clientDocuments || "—"}</dd></div>
                    <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Tipo de terreno</dt><dd className="text-right font-medium">{current.terrainType || "—"}</dd></div>
                    <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Sector</dt><dd className="text-right font-medium">{current.sector || "—"}</dd></div>
                    <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Medidas del terreno</dt><dd className="text-right font-medium">{displayTerrainMeasure(current)}</dd></div>
                    <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Mz</dt><dd className="text-right font-medium">{current.mz || "—"}</dd></div>
                    <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Lote</dt><dd className="text-right font-medium">{current.lot || "—"}</dd></div>
                    <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Notas adicionales</dt><dd className="text-right font-medium whitespace-pre-wrap">{current.additionalNotes || "—"}</dd></div>
                    <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Fecha Creación</dt><dd className="text-right font-medium">{formatCertificateDate(current.createdAt)}</dd></div>
                  </dl>
                </div>
              )}

            </CardContent>
          </Card>

          {!loading && verification && current && (
            <div className="flex justify-center">
              <a
                href={`${process.env.NEXT_PUBLIC_TRACKING_URL}/?type=certificado&code=${encodeURIComponent(current.certificateNumber)}&tab=history`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Revisar estado
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
