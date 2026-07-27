"use client";

import { useEffect, useState } from "react";

import { CommonerLicensesService } from "@/services/commoner-licenses.service";
import type { CommonerLicenseVerification } from "@/types/commoner-license-verification";

export function useCommonerLicenseVerification(carnetId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CommonerLicenseVerification | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      const value = String(carnetId || "").trim();

      if (!active) return;

      setData(null);
      setError(null);
      setLoading(true);

      if (!value) {
        setError("ID de carnet inválido");
        setLoading(false);
        return;
      }

      try {
        const response = await CommonerLicensesService.verifyPublic(value);
        if (!active) return;
        setData(response.data);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo verificar el carnet de comunero",
        );
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [carnetId]);

  return { loading, error, data };
}
