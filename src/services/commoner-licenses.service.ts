import { apiFetch, apiFetchResponse, getBaseUrl } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type { CarnetComunero, CarnetComuneroStatus } from "@/types/carnet-comunero";
import type { CommonerLicenseVerification } from "@/types/commoner-license-verification";

type CommonerLicenseListResponse = PaginatedApiResponse<{
  id: number;
  dni: string;
  licenseNumber: string;
  fullName: string | null;
  photoUrl: string | null;
  createdAt: string;
  hasPhoto: boolean;
  status: string;
}>;

type CommonerLicenseWritePayload = {
  dni: string;
  nroCarnet: string;
};

type CommonerLicenseDetails = {
  id: number;
  dni: string;
  licenseNumber: string;
  fullName: string;
  firstNames: string;
  lastNames: string;
  gender: string;
  birthDate: string;
  address: string;
  photoPath: string | null;
  createdAt: string;
  updatedAt: string;
  hasPhoto: boolean;
  photoUrl: string | null;
};

type BulkPdfParams = {
  mode: "single" | "range" | "list" | "all";
  id?: number;
  from?: string;
  to?: string;
  field?: "dni" | "licenseNumber";
  values?: string;
  search?: string;
};

function mapLicense(item: CommonerLicenseListResponse["data"][number]): CarnetComunero {
  return {
    id: item.id,
    dni: item.dni,
    nroCarnet: item.licenseNumber,
    nombre: item.fullName,
    foto: item.hasPhoto ? item.photoUrl : null,
    registrado: item.createdAt,
    status: (item.status as CarnetComuneroStatus) || "Sin entregar",
  };
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  return searchParams.toString();
}

export const CommonerLicensesService = {
  async list({ page = 1, limit = 10, search, rangeField, rangeFrom, rangeTo }: { page?: number; limit?: number; search?: string; rangeField?: "licenseNumber" | "dni"; rangeFrom?: string; rangeTo?: string } = {}) {
    const params = buildQuery({ page, limit, search, rangeField, rangeFrom, rangeTo });
    const response = await apiFetch<CommonerLicenseListResponse>(`/api/commoner-licenses${params ? `?${params}` : ""}`);

    return {
      ...response,
      data: response.data.map(mapLicense),
    };
  },

  create(payload: CommonerLicenseWritePayload) {
    return apiFetch<CommonerLicenseListResponse["data"][number]>("/api/commoner-licenses", {
      method: "POST",
      body: JSON.stringify({
        dni: payload.dni,
        numeroComunero: payload.nroCarnet,
      }),
    }).then(mapLicense);
  },

  remove(id: number) {
    return apiFetch<void>(`/api/commoner-licenses/${id}`, {
      method: "DELETE",
    });
  },

  getById(id: number) {
    return apiFetch<CommonerLicenseDetails>(`/api/commoner-licenses/${id}`);
  },

  getPdfUrl(id: number) {
    return `${getBaseUrl()}/api/commoner-licenses/${id}/pdf`;
  },

  getBulkPdfUrl(params: BulkPdfParams) {
    const query = buildQuery(params);
    return `${getBaseUrl()}/api/commoner-licenses/pdf${query ? `?${query}` : ""}`;
  },

  verifyPublic(carnetId: string) {
    return apiFetch<{ message: string; error: boolean; status: number; data: CommonerLicenseVerification }>(
      `/api/public/commoner-licenses/${encodeURIComponent(carnetId)}`,
    );
  },

  updateStatus(id: number, status: CarnetComuneroStatus) {
    return apiFetch<CommonerLicenseListResponse["data"][number]>(`/api/commoner-licenses/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }).then(mapLicense);
  },

  async downloadReport({ search, status }: { search?: string; status?: CarnetComuneroStatus } = {}) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);

    const res = await apiFetchResponse(`/api/reports/commoner-licenses${params.toString() ? `?${params.toString()}` : ""}`);

    const blob = await res.blob();
    const disposition = res.headers.get("content-disposition") || "";
    const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);

    return {
      blob,
      filename: filenameMatch?.[1] || "reporte-carnets.xlsx",
    };
  },
};
