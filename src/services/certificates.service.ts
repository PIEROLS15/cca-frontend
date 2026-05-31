import { apiFetch } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type { Certificate, CertificatePayload } from "@/types/certificate";

const PAGE_SIZE = 100;

function buildQuery(page: number, limit: number) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return `?${params.toString()}`;
}

async function listPage(page: number) {
  return apiFetch<PaginatedApiResponse<Certificate>>(
    `/api/certificates${buildQuery(page, PAGE_SIZE)}`,
  );
}

export const CertificatesService = {
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

  getById(id: number) {
    return apiFetch<Certificate>(`/api/certificates/${id}`);
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
