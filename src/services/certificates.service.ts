import { apiFetch } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type { Certificate, CertificatePayload } from "@/types/certificate";

export const CertificatesService = {
  async list({ page = 1, limit = 5, search, name, documentNumber, mz, lot }: { page?: number; limit?: number; search?: string; name?: string; documentNumber?: string; mz?: string; lot?: string } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (name) params.set("name", name);
    if (documentNumber) params.set("documentNumber", documentNumber);
    if (mz) params.set("mz", mz);
    if (lot) params.set("lot", lot);
    return apiFetch<PaginatedApiResponse<Certificate>>(`/api/certificates?${params.toString()}`);
  },

  getById(id: number) {
    return apiFetch<Certificate>(`/api/certificates/${id}`);
  },

  lookupByNumber(number: string) {
    return apiFetch<Certificate>(`/api/certificates/by-number/${number}`);
  },

  create(payload: CertificatePayload) {
    return apiFetch<Certificate>("/api/certificates", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: CertificatePayload) {
    return apiFetch<Certificate>(`/api/certificates/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  remove(id: number) {
    return apiFetch<void>(`/api/certificates/${id}`, {
      method: "DELETE",
    });
  },

  updateStatus(id: number, status: string) {
    return apiFetch<Certificate>(`/api/certificates/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  getPdfUrl(_id: number, certificateNumber: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_API_URL no está definida en .env");
    }

    return `${baseUrl}/api/certificates/download/certificado-${certificateNumber}.pdf`;
  },
};
