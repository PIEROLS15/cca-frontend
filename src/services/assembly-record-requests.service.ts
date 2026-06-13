import { apiFetch } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type { AssemblyRecordRequest, AssemblyRecordRequestPayload, AssemblyRecordRequestUpdatePayload } from "@/types/assembly-record-request";

export const AssemblyRecordRequestsService = {
  async list({ page = 1, limit = 5, search }: { page?: number; limit?: number; search?: string } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    return apiFetch<PaginatedApiResponse<AssemblyRecordRequest>>(`/api/assembly-record-requests?${params.toString()}`);
  },

  getById(id: number) {
    return apiFetch<AssemblyRecordRequest>(`/api/assembly-record-requests/${id}`);
  },

  create(payload: AssemblyRecordRequestPayload) {
    return apiFetch<AssemblyRecordRequest>("/api/assembly-record-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: AssemblyRecordRequestUpdatePayload) {
    return apiFetch<AssemblyRecordRequest>(`/api/assembly-record-requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  remove(id: number) {
    return apiFetch<void>(`/api/assembly-record-requests/${id}`, {
      method: "DELETE",
    });
  },

  getPdfUrl(code: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_API_URL no está definida en .env");
    }

    return `${baseUrl}/api/assembly-record-requests/download/solicitud-acta-${code}.pdf`;
  },
};
