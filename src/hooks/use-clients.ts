"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import { ClientsService } from "@/services/clients.service";
import type { Client, ClientPayload, ClientType } from "@/types/client";

interface UseClientsOptions {
  clientType?: ClientType;
  documentNumber?: string;
  resourceLabel?: string;
  initial?: { page?: number; limit?: number; search?: string };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useClients(options: UseClientsOptions = {}) {
  const { clientType, documentNumber, resourceLabel = "clientes", initial } = options;
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 5);
  const [search, setSearch] = useState(initial?.search ?? "");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const result = await ClientsService.list({ page, limit, search, documentNumber, clientType });
      setClients(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, `No se pudieron cargar los ${resourceLabel}`));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, documentNumber, clientType, resourceLabel]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const result = await ClientsService.list({ page, limit, search, documentNumber, clientType });
        if (!cancelled) {
          setClients(result.data);
          setTotal(result.total);
          setTotalPages(result.totalPages);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error, `No se pudieron cargar los ${resourceLabel}`));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [page, limit, search, documentNumber, clientType, resourceLabel]);

  async function createClient(payload: ClientPayload) {
    setSubmitting(true);

    try {
      await ClientsService.create(payload);
      await loadClients();
      toast.success("Cliente creado");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo guardar el cliente"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function updateClient(id: number, payload: ClientPayload) {
    setSubmitting(true);

    try {
      await ClientsService.update(id, payload);
      await loadClients();
      toast.success("Cliente actualizado");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo guardar el cliente"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteClient(client: Client) {
    setSubmitting(true);

    try {
      await ClientsService.remove(client.id);
      await loadClients();
      toast.success(`Cliente ${client.fullName} eliminado`);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo eliminar el cliente"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    clients,
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
    createClient,
    updateClient,
    deleteClient,
  };
}
