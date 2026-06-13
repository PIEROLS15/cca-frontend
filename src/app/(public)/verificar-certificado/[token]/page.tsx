"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { AlertTriangle, Loader2, ShieldCheck, ShieldX } from "lucide-react";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { displayTerrainMeasure, formatCertificateDate } from "@/lib/certificate-verification";
import { useCertificateVerification } from "@/hooks/use-certificate-verification";

export default function VerifyCertificatePage() {
  const params = useParams<{ token: string }>();
  const tokenParam = String(params?.token || "").trim();

  const { loading, error, verification } = useCertificateVerification(tokenParam);

  const current = verification?.certificate;
  const issued = verification?.issuedSnapshot;
  const status = verification ? (
    verification.isValid ? (
      <Badge className="gap-1 border-success/20 bg-success/10 text-success hover:bg-success/10">
        <ShieldCheck className="h-3.5 w-3.5" /> Documento válido
      </Badge>
    ) : (
      <Badge className="gap-1 border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/10">
        <ShieldX className="h-3.5 w-3.5" /> Documento modificado
      </Badge>
    )
  ) : null;

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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">Estado del documento</CardTitle>
                  <CardDescription>Datos verificados desde el QR del certificado.</CardDescription>
                </div>
                {status}
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
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-4 rounded-xl border border-border bg-card p-4">
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
                      <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Fecha Creación</dt><dd className="text-right font-medium">{formatCertificateDate(current.createdAt)}</dd></div>
                    </dl>
                  </div>

                  <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Validación</div>
                    <div className={`rounded-lg border p-4 ${verification.isValid ? "border-success/20 bg-success/10" : "border-destructive/20 bg-destructive/10"}`}>
                      <div className="flex items-center gap-2 font-medium">
                        {verification.isValid ? <ShieldCheck className="h-4 w-4 text-success" /> : <ShieldX className="h-4 w-4 text-destructive" />}
                        {verification.isValid ? "El documento coincide con su emisión" : "El documento fue modificado"}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {verification.isValid
                          ? "No se detectaron diferencias entre la huella emitida y los datos actuales."
                          : "Se detectaron cambios en los campos protegidos del certificado."}
                      </p>
                    </div>

                    {!verification.isValid && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Diferencias detectadas</div>
                        <div className="space-y-2">
                          {verification.differences.map((diff) => (
                            <div key={diff.field} className="rounded-lg border border-border bg-background p-3 text-sm">
                              <div className="font-medium">{diff.label}</div>
                              <div className="mt-1 grid gap-1 text-xs text-muted-foreground">
                                <div>Original: <span className="font-mono text-foreground">{String(diff.issued ?? "—")}</span></div>
                                <div>Actual: <span className="font-mono text-foreground">{String(diff.current ?? "—")}</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {issued && <div className="text-xs text-muted-foreground">Huella emitida: <span className="font-mono">{issued.certificateNumber}</span></div>}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
