"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import { SectorsService } from "@/services/sectors.service";
import type { Sector } from "@/types/sector";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useSectors(initial?: { page?: number; limit?: number; search?: string }) {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 5);
  const [search, setSearch] = useState(initial?.search ?? "");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadSectors = useCallback(async () => {
    setLoading(true);
    try {
      const result = await SectorsService.list({ page, limit, search });
      setSectors(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudieron cargar los sectores"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const result = await SectorsService.list({ page, limit, search });
        if (!cancelled) {
          setSectors(result.data);
          setTotal(result.total);
          setTotalPages(result.totalPages);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error, "No se pudieron cargar los sectores"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [page, limit, search]);

  async function createSector(name: string) {
    setSubmitting(true);

    try {
      await SectorsService.create(name);
      await loadSectors();
      toast.success("Sector creado");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo guardar el sector"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function updateSector(id: number, name: string) {
    setSubmitting(true);

    try {
      await SectorsService.update(id, name);
      await loadSectors();
      toast.success("Sector actualizado");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo guardar el sector"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    sectors,
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
    createSector,
    updateSector,
  };
}
