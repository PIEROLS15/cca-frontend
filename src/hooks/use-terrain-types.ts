"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import { TerrainTypesService } from "@/services/terrain-types.service";
import type { TerrainType } from "@/types/terrain-type";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useTerrainTypes(initial?: { page?: number; limit?: number; search?: string }) {
  const [terrainTypes, setTerrainTypes] = useState<TerrainType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 5);
  const [search, setSearch] = useState(initial?.search ?? "");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadTerrainTypes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await TerrainTypesService.list({ page, limit, search });
      setTerrainTypes(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudieron cargar los tipos de terreno"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const result = await TerrainTypesService.list({ page, limit, search });
        if (!cancelled) {
          setTerrainTypes(result.data);
          setTotal(result.total);
          setTotalPages(result.totalPages);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error, "No se pudieron cargar los tipos de terreno"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [page, limit, search]);

  async function createTerrainType(name: string) {
    setSubmitting(true);

    try {
      await TerrainTypesService.create(name);
      await loadTerrainTypes();
      toast.success("Tipo de terreno creado");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo guardar el tipo de terreno"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function updateTerrainType(id: number, name: string) {
    setSubmitting(true);

    try {
      await TerrainTypesService.update(id, name);
      await loadTerrainTypes();
      toast.success("Tipo de terreno actualizado");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo guardar el tipo de terreno"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    terrainTypes,
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
    createTerrainType,
    updateTerrainType,
  };
}
