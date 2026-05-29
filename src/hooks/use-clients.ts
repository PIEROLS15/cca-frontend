"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ClientsService } from "@/services/clients.service";
import type { Client, ClientPayload, ClientType } from "@/types/client";

interface UseClientsOptions {
  clientType?: ClientType;
  resourceLabel?: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useClients(options: UseClientsOptions = {}) {
  const { clientType, resourceLabel = "clientes" } = options;
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadClients() {
      try {
        const data = await ClientsService.listAll(clientType);

        if (!cancelled) {
          setClients(data);
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
    }

    void loadClients();

    return () => {
      cancelled = true;
    };
  }, [clientType, resourceLabel]);

  async function reloadClients() {
    const data = await ClientsService.listAll(clientType);
    setClients(data);
  }

  async function createClient(payload: ClientPayload) {
    setSubmitting(true);

    try {
      await ClientsService.create(payload);
      await reloadClients();
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
      await reloadClients();
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
      await reloadClients();
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
    createClient,
    updateClient,
    deleteClient,
  };
}
