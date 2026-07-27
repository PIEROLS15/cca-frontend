"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import { useSession } from "@/context/session-context";
import { getFirstAccessibleRoute } from "@/lib/access-control";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (username: string, password: string) => {
    setApiError(null);

    if (!username.trim()) {
      setApiError("El usuario es obligatorio");
      return;
    }
    if (!password) {
      setApiError("La contraseña es obligatoria");
      return;
    }

    try {
      setLoading(true);
      const response = await AuthService.login({ username, password });
      setSession(response.user);
      const redirectTo = searchParams.get("redirect") || getFirstAccessibleRoute(response.user) || "/";
      router.push(redirectTo);
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Error inesperado al iniciar sesión";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSubmit,
    loading,
    apiError,
  };
}
