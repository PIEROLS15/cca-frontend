"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { CertificateRequestsService } from "@/services/certificate-requests.service";
import type { CertificateRequest } from "@/types/certificate-request";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useCertificateRequests() {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      try {
        const data = await CertificateRequestsService.listAll();

        if (!cancelled) {
          setRequests(data);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error, "No se pudieron cargar las solicitudes de certificados"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRequests();

    return () => {
      cancelled = true;
    };
  }, []);

  async function reloadRequests() {
    const data = await CertificateRequestsService.listAll();
    setRequests(data);
  }

  async function deleteRequest(request: CertificateRequest) {
    setSubmitting(true);

    try {
      await CertificateRequestsService.remove(request.id);
      await reloadRequests();
      toast.success(`Solicitud ${request.requestNumber} eliminada`);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo eliminar la solicitud"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    requests,
    loading,
    submitting,
    deleteRequest,
  };
}
