import { apiFetch } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type { Client, ClientLookupResult, ClientPayload, ClientType, PersonaData } from "@/types/client";

export const ClientsService = {
  async list({ page = 1, limit = 5, search, clientType }: { page?: number; limit?: number; search?: string; clientType?: ClientType } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (clientType) params.set("clientType", clientType);
    return apiFetch<PaginatedApiResponse<Client>>(`/api/clients?${params.toString()}`);
  },

  create(payload: ClientPayload) {
    return apiFetch<Client>("/api/clients", {
      method: "POST",
      body: JSON.stringify({
        fullName: payload.fullName.trim(),
        documentNumber: payload.documentNumber.trim(),
        address: payload.address.trim(),
        phone: payload.phone.trim(),
        clientType: payload.clientType,
      }),
    });
  },

  update(id: number, payload: ClientPayload) {
    return apiFetch<Client>(`/api/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        fullName: payload.fullName.trim(),
        documentNumber: payload.documentNumber.trim(),
        address: payload.address.trim(),
        phone: payload.phone.trim(),
        clientType: payload.clientType,
      }),
    });
  },

  remove(id: number) {
    return apiFetch<void>(`/api/clients/${id}`, {
      method: "DELETE",
    });
  },

  searchByDocument(document: string) {
    return apiFetch<Client>(`/api/clients/search/${encodeURIComponent(document)}`).then<ClientLookupResult>((client) => ({
      id: client.id,
      fullName: client.fullName,
      documentNumber: client.documentNumber,
      address: client.address ?? "",
    }));
  },

  searchReniec(document: string) {
    return apiFetch<PersonaData>(`/api/clients/reniec/${encodeURIComponent(document)}`);
  },
};
