import { apiFetch } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type { Client, ClientLookupResult, ClientPayload, ClientType, PersonaData } from "@/types/client";

const toClientWriteBody = (payload: ClientPayload) => ({
  fullName: payload.fullName.trim(),
  documentNumber: payload.documentNumber.trim(),
  address: payload.address.trim(),
  phone: payload.phone.trim(),
  isComunero: payload.clientType === "Comunero",
  licenseSequence: payload.clientType === "Comunero" && payload.licenseSequence?.trim()
    ? Number(payload.licenseSequence)
    : undefined,
});

export const ClientsService = {
  async list({ page = 1, limit = 5, search, documentNumber, clientType }: { page?: number; limit?: number; search?: string; documentNumber?: string; clientType?: ClientType } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (documentNumber) params.set("documentNumber", documentNumber);
    if (clientType) params.set("clientType", clientType);
    return apiFetch<PaginatedApiResponse<Client>>(`/api/clients?${params.toString()}`);
  },

  create(payload: ClientPayload) {
    return apiFetch<Client>("/api/clients", {
      method: "POST",
      body: JSON.stringify(toClientWriteBody(payload)),
    });
  },

  update(id: number, payload: ClientPayload) {
    return apiFetch<Client>(`/api/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(toClientWriteBody(payload)),
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
