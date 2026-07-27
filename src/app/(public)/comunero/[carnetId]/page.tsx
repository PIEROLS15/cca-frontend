"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { AlertTriangle, Calendar, CheckCircle, CreditCard, Hash, Loader2, MapPin, User } from "lucide-react";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useCommonerLicenseVerification } from "@/hooks/use-commoner-license-verification";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const month = new Intl.DateTimeFormat("es-PE", { month: "long" }).format(date).toLowerCase();
  const time = date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  return `${date.getDate()} de ${month} de ${date.getFullYear()} a las ${time}`;
}

function resolvePhotoUrl(photoUrl: string | null): string | null {
  if (!photoUrl) return null;
  if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) return photoUrl;
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9001";
  return `${base}${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}`;
}

export default function ComuneroVerificationPage() {
  const params = useParams<{ carnetId: string }>();
  const carnetIdParam = String(params?.carnetId || "").trim();

  const { loading, error, data } = useCommonerLicenseVerification(carnetIdParam);

  const year = data?.createdAt ? new Date(data.createdAt).getFullYear().toString() : "2026";

  const resolvedPhotoUrl = useMemo(() => resolvePhotoUrl(data?.photoUrl ?? null), [data?.photoUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl items-center justify-center py-10">
        <div className="w-full space-y-6">
          {/* Header */}
          <div className="relative flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Comunidad Campesina de Asia"
              width={120}
              height={120}
              priority
              className="h-auto w-36 sm:w-40"
            />
            <ThemeToggle className="absolute right-0 rounded-full shadow-md" />
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground shadow-xl shadow-black/5">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verificando carnet...
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center shadow-xl shadow-black/5">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-destructive">
                Carnet no encontrado
              </h2>
              <p className="mt-2 text-sm text-destructive/80">{error}</p>
            </div>
          )}

          {/* Data */}
          {!loading && data && (
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/5">
              {/* Status badge */}
              <div className="border-b border-border bg-primary/5 px-6 py-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      Comunero verificado
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Registro válido en el padrón comunal
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo + Name header */}
              <div className="flex items-center gap-5 border-b border-border px-6 py-5">
                {/* Photo */}
                <div className="relative shrink-0">
                  {resolvedPhotoUrl && data.hasPhoto ? (
                    <div className="relative h-24 w-24 overflow-hidden rounded-xl ring-2 ring-primary/30">
                      <Image
                        src={resolvedPhotoUrl}
                        alt={data.fullName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-muted ring-2 ring-primary/30">
                      <User className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm">
                    {year}
                  </span>
                </div>

                {/* Name + Location */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    COMUNERO
                  </p>
                  <p className="mt-0.5 truncate text-lg font-bold uppercase tracking-tight text-foreground">
                    {data.fullName}
                  </p>
                  {data.address && (
                    <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <MapPin className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{data.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="divide-y divide-border">
                {/* Nombres completos */}
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Nombres completos
                    </p>
                    <p className="mt-0.5 font-semibold uppercase text-foreground">
                      {data.fullName}
                    </p>
                  </div>
                </div>

                {/* Género */}
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Género
                    </p>
                    <p className="mt-0.5 font-semibold uppercase text-foreground">
                      {data.gender || "—"}
                    </p>
                  </div>
                </div>

                {/* DNI */}
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      DNI
                    </p>
                    <p className="mt-0.5 font-mono font-semibold text-foreground">
                      {data.dni}
                    </p>
                  </div>
                </div>

                {/* N° de Carnet */}
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Hash className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      N° de Carnet
                    </p>
                    <p className="mt-0.5 font-mono font-semibold text-foreground">
                      {data.licenseNumber}
                    </p>
                  </div>
                </div>

                {/* Fecha de Registro */}
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Fecha de Registro
                    </p>
                    <p className="mt-0.5 font-semibold text-foreground">
                      {formatDate(data.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border bg-muted/30 px-6 py-3 text-center">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Documento verificado electrónicamente. La información mostrada
                  proviene del padrón oficial de la Comunidad Campesina de Asia.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
