"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { TerrainTypesService } from "@/services/terrain-types.service";
import type { TerrainType } from "@/types/terrain-type";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useTerrainTypes() {
  const [terrainTypes, setTerrainTypes] = useState<TerrainType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadTerrainTypes() {
      try {
        const data = await TerrainTypesService.listAll();

        if (!cancelled) {
          setTerrainTypes(data);
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
    }

    void loadTerrainTypes();

    return () => {
      cancelled = true;
    };
  }, []);

  async function reloadTerrainTypes() {
    const data = await TerrainTypesService.listAll();
    setTerrainTypes(data);
  }

  async function createTerrainType(name: string) {
    setSubmitting(true);

    try {
      await TerrainTypesService.create(name);
      await reloadTerrainTypes();
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
      await reloadTerrainTypes();
      toast.success("Tipo de terreno actualizado");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo guardar el tipo de terreno"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteTerrainType(terrainType: TerrainType) {
    setSubmitting(true);

    try {
      await TerrainTypesService.remove(terrainType.id);
      await reloadTerrainTypes();
      toast.success(`Tipo ${terrainType.name} eliminado`);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo eliminar el tipo de terreno"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    terrainTypes,
    loading,
    submitting,
    createTerrainType,
    updateTerrainType,
    deleteTerrainType,
  };
}
