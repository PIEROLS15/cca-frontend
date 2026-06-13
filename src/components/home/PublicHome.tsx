import Link from "next/link";

export function PublicHome() {
  return (
    <div className="min-h-screen bg-background px-6 py-16 flex items-center justify-center">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Comunidad Campesina de Asia
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Sistema de gestion comunal
          </h1>
          <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
            Accede al panel administrativo o verifica certificados mediante el QR publico.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Iniciar sesion
          </Link>
        </div>
      </div>
    </div>
  );
}
