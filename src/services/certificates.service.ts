import { ApiError, apiFetch, getBaseUrl } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type { Certificate, CertificatePayload, CertificateStatusPayload } from "@/types/certificate";
import type { CertificateVerificationResponse } from "@/types/certificate-verification";

export const CertificatesService = {
  async list({ page = 1, limit = 5, search, documentNumber, mz, lot, sectorId, createdByRoleId }: { page?: number; limit?: number; search?: string; documentNumber?: string; mz?: string; lot?: string; sectorId?: number; createdByRoleId?: number } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (documentNumber) params.set("documentNumber", documentNumber);
    if (mz) params.set("mz", mz);
    if (lot) params.set("lot", lot);
    if (sectorId !== undefined) params.set("sectorId", String(sectorId));
    if (createdByRoleId !== undefined) params.set("createdByRoleId", String(createdByRoleId));
    return apiFetch<PaginatedApiResponse<Certificate>>(`/api/certificates?${params.toString()}`);
  },

  async downloadReport({ search, documentNumber, mz, lot, sectorId, createdByRoleId }: { search?: string; documentNumber?: string; mz?: string; lot?: string; sectorId?: number; createdByRoleId?: number } = {}) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (documentNumber) params.set("documentNumber", documentNumber);
    if (mz) params.set("mz", mz);
    if (lot) params.set("lot", lot);
    if (sectorId !== undefined) params.set("sectorId", String(sectorId));
    if (createdByRoleId !== undefined) params.set("createdByRoleId", String(createdByRoleId));

    const url = `${getBaseUrl()}/api/reports/certificates${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await fetch(url, { credentials: "include" });

    if (!res.ok) {
      const body = await res.json().catch(() => ({
        message: "No se pudo descargar el reporte",
      }));
      throw new ApiError(body.message, res.status, body);
    }

    const blob = await res.blob();
    const disposition = res.headers.get("content-disposition") || "";
    const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);

    return {
      blob,
      filename: filenameMatch?.[1] || "reporte-certificados.xlsx",
    };
  },

  getById(id: number) {
    return apiFetch<Certificate>(`/api/certificates/${id}`);
  },

  lookupByNumber(number: string) {
    return apiFetch<Certificate>(`/api/certificates/by-number/${number}`);
  },

  verifyByToken(token: string) {
    return apiFetch<{ message: string; error: boolean; status: number; data: CertificateVerificationResponse }>(
      `/api/public/certificates/${encodeURIComponent(token)}`,
    );
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

  updateStatus(id: number, payload: CertificateStatusPayload) {
    return apiFetch<Certificate>(`/api/certificates/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
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
