import Link from "next/link";
import Image from "next/image";
import { Home, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-110" />
            <Image
              src="/images/logo.png"
              alt="Comunidad Campesina de Asia"
              width={160}
              height={65}
              className="relative h-20 w-auto drop-shadow-md"
              priority
            />
          </div>
        </div>

        <div className="relative mb-4">
          <span
            className="text-[8rem] leading-none font-bold tracking-tighter select-none"
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, oklch(0.55 0.14 118) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="p-2 rounded-full bg-destructive/10">
            <FileQuestion className="h-5 w-5 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Página no encontrada
          </h2>
        </div>

        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          La ruta que buscas no existe o fue movida. Verifica la dirección o
          regresa al inicio para continuar.
        </p>

        <div className="mt-8 flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </Link>
        </div>

        <p className="mt-8 text-xs text-muted-foreground/60">
          Comunidad Campesina de Asia &mdash; Sistema de Gestión
        </p>
      </div>
    </div>
  );
}
