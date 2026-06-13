"use client";

import { useEffect, useState } from "react";

import { CertificatesService } from "@/services/certificates.service";
import type { CertificateVerificationResponse } from "@/types/certificate-verification";

export function useCertificateVerification(token: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verification, setVerification] = useState<CertificateVerificationResponse | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      const value = String(token || "").trim();
      if (!active) return;

      setVerification(null);
      setError(null);
      setLoading(true);

      if (!value) {
        setError("Token inválido");
        setLoading(false);
        return;
      }

      try {
        const response = await CertificatesService.verifyByToken(value);
        if (!active) return;
        setVerification(response.data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "No se pudo verificar el certificado");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [token]);

  return { loading, error, verification };
}
