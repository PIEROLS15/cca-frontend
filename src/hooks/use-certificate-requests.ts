"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import { CertificateRequestsService } from "@/services/certificate-requests.service";
import type { CertificateRequest } from "@/types/certificate-request";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useCertificateRequests(initial?: { page?: number; limit?: number; search?: string }) {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 5);
  const [search, setSearch] = useState(initial?.search ?? "");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const result = await CertificateRequestsService.list({ page, limit, search });
      setRequests(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudieron cargar las solicitudes de certificados"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const result = await CertificateRequestsService.list({ page, limit, search });
        if (!cancelled) {
          setRequests(result.data);
          setTotal(result.total);
          setTotalPages(result.totalPages);
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
    })();
    return () => { cancelled = true; };
  }, [page, limit, search]);

  async function deleteRequest(request: CertificateRequest) {
    setSubmitting(true);

    try {
      await CertificateRequestsService.remove(request.id);
      await loadRequests();
      toast.success(`Solicitud ${request.requestNumber} eliminada`);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo eliminar la solicitud"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function updateRequestStatus(request: CertificateRequest, payload: { status: CertificateRequest["status"]; note?: string }) {
    setSubmitting(true);

    try {
      await CertificateRequestsService.updateStatus(request.id, payload);
      await loadRequests();
      toast.success(`Estado de ${request.requestNumber} actualizado`);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo actualizar el estado"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    requests,
    loading,
    submitting,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    total,
    totalPages,
    deleteRequest,
    updateRequestStatus,
  };
}
