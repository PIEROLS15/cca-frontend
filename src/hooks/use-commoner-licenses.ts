"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { CommonerLicensesService } from "@/services/commoner-licenses.service";
import type { CarnetComunero, CarnetComuneroStatus } from "@/types/carnet-comunero";

interface UseCommonerLicensesOptions {
  initial?: { page?: number; limit?: number; search?: string };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useCommonerLicenses(options: UseCommonerLicensesOptions = {}) {
  const { initial } = options;
  const [items, setItems] = useState<CarnetComunero[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 10);
  const [search, setSearch] = useState(initial?.search ?? "");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadCommonerLicenses = useCallback(async () => {
    setLoading(true);

    try {
      const result = await CommonerLicensesService.list({ page, limit, search });
      setItems(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudieron cargar los carnets"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);

      try {
        const result = await CommonerLicensesService.list({ page, limit, search });
        if (!cancelled) {
          setItems(result.data);
          setTotal(result.total);
          setTotalPages(result.totalPages);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error, "No se pudieron cargar los carnets"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, limit, search]);

  async function createCommonerLicense(payload: { dni: string; nroCarnet: string }) {
    setSubmitting(true);

    try {
      await CommonerLicensesService.create(payload);
      await loadCommonerLicenses();
      toast.success("Comunero registrado correctamente.");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo registrar"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteCommonerLicense(item: CarnetComunero) {
    setSubmitting(true);

    try {
      await CommonerLicensesService.remove(item.id);
      await loadCommonerLicenses();
      toast.success("Registro eliminado.");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo eliminar el registro"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function updateCommonerLicenseStatus(id: number, status: CarnetComuneroStatus) {
    setSubmitting(true);

    try {
      await CommonerLicensesService.updateStatus(id, status);
      await loadCommonerLicenses();
      toast.success(`Estado cambiado a "${status}".`);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo cambiar el estado"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    items,
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
    reload: loadCommonerLicenses,
    createCommonerLicense,
    deleteCommonerLicense,
    updateCommonerLicenseStatus,
  };
}
