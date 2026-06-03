import { apiFetch } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type { AssemblyRecordRequest, AssemblyRecordRequestPayload, AssemblyRecordRequestUpdatePayload } from "@/types/assembly-record-request";

const PAGE_SIZE = 100;

function buildQuery(page: number, limit: number) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return `?${params.toString()}`;
}

async function listPage(page: number) {
  return apiFetch<PaginatedApiResponse<AssemblyRecordRequest>>(
    `/api/assembly-record-requests${buildQuery(page, PAGE_SIZE)}`,
  );
}

export const AssemblyRecordRequestsService = {
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
