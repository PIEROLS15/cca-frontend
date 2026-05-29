"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SectorsService } from "@/services/sectors.service";
import type { Sector } from "@/types/sector";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useSectors() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSectors() {
      try {
        const data = await SectorsService.listAll();

        if (!cancelled) {
          setSectors(data);
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
    }

    void loadSectors();

    return () => {
      cancelled = true;
    };
  }, []);

  async function reloadSectors() {
    const data = await SectorsService.listAll();
    setSectors(data);
  }

  async function createSector(name: string) {
    setSubmitting(true);

    try {
      await SectorsService.create(name);
      await reloadSectors();
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
      await reloadSectors();
      toast.success("Sector actualizado");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo guardar el sector"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteSector(sector: Sector) {
    setSubmitting(true);

    try {
      await SectorsService.remove(sector.id);
      await reloadSectors();
      toast.success(`Sector ${sector.name} eliminado`);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo eliminar el sector"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    sectors,
    loading,
    submitting,
    createSector,
    updateSector,
    deleteSector,
  };
}
