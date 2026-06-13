import { apiFetch } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type { Sector } from "@/types/sector";

export const SectorsService = {
  async list({ page = 1, limit = 5, search }: { page?: number; limit?: number; search?: string } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    return apiFetch<PaginatedApiResponse<Sector>>(`/api/sectors?${params.toString()}`);
  },

  create(name: string) {
    return apiFetch<Sector>("/api/sectors", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  update(id: number, name: string) {
    return apiFetch<Sector>(`/api/sectors/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  },

  remove(id: number) {
    return apiFetch<void>(`/api/sectors/${id}`, {
      method: "DELETE",
    });
  },
};
