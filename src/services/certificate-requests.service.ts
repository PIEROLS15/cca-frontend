import { apiFetch } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type {
  CertificateRequest,
  CertificateRequestPayload,
} from "@/types/certificate-request";

const PAGE_SIZE = 100;

function buildQuery(page: number, limit: number) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return `?${params.toString()}`;
}

async function listPage(page: number) {
  return apiFetch<PaginatedApiResponse<CertificateRequest>>(
    `/api/certificate-requests${buildQuery(page, PAGE_SIZE)}`,
  );
}

export const CertificateRequestsService = {
  async listAll() {
    const firstPage = await listPage(1);

    if (firstPage.totalPages <= 1) {
      return firstPage.data;
    }

    const restPages = await Promise.all(
      Array.from({ length: firstPage.totalPages - 1 }, (_, index) => listPage(index + 2)),
    );

    return firstPage.data.concat(restPages.flatMap((page) => page.data));
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
