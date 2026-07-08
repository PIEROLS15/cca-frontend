import { apiFetch } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type {
  CertificateRequest,
  CertificateRequestPayload,
  CertificateRequestStatusPayload,
} from "@/types/certificate-request";

export const CertificateRequestsService = {
  async list({ page = 1, limit = 5, search }: { page?: number; limit?: number; search?: string } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    return apiFetch<PaginatedApiResponse<CertificateRequest>>(`/api/certificate-requests?${params.toString()}`);
  },

  getById(identifier: string) {
    return apiFetch<CertificateRequest>(`/api/certificate-requests/${identifier}`);
  },

  create(payload: CertificateRequestPayload) {
    return apiFetch<CertificateRequest>("/api/certificate-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: CertificateRequestPayload) {
    return apiFetch<CertificateRequest>(`/api/certificate-requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  updateStatus(id: number, payload: CertificateRequestStatusPayload) {
    return apiFetch<CertificateRequest>(`/api/certificate-requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  remove(id: number) {
    return apiFetch<void>(`/api/certificate-requests/${id}`, {
      method: "DELETE",
    });
  },

  getPdfUrl(_id: number, requestNumber: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_API_URL no está definida en .env");
    }

    return `${baseUrl}/api/certificate-requests/download/solicitud-certificado-${requestNumber}.pdf`;
  },
};
