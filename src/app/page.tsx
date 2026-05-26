"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/context/session-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, isAuthenticated, loading, logout } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">
          Cargando...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
            {user.fullName.charAt(0)}
          </div>
          <h1 className="text-xl font-semibold">
            Bienvenido, {user.fullName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user.role.name} &middot; @{user.username}
          </p>

          <div className="mt-6 space-y-2 text-left text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Email</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">DNI</span>
              <span>{user.dni}</span>
            </div>
          </div>

          <Button variant="outline" className="mt-6 w-full" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
