"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import { AssemblyRecordRequestsService } from "@/services/assembly-record-requests.service";
import type { AssemblyRecordRequest } from "@/types/assembly-record-request";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useAssemblyRecordRequests() {
  const [requests, setRequests] = useState<AssemblyRecordRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      try {
        const data = await AssemblyRecordRequestsService.listAll();

        if (!cancelled) {
          setRequests(data);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error, "No se pudieron cargar las solicitudes de acta"));
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

  const reloadRequests = useCallback(async () => {
    const data = await AssemblyRecordRequestsService.listAll();
    setRequests(data);
  }, []);

  async function deleteRequest(request: AssemblyRecordRequest) {
    setSubmitting(true);

    try {
      await AssemblyRecordRequestsService.remove(request.id);
      await reloadRequests();
      toast.success(`Solicitud ${request.code} eliminada`);
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
    reloadRequests,
  };
}
