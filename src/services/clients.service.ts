import { apiFetch } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type { Client, ClientPayload, ClientType } from "@/types/client";

const PAGE_SIZE = 100;

function buildQuery(page: number, limit: number, clientType?: ClientType) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (clientType) {
    params.set("clientType", clientType);
  }

  return `?${params.toString()}`;
}

async function listPage(page: number, clientType?: ClientType) {
  return apiFetch<PaginatedApiResponse<Client>>(
    `/api/clients${buildQuery(page, PAGE_SIZE, clientType)}`,
  );
}

function normalizePayload(payload: ClientPayload) {
  return {
    fullName: payload.fullName.trim(),
    documentNumber: payload.documentNumber.trim(),
    address: payload.address.trim(),
    phone: payload.phone.trim(),
    clientType: payload.clientType,
  };
}

export const ClientsService = {
  async listAll(clientType?: ClientType) {
    const firstPage = await listPage(1, clientType);

    if (firstPage.totalPages <= 1) {
      return firstPage.data;
    }

    const restPages = await Promise.all(
      Array.from({ length: firstPage.totalPages - 1 }, (_, index) => listPage(index + 2, clientType)),
    );

    return firstPage.data.concat(restPages.flatMap((page) => page.data));
  },

  create(payload: ClientPayload) {
    return apiFetch<Client>("/api/clients", {
      method: "POST",
      body: JSON.stringify(normalizePayload(payload)),
    });
  },

  update(id: number, payload: ClientPayload) {
    return apiFetch<Client>(`/api/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(normalizePayload(payload)),
    });
  },

  remove(id: number) {
    return apiFetch<void>(`/api/clients/${id}`, {
      method: "DELETE",
    });
  },
};
